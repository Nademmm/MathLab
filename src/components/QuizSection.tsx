import React, { useState } from 'react';
import { RichMathText, KaTeXMath } from './MathText';
import { CheckCircle2, XCircle, RotateCcw, Award } from 'lucide-react';

interface QuizQuestion {
  id: number;
  chapter: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    chapter: 'Materi 01 · Statistika Regresi',
    question:
      'Diketahui suatu model regresi linear sederhana memiliki rata-rata jam latihan $\\bar{x} = 5$, rata-rata skor $\\bar{y} = 80$, dan gradien garis regresi $b = 4$. Persamaan garis regresi $\\hat{y} = a + bx$ beserta prediksi skor saat $x = 8$ adalah...',
    options: [
      '$\\hat{y} = 60 + 4x$ dan prediksi $\\hat{y} = 92$',
      '$\\hat{y} = 60 + 4x$ dan prediksi $\\hat{y} = 88$',
      '$\\hat{y} = 20 + 4x$ dan prediksi $\\hat{y} = 52$',
      '$\\hat{y} = 100 - 4x$ dan prediksi $\\hat{y} = 68$',
    ],
    correctIndex: 0,
    explanation:
      'Konstanta dihitung dengan rumus $a = \\bar{y} - b\\bar{x} = 80 - 4(5) = 80 - 20 = 60$. Sehingga persamaan regresinya adalah $\\hat{y} = 60 + 4x$. Saat $x = 8$, diperoleh $\\hat{y} = 60 + 4(8) = 60 + 32 = 92$.',
  },
  {
    id: 2,
    chapter: 'Materi 01 · Statistika Regresi',
    question:
      'Apabila hasil analisis korelasi antara dua variabel menghasilkan koefisien korelasi Pearson $r = -0,90$, maka nilai koefisien determinasi ($R^2$) dan interpretasi hubungannya yang tepat adalah...',
    options: [
      '$R^2 = -81\\%$, korelasi negatif lemah',
      '$R^2 = 81\\%$, korelasi negatif sangat kuat',
      '$R^2 = 90\\%$, korelasi positif sangat kuat',
      '$R^2 = 19\\%$, tidak ada korelasi linear',
    ],
    correctIndex: 1,
    explanation:
      'Koefisien determinasi selalu bernilai positif: $R^2 = r^2 \\times 100\\% = (-0,90)^2 \\times 100\\% = 0,81 \\times 100\\% = 81\\%$. Tanda negatif pada $r = -0,90$ menunjukkan arah korelasi negatif (berlawanan arah) yang sangat kuat karena $|r| = 0,90$ mendekati $1$.',
  },
  {
    id: 3,
    chapter: 'Materi 02 · Transformasi Fungsi',
    question:
      'Grafik fungsi kuadrat $f(x) = x^2$ digeser $3$ satuan ke kiri dan $2$ satuan ke atas, kemudian dicerminkan terhadap sumbu-$X$. Persamaan grafik fungsi bayangan akhirnya adalah...',
    options: [
      '$g(x) = -(x - 3)^2 + 2$',
      '$g(x) = -(x + 3)^2 - 2$',
      '$g(x) = (x + 3)^2 - 2$',
      '$g(x) = -(x - 3)^2 - 2$',
    ],
    correctIndex: 1,
    explanation:
      'Geser $3$ satuan ke kiri ($h = -3 \\implies x \\to x + 3$) dan $2$ satuan ke atas ($+2$) menghasilkan $f_1(x) = (x + 3)^2 + 2$. Refleksi terhadap sumbu-$X$ mengalikan seluruh fungsi dengan $-1$: $g(x) = -f_1(x) = -\\left[(x + 3)^2 + 2\\right] = -(x + 3)^2 - 2$.',
  },
  {
    id: 4,
    chapter: 'Materi 02 · Transformasi Fungsi',
    question:
      'Fungsi nilai mutlak $f(x) = |x|$ mengalami dilatasi horizontal sejajar sumbu-$X$ dengan faktor skala $k = 2$, lalu mengalami dilatasi vertikal sejajar sumbu-$Y$ dengan faktor skala $a = 4$, dan digeser naik $1$ satuan. Nilai bayangan fungsi $g(x)$ saat $x = 6$ adalah...',
    options: [
      '$g(6) = 13$',
      '$g(6) = 25$',
      '$g(6) = 49$',
      '$g(6) = 9$',
    ],
    correctIndex: 0,
    explanation:
      'Dilatasi horizontal skala $k = 2$ mengubah $x \\to \\frac{x}{2}$ sehingga diperoleh $\\left|\\frac{x}{2}\\right|$. Dilatasi vertikal skala $a = 4$ dan translasi naik $1$ menghasilkan $g(x) = 4\\left|\\frac{x}{2}\\right| + 1$. Saat $x = 6$, maka $g(6) = 4\\left|\\frac{6}{2}\\right| + 1 = 4(3) + 1 = 13$.',
  },
  {
    id: 5,
    chapter: 'Materi 03 · Kaidah Pencacahan & Peluang',
    question:
      'Sebuah ekstrakurikuler IT memiliki $7$ anggota finalis. Banyaknya cara memilih $2$ orang untuk menjadi Ketua dan Wakil Ketua dibandingkan dengan memilih $2$ orang perwakilan lomba tanpa jabatan berturut-turut adalah...',
    options: [
      '$P(7,2) = 21$ cara dan $C(7,2) = 42$ cara',
      '$P(7,2) = 42$ cara dan $C(7,2) = 21$ cara',
      '$P(7,2) = 49$ cara dan $C(7,2) = 14$ cara',
      '$P(7,2) = 14$ cara dan $C(7,2) = 7$ cara',
    ],
    correctIndex: 1,
    explanation:
      'Memilih Ketua & Wakil Ketua memperhatikan urutan: $P(7,2) = \\frac{7!}{5!} = 7 \\times 6 = 42$ cara. Memilih $2$ perwakilan tanpa jabatan tidak memperhatikan urutan: $C(7,2) = \\frac{7!}{2!5!} = \\frac{42}{2} = 21$ cara.',
  },
  {
    id: 6,
    chapter: 'Materi 03 · Kaidah Pencacahan & Peluang',
    question:
      'Pada pelemparan sebuah dadu bersisi $6$ satu kali, peluang munculnya mata dadu bilangan ganjil ATAU bilangan kelipatan $3$ adalah...',
    options: [
      '$\\frac{5}{6}$',
      '$\\frac{4}{6} = \\frac{2}{3}$',
      '$\\frac{3}{6} = \\frac{1}{2}$',
      '$\\frac{1}{6}$',
    ],
    correctIndex: 1,
    explanation:
      'Ruang sampel $S = \\{1,2,3,4,5,6\\}, n(S)=6$. Kejadian ganjil $A = \\{1,3,5\\} \\implies P(A) = \\frac{3}{6}$. Kejadian kelipatan $3$ adalah $B = \\{3,6\\} \\implies P(B) = \\frac{2}{6}$. Irisan keduanya $A \\cap B = \\{3\\} \\implies P(A \\cap B) = \\frac{1}{6}$. Maka $P(A \\cup B) = \\frac{3}{6} + \\frac{2}{6} - \\frac{1}{6} = \\frac{4}{6} = \\frac{2}{3}$.',
  },
];

