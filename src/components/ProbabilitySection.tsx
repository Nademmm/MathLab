import React, { useState, useMemo } from 'react';
import { KaTeXMath, FormulaCard } from './MathText';
import {
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Dices,
  Calculator,
  RotateCcw,
} from 'lucide-react';

type DiceEventKey =
  | 'sum_even'
  | 'sum_gte_8'
  | 'sum_prime'
  | 'doubles'
  | 'first_prime'
  | 'sum_eq_7';

interface DiceEventOption {
  key: DiceEventKey;
  label: string;
  mathDesc: string;
  test: (d1: number, d2: number) => boolean;
}

const isPrime = (num: number) => [2, 3, 5, 7, 11].includes(num);

const DICE_EVENTS: DiceEventOption[] = [
  {
    key: 'sum_even',
    label: 'Jumlah Mata Dadu Genap',
    mathDesc: '(d_1 + d_2) \\text{ genap}',
    test: (d1, d2) => (d1 + d2) % 2 === 0,
  },
  {
    key: 'sum_gte_8',
    label: 'Jumlah Mata Dadu ≥ 8',
    mathDesc: 'd_1 + d_2 \\ge 8',
    test: (d1, d2) => d1 + d2 >= 8,
  },
  {
    key: 'sum_prime',
    label: 'Jumlah Mata Dadu Bilangan Prima',
    mathDesc: 'd_1 + d_2 \\in \\{2,3,5,7,11\\}',
    test: (d1, d2) => isPrime(d1 + d2),
  },
  {
    key: 'doubles',
    label: 'Mata Dadu Kembar',
    mathDesc: 'd_1 = d_2',
    test: (d1, d2) => d1 === d2,
  },
  {
    key: 'first_prime',
    label: 'Dadu Pertama Bilangan Prima',
    mathDesc: 'd_1 \\in \\{2,3,5\\}',
    test: (d1) => [2, 3, 5].includes(d1),
  },
  {
    key: 'sum_eq_7',
    label: 'Jumlah Mata Dadu = 7',
    mathDesc: 'd_1 + d_2 = 7',
    test: (d1, d2) => d1 + d2 === 7,
  },
];

