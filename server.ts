import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel, type GenerateContentResponse } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYSTEM_INSTRUCTION = `Kamu adalah Asisten Pembahas Matematika Kelas XII untuk website "MathLab XII — Modul Pembelajaran Matematika" karya Naadhim Fahly Mubaarok (Kelas XII SIJA 2 — SMK Telkom Sidoarjo, Penugasan Pengganti Nilai Tugas KPP).

Peran dan Gaya Bahasa:
1. Gunakan bahasa Indonesia yang ramah, komunikatif, jelas, dan mudah dipahami siswa SMA/SMK Kelas XII.
2. Selalu tuliskan SELURUH rumus, variabel, dan langkah perhitungan matematika dalam format LaTeX menggunakan tanda $...$ untuk rumus inline (contoh: $\\hat{y} = a + bx$) dan $$...$$ untuk rumus blok (contoh: $$b = \\frac{n\\sum xy - (\\sum x)(\\sum y)}{n\\sum x^2 - (\\sum x)^2}$$). DILARANG menulis rumus dalam teks polos tanpa delimiter LaTeX.
3. Fokus utama materi modul ini adalah:
   - Materi 1: Statistika Regresi Linear Sederhana ($\\hat{y} = a + bx$, gradien $b$, konstanta $a$, korelasi Pearson $r$, dan koefisien determinasi $R^2$).
   - Materi 2: Transformasi Fungsi (Translasi horizontal $f(x-h)$ & vertikal $f(x)+k$, Refleksi sumbu-X $-f(x)$ & sumbu-Y $f(-x)$, Dilatasi vertikal $a\\cdot f(x)$ & horizontal $f(x/k)$, serta Rotasi terhadap titik asal $O(0,0)$).
   - Materi 3: Kaidah Pencacahan & Peluang Kejadian Majemuk (Aturan penjumlahan/perkalian, Permutasi $P(n,r)$, Kombinasi $C(n,r)$, Peluang Saling Lepas, Tidak Saling Lepas, Saling Bebas, dan Peluang Bersyarat).
4. Berikan penjelasan yang runtut (Diketahui, Ditanya, Dijawab Step-by-Step, dan Kesimpulan) serta pastikan 100% akurat secara matematis.`;

interface ChatMessageInput {
  role: 'user' | 'model';
  text: string;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'MathLab XII' });
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.status(400).json({
          error:
            'API Key Gemini belum dikonfigurasi. Silakan periksa API Key pada panel Settings > Secrets di AI Studio.',
        });
      }

      const {
        message,
        history = [],
        modelMode = 'carbon_high',
      }: {
        message?: string;
        history?: ChatMessageInput[];
        modelMode?: 'carbon_high' | 'neon' | 'hydrogen' | 'flash_lite';
      } = req.body;

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

      if (modelMode === 'carbon_high') {
        targetModel = 'gemini-4-carbon';
        thinkingLevel = ThinkingLevel.HIGH;
      } else if (modelMode === 'neon') {
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
        return res.json({
          text: replyText,
          modelUsed: targetModel,
          thinkingLevel: thinkingLevel ?? 'DEFAULT',
        });
      } catch (primaryErr: unknown) {
        const errMsg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
        // If paid-only model is unavailable on free-tier API key, fall back cleanly to gemini-4-hydrogen with HIGH thinking
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
          return res.json({
            text: fallbackReply,
            modelUsed: 'gemini-4-hydrogen (High Thinking)',
            thinkingLevel: ThinkingLevel.HIGH,
          });
        }
        throw primaryErr;
      }
    } catch (error: unknown) {
      const rawMessage = error instanceof Error ? error.message : String(error);
      let friendlyError = `Terjadi kesalahan saat menghubungi layanan Gemini: ${rawMessage}`;
      if (rawMessage.includes('PERMISSION_DENIED') || rawMessage.includes('API_KEY_INVALID')) {
        friendlyError =
          'Akses ditolak atau API Key tidak valid. Silakan periksa API Key Anda di panel Settings > Secrets.';
      } else if (rawMessage.includes('RESOURCE_EXHAUSTED') || rawMessage.includes('429')) {
        friendlyError =
          'Kuota API habis (429). Meningkatkan ke akun berbayar dapat menambah kuota melalui panel Settings > Secrets.';
      }
      return res.status(500).json({ error: friendlyError });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MathLab XII server running on http://localhost:${PORT}`);
  });
}

startServer();
