import React, { useState, useMemo, useRef, useEffect } from 'react';
import { KaTeXMath, FormulaCard } from './MathText';
import {
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  FlipHorizontal,
  FlipVertical,
} from 'lucide-react';

type BaseFunctionType = 'quadratic' | 'abs' | 'exp' | 'soal1';

interface TransformationSectionProps {
  isDark: boolean;
}

export const TransformationSection: React.FC<TransformationSectionProps> = ({ isDark }) => {
  const [baseFunc, setBaseFunc] = useState<BaseFunctionType>('quadratic');
  const [h, setH] = useState<number>(2); // horizontal shift (right if > 0)
  const [k, setK] = useState<number>(-1); // vertical shift (up if > 0)
  const [a, setA] = useState<number>(1); // vertical dilation scale
  const [s, setS] = useState<number>(1); // horizontal dilation factor k_h (x -> x / s)
  const [reflectX, setReflectX] = useState<boolean>(false); // y = -f(x)
  const [reflectY, setReflectY] = useState<boolean>(false); // y = f(-x)
  const [probeX, setProbeX] = useState<number>(1);

  const [openSolution1, setOpenSolution1] = useState<boolean>(false);
  const [openSolution2, setOpenSolution2] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const evalBase = (x: number, type: BaseFunctionType): number => {
    if (type === 'quadratic') return x * x;
    if (type === 'abs') return Math.abs(x);
    if (type === 'exp') return Math.pow(2, x);
    // soal1 base: x^2 - 4x + 5
    return x * x - 4 * x + 5;
  };

  const evalTransformed = (x: number): number => {
    // Horizontal reflection (x -> -x), translation h (x -> x - h), horizontal dilation s (x -> x / s)
    const signX = reflectY ? -1 : 1;
    const safeS = Math.abs(s) < 0.1 ? 0.1 : s;
    const innerX = (signX * x - h) / safeS;
    const baseVal = evalBase(innerX, baseFunc);
    const verticalScaled = a * baseVal + k;
    return reflectX ? -verticalScaled : verticalScaled;
  };

  const formatCoeff = (val: number) =>
    Number.isInteger(val) ? String(val) : val.toFixed(2).replace('.', ',');

  const dynamicEquationLatex = useMemo(() => {
    const xTerm = reflectY ? '-x' : 'x';
    const shiftPart =
      h === 0
        ? xTerm
        : h > 0
        ? `${xTerm} - ${formatCoeff(h)}`
        : `${xTerm} + ${formatCoeff(Math.abs(h))}`;

    const scaledXPart =
      s === 1
        ? shiftPart
        : s === 0.5
        ? `2(${shiftPart})`
        : `\\frac{${shiftPart}}{${formatCoeff(s)}}`;

    let bodyExpr = '';
    if (baseFunc === 'quadratic') {
      bodyExpr =
        scaledXPart === 'x' ? 'x^2' : `\\left(${scaledXPart}\\right)^2`;
    } else if (baseFunc === 'abs') {
      bodyExpr = `\\left|${scaledXPart}\\right|`;
    } else if (baseFunc === 'exp') {
      bodyExpr = `2^{${scaledXPart}}`;
    } else {
      bodyExpr = `\\left[(${scaledXPart})^2 - 4(${scaledXPart}) + 5\\right]`;
    }

    const aPrefix =
      a === 1 ? '' : a === -1 ? '-' : `${formatCoeff(a)} \\cdot `;
    const kSuffix =
      k === 0
        ? ''
        : k > 0
        ? ` + ${formatCoeff(k)}`
        : ` - ${formatCoeff(Math.abs(k))}`;

    if (reflectX) {
      return `g(x) = -\\left(${aPrefix}${bodyExpr}${kSuffix}\\right)`;
    }
    return `g(x) = ${aPrefix}${bodyExpr}${kSuffix}`;
  }, [baseFunc, h, k, a, s, reflectX, reflectY]);

  const baseEquationLatex = useMemo(() => {
    if (baseFunc === 'quadratic') return 'f(x) = x^2';
    if (baseFunc === 'abs') return 'f(x) = |x|';
    if (baseFunc === 'exp') return 'f(x) = 2^x';
    return 'f(x) = x^2 - 4x + 5';
  }, [baseFunc]);

  // Draw Cartesian Grid & Curves
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 620;
    const height = rect.height || 380;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const bgColor = isDark ? '#0f172a' : '#ffffff';
    const gridColor = isDark ? '#1e293b' : '#f1f5f9';
    const axisColor = isDark ? '#64748b' : '#94a3b8';
    const labelColor = isDark ? '#94a3b8' : '#64748b';
    const baseCurveColor = isDark ? '#94a3b8' : '#64748b';
    const transformedColor = isDark ? '#34d399' : '#059669';

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const xMin = -8;
    const xMax = 8;
    const yMin = -10;
    const yMax = 10;

    const toScreenX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toScreenY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    // Grid lines every 1 unit
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let gx = xMin; gx <= xMax; gx++) {
      const sx = toScreenX(gx);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();
    }
    for (let gy = yMin; gy <= yMax; gy++) {
      const sy = toScreenY(gy);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();
    }

    // Main Axes X=0 and Y=0
    const originX = toScreenX(0);
    const originY = toScreenY(0);

    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Tick numbers every 2 units
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = labelColor;
    ctx.textAlign = 'center';
    for (let gx = xMin + 2; gx <= xMax - 2; gx += 2) {
      if (gx === 0) continue;
      ctx.fillText(String(gx), toScreenX(gx), originY + 14);
    }
    ctx.textAlign = 'right';
    for (let gy = yMin + 2; gy <= yMax - 2; gy += 2) {
      if (gy === 0) continue;
      ctx.fillText(String(gy), originX - 6, toScreenY(gy) + 3);
    }

    // Plot Base Function f(x) (Dashed Line)
    ctx.strokeStyle = baseCurveColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    let startedBase = false;
    const steps = 320;
    for (let i = 0; i <= steps; i++) {
      const xVal = xMin + (i / steps) * (xMax - xMin);
      const yVal = evalBase(xVal, baseFunc);
      if (yVal < yMin - 5 || yVal > yMax + 5 || !Number.isFinite(yVal)) {
        startedBase = false;
        continue;
      }
      const sx = toScreenX(xVal);
      const sy = toScreenY(yVal);
      if (!startedBase) {
        ctx.moveTo(sx, sy);
        startedBase = true;
      } else {
        ctx.lineTo(sx, sy);
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot Transformed Function g(x) (Solid Line)
    ctx.strokeStyle = transformedColor;
    ctx.lineWidth = 2.75;
    ctx.beginPath();
    let startedTrans = false;
    for (let i = 0; i <= steps; i++) {
      const xVal = xMin + (i / steps) * (xMax - xMin);
      const yVal = evalTransformed(xVal);
      if (yVal < yMin - 5 || yVal > yMax + 5 || !Number.isFinite(yVal)) {
        startedTrans = false;
        continue;
      }
      const sx = toScreenX(xVal);
      const sy = toScreenY(yVal);
      if (!startedTrans) {
        ctx.moveTo(sx, sy);
        startedTrans = true;
      } else {
        ctx.lineTo(sx, sy);
      }
    }
    ctx.stroke();

    // Draw Probe Point on Base and Transformed Curve
    const baseProbeY = evalBase(probeX, baseFunc);
    const transProbeY = evalTransformed(probeX);

    if (baseProbeY >= yMin && baseProbeY <= yMax) {
      ctx.fillStyle = baseCurveColor;
      ctx.beginPath();
      ctx.arc(toScreenX(probeX), toScreenY(baseProbeY), 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    if (transProbeY >= yMin && transProbeY <= yMax) {
      ctx.fillStyle = transformedColor;
      ctx.beginPath();
      ctx.arc(toScreenX(probeX), toScreenY(transProbeY), 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = bgColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [baseFunc, h, k, a, s, reflectX, reflectY, probeX, isDark]);

  const applyPresetSoal1 = () => {
    setBaseFunc('soal1');
    setH(2);
    setK(3);
    setA(1);
    setS(1);
    setReflectX(true);
    setReflectY(false);
    setProbeX(4);
  };

  const applyPresetSoal2 = () => {
    setBaseFunc('exp');
    setH(0);
    setK(-4);
    setA(3);
    setS(0.5);
    setReflectX(false);
    setReflectY(false);
    setProbeX(1);
  };

  const handleReset = () => {
    setBaseFunc('quadratic');
    setH(2);
    setK(-1);
    setA(1);
    setS(1);
    setReflectX(false);
    setReflectY(false);
    setProbeX(1);
  };

  return (
    <section id="materi-2" className="scroll-mt-20 py-12 border-b border-[#E5E7EB] dark:border-slate-800">
      {/* Chapter Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-2">
          <span>Materi 02</span>
          <span aria-hidden="true">·</span>
          <span>Aljabar & Geometri Koordinat</span>
          <span aria-hidden="true">·</span>
          <span>Kelas XII</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          02. Transformasi Fungsi pada Bidang Kartesius
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          Mempelajari bagaimana perubahan aljabar pada rumus fungsi <KaTeXMath math="y = f(x)" />{' '}
          menggeser, mencerminkan, meregangkan, atau memutar kurva grafik secara presisi.
        </p>
      </div>

      {/* 1. PENJELASAN SINGKAT */}
      <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-xl p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          <span>Sub-Bagian 2.1</span>
          <span aria-hidden="true">·</span>
          <span>Penjelasan Singkat & Analogi Visual</span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Apa Itu Transformasi Fungsi?
        </h3>

        <div className="space-y-4 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Bayangkan kamu sedang mengedit sebuah objek foto atau gelombang audio di aplikasi
            desain. Kamu bisa menggeser posisinya ke kanan/atas, membalik bayangannya seperti
            bercermin, memperbesar ukurannya (<em>zoom/stretch</em>), atau memutarnya. Dalam
            matematika, <strong>Transformasi Fungsi</strong> melakukan hal yang sama persis terhadap
            kurva <KaTeXMath math="y = f(x)" /> pada bidang Kartesius tanpa merusak karakteristik
            dasar fungsinya.
          </p>
          <p>
            Kunci terpenting yang wajib kamu ingat adalah perbedaan antara perubahan{' '}
            <strong>di luar fungsi</strong> dan <strong>di dalam tanda kurung <KaTeXMath math="x" /></strong>:
            operasi di luar <KaTeXMath math="f(x)" /> selalu memengaruhi arah{' '}
            <strong>vertikal (sumbu-<KaTeXMath math="Y" />)</strong> secara langsung, sedangkan
            operasi di dalam argumen <KaTeXMath math="x" /> memengaruhi arah{' '}
            <strong>horizontal (sumbu-<KaTeXMath math="X" />)</strong> dengan efek kebalikannya.
          </p>
        </div>

        {/* 4 Types Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              1. Translasi (Pergeseran)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Menggeser seluruh titik kurva sejauh <KaTeXMath math="h" /> satuan mendatar dan{' '}
              <KaTeXMath math="k" /> satuan tegak tanpa mengubah bentuk maupun kemiringan kurva.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              2. Refleksi (Pencerminan)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Membalik grafik terhadap sumbu cermin. Refleksi sumbu-<KaTeXMath math="X" /> membalik
              atas-bawah (<KaTeXMath math="-f(x)" />), sedangkan sumbu-<KaTeXMath math="Y" />{' '}
              membalik kiri-kanan (<KaTeXMath math="f(-x)" />).
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              3. Dilatasi (Perkalian Skala)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Meregangkan (<em>stretch</em>) atau menyusutkan (<em>shrink</em>) grafik secara
              vertikal dengan faktor <KaTeXMath math="a" /> atau secara horizontal dengan faktor
              skala <KaTeXMath math="k" />.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              4. Rotasi (Perputaran)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Memutar setiap titik <KaTeXMath math="(x, y)" /> pada kurva terhadap titik pusat{' '}
              <KaTeXMath math="O(0,0)" /> sebesar sudut <KaTeXMath math="90^\circ, 180^\circ," />{' '}
              atau <KaTeXMath math="270^\circ" />.
            </p>
          </div>
        </div>
      </div>

      {/* 2. RUMUS-RUMUS PENTING (Tabel Rapi + Formula Cards) */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          <span>Sub-Bagian 2.2</span>
          <span aria-hidden="true">·</span>
          <span>Tabel Referensi & Kartu Rumus Transformasi Fungsi</span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Rangkuman Rumus Transformasi Fungsi <KaTeXMath math="y = f(x)" />
        </h3>

        {/* Structured Formula Reference Table */}
        <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-xl overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200">
                  <th className="py-3.5 px-4 font-semibold">Jenis Transformasi</th>
                  <th className="py-3.5 px-4 font-semibold">Pemetaan Titik <KaTeXMath math="(x, y) \to (x', y')" /></th>
                  <th className="py-3.5 px-4 font-semibold">Persamaan Bayangan</th>
                  <th className="py-3.5 px-4 font-semibold">Efek Visual pada Grafik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    Translasi Vertikal
                  </td>
                  <td className="py-3 px-4">
                    <KaTeXMath math="(x, y) \to (x, y + k)" />
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-700 dark:text-emerald-400">
                    <KaTeXMath math="y = f(x) + k" />
                  </td>
                  <td className="py-3 px-4">
                    Bergeser <strong>naik <KaTeXMath math="k" /> satuan</strong> jika{' '}
                    <KaTeXMath math="k > 0" />, atau <strong>turun <KaTeXMath math="|k|" /> satuan</strong>{' '}
                    jika <KaTeXMath math="k < 0" />.
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    Translasi Horizontal
                  </td>
                  <td className="py-3 px-4">
                    <KaTeXMath math="(x, y) \to (x + h, y)" />
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-700 dark:text-emerald-400">
                    <KaTeXMath math="y = f(x - h)" />
                  </td>
                  <td className="py-3 px-4">
                    Bergeser <strong>ke kanan <KaTeXMath math="h" /> satuan</strong> jika{' '}
                    <KaTeXMath math="h > 0" />, atau <strong>ke kiri <KaTeXMath math="|h|" /> satuan</strong>{' '}
                    jika <KaTeXMath math="h < 0" />.
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    Refleksi Sumbu-<KaTeXMath math="X" />
                  </td>
                  <td className="py-3 px-4">
                    <KaTeXMath math="(x, y) \to (x, -y)" />
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-700 dark:text-emerald-400">
                    <KaTeXMath math="y = -f(x)" />
                  </td>
                  <td className="py-3 px-4">
                    Kurva dicerminkan secara vertikal terhadap sumbu-<KaTeXMath math="X" />.
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    Refleksi Sumbu-<KaTeXMath math="Y" />
                  </td>
                  <td className="py-3 px-4">
                    <KaTeXMath math="(x, y) \to (-x, y)" />
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-700 dark:text-emerald-400">
                    <KaTeXMath math="y = f(-x)" />
                  </td>
                  <td className="py-3 px-4">
                    Kurva dicerminkan secara horizontal terhadap sumbu-<KaTeXMath math="Y" />.
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    Dilatasi Vertikal (Skala <KaTeXMath math="a" />)
                  </td>
                  <td className="py-3 px-4">
                    <KaTeXMath math="(x, y) \to (x, a \cdot y)" />
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-700 dark:text-emerald-400">
                    <KaTeXMath math="y = a \cdot f(x)" />
                  </td>
                  <td className="py-3 px-4">
                    Meregang sejajar sumbu-<KaTeXMath math="Y" /> jika <KaTeXMath math="a > 1" />,
                    menyusut jika <KaTeXMath math="0 < a < 1" />.
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    Dilatasi Horizontal (Skala <KaTeXMath math="k" />)
                  </td>
                  <td className="py-3 px-4">
                    <KaTeXMath math="(x, y) \to (k \cdot x, y)" />
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-700 dark:text-emerald-400">
                    <KaTeXMath math="y = f\left(\frac{x}{k}\right)" />
                  </td>
                  <td className="py-3 px-4">
                    Meregang sejajar sumbu-<KaTeXMath math="X" /> jika <KaTeXMath math="k > 1" />,
                    merapat jika <KaTeXMath math="0 < k < 1" />.
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    Rotasi Pusat <KaTeXMath math="O(0,0)" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div><KaTeXMath math="+90^\circ: (x, y) \to (-y, x)" /></div>
                      <div><KaTeXMath math="180^\circ: (x, y) \to (-x, -y)" /></div>
                      <div><KaTeXMath math="+270^\circ: (x, y) \to (y, -x)" /></div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-700 dark:text-emerald-400">
                    <div className="space-y-1">
                      <div><KaTeXMath math="x = -f(y)" /></div>
                      <div><KaTeXMath math="y = -f(-x)" /></div>
                      <div><KaTeXMath math="x = f(-y)" /></div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    Memutar kurva berlawanan arah jarum jam terhadap titik asal <KaTeXMath math="(0,0)" />.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Copyable Formula Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormulaCard
            title="Gabungan Translasi (h, k)"
            subtitle="Pergeseran mendatar h dan vertikal k"
            latex="g(x) = f(x - h) + k"
            accentColor="emerald"
            variables={[
              { symbol: 'h', meaning: 'Pergeseran horizontal ($h > 0$ ke kanan, $h < 0$ ke kiri)' },
              { symbol: 'k', meaning: 'Pergeseran vertikal ($k > 0$ ke atas, $k < 0$ ke bawah)' },
            ]}
          />
          <FormulaCard
            title="Gabungan Dilatasi Vertikal & Horizontal"
            subtitle="Peregangan skala vertikal a dan horizontal k"
            latex="g(x) = a \cdot f\left(\frac{x}{k}\right)"
            accentColor="emerald"
            variables={[
              { symbol: 'a', meaning: 'Faktor skala vertikal sejajar sumbu-$Y$' },
              { symbol: 'k', meaning: 'Faktor skala horizontal sejajar sumbu-$X$ (substitusi $x \\to \\frac{x}{k}$)' },
            ]}
          />
          <FormulaCard
            title="Refleksi & Rotasi 180°"
            subtitle="Pencerminan ganda sumbu-X dan sumbu-Y"
            latex="g(x) = -f(-x)"
            accentColor="emerald"
            variables={[
              { symbol: '-f(x)', meaning: 'Refleksi terhadap sumbu-$X$ ($y \\to -y$)' },
              { symbol: 'f(-x)', meaning: 'Refleksi terhadap sumbu-$Y$ ($x \\to -x$)' },
            ]}
          />
        </div>
      </div>

      {/* 3. MINI-LAB INTERAKTIF */}
      <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-xl p-6 sm:p-8 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">
              <span>Sub-Bagian 2.3</span>
              <span aria-hidden="true">·</span>
              <span>Mini-Lab Interaktif</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
              Simulator Grafik Transformasi Fungsi Kartesius
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Bandingkan grafik fungsi asli <KaTeXMath math="f(x)" /> (garis putus-putus) dengan
              hasil transformasi <KaTeXMath math="g(x)" /> (garis hijau solid).
            </p>
          </div>

          {/* Base Function Selector */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setBaseFunc('quadratic')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                baseFunc === 'quadratic'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <KaTeXMath math="f(x) = x^2" />
            </button>
            <button
              type="button"
              onClick={() => setBaseFunc('abs')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                baseFunc === 'abs'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <KaTeXMath math="f(x) = |x|" />
            </button>
            <button
              type="button"
              onClick={() => setBaseFunc('exp')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                baseFunc === 'exp'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <KaTeXMath math="f(x) = 2^x" />
            </button>
            <button
              type="button"
              onClick={applyPresetSoal1}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                baseFunc === 'soal1'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Preset Soal 1
            </button>
            <button
              type="button"
              onClick={applyPresetSoal2}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Preset Soal 2
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Zone: Interactive Canvas (7 cols) */}
          <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Fungsi Dasar:{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  <KaTeXMath math={baseEquationLatex} />
                </span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                <KaTeXMath math={dynamicEquationLatex} />
              </div>
            </div>

            <div className="relative w-full h-[340px] sm:h-[380px]">
              <canvas
                ref={canvasRef}
                className="w-full h-full rounded-lg border border-slate-200/70 dark:border-slate-800"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex flex-wrap items-center gap-5">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-5 border-t-2 border-dashed border-slate-500" />
                  <span>Grafik Asli <KaTeXMath math="f(x)" /></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-5 h-0.5 bg-emerald-600 dark:bg-emerald-400" />
                  <span>Hasil Transformasi <KaTeXMath math="g(x)" /></span>
                </div>
              </div>
              <div className="font-mono">
                Titik Uji <KaTeXMath math={`x = ${probeX}`} />:{' '}
                <KaTeXMath
                  math={`g(${probeX}) = ${formatCoeff(evalTransformed(probeX))}`}
                />
              </div>
            </div>
          </div>

          {/* Right Zone: Parameter Sliders & Toggles (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Kontrol Parameter Transformasi
              </h4>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Slider h */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Translasi Horizontal (<KaTeXMath math="h" />)
                </span>
                <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                  {h > 0 ? `+${h} (Kanan ${h})` : h < 0 ? `${h} (Kiri ${Math.abs(h)})` : '0 (Tetap)'}
                </span>
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.5"
                value={h}
                onChange={(e) => setH(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Slider k */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Translasi Vertikal (<KaTeXMath math="k" />)
                </span>
                <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                  {k > 0 ? `+${k} (Naik ${k})` : k < 0 ? `${k} (Turun ${Math.abs(k)})` : '0 (Tetap)'}
                </span>
              </div>
              <input
                type="range"
                min="-6"
                max="6"
                step="0.5"
                value={k}
                onChange={(e) => setK(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Slider a (Vertical dilation) */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Faktor Skala Vertikal (<KaTeXMath math="a" />)
                </span>
                <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                  a = {a}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4"
                step="0.5"
                value={a}
                onChange={(e) => setA(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Slider s (Horizontal dilation) */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Faktor Skala Horizontal (<KaTeXMath math="k_x" />)
                </span>
                <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                  k = {s === 0.5 ? '1/2 (x → 2x)' : `${s}`}
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.5"
                value={s}
                onChange={(e) => setS(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Probe x slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Titik Uji Koordinat (<KaTeXMath math="x" />)
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  x = {probeX} → g({probeX}) = {formatCoeff(evalTransformed(probeX))}
                </span>
              </div>
              <input
                type="range"
                min="-4"
                max="5"
                step="0.5"
                value={probeX}
                onChange={(e) => setProbeX(Number(e.target.value))}
                className="w-full accent-slate-600 cursor-pointer"
              />
            </div>

            {/* Reflection Toggle Buttons */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                Pencerminan (Refleksi Sumbu Koordinat):
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setReflectX(!reflectX)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    reflectX
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                  <span>Refleksi Sumbu-X</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReflectY(!reflectY)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    reflectY
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Refleksi Sumbu-Y</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 & 5. CONTOH SOAL & PEMBAHASAN TERVERIFIKASI */}
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          <span>Sub-Bagian 2.4 & 2.5</span>
          <span aria-hidden="true">·</span>
          <span>Contoh Soal Bertahap & Pembahasan Step-by-Step Terverifikasi</span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Latihan Contoh Soal Transformasi Fungsi
        </h3>

        <div className="space-y-4">
          {/* SOAL 1 */}
          <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <span>Contoh Soal 1</span>
                  <span aria-hidden="true">·</span>
                  <span>Tingkat Dasar–Menengah</span>
                  <span aria-hidden="true">·</span>
                  <span>Kombinasi Translasi & Refleksi</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    applyPresetSoal1();
                    document.getElementById('materi-2')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  <span>Tampilkan Grafik Soal 1 di Simulator</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                Grafik fungsi kuadrat <KaTeXMath math="f(x) = x^2 - 4x + 5" /> ditranslasikan{' '}
                <strong>2 satuan ke kanan</strong> dan <strong>3 satuan ke atas</strong>, kemudian
                hasilnya direfleksikan terhadap <strong>sumbu-<KaTeXMath math="X" /></strong>.
                Tentukan persamaan fungsi bayangan akhirnya!
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
                    Langkah 1: Translasi 2 Satuan ke Kanan (<KaTeXMath math="h = 2" />) dan 3 Satuan ke Atas (<KaTeXMath math="k = 3" />)
                  </h4>
                  <p>
                    Berdasarkan rumus translasi <KaTeXMath math="g(x) = f(x - h) + k" />, kita
                    ganti setiap <KaTeXMath math="x" /> dengan <KaTeXMath math="(x - 2)" /> lalu
                    menambahkan <KaTeXMath math="+ 3" /> di luar fungsi:
                  </p>
                  <KaTeXMath
                    block
                    math="g(x) = f(x - 2) + 3 = (x - 2)^2 - 4(x - 2) + 5 + 3"
                  />
                  <KaTeXMath
                    block
                    math="g(x) = (x^2 - 4x + 4) - 4x + 8 + 8 = x^2 - 8x + 20"
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Langkah 2: Refleksi Terhadap Sumbu-<KaTeXMath math="X" /> (<KaTeXMath math="h(x) = -g(x)" />)
                  </h4>
                  <p>
                    Pencerminan terhadap sumbu-<KaTeXMath math="X" /> mengubah tanda seluruh nilai
                    fungsi menjadi negatif:
                  </p>
                  <KaTeXMath
                    block
                    math="h(x) = -g(x) = -(x^2 - 8x + 20) = -x^2 + 8x - 20"
                  />
                  <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-slate-800 dark:text-slate-200">
                    <strong>Kesimpulan:</strong> Persamaan fungsi bayangan akhirnya adalah{' '}
                    <strong><KaTeXMath math="h(x) = -x^2 + 8x - 20" /></strong>.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SOAL 2 */}
          <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <span>Contoh Soal 2</span>
                  <span aria-hidden="true">·</span>
                  <span>Tingkat Aplikasi & Kombinasi</span>
                  <span aria-hidden="true">·</span>
                  <span>Dilatasi & Translasi Fungsi Eksponen</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    applyPresetSoal2();
                    document.getElementById('materi-2')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  <span>Tampilkan Grafik Soal 2 di Simulator</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                Grafik fungsi eksponen <KaTeXMath math="f(x) = 2^x" /> mengalami{' '}
                <strong>dilatasi horizontal</strong> dengan faktor skala{' '}
                <KaTeXMath math="k = \frac{1}{2}" /> sejajar sumbu-<KaTeXMath math="X" />,
                dilanjutkan <strong>dilatasi vertikal</strong> dengan faktor skala{' '}
                <KaTeXMath math="a = 3" /> sejajar sumbu-<KaTeXMath math="Y" />, lalu{' '}
                <strong>digeser ke bawah 4 satuan</strong>. Tentukan persamaan fungsi akhirnya dan
                hitung nilai fungsi tersebut saat <KaTeXMath math="x = 1" />!
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
                    Langkah 1: Dilatasi Horizontal Faktor Skala <KaTeXMath math="k = \frac{1}{2}" />
                  </h4>
                  <p>
                    Rumus dilatasi horizontal sejajar sumbu-<KaTeXMath math="X" /> dengan skala{' '}
                    <KaTeXMath math="k" /> adalah <KaTeXMath math="y = f\left(\frac{x}{k}\right)" />.
                    Substitusikan <KaTeXMath math="k = \frac{1}{2}" />:
                  </p>
                  <KaTeXMath
                    block
                    math="f_1(x) = f\left(\frac{x}{1/2}\right) = f(2x) = 2^{2x}"
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Langkah 2: Dilatasi Vertikal Faktor Skala <KaTeXMath math="a = 3" />
                  </h4>
                  <p>
                    Kalikan seluruh fungsi <KaTeXMath math="f_1(x)" /> dengan faktor skala vertikal{' '}
                    <KaTeXMath math="3" />:
                  </p>
                  <KaTeXMath block math="f_2(x) = 3 \cdot f_1(x) = 3 \cdot 2^{2x}" />
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Langkah 3: Translasi Vertikal ke Bawah 4 Satuan & Evaluasi Saat <KaTeXMath math="x = 1" />
                  </h4>
                  <p>
                    Kurangi fungsi dengan <KaTeXMath math="4" /> satuan:
                  </p>
                  <KaTeXMath block math="g(x) = 3 \cdot 2^{2x} - 4" />
                  <p>
                    Selanjutnya, substitusikan <KaTeXMath math="x = 1" /> ke dalam persamaan{' '}
                    <KaTeXMath math="g(x)" />:
                  </p>
                  <KaTeXMath
                    block
                    math="g(1) = 3 \cdot 2^{2(1)} - 4 = 3 \cdot 2^2 - 4 = 3(4) - 4 = 12 - 4 = 8"
                  />
                  <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-slate-800 dark:text-slate-200">
                    <strong>Kesimpulan:</strong> Persamaan akhirnya adalah{' '}
                    <strong><KaTeXMath math="g(x) = 3 \cdot 2^{2x} - 4" /></strong> dan nilai fungsi
                    saat <KaTeXMath math="x = 1" /> adalah <strong><KaTeXMath math="g(1) = 8" /></strong>.
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
