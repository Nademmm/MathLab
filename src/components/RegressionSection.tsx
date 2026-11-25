import React, { useState, useMemo, useRef, useEffect } from 'react';
import { KaTeXMath, RichMathText, FormulaCard } from './MathText';
import {
  Plus,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Calculator,
  ArrowUpRight,
} from 'lucide-react';

interface DataPoint {
  id: string;
  x: number;
  y: number;
}

const PRESET_SOAL_1: DataPoint[] = [
  { id: '1', x: 2, y: 60 },
  { id: '2', x: 4, y: 70 },
  { id: '3', x: 6, y: 80 },
  { id: '4', x: 8, y: 85 },
  { id: '5', x: 10, y: 95 },
];

const PRESET_SOAL_2: DataPoint[] = [
  { id: '1', x: 1, y: 5 },
  { id: '2', x: 2, y: 9 },
  { id: '3', x: 3, y: 11 },
  { id: '4', x: 4, y: 12 },
  { id: '5', x: 5, y: 13 },
];

const PRESET_NEGATIF: DataPoint[] = [
  { id: '1', x: 1, y: 92 },
  { id: '2', x: 2, y: 85 },
  { id: '3', x: 3, y: 76 },
  { id: '4', x: 4, y: 68 },
  { id: '5', x: 5, y: 60 },
];

interface RegressionSectionProps {
  isDark: boolean;
}

