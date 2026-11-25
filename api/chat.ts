import { GoogleGenAI, ThinkingLevel, type GenerateContentResponse } from '@google/genai';

const SYSTEM_INSTRUCTION = `Kamu adalah Asisten Pembahas Matematika Kelas XII untuk website "MathLab XII — Modul Pembelajaran Matematika" karya Naadhim Fahly Mubaarok (Kelas XII SIJA 2 — SMK Telkom Sidoarjo, Penugasan Pengganti Nilai Tugas KPP).

Peran dan Gaya Bahasa:
1. Gunakan bahasa Indonesia yang ramah, komunikatif, jelas, dan mudah dipahami siswa SMA/SMK Kelas XII.
2. Selalu tuliskan SELURUH rumus, variabel, dan langkah perhitungan matematika dalam format LaTeX menggunakan tanda $...$ untuk rumus inline dan $$...$$ untuk rumus blok.
3. Fokus utama materi modul ini adalah: Statistika Regresi Linear Sederhana, Transformasi Fungsi, serta Kaidah Pencacahan & Peluang Kejadian Majemuk.
4. Berikan penjelasan yang runtut (Diketahui, Ditanya, Dijawab Step-by-Step, dan Kesimpulan) serta pastikan 100% akurat secara matematis.`;

interface ChatMessageInput {
  role: 'user' | 'model';
  text: string;
}

interface ServerlessReq {
  method?: string;
  body?: {
    message?: string;
    history?: ChatMessageInput[];
    modelMode?: 'carbon_high' | 'neon' | 'hydrogen' | 'flash_lite';
  };
}

interface ServerlessRes {
  status: (code: number) => {
    json: (payload: unknown) => void;
  };
}

export default async function handler(req: ServerlessReq, res: ServerlessRes) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(400).json({
        error: 'GEMINI_API_KEY belum diatur di Environment Variables.',
      });
    }

    const { message, history = [], modelMode = 'carbon_high' } = req.body ?? {};
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Pesan pertanyaan tidak boleh kosong.' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const formattedHistory = Array.isArray(history)
      ? history
          .filter((m) => m && typeof m.text === 'string' && m.text.trim() !== '')
          .map((m) => ({
            role: m.role === 'model' ? 'model' : 'user',
            parts: [{ text: m.text }],
          }))
      : [];

    let targetModel = 'gemini-4-carbon';
    let thinkingLevel: ThinkingLevel | undefined = ThinkingLevel.HIGH;

    if (modelMode === 'neon') {
      targetModel = 'gemini-4-neon';
      thinkingLevel = ThinkingLevel.HIGH;
    } else if (modelMode === 'hydrogen') {
      targetModel = 'gemini-4-hydrogen';
      thinkingLevel = ThinkingLevel.HIGH;
    } else if (modelMode === 'flash_lite') {
      targetModel = 'gemini-3.1-flash-lite';
      thinkingLevel = undefined;
    }

    const runChat = async (modelName: string, level?: ThinkingLevel) => {
      const chat = ai.chats.create({
        model: modelName,
        history: formattedHistory,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          ...(level ? { thinkingConfig: { thinkingLevel: level } } : {}),
        },
      });
      const response: GenerateContentResponse = await chat.sendMessage({
        message: message.trim(),
      });
      return response.text ?? '';
    };

    try {
      const replyText = await runChat(targetModel, thinkingLevel);
      return res.status(200).json({
        text: replyText,
        modelUsed: targetModel,
        thinkingLevel: thinkingLevel ?? 'DEFAULT',
      });
    } catch (primaryErr: unknown) {
      const errMsg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
      if (
        targetModel !== 'gemini-4-hydrogen' &&
        (errMsg.includes('403') ||
          errMsg.includes('429') ||
          errMsg.includes('404') ||
          errMsg.includes('PERMISSION_DENIED') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('billing') ||
          errMsg.includes('not found'))
      ) {
        const fallbackReply = await runChat('gemini-4-hydrogen', ThinkingLevel.HIGH);
        return res.status(200).json({
          text: fallbackReply,
          modelUsed: 'gemini-4-hydrogen (High Thinking)',
          thinkingLevel: ThinkingLevel.HIGH,
        });
      }
      throw primaryErr;
    }
  } catch (error: unknown) {
    const rawMessage = error instanceof Error ? error.message : String(error);
    return res.status(500).json({
      error: `Terjadi kesalahan saat menghubungi layanan Gemini: ${rawMessage}`,
    });
  }
}
