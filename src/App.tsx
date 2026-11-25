/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RegressionSection } from './components/RegressionSection';
import { TransformationSection } from './components/TransformationSection';
import { ProbabilitySection } from './components/ProbabilitySection';
import { QuizSection } from './components/QuizSection';
import { CheatSheetSection } from './components/CheatSheetSection';
import { GeminiTutorDrawer } from './components/GeminiTutorDrawer';
import { KaTeXMath } from './components/MathText';
import {
  Sun,
  Moon,
  BookOpen,
  MessageSquare,
  Printer,
  ArrowUp,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);

  // Sync dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  // Track reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      setScrollProgress(pct);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-slate-950 text-[#111827] dark:text-slate-100 transition-colors">
      {/* Reading Progress Bar at Top of Screen */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-200/70 dark:bg-slate-800 no-print">
        <div
          className="h-full bg-blue-600 dark:bg-blue-500 transition-transform duration-150 origin-left"
          style={{ transform: `scaleX(${scrollProgress / 100})` }}
        />
      </div>

      {/* Top Navigation Bar — Strict 3-Zone Contract */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-[#E5E7EB] dark:border-slate-800 no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
          >
            MathLab XII
          </a>

          {/* Zone 2: 5 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a
              href="#materi-1"
              className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Regresi
            </a>
            <a
              href="#materi-2"
              className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Transformasi
            </a>
            <a
              href="#materi-3"
              className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Peluang
            </a>
            <a
              href="#mini-kuis"
              className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Mini Kuis
            </a>
            <a
              href="#ringkasan"
              className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Ringkasan
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsTutorOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-blue-600 rounded-lg hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Tanya Pembahas Soal
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main id="top" className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* HERO SECTION & IDENTITAS PEMILIK TUGAS */}
        <section className="py-10 sm:py-14 border-b border-[#E5E7EB] dark:border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Title, Narrative & Workspace Controls (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                {/* Clean Unboxed Metadata */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400 mb-3">
                  <span>Penugasan Pengganti Nilai Tugas KPP</span>
                  <span aria-hidden="true">·</span>
                  <span>Matematika Kelas XII</span>
                  <span aria-hidden="true">·</span>
                  <span>SMK Telkom Sidoarjo</span>
                </div>

                <h1
                  className="text-3xl sm:text-4xl lg:text-[2.65rem] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15]"
                  style={{ textWrap: 'balance' }}
                >
                  MathLab XII — Modul Pembelajaran Matematika Interaktif
                </h1>

                <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                  Modul belajar mandiri yang memadukan penjelasan konsep yang komunikatif,
                  perumusan matematis presisi berbasis <strong>KaTeX</strong>, laboratorium
                  visualisasi interaktif, serta pembahasan contoh soal langkah demi langkah yang
                  terverifikasi.
                </p>
              </div>

              {/* Workspace Toolbar (Theme Toggle, Quick Jump, Print Cheat Sheet, Tutor) */}
              <div className="mt-7 pt-5 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-2.5 no-print">
                <a
                  href="#materi-1"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Mulai Belajar Materi 01</span>
                </a>

                <a
                  href="#ringkasan"
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cheat Sheet Rumus</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsTutorOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Diskusi Soal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDark(!isDark)}
                  aria-label="Ubah Tema Terang atau Gelap"
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isDark ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>Mode Terang</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-slate-700" />
                      <span>Mode Gelap</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Official Student Assignment Identity Card (5 cols) */}
            <div className="lg:col-span-5 flex">
              <div className="w-full bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Identitas Pemilik Tugas
                    </span>
                    <span className="text-xs font-mono text-blue-700 dark:text-blue-400">
                      KPP · TP 2025/2026
                    </span>
                  </div>

                  <dl className="space-y-3 text-xs sm:text-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                      <dt className="text-slate-500 dark:text-slate-400">Nama Pembuat</dt>
                      <dd className="font-bold text-slate-900 dark:text-white">
                        Naadhim Fahly Mubaarok
                      </dd>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                      <dt className="text-slate-500 dark:text-slate-400">Kelas / Kompetensi</dt>
                      <dd className="font-semibold text-slate-800 dark:text-slate-200">
                        XII SIJA 2
                      </dd>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                      <dt className="text-slate-500 dark:text-slate-400">Sekolah</dt>
                      <dd className="font-semibold text-slate-800 dark:text-slate-200">
                        SMK Telkom Sidoarjo
                      </dd>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                      <dt className="text-slate-500 dark:text-slate-400">Keterangan Tugas</dt>
                      <dd className="font-semibold text-blue-700 dark:text-blue-400">
                        Penugasan Pengganti Nilai Tugas KPP
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Chapter Scope Overview inside Identity Card */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Cakupan 3 Materi Utama & Simulasi:
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>01. Statistika Regresi Linear</span>
                      </span>
                      <span className="font-mono text-slate-500">
                        <KaTeXMath math="\hat{y} = a + bx" />
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>02. Transformasi Fungsi</span>
                      </span>
                      <span className="font-mono text-slate-500">
                        <KaTeXMath math="a \cdot f(x - h) + k" />
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>03. Pencacahan & Peluang Majemuk</span>
                      </span>
                      <span className="font-mono text-slate-500">
                        <KaTeXMath math="P(A \cup B)" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Quick Jump Strip (Visible on mobile/tablet for rapid navigation) */}
          <div className="mt-6 pt-4 border-t border-slate-200/70 dark:border-slate-800 flex md:hidden items-center gap-2 overflow-x-auto pb-1 no-print">
            <a
              href="#materi-1"
              className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md whitespace-nowrap shrink-0"
            >
              01. Regresi
            </a>
            <a
              href="#materi-2"
              className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md whitespace-nowrap shrink-0"
            >
              02. Transformasi
            </a>
            <a
              href="#materi-3"
              className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md whitespace-nowrap shrink-0"
            >
              03. Peluang
            </a>
            <a
              href="#mini-kuis"
              className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md whitespace-nowrap shrink-0"
            >
              Mini Kuis (6 Soal)
            </a>
            <a
              href="#ringkasan"
              className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md whitespace-nowrap shrink-0"
            >
              Ringkasan Rumus
            </a>
          </div>
        </section>

        {/* MATERI 1: STATISTIKA REGRESI */}
        <RegressionSection isDark={isDark} />

        {/* MATERI 2: TRANSFORMASI FUNGSI */}
        <TransformationSection isDark={isDark} />

        {/* MATERI 3: KAIDAH PENCACAHAN & PELUANG KEJADIAN MAJEMUK */}
        <ProbabilitySection />

        {/* FITUR TAMBAHAN 1: MINI KUIS EVALUASI (6 SOAL PILIHAN GANDA) */}
        <QuizSection />

        {/* FITUR TAMBAHAN 2: RINGKASAN CEPAT (CHEAT SHEET MODE) */}
        <CheatSheetSection />
      </main>

      {/* ACADEMIC FOOTER WITH COMPLETE STUDENT IDENTITY */}
      <footer className="mt-8 bg-white dark:bg-slate-900 border-t border-[#E5E7EB] dark:border-slate-800 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="text-base font-bold text-slate-900 dark:text-white">
              MathLab XII — Modul Pembelajaran Matematika
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <span>Dibuat oleh: <strong>Naadhim Fahly Mubaarok</strong></span>
              <span aria-hidden="true">·</span>
              <span>Kelas: <strong>XII SIJA 2 — SMK Telkom Sidoarjo</strong></span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Disusun khusus untuk memenuhi <strong>Penugasan Pengganti Nilai Tugas KPP</strong>{' '}
              Mata Pelajaran Matematika Kelas XII.
            </p>
          </div>

          <div className="flex items-center gap-3 no-print">
            <a
              href="#top"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Kembali ke Atas</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Multi-turn Gemini Math Tutor Drawer */}
      <GeminiTutorDrawer isOpen={isTutorOpen} onClose={() => setIsTutorOpen(false)} />
    </div>
  );
}