export const RegressionSection: React.FC<RegressionSectionProps> = ({ isDark }) => {
  const [points, setPoints] = useState<DataPoint[]>(PRESET_SOAL_1);
  const [activePreset, setActivePreset] = useState<'soal1' | 'soal2' | 'negatif' | 'custom'>('soal1');
  const [predictX, setPredictX] = useState<string>('7');
  const [showResidual, setShowResidual] = useState<boolean>(true);
  const [openSolution1, setOpenSolution1] = useState<boolean>(false);
  const [openSolution2, setOpenSolution2] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stats = useMemo(() => {
    const n = points.length;
    if (n < 2) {
      return {
        n,
        sumX: 0,
        sumY: 0,
        sumX2: 0,
        sumY2: 0,
        sumXY: 0,
        meanX: 0,
        meanY: 0,
        b: 0,
        a: 0,
        r: 0,
        r2Percent: 0,
        numB: 0,
        denX: 0,
        denY: 0,
        valid: false,
      };
    }

    let sumX = 0;
    let sumY = 0;
    let sumX2 = 0;
    let sumY2 = 0;
    let sumXY = 0;

    for (const p of points) {
      sumX += p.x;
      sumY += p.y;
      sumX2 += p.x * p.x;
      sumY2 += p.y * p.y;
      sumXY += p.x * p.y;
    }

    const meanX = sumX / n;
    const meanY = sumY / n;

    const numB = n * sumXY - sumX * sumY;
    const denX = n * sumX2 - sumX * sumX;
    const denY = n * sumY2 - sumY * sumY;

    const b = denX !== 0 ? numB / denX : 0;
    const a = meanY - b * meanX;

    const denR = Math.sqrt(Math.max(0, denX * denY));
    const r = denR !== 0 ? numB / denR : 0;
    const r2Percent = r * r * 100;

    return {
      n,
      sumX,
      sumY,
      sumX2,
      sumY2,
      sumXY,
      meanX,
      meanY,
      b,
      a,
      r,
      r2Percent,
      numB,
      denX,
      denY,
      valid: denX !== 0,
    };
  }, [points]);

  const numericPredictX = Number(predictX);
  const predictedY = !Number.isNaN(numericPredictX)
    ? stats.a + stats.b * numericPredictX
    : null;

  const correlationLabel = useMemo(() => {
    if (!stats.valid) return 'Data belum cukup';
    const absR = Math.abs(stats.r);
    const direction = stats.r > 0.05 ? 'Positif' : stats.r < -0.05 ? 'Negatif' : 'Tidak Berkorelasi';
    if (absR < 0.05) return 'Tidak Berkorelasi';
    if (absR >= 0.8) return `Korelasi ${direction} Sangat Kuat`;
    if (absR >= 0.6) return `Korelasi ${direction} Kuat`;
    if (absR >= 0.4) return `Korelasi ${direction} Sedang`;
    return `Korelasi ${direction} Lemah`;
  }, [stats]);

  // Draw Scatter Plot & Regression Line on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 360;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Colors based on theme
    const bgColor = isDark ? '#0f172a' : '#ffffff';
    const gridColor = isDark ? '#1e293b' : '#f1f5f9';
    const axisColor = isDark ? '#475569' : '#94a3b8';
    const textColor = isDark ? '#94a3b8' : '#475569';
    const lineColor = isDark ? '#38bdf8' : '#2563eb';
    const pointColor = isDark ? '#f8fafc' : '#0f172a';
    const pointStroke = isDark ? '#38bdf8' : '#2563eb';
    const predictColor = isDark ? '#fbbf24' : '#d97706';
    const residualColor = isDark ? 'rgba(148, 163, 184, 0.45)' : 'rgba(100, 116, 139, 0.4)';

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const padLeft = 52;
    const padRight = 28;
    const padTop = 28;
    const padBottom = 42;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const allX = points.map((p) => p.x);
    const allY = points.map((p) => p.y);

    if (predictedY !== null && !Number.isNaN(numericPredictX)) {
      allX.push(numericPredictX);
      allY.push(predictedY);
    }

    let minX = allX.length ? Math.min(...allX) : 0;
    let maxX = allX.length ? Math.max(...allX) : 10;
    let minY = allY.length ? Math.min(...allY) : 0;
    let maxY = allY.length ? Math.max(...allY) : 100;

    if (maxX === minX) {
      minX -= 2;
      maxX += 2;
    }
    if (maxY === minY) {
      minY -= 10;
      maxY += 10;
    }

    const spanX = maxX - minX;
    const spanY = maxY - minY;
    minX = Math.max(0, minX - spanX * 0.15);
    maxX = maxX + spanX * 0.15;
    minY = minY - spanY * 0.18;
    maxY = maxY + spanY * 0.18;

    const toScreenX = (x: number) => padLeft + ((x - minX) / (maxX - minX)) * plotW;
    const toScreenY = (y: number) => padTop + plotH - ((y - minY) / (maxY - minY)) * plotH;

    // Grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = textColor;

    const xTicks = 5;
    for (let i = 0; i <= xTicks; i++) {
      const valX = minX + (i / xTicks) * (maxX - minX);
      const sx = toScreenX(valX);
      ctx.beginPath();
      ctx.moveTo(sx, padTop);
      ctx.lineTo(sx, padTop + plotH);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillText(valX.toFixed(1), sx, padTop + plotH + 18);
    }

    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const valY = minY + (i / yTicks) * (maxY - minY);
      const sy = toScreenY(valY);
      ctx.beginPath();
      ctx.moveTo(padLeft, sy);
      ctx.lineTo(padLeft + plotW, sy);
      ctx.stroke();

      ctx.textAlign = 'right';
      ctx.fillText(valY.toFixed(0), padLeft - 8, sy + 4);
    }

    // Axes border
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + plotH);
    ctx.lineTo(padLeft + plotW, padTop + plotH);
    ctx.stroke();

    // Axis titles
    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.fillText('Variabel Bebas (x)', padLeft + plotW / 2, height - 6);

    ctx.save();
    ctx.translate(14, padTop + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Variabel Terikat (y)', 0, 0);
    ctx.restore();

    if (stats.valid) {
      // Draw residuals if enabled
      if (showResidual) {
        ctx.strokeStyle = residualColor;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 3]);
        for (const p of points) {
          const sx = toScreenX(p.x);
          const syActual = toScreenY(p.y);
          const syHat = toScreenY(stats.a + stats.b * p.x);
          ctx.beginPath();
          ctx.moveTo(sx, syActual);
          ctx.lineTo(sx, syHat);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }

      // Draw Regression Line y_hat = a + bx
      const yStart = stats.a + stats.b * minX;
      const yEnd = stats.a + stats.b * maxX;
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(toScreenX(minX), toScreenY(yStart));
      ctx.lineTo(toScreenX(maxX), toScreenY(yEnd));
      ctx.stroke();

      // Draw Predicted Point
      if (predictedY !== null && !Number.isNaN(numericPredictX)) {
        const px = toScreenX(numericPredictX);
        const py = toScreenY(predictedY);

        ctx.strokeStyle = predictColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(px, padTop + plotH);
        ctx.lineTo(px, py);
        ctx.lineTo(padLeft, py);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = predictColor;
        ctx.beginPath();
        ctx.arc(px, py, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = bgColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Draw Actual Data Points
    for (const p of points) {
      const sx = toScreenX(p.x);
      const sy = toScreenY(p.y);

      ctx.fillStyle = pointColor;
      ctx.strokeStyle = pointStroke;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }, [points, stats, isDark, numericPredictX, predictedY, showResidual]);

  const handlePointChange = (id: string, field: 'x' | 'y', value: string) => {
    const num = Number(value);
    setActivePreset('custom');
    setPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: Number.isNaN(num) ? 0 : num } : p))
    );
  };

  const handleAddRow = () => {
    const last = points[points.length - 1];
    const nextX = last ? last.x + 2 : 1;
    const nextY = last ? Math.round(stats.a + stats.b * nextX) : 10;
    setActivePreset('custom');
    setPoints((prev) => [
      ...prev,
      { id: String(Date.now()), x: nextX, y: Number.isFinite(nextY) ? nextY : 50 },
    ]);
  };

  const handleDeleteRow = (id: string) => {
    if (points.length <= 2) return;
    setActivePreset('custom');
    setPoints((prev) => prev.filter((p) => p.id !== id));
  };

  const loadPreset = (preset: 'soal1' | 'soal2' | 'negatif') => {
    setActivePreset(preset);
    if (preset === 'soal1') {
      setPoints(PRESET_SOAL_1);
      setPredictX('7');
    } else if (preset === 'soal2') {
      setPoints(PRESET_SOAL_2);
      setPredictX('6');
    } else {
      setPoints(PRESET_NEGATIF);
      setPredictX('3.5');
    }
  };

  const formatNum = (n: number, decimals = 2) => {
    if (!Number.isFinite(n)) return '0';
    return Number.isInteger(n) ? String(n) : n.toFixed(decimals).replace('.', ',');
  };

  const equationLatex = useMemo(() => {
    if (!stats.valid) return '\\hat{y} = -';
    const aStr = formatNum(stats.a, 2);
    const bAbsStr = formatNum(Math.abs(stats.b), 2);
    const sign = stats.b >= 0 ? '+' : '-';
    return `\\hat{y} = ${aStr} ${sign} ${bAbsStr}x`;
  }, [stats]);

  return (
    <section id="materi-1" className="scroll-mt-20 py-12 border-b border-[#E5E7EB] dark:border-slate-800">
      {/* Chapter Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">
          <span>Materi 01</span>
          <span aria-hidden="true">·</span>
          <span>Statistika Inferensial</span>
          <span aria-hidden="true">·</span>
          <span>Kelas XII</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          01. Statistika Regresi Linear & Analisis Korelasi
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          Memahami cara memodelkan hubungan antara dua variabel kuantitatif pada diagram pencar (
          <em>scatter plot</em>), mengukur kekuatan hubungannya, dan memprediksi nilai masa depan
          secara terukur.
        </p>
      </div>

      {/* 1. PENJELASAN SINGKAT */}
      <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-xl p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          <span>Sub-Bagian 1.1</span>
          <span aria-hidden="true">·</span>
          <span>Penjelasan Singkat & Konsep Dasar</span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Mengapa Kita Membutuhkan Regresi Linear?
        </h3>

        <div className="space-y-4 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Pernahkah kamu memperhatikan bahwa semakin lama seseorang berlatih soal matematika dalam
            seminggu, nilai ujiannya cenderung semakin tinggi? Atau semakin besar biaya promosi yang
            dikeluarkan sebuah toko <em>online</em>, jumlah barang yang terjual ikut meningkat?
            Dalam statistika, kita tidak cukup hanya menebak &ldquo;kayaknya naik&rdquo; — kita
            butuh alat matematis untuk menarik <strong>satu garis lurus paling pas</strong> (
            <em>line of best fit</em>) di tengah titik-titik data pada diagram pencar (
            <em>scatter plot</em>).
          </p>
          <p>
            Metode tersebut dinamakan <strong>Regresi Linear Sederhana</strong>. Tujuannya adalah
            memprediksi nilai <strong>variabel terikat / dependen</strong> (<KaTeXMath math="y" />,
            yaitu hasil yang dipengaruhi) berdasarkan nilai <strong>variabel bebas / independen</strong>{' '}
            (<KaTeXMath math="x" />, yaitu faktor penyebabnya). Garis regresi dicari dengan metode
            kuadrat terkecil (<em>least squares method</em>) agar jarak rata-rata titik data ke
            garis (<KaTeXMath math="\text{residu} = y - \hat{y}" />) sekecil mungkin.
          </p>
        </div>

        {/* 3 Correlation Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                1. Korelasi Positif
              </span>
              <span className="text-xs font-mono text-blue-700 dark:text-blue-400">
                <KaTeXMath math="0 < r \le +1" />
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Saat nilai <KaTeXMath math="x" /> bertambah, nilai <KaTeXMath math="y" /> ikut
              meningkat. Titik-titik pada <em>scatter plot</em> membentuk pola menanjak dari kiri
              bawah ke kanan atas. Contoh: jam belajar terhadap nilai ujian.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                2. Korelasi Negatif
              </span>
              <span className="text-xs font-mono text-amber-700 dark:text-amber-400">
                <KaTeXMath math="-1 \le r < 0" />
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Saat nilai <KaTeXMath math="x" /> bertambah, nilai <KaTeXMath math="y" /> justru
              menurun. Pola titik-titik menurun dari kiri atas ke kanan bawah. Contoh: banyaknya jam
              bermain <em>game</em> larut malam terhadap tingkat konsentrasi di kelas.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                3. Tidak Berkorelasi
              </span>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                <KaTeXMath math="r \approx 0" />
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Perubahan nilai <KaTeXMath math="x" /> tidak diikuti pola perubahan tertentu pada{' '}
              <KaTeXMath math="y" />. Titik-titik menyebar acak di seluruh bidang. Contoh: ukuran
              sepatu siswa terhadap nilai ulangan matematika.
            </p>
          </div>
        </div>

        {/* Meaning of r and R^2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              Arti Koefisien Korelasi Pearson (<KaTeXMath math="r" />)
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Angka dengan rentang <KaTeXMath math="-1 \le r \le 1" /> yang mengukur{' '}
              <strong>kekuatan sekaligus arah hubungan linear</strong> antara variabel{' '}
              <KaTeXMath math="x" /> dan <KaTeXMath math="y" />. Semakin mendekati{' '}
              <KaTeXMath math="+1" /> atau <KaTeXMath math="-1" />, semakin rapat titik-titik data
              menempel pada garis lurus.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              Arti Koefisien Determinasi (<KaTeXMath math="R^2" />)
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Menyatakan <strong>persentase kontribusi</strong> variabel bebas{' '}
              <KaTeXMath math="x" /> dalam menjelaskan variasi perubahan variabel terikat{' '}
              <KaTeXMath math="y" />. Jika <KaTeXMath math="R^2 = 90,25\%" />, artinya{' '}
              <KaTeXMath math="90,25\%" /> perubahan <KaTeXMath math="y" /> dipengaruhi oleh{' '}
              <KaTeXMath math="x" />, sedangkan sisanya <KaTeXMath math="9,75\%" /> dipengaruhi
              faktor lain.
            </p>
          </div>
        </div>
      </div>

      {/* 2. RUMUS-RUMUS PENTING */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          <span>Sub-Bagian 1.2</span>
          <span aria-hidden="true">·</span>
          <span>Rumus-Rumus Penting (Klik Salin Rumus untuk Menyalin LaTeX)</span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Daftar Rumus Statistika Regresi & Korelasi
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormulaCard
            title="Persamaan Regresi Linear"
            subtitle="Model prediksi garis lurus"
            latex="\hat{y} = a + bx"
            accentColor="blue"
            variables={[
              { symbol: '\\hat{y}', meaning: 'Nilai prediksi variabel terikat ($y$ topi)' },
              { symbol: 'a', meaning: 'Konstanta (intersep / titik potong sumbu-$Y$ saat $x=0$)' },
              { symbol: 'b', meaning: 'Gradien (kemiringan garis / rata-rata perubahan $y$ tiap kenaikan $1$ unit $x$)' },
              { symbol: 'x', meaning: 'Nilai variabel bebas yang diketahui' },
            ]}
          />

          <FormulaCard
            title="Gradien Garis Regresi (b)"
            subtitle="Dihitung terlebih dahulu sebelum mencari a"
            latex="b = \frac{n\sum xy - (\sum x)(\sum y)}{n\sum x^2 - (\sum x)^2}"
            accentColor="blue"
            variables={[
              { symbol: 'n', meaning: 'Banyaknya pasangan data $(x, y)$' },
              { symbol: '\\sum xy', meaning: 'Jumlah hasil kali setiap pasangan $x$ dan $y$' },
              { symbol: '\\sum x, \\sum y', meaning: 'Jumlah seluruh nilai $x$ dan jumlah seluruh nilai $y$' },
              { symbol: '\\sum x^2', meaning: 'Jumlah dari kuadrat masing-masing nilai $x$' },
            ]}
          />

          <FormulaCard
            title="Konstanta / Intersep (a)"
            subtitle="Menggunakan nilai rata-rata dan gradien b"
            latex="a = \bar{y} - b\bar{x}"
            accentColor="blue"
            variables={[
              { symbol: '\\bar{y}', meaning: 'Rata-rata variabel terikat ($\\frac{\\sum y}{n}$)' },
              { symbol: '\\bar{x}', meaning: 'Rata-rata variabel bebas ($\\frac{\\sum x}{n}$)' },
              { symbol: 'b', meaning: 'Nilai gradien regresi yang sudah diperoleh' },
            ]}
          />

          <div className="md:col-span-2">
            <FormulaCard
              title="Koefisien Korelasi Pearson (r)"
              subtitle="Ukuran kekuatan & arah hubungan linear (-1 ≤ r ≤ 1)"
              latex="r = \frac{n\sum xy - (\sum x)(\sum y)}{\sqrt{\left[n\sum x^2 - (\sum x)^2\right]\left[n\sum y^2 - (\sum y)^2\right]}}"
              accentColor="blue"
              variables={[
                { symbol: 'r', meaning: 'Koefisien korelasi Pearson ($r > 0$ searah, $r < 0$ berlawanan arah)' },
                { symbol: '\\sum y^2', meaning: 'Jumlah dari kuadrat masing-masing nilai $y$' },
                { symbol: '(\\sum y)^2', meaning: 'Total nilai $y$ yang dikuadratkan' },
              ]}
            />
          </div>

          <FormulaCard
            title="Koefisien Determinasi"
            subtitle="Persentase pengaruh variabel x terhadap y"
            latex="R^2 = r^2 \times 100\%"
            accentColor="blue"
            variables={[
              { symbol: 'R^2', meaning: 'Persentase variasi $y$ yang dijelaskan oleh model regresi $x$' },
              { symbol: '100\\% - R^2', meaning: 'Persentase pengaruh faktor-faktor lain di luar variabel $x$' },
            ]}
          />
        </div>
      </div>

      {/* 3. MINI-LAB INTERAKTIF */}
      <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-xl p-6 sm:p-8 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">
              <span>Sub-Bagian 1.3</span>
              <span aria-hidden="true">·</span>
              <span>Mini-Lab Interaktif</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
              Laboratorium Kalkulator & Scatter Plot Regresi Linear
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Ubah angka pada tabel data di bawah atau pilih preset soal untuk melihat perubahan
              garis regresi <KaTeXMath math="\hat{y} = a + bx" /> secara langsung.
            </p>
          </div>

          {/* Preset Selector */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => loadPreset('soal1')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activePreset === 'soal1'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Data Contoh Soal 1
            </button>
            <button
              type="button"
              onClick={() => loadPreset('soal2')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activePreset === 'soal2'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Data Contoh Soal 2
            </button>
            <button
              type="button"
              onClick={() => loadPreset('negatif')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activePreset === 'negatif'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Pola Korelasi Negatif
            </button>
          </div>
        </div>

        {/* Two-Zone Sandbox Layout (60% Stage / 40% Data & Controls) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Zone: Scatter Plot Stage & Live Metrics (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Persamaan Garis:
                  </span>
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                    <KaTeXMath math={equationLatex} />
                  </span>
                </div>
                <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showResidual}
                    onChange={(e) => setShowResidual(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Tampilkan Garis Residu (<KaTeXMath math="y - \hat{y}" />)</span>
                </label>
              </div>

              <div className="relative w-full h-[320px] sm:h-[360px]">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full rounded-lg border border-slate-200/70 dark:border-slate-800"
                />
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-5 mt-3 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-full border-2 border-blue-600 bg-slate-900 dark:bg-white" />
                  <span>Titik Data Aktual <KaTeXMath math="(x_i, y_i)" /></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-4 h-0.5 bg-blue-600 dark:bg-sky-400" />
                  <span>Garis Regresi <KaTeXMath math="\hat{y} = a + bx" /></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-full bg-amber-600 dark:bg-amber-400" />
                  <span>Titik Prediksi <KaTeXMath math="(x, \hat{y})" /></span>
                </div>
              </div>
            </div>

            {/* Real-time Computed Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Konstanta (<KaTeXMath math="a" />)
                </p>
                <p className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                  {stats.valid ? formatNum(stats.a, 2) : '-'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <KaTeXMath math="\bar{y} - b\bar{x}" />
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gradien (<KaTeXMath math="b" />)
                </p>
                <p className="text-lg font-bold font-mono tabular-nums text-blue-700 dark:text-blue-400 mt-0.5">
                  {stats.valid ? formatNum(stats.b, 2) : '-'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Kemiringan garis
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Korelasi (<KaTeXMath math="r" />)
                </p>
                <p className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                  {stats.valid ? formatNum(stats.r, 4) : '-'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {correlationLabel}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Determinasi (<KaTeXMath math="R^2" />)
                </p>
                <p className="text-lg font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {stats.valid ? `${formatNum(stats.r2Percent, 2)}%` : '-'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Kontribusi <KaTeXMath math="x \to y" />
                </p>
              </div>
            </div>

            {/* Interactive Prediction Simulator Box */}
            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2">
                <Calculator className="w-4 h-4" />
                <span>Simulasi Prediksi Nilai Variabel Terikat (<KaTeXMath math="\hat{y}" />)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-5">
                  <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">
                    Masukkan nilai <KaTeXMath math="x" /> yang ingin diprediksi:
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={predictX}
                    onChange={(e) => setPredictX(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-7 bg-white dark:bg-slate-900 rounded-lg p-3 border border-blue-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Hasil Substitusi ke Persamaan Regresi:
                  </p>
                  {stats.valid && predictedY !== null ? (
                    <div className="text-sm overflow-x-auto">
                      <KaTeXMath
                        math={`\\hat{y} = ${formatNum(stats.a, 2)} ${
                          stats.b >= 0 ? '+' : '-'
                        } ${formatNum(Math.abs(stats.b), 2)}(${formatNum(
                          numericPredictX,
                          2
                        )}) = \\mathbf{${formatNum(predictedY, 2)}}`}
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Masukkan angka valid untuk memprediksi.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Zone: Editable Data Table & Summations (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Tabel Bantu Pasangan Data <KaTeXMath math="(x, y)" />
              </h4>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Data</span>
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset('soal1')}
                  title="Reset ke Data Soal 1"
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono tabular-nums border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2 px-1.5 text-left font-sans font-medium">No</th>
                    <th className="py-2 px-1.5 text-center">
                      <KaTeXMath math="x" />
                    </th>
                    <th className="py-2 px-1.5 text-center">
                      <KaTeXMath math="y" />
                    </th>
                    <th className="py-2 px-1.5 text-right">
                      <KaTeXMath math="x^2" />
                    </th>
                    <th className="py-2 px-1.5 text-right">
                      <KaTeXMath math="y^2" />
                    </th>
                    <th className="py-2 px-1.5 text-right">
                      <KaTeXMath math="xy" />
                    </th>
                    <th className="py-2 px-1 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
                  {points.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-white dark:hover:bg-slate-900/60">
                      <td className="py-1.5 px-1.5 text-slate-400">{idx + 1}</td>
                      <td className="py-1.5 px-1">
                        <input
                          type="number"
                          value={p.x}
                          onChange={(e) => handlePointChange(p.id, 'x', e.target.value)}
                          aria-label={`Nilai x baris ${idx + 1}`}
                          className="w-16 px-1.5 py-1 text-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-1.5 px-1">
                        <input
                          type="number"
                          value={p.y}
                          onChange={(e) => handlePointChange(p.id, 'y', e.target.value)}
                          aria-label={`Nilai y baris ${idx + 1}`}
                          className="w-16 px-1.5 py-1 text-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-1.5 px-1.5 text-right text-slate-600 dark:text-slate-300">
                        {formatNum(p.x * p.x, 1)}
                      </td>
                      <td className="py-1.5 px-1.5 text-right text-slate-600 dark:text-slate-300">
                        {formatNum(p.y * p.y, 1)}
                      </td>
                      <td className="py-1.5 px-1.5 text-right font-semibold text-slate-800 dark:text-slate-200">
                        {formatNum(p.x * p.y, 1)}
                      </td>
                      <td className="py-1.5 px-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(p.id)}
                          disabled={points.length <= 2}
                          title="Hapus baris"
                          className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300 dark:border-slate-700 font-semibold bg-slate-100/80 dark:bg-slate-900 text-slate-900 dark:text-white">
                    <td className="py-2 px-1.5 font-sans text-xs">
                      <KaTeXMath math="\sum" />
                    </td>
                    <td className="py-2 px-1.5 text-center text-blue-700 dark:text-blue-400">
                      {formatNum(stats.sumX, 1)}
                    </td>
                    <td className="py-2 px-1.5 text-center text-blue-700 dark:text-blue-400">
                      {formatNum(stats.sumY, 1)}
                    </td>
                    <td className="py-2 px-1.5 text-right">{formatNum(stats.sumX2, 1)}</td>
                    <td className="py-2 px-1.5 text-right">{formatNum(stats.sumY2, 1)}</td>
                    <td className="py-2 px-1.5 text-right text-blue-700 dark:text-blue-400">
                      {formatNum(stats.sumXY, 1)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Banyak Data: </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  <KaTeXMath math={`n = ${stats.n}`} />
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Rata-rata </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  <KaTeXMath math={`\\bar{x} = ${formatNum(stats.meanX, 2)}`} />
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Rata-rata </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  <KaTeXMath math={`\\bar{y} = ${formatNum(stats.meanY, 2)}`} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 & 5. CONTOH SOAL & PEMBAHASAN STEP-BY-STEP */}
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          <span>Sub-Bagian 1.4 & 1.5</span>
          <span aria-hidden="true">·</span>
          <span>Contoh Soal Bertahap & Pembahasan Step-by-Step Terverifikasi</span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Latihan Contoh Soal Statistika Regresi
        </h3>

        <div className="space-y-4">
          {/* SOAL 1 */}
          <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-400">
                  <span>Contoh Soal 1</span>
                  <span aria-hidden="true">·</span>
                  <span>Tingkat Dasar</span>
                  <span aria-hidden="true">·</span>
                  <span>Persamaan Regresi & Prediksi</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    loadPreset('soal1');
                    document.getElementById('materi-1')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <span>Simulasikan di Mini-Lab</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                Seorang guru mencatat data jam belajar mandiri per minggu (<KaTeXMath math="x" />)
                dan nilai ujian matematika (<KaTeXMath math="y" />) dari 5 orang siswa kelas XII
                sebagai berikut:{' '}
                <KaTeXMath math="(2, 60), (4, 70), (6, 80), (8, 85), (10, 95)" />. Tentukan{' '}
                <strong>persamaan garis regresi linearnya</strong> dan hitung{' '}
                <strong>prediksi nilai ujian siswa</strong> apabila ia belajar selama{' '}
                <KaTeXMath math="7" /> jam per minggu!
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
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Langkah 1: Menyusun Tabel Bantu Perhitungan (<KaTeXMath math="n = 5" />)
                  </h4>
                  <div className="overflow-x-auto max-w-lg">
                    <table className="w-full text-xs font-mono tabular-nums border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                          <th className="py-2 px-3 text-center">Siswa</th>
                          <th className="py-2 px-3 text-center"><KaTeXMath math="x" /></th>
                          <th className="py-2 px-3 text-center"><KaTeXMath math="y" /></th>
                          <th className="py-2 px-3 text-center"><KaTeXMath math="x^2" /></th>
                          <th className="py-2 px-3 text-center"><KaTeXMath math="xy" /></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-center">
                        <tr><td className="py-1.5">1</td><td>2</td><td>60</td><td>4</td><td>120</td></tr>
                        <tr><td className="py-1.5">2</td><td>4</td><td>70</td><td>16</td><td>280</td></tr>
                        <tr><td className="py-1.5">3</td><td>6</td><td>80</td><td>36</td><td>480</td></tr>
                        <tr><td className="py-1.5">4</td><td>8</td><td>85</td><td>64</td><td>680</td></tr>
                        <tr><td className="py-1.5">5</td><td>10</td><td>95</td><td>100</td><td>950</td></tr>
                      </tbody>
                      <tfoot>
                        <tr className="font-bold bg-blue-50/60 dark:bg-blue-950/40 text-slate-900 dark:text-white border-t border-slate-300 dark:border-slate-700 text-center">
                          <td className="py-2"><KaTeXMath math="\sum" /></td>
                          <td>30</td>
                          <td>390</td>
                          <td>220</td>
                          <td>2510</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm">
                    Dari tabel di atas diperoleh: <KaTeXMath math="n = 5" />,{' '}
                    <KaTeXMath math="\sum x = 30 \implies \bar{x} = \frac{30}{5} = 6" />,{' '}
                    <KaTeXMath math="\sum y = 390 \implies \bar{y} = \frac{390}{5} = 78" />,{' '}
                    <KaTeXMath math="\sum x^2 = 220" />, dan <KaTeXMath math="\sum xy = 2510" />.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Langkah 2: Menghitung Gradien (<KaTeXMath math="b" />) dan Konstanta (<KaTeXMath math="a" />)
                  </h4>
                  <KaTeXMath
                    block
                    math="b = \frac{n\sum xy - (\sum x)(\sum y)}{n\sum x^2 - (\sum x)^2} = \frac{5(2510) - (30)(390)}{5(220) - (30)^2} = \frac{12550 - 11700}{1100 - 900} = \frac{850}{200} = 4,25"
                  />
                  <KaTeXMath
                    block
                    math="a = \bar{y} - b\bar{x} = 78 - 4,25(6) = 78 - 25,5 = 52,5"
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Langkah 3: Menyusun Persamaan Regresi & Menghitung Prediksi (<KaTeXMath math="x = 7" />)
                  </h4>
                  <p>
                    Substitusikan nilai <KaTeXMath math="a = 52,5" /> dan{' '}
                    <KaTeXMath math="b = 4,25" /> ke bentuk umum <KaTeXMath math="\hat{y} = a + bx" />:
                  </p>
                  <KaTeXMath block math="\hat{y} = 52,5 + 4,25x" />
                  <p>
                    Untuk siswa yang belajar <KaTeXMath math="x = 7" /> jam per minggu:
                  </p>
                  <KaTeXMath
                    block
                    math="\hat{y} = 52,5 + 4,25(7) = 52,5 + 29,75 = 82,25"
                  />
                  <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-slate-800 dark:text-slate-200">
                    <strong>Kesimpulan:</strong> Persamaan garis regresinya adalah{' '}
                    <KaTeXMath math="\hat{y} = 52,5 + 4,25x" />, dan prediksi nilai ujian siswa yang
                    belajar 7 jam/minggu adalah <strong><KaTeXMath math="82,25" /></strong>.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SOAL 2 */}
          <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-400">
                  <span>Contoh Soal 2</span>
                  <span aria-hidden="true">·</span>
                  <span>Tingkat Aplikasi</span>
                  <span aria-hidden="true">·</span>
                  <span>Koefisien Korelasi & Determinasi</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    loadPreset('soal2');
                    document.getElementById('materi-1')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <span>Simulasikan di Mini-Lab</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                Diketahui data biaya promosi bulanan dalam juta rupiah (<KaTeXMath math="x" />) dan
                jumlah produk terjual dalam puluhan unit (<KaTeXMath math="y" />) selama 5 bulan:{' '}
                <KaTeXMath math="(1, 5), (2, 9), (3, 11), (4, 12), (5, 13)" />. Hitunglah nilai{' '}
                <strong>koefisien korelasi Pearson (<KaTeXMath math="r" />)</strong>,{' '}
                <strong>koefisien determinasi (<KaTeXMath math="R^2" />)</strong>, serta jelaskan
                arti dari kedua nilai tersebut!
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
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Langkah 1: Menyusun Tabel Bantu (<KaTeXMath math="x, y, x^2, y^2, xy" />)
                  </h4>
                  <div className="overflow-x-auto max-w-xl">
                    <table className="w-full text-xs font-mono tabular-nums border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                          <th className="py-2 px-3 text-center">Bulan</th>
                          <th className="py-2 px-3 text-center"><KaTeXMath math="x" /></th>
                          <th className="py-2 px-3 text-center"><KaTeXMath math="y" /></th>
                          <th className="py-2 px-3 text-center"><KaTeXMath math="x^2" /></th>
                          <th className="py-2 px-3 text-center"><KaTeXMath math="y^2" /></th>
                          <th className="py-2 px-3 text-center"><KaTeXMath math="xy" /></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-center">
                        <tr><td className="py-1.5">1</td><td>1</td><td>5</td><td>1</td><td>25</td><td>5</td></tr>
                        <tr><td className="py-1.5">2</td><td>2</td><td>9</td><td>4</td><td>81</td><td>18</td></tr>
                        <tr><td className="py-1.5">3</td><td>3</td><td>11</td><td>9</td><td>121</td><td>33</td></tr>
                        <tr><td className="py-1.5">4</td><td>4</td><td>12</td><td>16</td><td>144</td><td>48</td></tr>
                        <tr><td className="py-1.5">5</td><td>5</td><td>13</td><td>25</td><td>169</td><td>65</td></tr>
                      </tbody>
                      <tfoot>
                        <tr className="font-bold bg-blue-50/60 dark:bg-blue-950/40 text-slate-900 dark:text-white border-t border-slate-300 dark:border-slate-700 text-center">
                          <td className="py-2"><KaTeXMath math="\sum" /></td>
                          <td>15</td>
                          <td>50</td>
                          <td>55</td>
                          <td>540</td>
                          <td>169</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Langkah 2: Menghitung Koefisien Korelasi Pearson (<KaTeXMath math="r" />)
                  </h4>
                  <p>
                    Hitung bagian pembilang dan penyebut dengan <KaTeXMath math="n = 5" />:
                  </p>
                  <KaTeXMath
                    block
                    math="\text{Pembilang} = n\sum xy - (\sum x)(\sum y) = 5(169) - (15)(50) = 845 - 750 = 95"
                  />
                  <KaTeXMath
                    block
                    math="\text{Penyebut} = \sqrt{\left[5(55) - (15)^2\right]\left[5(540) - (50)^2\right]} = \sqrt{(275 - 225)(2700 - 2500)} = \sqrt{50 \times 200} = \sqrt{10000} = 100"
                  />
                  <KaTeXMath
                    block
                    math="r = \frac{95}{100} = 0,95"
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Langkah 3: Menghitung Koefisien Determinasi (<KaTeXMath math="R^2" />) & Interpretasi
                  </h4>
                  <KaTeXMath
                    block
                    math="R^2 = r^2 \times 100\% = (0,95)^2 \times 100\% = 0,9025 \times 100\% = 90,25\%"
                  />
                  <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-slate-800 dark:text-slate-200 space-y-1">
                    <p>
                      <strong>Interpretasi Matematis:</strong>
                    </p>
                    <p>
                      1. Nilai <KaTeXMath math="r = 0,95" /> menunjukkan adanya{' '}
                      <strong>korelasi positif yang sangat kuat</strong> antara biaya promosi dan
                      jumlah produk terjual (semakin besar biaya promosi, penjualan meningkat secara
                      konsisten).
                    </p>
                    <p>
                      2. Nilai <KaTeXMath math="R^2 = 90,25\%" /> berarti{' '}
                      <strong><KaTeXMath math="90,25\%" /> variasi jumlah penjualan produk</strong>{' '}
                      dipengaruhi oleh biaya promosi, sedangkan sisanya{' '}
                      <strong><KaTeXMath math="9,75\%" /></strong> dipengaruhi oleh faktor lain
                      (seperti kualitas layanan, musim, atau harga pesaing).
                    </p>
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