export const QuizSection: React.FC = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = QUIZ_QUESTIONS.length;

  const correctCount = QUIZ_QUESTIONS.reduce((acc, q) => {
    return selectedAnswers[q.id] === q.correctIndex ? acc + 1 : acc;
  }, 0);

  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (selectedAnswers[questionId] !== undefined) return; // Lock after instant check
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
  };

  return (
    <section id="mini-kuis" className="scroll-mt-20 py-12 border-b border-[#E5E7EB] dark:border-slate-800">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">
            <span>Evaluasi Pemahaman</span>
            <span aria-hidden="true">·</span>
            <span>6 Soal Pilihan Ganda</span>
            <span aria-hidden="true">·</span>
            <span>Cek Jawaban Instan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Mini Kuis Evaluasi Kelas XII
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
            Uji pemahamanmu pada ketiga materi (masing-masing 2 soal per bab). Pilih salah satu
            opsi jawaban untuk langsung melihat verifikasi dan pembahasan langkah demi langkah.
          </p>
        </div>

        {/* Live Score Card */}
        <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-xl px-5 py-4 flex items-center gap-5">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Progres & Skor Saat Ini</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {scorePercent}
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                / 100 ({correctCount}/{totalQuestions} Benar)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetQuiz}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ulangi Kuis</span>
          </button>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="space-y-6">
        {QUIZ_QUESTIONS.map((q, qIdx) => {
          const userPick = selectedAnswers[q.id];
          const isAnswered = userPick !== undefined;
          const isCorrect = userPick === q.correctIndex;

          return (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-xl p-6"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    Soal 0{qIdx + 1}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{q.chapter}</span>
                </div>

                {isAnswered && (
                  <div
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                      isCorrect
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Jawaban Benar</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>Kurang Tepat</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-relaxed mb-5">
                <RichMathText text={q.question} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, optIdx) => {
                  const optionLetter = String.fromCharCode(65 + optIdx);
                  const isThisSelected = userPick === optIdx;
                  const isThisCorrect = q.correctIndex === optIdx;

                  let btnStyle =
                    'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800';

                  if (isAnswered) {
                    if (isThisCorrect) {
                      btnStyle =
                        'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 dark:border-emerald-600 text-emerald-950 dark:text-emerald-100 font-semibold';
                    } else if (isThisSelected && !isThisCorrect) {
                      btnStyle =
                        'bg-red-50 dark:bg-red-950/50 border-red-400 dark:border-red-700 text-red-950 dark:text-red-200';
                    } else {
                      btnStyle =
                        'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 text-slate-400 dark:text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`flex items-start gap-3 p-3.5 rounded-lg border text-left text-xs sm:text-sm transition-colors ${btnStyle} ${
                        !isAnswered ? 'cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <span className="font-mono font-bold shrink-0 mt-0.5">{optionLetter}.</span>
                      <span className="leading-relaxed">
                        <RichMathText text={opt} />
                      </span>
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-950/50 p-4 rounded-lg">
                  <p className="font-semibold text-slate-900 dark:text-white mb-1">
                    Pembahasan Soal 0{qIdx + 1}:
                  </p>
                  <p className="leading-relaxed">
                    <RichMathText text={q.explanation} />
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Final Score Banner when all 6 questions answered */}
      {answeredCount === totalQuestions && (
        <div className="mt-8 p-6 rounded-xl bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-500 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Evaluasi Selesai! Skor Akhir Kamu: <KaTeXMath math={`${scorePercent}/100`} />
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                Kamu menjawab benar <strong>{correctCount}</strong> dari{' '}
                <strong>{totalQuestions}</strong> soal evaluasi.{' '}
                {scorePercent >= 80
                  ? 'Luar biasa! Pemahamanmu terhadap ketiga materi Kelas XII sudah sangat matang.'
                  : 'Terus berlatih menggunakan Mini-Lab interaktif di atas dan coba ulangi kuis untuk hasil sempurna!'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetQuiz}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Kerjakan Ulang Kuis</span>
          </button>
        </div>
      )}
    </section>
  );
};