function factorial(n: number): number {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function formatFractionLatex(num: number, den: number): string {
  if (den === 0) return '0';
  if (num === 0) return '0';
  const g = gcd(num, den);
  const sNum = num / g;
  const sDen = den / g;
  if (sNum === num && sDen === den) {
    return `\\frac{${num}}{${den}}`;
  }
  return `\\frac{${num}}{${den}} = \\frac{${sNum}}{${sDen}}`;
}

export const ProbabilitySection: React.FC = () => {
  // Part A: Permutation & Combination Calculator state
  const [nVal, setNVal] = useState<number>(8);
  const [rVal, setRVal] = useState<number>(3);

  // Part B: 2-Dice Sample Space Simulator state
  const [eventAKey, setEventAKey] = useState<DiceEventKey>('sum_even');
  const [eventBKey, setEventBKey] = useState<DiceEventKey>('sum_gte_8');

  // Accordion state for Contoh Soal
  const [openSolution1, setOpenSolution1] = useState<boolean>(false);
  const [openSolution2, setOpenSolution2] = useState<boolean>(false);

  const safeN = Math.max(1, Math.min(15, nVal));
  const safeR = Math.max(0, Math.min(safeN, rVal));

  const combStats = useMemo(() => {
    const nFact = factorial(safeN);
    const nmrFact = factorial(safeN - safeR);
    const rFact = factorial(safeR);

    const perm = Math.round(nFact / nmrFact);
    const comb = Math.round(nFact / (rFact * nmrFact));

    const descendingTerms: number[] = [];
    for (let i = 0; i < safeR; i++) {
      descendingTerms.push(safeN - i);
    }
    const multChain = descendingTerms.length > 0 ? descendingTerms.join(' \\times ') : '1';

    return {
      perm,
      comb,
      rFact,
      multChain,
      permLatex: `P(${safeN}, ${safeR}) = \\frac{${safeN}!}{(${safeN} - ${safeR})!} = \\frac{${safeN}!}{${
        safeN - safeR
      }!} = ${multChain} = \\mathbf{${perm.toLocaleString('id-ID')}}`,
      combLatex: `C(${safeN}, ${safeR}) = \\frac{${safeN}!}{${safeR}!(${safeN} - ${safeR})!} = \\frac{${multChain}}{${safeR}!} = \\frac{${perm}}{${rFact}} = \\mathbf{${comb.toLocaleString(
        'id-ID'
      )}}`,
    };
  }, [safeN, safeR]);

  const eventA = useMemo(
    () => DICE_EVENTS.find((e) => e.key === eventAKey) ?? DICE_EVENTS[0],
    [eventAKey]
  );
  const eventB = useMemo(
    () => DICE_EVENTS.find((e) => e.key === eventBKey) ?? DICE_EVENTS[1],
    [eventBKey]
  );

  const diceStats = useMemo(() => {
    let countA = 0;
    let countB = 0;
    let countIntersect = 0;
    let countUnion = 0;

    for (let d1 = 1; d1 <= 6; d1++) {
      for (let d2 = 1; d2 <= 6; d2++) {
        const inA = eventA.test(d1, d2);
        const inB = eventB.test(d1, d2);
        if (inA) countA++;
        if (inB) countB++;
        if (inA && inB) countIntersect++;
        if (inA || inB) countUnion++;
      }
    }

    return {
      countA,
      countB,
      countIntersect,
      countUnion,
      isDisjoint: countIntersect === 0,
    };
  }, [eventA, eventB]);

  return (
    <section id="materi-3" className="scroll-mt-20 py-12 border-b border-[#E5E7EB] dark:border-slate-800">
      {/* Chapter Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-indigo-700 dark:text-indigo-400 mb-2">
          <span>Materi 03</span>
          <span aria-hidden="true">·</span>
          <span>Kombinatorika & Teori Peluang</span>
          <span aria-hidden="true">·</span>
          <span>Kelas XII</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          03. Kaidah Pencacahan & Peluang Kejadian Majemuk
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          Menghitung banyaknya kemungkinan susunan secara sistematis (Permutasi & Kombinasi) serta
          menerapkannya untuk menganalisis peluang gabungan dua kejadian atau lebih.
        </p>
      </div>

      {/* 1. PENJELASAN SINGKAT */}
      <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-xl p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          <span>Sub-Bagian 3.1</span>
          <span aria-hidden="true">·</span>
          <span>Penjelasan Singkat & Jembatan Konsep</span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Dari Menghitung Kemungkinan Menuju Peluang Kejadian Majemuk
        </h3>

        <div className="space-y-4 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Sebelum kita bisa menghitung peluang (<KaTeXMath math="P(A) = \frac{n(A)}{n(S)}" />),
            kita harus tahu dulu cara menghitung berapa banyak anggota kejadian{' '}
            <KaTeXMath math="n(A)" /> dan ruang sampel <KaTeXMath math="n(S)" /> tanpa harus
            mencacahnya satu per satu secara manual. Di sinilah <strong>Kaidah Pencacahan</strong>{' '}
            bekerja:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
            <li>
              <strong>Aturan Penjumlahan vs Aturan Perkalian:</strong> Jika dua pilihan{' '}
              <em>tidak bisa dipilih sekaligus</em> (kata kunci: <strong>ATAU</strong>), jumlahkan
              banyak pilihannya (<KaTeXMath math="k_1 + k_2" />). Jika tahapan dilakukan{' '}
              <em>berurutan / sekaligus</em> (kata kunci: <strong>DAN</strong>), kalikan banyak
              pilihannya (<KaTeXMath math="k_1 \times k_2" />).
            </li>
            <li>
              <strong>Permutasi vs Kombinasi (Perbedaan Kunci!):</strong> Tanyakan satu hal pada
              soal: <em>&ldquo;Apakah urutan posisi mengubah arti?&rdquo;</em> Jika{' '}
              <strong>URUTAN PENTING</strong> (seperti memilih Ketua–Sekretaris–Bendahara, PIN ATM,
              atau juara 1–2–3 di mana <KaTeXMath math="AB \ne BA" />), gunakan{' '}
              <strong>Permutasi</strong>. Sebaliknya, jika <strong>URUTAN TIDAK PENTING</strong>{' '}
              (seperti memilih 3 anggota tim delegasi atau mengambil 2 bola sekaligus di mana{' '}
              <KaTeXMath math="AB = BA" />), gunakan <strong>Kombinasi</strong>.
            </li>
          </ul>
        </div>

        {/* 4 Compound Probability Categories */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            4 Jenis Peluang Kejadian Majemuk yang Wajib Dibedakan:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-xs font-mono text-indigo-700 dark:text-indigo-400 mb-1">
                Kata Kunci: ATAU (<KaTeXMath math="A \cap B = \emptyset" />)
              </div>
              <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                1. Saling Lepas
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Dua kejadian yang <strong>tidak mungkin terjadi bersamaan</strong> (tidak punya
                irisan). Contoh: muncul mata dadu jumlah 4 atau jumlah 11.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-xs font-mono text-indigo-700 dark:text-indigo-400 mb-1">
                Kata Kunci: ATAU (<KaTeXMath math="A \cap B \ne \emptyset" />)
              </div>
              <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                2. Tidak Saling Lepas
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Dua kejadian yang <strong>memiliki anggota persekutuan (irisan)</strong>. Irisannya
                wajib dikurangkan agar tidak terhitung dua kali.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-xs font-mono text-indigo-700 dark:text-indigo-400 mb-1">
                Kata Kunci: DAN (Independen)
              </div>
              <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                3. Saling Bebas
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Kejadian <KaTeXMath math="A" /> <strong>tidak memengaruhi</strong> peluang terjadinya
                kejadian <KaTeXMath math="B" />. Contoh: melempar dadu dan koin bersama.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-xs font-mono text-indigo-700 dark:text-indigo-400 mb-1">
                Kata Kunci: DENGAN SYARAT
              </div>
              <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                4. Kejadian Bersyarat
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Peluang kejadian <KaTeXMath math="A" /> jika diketahui kejadian <KaTeXMath math="B" />{' '}
                sudah terjadi lebih dulu (misal: pengambilan bola tanpa pengembalian).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RUMUS-RUMUS PENTING */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          <span>Sub-Bagian 3.2</span>
          <span aria-hidden="true">·</span>
          <span>Rumus-Rumus Penting (KaTeX)</span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Daftar Rumus Pencacahan & Peluang Majemuk
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormulaCard
            title="Permutasi r Unsur dari n Unsur"
            subtitle="Urutan diperhatikan (AB ≠ BA)"
            latex="P(n, r) = \frac{n!}{(n-r)!}"
            accentColor="indigo"
            variables={[
              { symbol: 'n', meaning: 'Total seluruh objek yang tersedia' },
              { symbol: 'r', meaning: 'Banyaknya objek yang dipilih dan disusun berurutan ($r \\le n$)' },
              { symbol: 'n!', meaning: 'Faktorial dari $n$ ($n \\times (n-1) \\times \\dots \\times 1$)' },
            ]}
          />

          <FormulaCard
            title="Kombinasi r Unsur dari n Unsur"
            subtitle="Urutan TIDAK diperhatikan (AB = BA)"
            latex="C(n, r) = \frac{n!}{r!(n-r)!}"
            accentColor="indigo"
            variables={[
              { symbol: 'C(n,r)', meaning: 'Banyak kombinasi $r$ objek dari $n$ objek tanpa melihat urutan' },
              { symbol: 'r!', meaning: 'Pembagi untuk menghilangkan duplikasi urutan ($P(n,r) / r!$)' },
            ]}
          />

          <FormulaCard
            title="Peluang Kejadian Dasar"
            subtitle="Rasio titik sampel kejadian terhadap ruang sampel"
            latex="P(A) = \frac{n(A)}{n(S)}"
            accentColor="indigo"
            variables={[
              { symbol: 'n(A)', meaning: 'Banyaknya anggota/titik sampel kejadian $A$' },
              { symbol: 'n(S)', meaning: 'Banyaknya seluruh titik sampel dalam ruang sampel $S$' },
            ]}
          />

          <FormulaCard
            title="Kejadian Saling Lepas"
            subtitle="Gabungan dua kejadian tanpa irisan (A ∩ B = ∅)"
            latex="P(A \cup B) = P(A) + P(B)"
            accentColor="indigo"
            variables={[
              { symbol: 'A \\cup B', meaning: 'Kejadian munculnya $A$ ATAU $B$' },
              { symbol: 'P(A \\cap B)', meaning: 'Bernilai $0$ karena kedua kejadian mustahil terjadi serentak' },
            ]}
          />

          <FormulaCard
            title="Kejadian Tidak Saling Lepas"
            subtitle="Gabungan dua kejadian yang memiliki irisan"
            latex="P(A \cup B) = P(A) + P(B) - P(A \cap B)"
            accentColor="indigo"
            variables={[
              { symbol: 'P(A \\cap B)', meaning: 'Peluang irisan ($A$ dan $B$ terjadi sekaligus)' },
            ]}
          />

          <FormulaCard
            title="Kejadian Saling Bebas & Bersyarat"
            subtitle="Irisan dua kejadian independen vs bersyarat"
            latex="P(A \cap B) = P(A) \times P(B) \quad \Big| \quad P(A|B) = \frac{P(A \cap B)}{P(B)}"
            accentColor="indigo"
            variables={[
              { symbol: 'P(A \\cap B)', meaning: 'Peluang $A$ DAN $B$ terjadi bersama (saling bebas)' },
              { symbol: 'P(A|B)', meaning: 'Peluang terjadinya $A$ dengan syarat $B$ telah terjadi ($P(B) > 0$)' },
            ]}
          />
        </div>
      </div>

      {/* 3. MINI-LAB INTERAKTIF */}
      <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-xl p-6 sm:p-8 mb-8 space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-indigo-700 dark:text-indigo-400 mb-1">
            <span>Sub-Bagian 3.3</span>
            <span aria-hidden="true">·</span>
            <span>Mini-Lab Interaktif Ganda</span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
            Kalkulator Pencacahan & Simulator Ruang Sampel 2 Dadu (36 Kemungkinan)
          </h3>
        </div>

        {/* LAB PART A: Permutation vs Combination Calculator */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                Panel A: Kalkulator Perbandingan <KaTeXMath math="P(n, r)" /> vs{' '}
                <KaTeXMath math="C(n, r)" />
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setNVal(8);
                  setRVal(3);
                }}
                className="px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-md hover:bg-indigo-100 cursor-pointer"
              >
                Muat Angka Contoh Soal 1 (n=8, r=3)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-4 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Total Unsur Tersedia (<KaTeXMath math="n" />)
                  </span>
                  <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400">
                    n = {safeN}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={safeN}
                  onChange={(e) => {
                    const nextN = Number(e.target.value);
                    setNVal(nextN);
                    if (rVal > nextN) setRVal(nextN);
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Unsur yang Dipilih (<KaTeXMath math="r \le n" />)
                  </span>
                  <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400">
                    r = {safeR}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={safeN}
                  value={safeR}
                  onChange={(e) => setRVal(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                Nilai Permutasi selalu <KaTeXMath math={`r! = ${safeR}! = ${combStats.rFact}`} />{' '}
                kali lipat lebih besar daripada nilai Kombinasi pada <KaTeXMath math="n" /> dan{' '}
                <KaTeXMath math="r" /> yang sama.
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                    Permutasi (Urutan Penting)
                  </span>
                  <span className="text-xs font-mono text-slate-500">Jabatan / Posisi</span>
                </div>
                <div className="text-xs sm:text-sm overflow-x-auto py-1">
                  <KaTeXMath block math={combStats.permLatex} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Kombinasi (Urutan Tidak Penting)
                  </span>
                  <span className="text-xs font-mono text-slate-500">Tim / Delegasi</span>
                </div>
                <div className="text-xs sm:text-sm overflow-x-auto py-1">
                  <KaTeXMath block math={combStats.combLatex} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LAB PART B: 2-Dice Sample Space Matrix (36 Outcomes) */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <Dices className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                  Panel B: Simulator Ruang Sampel Pelemparan 2 Dadu (<KaTeXMath math="n(S) = 36" />)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pilih filter Kejadian <KaTeXMath math="A" /> dan Kejadian <KaTeXMath math="B" />{' '}
                  untuk menyorot titik sampel serta menghitung <KaTeXMath math="P(A \cup B)" /> dan{' '}
                  <KaTeXMath math="P(A \cap B)" />.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setEventAKey('sum_even');
                setEventBKey('sum_gte_8');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-md cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 6x6 Sample Space Table (7 cols) */}
            <div className="lg:col-span-7">
              <div className="overflow-x-auto">
                <table className="w-full text-center font-mono text-xs tabular-nums border-collapse bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <th className="py-2.5 px-2 border border-slate-200 dark:border-slate-700">
                        D1 \ D2
                      </th>
                      {[1, 2, 3, 4, 5, 6].map((d2) => (
                        <th
                          key={d2}
                          className="py-2.5 px-2 border border-slate-200 dark:border-slate-700 font-semibold"
                        >
                          Dadu 2 = {d2}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5, 6].map((d1) => (
                      <tr key={d1}>
                        <th className="py-2.5 px-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold">
                          Dadu 1 = {d1}
                        </th>
                        {[1, 2, 3, 4, 5, 6].map((d2) => {
                          const inA = eventA.test(d1, d2);
                          const inB = eventB.test(d1, d2);
                          const inBoth = inA && inB;

                          let cellClass =
                            'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400';
                          let tagLabel = '';

                          if (inBoth) {
                            cellClass =
                              'bg-amber-100 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200 font-bold ring-1 ring-inset ring-amber-400';
                            tagLabel = 'A∩B';
                          } else if (inA) {
                            cellClass =
                              'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-semibold';
                            tagLabel = 'A';
                          } else if (inB) {
                            cellClass =
                              'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold';
                            tagLabel = 'B';
                          }

                          return (
                            <td
                              key={d2}
                              className={`py-2 px-1.5 border border-slate-200 dark:border-slate-800 transition-colors ${cellClass}`}
                            >
                              <div>({d1},{d2})</div>
                              <div className="text-[10px] opacity-75">
                                Σ={d1 + d2} {tagLabel ? `· ${tagLabel}` : ''}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend with explicit text tags (no color-only signaling) */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-800 font-mono text-[10px] text-indigo-900 dark:text-indigo-200">
                    A
                  </span>
                  <span>Hanya Kejadian A</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 font-mono text-[10px] text-emerald-900 dark:text-emerald-200">
                    B
                  </span>
                  <span>Hanya Kejadian B</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 border border-amber-400 font-mono text-[10px] font-bold text-amber-950 dark:text-amber-200">
                    A∩B
                  </span>
                  <span>Irisan Keduanya (<KaTeXMath math="A \cap B" />)</span>
                </div>
              </div>
            </div>

            {/* Event Selectors & Probability Output (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-indigo-700 dark:text-indigo-400 mb-1">
                    Pilih Kejadian A (<KaTeXMath math={`n(A) = ${diceStats.countA}`} />):
                  </label>
                  <select
                    value={eventAKey}
                    onChange={(e) => setEventAKey(e.target.value as DiceEventKey)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {DICE_EVENTS.map((ev) => (
                      <option key={ev.key} value={ev.key}>
                        {ev.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                    Pilih Kejadian B (<KaTeXMath math={`n(B) = ${diceStats.countB}`} />):
                  </label>
                  <select
                    value={eventBKey}
                    onChange={(e) => setEventBKey(e.target.value as DiceEventKey)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {DICE_EVENTS.map((ev) => (
                      <option key={ev.key} value={ev.key}>
                        {ev.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Computed Compound Probability Cards */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Status Hubungan Kejadian:
                  </span>
                  <span className="font-medium text-indigo-700 dark:text-indigo-400">
                    {diceStats.isDisjoint
                      ? 'Saling Lepas (A ∩ B = ∅)'
                      : `Tidak Saling Lepas (n(A ∩ B) = ${diceStats.countIntersect})`}
                  </span>
                </div>

                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Peluang <KaTeXMath math="P(A)" />:
                    </span>
                    <span className="font-semibold">
                      <KaTeXMath math={formatFractionLatex(diceStats.countA, 36)} />
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Peluang <KaTeXMath math="P(B)" />:
                    </span>
                    <span className="font-semibold">
                      <KaTeXMath math={formatFractionLatex(diceStats.countB, 36)} />
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Irisan <KaTeXMath math="P(A \cap B)" />:
                    </span>
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      <KaTeXMath math={formatFractionLatex(diceStats.countIntersect, 36)} />
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Gabungan <KaTeXMath math="P(A \cup B) = P(A) + P(B) - P(A \cap B)" />:
                    </p>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 overflow-x-auto">
                      <KaTeXMath
                        math={`P(A \\cup B) = \\frac{${diceStats.countA}}{36} + \\frac{${diceStats.countB}}{36} - \\frac{${diceStats.countIntersect}}{36} = ${formatFractionLatex(
                          diceStats.countUnion,
                          36
                        )}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 & 5. CONTOH SOAL & PEMBAHASAN TERVERIFIKASI */}
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          <span>Sub-Bagian 3.4 & 3.5</span>
          <span aria-hidden="true">·</span>
          <span>Contoh Soal Bertahap & Pembahasan Step-by-Step Terverifikasi</span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Latihan Contoh Soal Kaidah Pencacahan & Peluang Majemuk
        </h3>

        <div className="space-y-4">
          {/* SOAL 1 */}
          <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 text-xs font-medium text-indigo-700 dark:text-indigo-400">
                  <span>Contoh Soal 1</span>
                  <span aria-hidden="true">·</span>
                  <span>Tingkat Dasar</span>
                  <span aria-hidden="true">·</span>
                  <span>Perbandingan Permutasi vs Kombinasi</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNVal(8);
                    setRVal(3);
                    document.getElementById('materi-3')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <span>Uji di Kalkulator Mini-Lab</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                Dari <KaTeXMath math="8" /> orang calon pengurus organisasi siswa di sekolah,
                tentukan:
                <br />
                <strong>(a)</strong> Banyaknya cara memilih pengurus inti yang terdiri atas{' '}
                <strong>Ketua, Sekretaris, dan Bendahara</strong>.
                <br />
                <strong>(b)</strong> Banyaknya cara memilih <strong>3 orang tim delegasi</strong>{' '}
                untuk mewakili sekolah tanpa jabatan khusus.
              </p>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setOpenSolution1(!openSolution1)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <span>{openSolution1 ? 'Sembunyikan Pembahasan' : 'Tampilkan Pembahasan'}</span>
                  {openSolution1 ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {openSolution1 && (
              <div className="px-6 pb-6 pt-4 bg-slate-50/70 dark:bg-slate-950/60 border-t border-slate-200/80 dark:border-slate-800 space-y-4 text-sm text-slate-700 dark:text-slate-300">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Bagian (a): Memilih Ketua, Sekretaris, dan Bendahara (Urutan Penting → Permutasi)
                  </h4>
                  <p>
                    Karena jabatan Ketua, Sekretaris, dan Bendahara berbeda (misal Andi sebagai
                    Ketua dan Budi sebagai Sekretaris berbeda dengan Budi sebagai Ketua dan Andi
                    sebagai Sekretaris), maka <strong>urutan diperhatikan</strong>. Gunakan rumus
                    Permutasi dengan <KaTeXMath math="n = 8" /> dan <KaTeXMath math="r = 3" />:
                  </p>
                  <KaTeXMath
                    block
                    math="P(8, 3) = \frac{8!}{(8 - 3)!} = \frac{8!}{5!} = \frac{8 \times 7 \times 6 \times 5!}{5!} = 8 \times 7 \times 6 = 336 \text{ cara}"
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Bagian (b): Memilih 3 Orang Tim Delegasi Tanpa Jabatan (Urutan Tidak Penting → Kombinasi)
                  </h4>
                  <p>
                    Karena ketiga orang yang terpilih memiliki status yang sama sebagai anggota
                    delegasi, maka <strong>urutan tidak diperhatikan</strong>. Gunakan rumus
                    Kombinasi dengan <KaTeXMath math="n = 8" /> dan <KaTeXMath math="r = 3" />:
                  </p>
                  <KaTeXMath
                    block
                    math="C(8, 3) = \frac{8!}{3!(8 - 3)!} = \frac{8!}{3!5!} = \frac{8 \times 7 \times 6}{3 \times 2 \times 1} = \frac{336}{6} = 56 \text{ cara}"
                  />
                  <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-slate-800 dark:text-slate-200">
                    <strong>Kesimpulan:</strong> (a) Terdapat <strong><KaTeXMath math="336" /> cara</strong>{' '}
                    memilih Ketua, Sekretaris, dan Bendahara; (b) Terdapat{' '}
                    <strong><KaTeXMath math="56" /> cara</strong> memilih 3 orang tim delegasi.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SOAL 2 */}
          <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 text-xs font-medium text-indigo-700 dark:text-indigo-400">
                  <span>Contoh Soal 2</span>
                  <span aria-hidden="true">·</span>
                  <span>Tingkat Aplikasi & Kombinasi</span>
                  <span aria-hidden="true">·</span>
                  <span>Kejadian Tidak Saling Lepas & Saling Bebas</span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                Sebuah dadu bersisi 6 dan sebuah koin dilempar secara bersamaan satu kali.
                <br />
                <strong>(a)</strong> Pada pelemparan dadu saja, berapakah peluang munculnya mata
                dadu <strong>angka genap ATAU bilangan prima</strong>?
                <br />
                <strong>(b)</strong> Berapakah peluang munculnya <strong>mata dadu lebih dari 4 DAN sisi angka pada koin</strong> secara bersamaan?
              </p>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setOpenSolution2(!openSolution2)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <span>{openSolution2 ? 'Sembunyikan Pembahasan' : 'Tampilkan Pembahasan'}</span>
                  {openSolution2 ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {openSolution2 && (
              <div className="px-6 pb-6 pt-4 bg-slate-50/70 dark:bg-slate-950/60 border-t border-slate-200/80 dark:border-slate-800 space-y-4 text-sm text-slate-700 dark:text-slate-300">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Bagian (a): Peluang Dadu Genap ATAU Prima (Kejadian Tidak Saling Lepas)
                  </h4>
                  <p>
                    Ruang sampel sebuah dadu adalah <KaTeXMath math="S = \{1, 2, 3, 4, 5, 6\}" />{' '}
                    dengan <KaTeXMath math="n(S) = 6" />.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>
                      Kejadian mata dadu genap: <KaTeXMath math="A = \{2, 4, 6\} \implies n(A) = 3 \implies P(A) = \frac{3}{6}" />
                    </li>
                    <li>
                      Kejadian mata dadu prima: <KaTeXMath math="B = \{2, 3, 5\} \implies n(B) = 3 \implies P(B) = \frac{3}{6}" />
                    </li>
                    <li>
                      Irisan keduanya (genap sekaligus prima):{' '}
                      <KaTeXMath math="A \cap B = \{2\} \implies n(A \cap B) = 1 \implies P(A \cap B) = \frac{1}{6}" />
                    </li>
                  </ul>
                  <p className="mt-2">
                    Karena memiliki irisan (<KaTeXMath math="A \cap B \ne \emptyset" />), kedua
                    kejadian bersifat <strong>tidak saling lepas</strong>:
                  </p>
                  <KaTeXMath
                    block
                    math="P(A \cup B) = P(A) + P(B) - P(A \cap B) = \frac{3}{6} + \frac{3}{6} - \frac{1}{6} = \frac{5}{6}"
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Bagian (b): Peluang Dadu Lebih dari 4 DAN Koin Sisi Angka (Kejadian Saling Bebas)
                  </h4>
                  <p>
                    Hasil lemparan dadu sama sekali tidak memengaruhi hasil lemparan koin, sehingga
                    keduanya merupakan <strong>kejadian saling bebas</strong>:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>
                      Kejadian mata dadu <KaTeXMath math="> 4" />:{' '}
                      <KaTeXMath math="C = \{5, 6\} \implies P(C) = \frac{2}{6} = \frac{1}{3}" />
                    </li>
                    <li>
                      Kejadian muncul sisi Angka pada koin (dari ruang sampel{' '}
                      <KaTeXMath math="\{\text{Angka}, \text{Gambar}\}" />):{' '}
                      <KaTeXMath math="P(D) = \frac{1}{2}" />
                    </li>
                  </ul>
                  <KaTeXMath
                    block
                    math="P(C \cap D) = P(C) \times P(D) = \frac{1}{3} \times \frac{1}{2} = \frac{1}{6}"
                  />
                  <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-slate-800 dark:text-slate-200">
                    <strong>Kesimpulan:</strong> (a) Peluang muncul mata dadu genap atau prima
                    adalah <strong><KaTeXMath math="\frac{5}{6}" /></strong>; (b) Peluang muncul
                    mata dadu lebih dari 4 dan sisi angka pada koin adalah{' '}
                    <strong><KaTeXMath math="\frac{1}{6}" /></strong>.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
