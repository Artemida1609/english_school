/**
 * QuizletCards — Flashcard component
 *
 * Дизайн відповідає скріншоту: одна велика картка з flip-анімацією,
 * фільтри категорій, прогрес-бар, транскрипція, кнопки «Знаю» / «Далі».
 *
 * Інтерфейс картки:
 *   { title: string; body: string; transcription?: string; category?: string }
 *
 * Використання (в ModulePage, exercises tab):
 *   <QuizletCards items={constructorPractice.quizlet} />
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface QuizletItem {
  title: string;
  body: string;
  transcription?: string;
  category?: string;
}

interface QuizletCardsProps {
  items: QuizletItem[];
}

export function QuizletCards({ items }: QuizletCardsProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());

  // ── Categories ──────────────────────────────────────────────
  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(items.map((i) => i.category).filter(Boolean))
    ) as string[];
    return cats;
  }, [items]);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((i) => i.category === activeCategory);
  }, [items, activeCategory]);

  const current = filtered[currentIndex];
  const total = filtered.length;
  const knownCount = filtered.filter((_, i) => known.has(
    items.indexOf(filtered[i])
  )).length;
  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  const goNext = () => {
    if (currentIndex >= total - 1) return;
    setFlipped(false);
    setTimeout(() => setCurrentIndex((i) => i + 1), 120);
  };

  const goPrev = () => {
    if (currentIndex <= 0) return;
    setFlipped(false);
    setTimeout(() => setCurrentIndex((i) => i - 1), 120);
  };

  const markKnown = () => {
    const globalIdx = items.indexOf(current);
    setKnown((prev) => {
      const next = new Set(prev);
      if (next.has(globalIdx)) {
        next.delete(globalIdx);
      } else {
        next.add(globalIdx);
      }
      return next;
    });
  };

  const resetAll = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setKnown(new Set());
  };

  const markAllKnown = () => {
    const allIdxs = filtered.map((item) => items.indexOf(item));
    setKnown(new Set(allIdxs));
    setCurrentIndex(total - 1);
    setFlipped(false);
  };

  const changeCategory = (cat: string) => {
    setActiveCategory(cat);
    setCurrentIndex(0);
    setFlipped(false);
  };

  const isKnown = current ? known.has(items.indexOf(current)) : false;

  if (!current) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            Флеш-картки 🗂
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {knownCount} / {total} вивчено
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={markAllKnown}
            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-white dark:bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
          >
            Знаю всі
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            Скинути
          </button>
        </div>
      </div>

      {/* ── Category filters ────────────────────────────────── */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => changeCategory("all")}
            className={`text-sm font-bold px-4 py-1.5 rounded-full border transition-all ${
              activeCategory === "all"
                ? "bg-emerald-500 border-emerald-400 text-white shadow-sm"
                : "border-slate-300 dark:border-white/15 text-slate-600 dark:text-slate-400 hover:border-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-300"
            }`}
          >
            Всі ({items.length})
          </button>
          {categories.map((cat) => {
            const count = items.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => changeCategory(cat)}
                className={`text-sm font-bold px-4 py-1.5 rounded-full border transition-all capitalize ${
                  activeCategory === cat
                    ? "bg-emerald-500 border-emerald-400 text-white shadow-sm"
                    : "border-slate-300 dark:border-white/15 text-slate-600 dark:text-slate-400 hover:border-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-300"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* ── Progress bar ────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-xs font-black text-slate-500 dark:text-slate-400 shrink-0 tabular-nums">
          {currentIndex + 1} / {total}
        </span>
      </div>

      {/* ── Flashcard ───────────────────────────────────────── */}
      <div
        className="relative cursor-pointer select-none"
        style={{ perspective: 1400 }}
        onClick={() => setFlipped((f) => !f)}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-full"
        >
          {/* Front */}
          <div
            className="w-full min-h-[200px] sm:min-h-[220px] rounded-3xl bg-white dark:bg-[#06121D] border border-slate-200 dark:border-white/10 shadow-lg p-8 flex flex-col items-center justify-center gap-3"
            style={{ backfaceVisibility: "hidden" }}
          >
            {isKnown && (
              <span className="absolute top-4 right-4 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 px-2.5 py-1 rounded-full">
                ✓ Знаю
              </span>
            )}
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white text-center leading-tight">
              {current.title}
            </p>
            {current.transcription && (
              <p className="text-base text-slate-400 dark:text-slate-500 font-mono tracking-wide">
                {current.transcription}
              </p>
            )}
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              натисни щоб побачити переклад
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 w-full min-h-[200px] rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-200 dark:border-emerald-500/30 shadow-lg p-8 flex flex-col items-center justify-center gap-3"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300 text-center leading-tight">
              {current.body}
            </p>
            {current.category && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 capitalize mt-1">
                {current.category}
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Controls ────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mt-1">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-bold text-sm disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
        >
          ← Назад
        </button>
        <button
          type="button"
          onClick={markKnown}
          className={`px-6 py-4 rounded-2xl border font-black text-sm transition-all ${
            isKnown
              ? "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_18px_rgba(16,185,129,0.35)]"
              : "border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
          }`}
        >
          {isKnown ? "✓ Знаю" : "Знаю"}
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={currentIndex === total - 1}
          className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm disabled:opacity-30 hover:shadow-[0_0_18px_rgba(16,185,129,0.45)] transition-all border border-emerald-400/50"
        >
          Далі →
        </button>
      </div>

      {/* ── All done banner ──────────────────────────────────── */}
      <AnimatePresence>
        {currentIndex === total - 1 && flipped && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-500/30 p-4 text-center"
          >
            <p className="font-black text-emerald-700 dark:text-emerald-300">
              🎉 Всі картки переглянуто!
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              Вивчено: {knownCount} з {total}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}