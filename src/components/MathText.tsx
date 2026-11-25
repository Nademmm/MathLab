import React, { useState } from 'react';
import katex from 'katex';
import { Copy, Check } from 'lucide-react';

interface KaTeXProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const KaTeXMath: React.FC<KaTeXProps> = ({ math, block = false, className = '' }) => {
  const html = React.useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        strict: false,
        trust: true,
      });
    } catch {
      return math;
    }
  }, [math, block]);

  if (block) {
    return (
      <div
        className={`katex-block-wrapper overflow-x-auto py-1 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block align-baseline ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

interface RichMathTextProps {
  text: string;
  className?: string;
}

/**
 * Parses text containing $$...$$ block math, $...$ inline math, and **bold** text
 * and renders every mathematical formula cleanly via KaTeX.
 */
export const RichMathText: React.FC<RichMathTextProps> = ({ text, className = '' }) => {
  // Split by block math $$...$$ first
  const blockSegments = text.split(/(\$\$[\s\S]+?\$\$)/g);

  return (
    <span className={className}>
      {blockSegments.map((segment, bIdx) => {
        if (segment.startsWith('$$') && segment.endsWith('$$')) {
          const latex = segment.slice(2, -2).trim();
          return <KaTeXMath key={bIdx} math={latex} block className="my-2" />;
        }

        // Split by inline math $...$
        const inlineSegments = segment.split(/(\$[^$\n]+?\$)/g);
        return (
          <React.Fragment key={bIdx}>
            {inlineSegments.map((inSeg, iIdx) => {
              if (inSeg.startsWith('$') && inSeg.endsWith('$') && inSeg.length > 2) {
                const latex = inSeg.slice(1, -1).trim();
                return <KaTeXMath key={iIdx} math={latex} />;
              }

              // Parse **bold** segments inside plain text
              const boldParts = inSeg.split(/(\*\*[^*]+?\*\*)/g);
              return (
                <React.Fragment key={iIdx}>
                  {boldParts.map((part, pIdx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return (
                        <strong key={pIdx} className="font-semibold text-slate-900 dark:text-white">
                          {part.slice(2, -2)}
                        </strong>
                      );
                    }
                    return <React.Fragment key={pIdx}>{part}</React.Fragment>;
                  })}
                </React.Fragment>
              );
            })}
          </React.Fragment>
        );
      })}
    </span>
  );
};

export interface FormulaVariable {
  symbol: string;
  meaning: string;
}

export interface FormulaCardProps {
  title: string;
  subtitle?: string;
  latex: string;
  variables: FormulaVariable[];
  accentColor?: 'blue' | 'emerald' | 'indigo';
}

export const FormulaCard: React.FC<FormulaCardProps> = ({
  title,
  subtitle,
  latex,
  variables,
  accentColor = 'blue',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(latex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const accentBorderMap = {
    blue: 'hover:border-blue-300 dark:hover:border-blue-800',
    emerald: 'hover:border-emerald-300 dark:hover:border-emerald-800',
    indigo: 'hover:border-indigo-300 dark:hover:border-indigo-800',
  };

  const formulaBgMap = {
    blue: 'bg-slate-50/90 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800',
    emerald: 'bg-emerald-50/40 dark:bg-slate-900/80 border-emerald-200/60 dark:border-slate-800',
    indigo: 'bg-indigo-50/40 dark:bg-slate-900/80 border-indigo-200/60 dark:border-slate-800',
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-xl p-5 transition-colors flex flex-col justify-between ${accentBorderMap[accentColor]}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h4>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            title="Salin kode rumus LaTeX"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-300">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Rumus</span>
              </>
            )}
          </button>
        </div>

        <div
          className={`rounded-lg border px-4 py-3.5 my-3 flex items-center justify-center overflow-x-auto ${formulaBgMap[accentColor]}`}
        >
          <KaTeXMath math={latex} block />
        </div>
      </div>

      {variables.length > 0 && (
        <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            Keterangan Variabel:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            {variables.map((v, i) => (
              <li key={i} className="flex items-baseline gap-2">
                <span className="min-w-[2.25rem] font-medium text-slate-900 dark:text-slate-100 shrink-0">
                  <KaTeXMath math={v.symbol} />
                </span>
                <span className="text-slate-400 dark:text-slate-600">:</span>
                <span className="leading-relaxed">
                  <RichMathText text={v.meaning} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
