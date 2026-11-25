import React, { useState, useRef, useEffect } from 'react';
import { RichMathText } from './MathText';
import {
  MessageSquare,
  X,
  Send,
  Trash2,
  Cpu,
  Loader2,
} from 'lucide-react';

interface ChatTurn {
  id: string;
  role: 'user' | 'model';
  text: string;
  modelUsed?: string;
}

type ModelMode = 'carbon_high' | 'neon' | 'hydrogen' | 'flash_lite';

const QUICK_PROMPTS = [
  'Jelaskan langkah mencari persamaan regresi linear jika diketahui n=5, ∑x=20, ∑y=150, ∑x²=90, ∑xy=640!',
  'Apa bedanya dilatasi horizontal f(x/k) dengan dilatasi vertikal a·f(x)? Berikan contohnya!',
  'Bagaimana cara membedakan soal yang memakai Permutasi vs Kombinasi dengan cepat?',
];

interface GeminiTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiTutorDrawer: React.FC<GeminiTutorDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Halo! Saya Asisten Diskusi Matematika **MathLab XII**. Kamu bisa menanyakan langkah penyelesaian soal **Statistika Regresi** ($\\hat{y} = a + bx$), **Transformasi Fungsi** ($y = f(x)$), maupun **Kaidah Pencacahan & Peluang** ($P(n,r)$ dan $C(n,r)$).',
      modelUsed: 'gemini-4-carbon (High Thinking)',
    },
  ]);
  const [input, setInput] = useState('');
  const [modelMode, setModelMode] = useState<ModelMode>('carbon_high');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const sendQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || isLoading) return;

    const userTurn: ChatTurn = {
      id: String(Date.now()),
      role: 'user',
      text: trimmed,
    };

    const historyForApi = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, userTurn]);
    setInput('');
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyForApi,
          modelMode,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal mendapatkan respons dari server.');
      }

      const modelTurn: ChatTurn = {
        id: String(Date.now() + 1),
        role: 'model',
        text: data.text || 'Maaf, tidak ada jawaban yang dihasilkan.',
        modelUsed: data.modelUsed,
      };
      setMessages((prev) => [...prev, modelTurn]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan jaringan.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(input);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: 'Riwayat percakapan telah dibersihkan. Silakan ajukan soal atau konsep matematika Kelas XII yang ingin kita bahas bersama!',
      },
    ]);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs no-print">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Diskusi Pembahas Soal Matematika
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Mendukung penalaran mendalam (High Thinking) & rumus KaTeX
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleClearChat}
              title="Bersihkan percakapan"
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Tutup panel diskusi"
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Model Selector Bar */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium">Mode Penalaran:</span>
          </div>
          <select
            value={modelMode}
            onChange={(e) => setModelMode(e.target.value as ModelMode)}
            className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="carbon_high">Deep Reasoning · High Thinking (gemini-4-carbon)</option>
            <option value="neon">Interactive Complex (gemini-4-neon)</option>
            <option value="hydrogen">General Math Tutor (gemini-4-hydrogen)</option>
            <option value="flash_lite">Respon Cepat (gemini-3.1-flash-lite)</option>
          </select>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[90%] rounded-xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700'
                }`}
              >
                <RichMathText text={msg.text} />
              </div>
              {msg.modelUsed && msg.role === 'model' && (
                <span className="text-[10px] font-mono text-slate-400 mt-1 px-1">
                  Model: {msg.modelUsed}
                </span>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-xl w-fit">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Sedang menyusun penalaran langkah demi langkah...</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
              {errorMsg}
            </div>
          )}

          <div ref={threadEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            Contoh pertanyaan cepat:
          </p>
          <div className="flex flex-col gap-1.5">
            {QUICK_PROMPTS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendQuestion(q)}
                disabled={isLoading}
                className="text-left text-xs text-blue-700 dark:text-blue-400 hover:underline truncate cursor-pointer disabled:opacity-50"
              >
                → {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleFormSubmit}
          className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan soal regresi, transformasi, atau peluang..."
            disabled={isLoading}
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Kirim</span>
          </button>
        </form>
      </div>
    </div>
  );
};
