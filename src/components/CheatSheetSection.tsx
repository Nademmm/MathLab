import React from 'react';
import { KaTeXMath } from './MathText';
import { Printer } from 'lucide-react';

export const CheatSheetSection: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="ringkasan" className="scroll-mt-20 py-12">
      <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-xl p-6 sm:p-8 print-only-sheet">
        {/* Header Ringkasan */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 mb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              <span>Cheat Sheet Mode</span>
              <span aria-hidden="true">·</span>
              <span>Naadhim Fahly Mubaarok</span>
              <span aria-hidden="true">·</span>
              <span>XII SIJA 2 — SMK Telkom Sidoarjo</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Ringkasan Cepat Rumus Matematika Kelas XII (3 Materi Utama)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Rangkuman seluruh rumus inti Statistika Regresi, Transformasi Fungsi, dan Kaidah
              Pencacahan & Peluang dalam satu halaman siap cetak.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="no-print inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>

        {/* 3 Columns Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Statistika Regresi */}
          <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="text-xs font-mono text-blue-700 dark:text-blue-400">MATERI 01</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Statistika Regresi & Korelasi
            </h3>

            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white mb-1">
                  1. Persamaan Regresi Linear
                </p>
                <KaTeXMath block math="\hat{y} = a + bx" />
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white mb-1">
                  2. Gradien (<KaTeXMath math="b" />) & Konstanta (<KaTeXMath math="a" />)
                </p>
                <KaTeXMath
                  block
                  math="b = \frac{n\sum xy - (\sum x)(\sum y)}{n\sum x^2 - (\sum x)^2}"
                />
                <KaTeXMath block math="a = \bar{y} - b\bar{x}" />
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white mb-1">
                  3. Korelasi Pearson (<KaTeXMath math="r" />) & Determinasi (<KaTeXMath math="R^2" />)
                </p>
                <KaTeXMath
                  block
                  math="r = \frac{n\sum xy - (\sum x)(\sum y)}{\sqrt{[n\sum x^2 - (\sum x)^2][n\sum y^2 - (\sum y)^2]}}"
                />
                <KaTeXMath block math="R^2 = r^2 \times 100\%" />
              </div>
            </div>
          </div>

          {/* Column 2: Transformasi Fungsi */}
          <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400">MATERI 02</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Transformasi Fungsi <KaTeXMath math="y = f(x)" />
            </h3>

            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white mb-1">
                  1. Translasi (Pergeseran)
                </p>
                <p>
                  Vertikal (<KaTeXMath math="k" />): <KaTeXMath math="y = f(x) + k" />
                </p>
                <p className="mt-1">
                  Horizontal (<KaTeXMath math="h" />): <KaTeXMath math="y = f(x - h)" />
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white mb-1">
                  2. Refleksi (Pencerminan)
                </p>
                <p>
                  Sumbu-<KaTeXMath math="X" />: <KaTeXMath math="y = -f(x)" />
                </p>
                <p className="mt-1">
                  Sumbu-<KaTeXMath math="Y" />: <KaTeXMath math="y = f(-x)" />
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white mb-1">
                  3. Dilatasi & Rotasi Titik Asal <KaTeXMath math="O(0,0)" />
                </p>
                <p>
                  Vertikal skala <KaTeXMath math="a" />: <KaTeXMath math="y = a \cdot f(x)" />
                </p>
                <p className="mt-1">
                  Horizontal skala <KaTeXMath math="k" />:{' '}
                  <KaTeXMath math="y = f\left(\frac{x}{k}\right)" />
                </p>
                <p className="mt-1">
                  Rotasi <KaTeXMath math="90^\circ: (-y, x)" /> | <KaTeXMath math="180^\circ: (-x, -y)" /> |{' '}
                  <KaTeXMath math="270^\circ: (y, -x)" />
                </p>
              </div>
            </div>
          </div>

          {/* Column 3: Pencacahan & Peluang */}
          <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="text-xs font-mono text-indigo-700 dark:text-indigo-400">MATERI 03</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Kaidah Pencacahan & Peluang Majemuk
            </h3>

            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white mb-1">
                  1. Permutasi vs Kombinasi
                </p>
                <KaTeXMath
                  block
                  math="P(n, r) = \frac{n!}{(n-r)!} \quad \Big| \quad C(n, r) = \frac{n!}{r!(n-r)!}"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white mb-1">
                  2. Peluang Saling Lepas & Tidak Saling Lepas
                </p>
                <KaTeXMath block math="P(A \cup B) = P(A) + P(B)" />
                <KaTeXMath block math="P(A \cup B) = P(A) + P(B) - P(A \cap B)" />
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white mb-1">
                  3. Peluang Saling Bebas & Bersyarat
                </p>
                <KaTeXMath
                  block
                  math="P(A \cap B) = P(A) \times P(B) \quad \Big| \quad P(A|B) = \frac{P(A \cap B)}{P(B)}"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
