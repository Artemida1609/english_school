import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Props = {
  left: string[];
  right: string[];
  /** Унікальний id для кольору ліній у кількох вправах */
  exerciseIndex: number;
};

/**
 * Зіставлення: клік ліворуч, потім праворуч. Лінії між колонками.
 * Правильна пара: left[i] ↔ right[i] (оригінальний індекс).
 */
export function MatchingExercise({ left, right, exerciseIndex }: Props) {
  const rightShuffled = useMemo(
    () => shuffle(right.map((text, origIndex) => ({ text, origIndex }))),
    [right],
  );

  const [pendingLeft, setPendingLeft] = useState<number | null>(null);
  /** leftIndex -> origIndex правого стовпчика */
  const [pairs, setPairs] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);

  const leftRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rightRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [lineSvg, setLineSvg] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);

  const updateLines = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    Object.entries(pairs).forEach(([li, origRi]) => {
      const displayRi = rightShuffled.findIndex((x) => x.origIndex === origRi);
      if (displayRi < 0) return;
      const lb = leftRefs.current[Number(li)];
      const rb = rightRefs.current[displayRi];
      if (!lb || !rb) return;
      const a = lb.getBoundingClientRect();
      const b = rb.getBoundingClientRect();
      lines.push({
        x1: a.right - r.left,
        y1: a.top + a.height / 2 - r.top,
        x2: b.left - r.left,
        y2: b.top + b.height / 2 - r.top,
      });
    });
    setLineSvg(lines);
  }, [pairs, rightShuffled]);

  useLayoutEffect(() => {
    updateLines();
  }, [updateLines, pairs, pendingLeft]);

  useLayoutEffect(() => {
    const ro = () => updateLines();
    window.addEventListener("resize", ro);
    return () => window.removeEventListener("resize", ro);
  }, [updateLines]);

  const onLeftClick = (i: number) => {
    if (checked) return;
    if (pairs[i] !== undefined) {
      const next = { ...pairs };
      delete next[i];
      setPairs(next);
      setPendingLeft(null);
      return;
    }
    setPendingLeft((p) => (p === i ? null : i));
  };

  const onRightClick = (displayIndex: number) => {
    if (checked || pendingLeft === null) return;
    const orig = rightShuffled[displayIndex].origIndex;
    setPairs((prev) => ({ ...prev, [pendingLeft]: orig }));
    setPendingLeft(null);
  };

  const allPaired =
    left.length > 0 && left.every((_, i) => pairs[i] !== undefined) && Object.keys(pairs).length === left.length;

  const correctCount = useMemo(() => {
    if (!checked) return 0;
    let n = 0;
    for (let i = 0; i < left.length; i++) {
      if (pairs[i] === i) n += 1;
    }
    return n;
  }, [checked, pairs, left.length]);

  const colors = ["#10b981", "#8b5cf6", "#f59e0b", "#3b82f6", "#ec4899"];

  return (
    <div className="mb-10">
      <h3 className="text-sm font-black uppercase tracking-widest text-sky-800 dark:text-sky-200 mb-2">
        Зіставлення {exerciseIndex + 1}
      </h3>
      <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
        Натисніть елемент зліва, потім відповідний справа. Повторний клік по парі зліва знімає зв’язок.
      </p>
      <div ref={wrapRef} className="relative flex gap-4 md:gap-10 min-h-[160px]">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
          aria-hidden
        >
          {lineSvg.map((ln, i) => (
            <line
              key={i}
              x1={ln.x1}
              y1={ln.y1}
              x2={ln.x2}
              y2={ln.y2}
              stroke={colors[i % colors.length]}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          ))}
          {pendingLeft !== null && leftRefs.current[pendingLeft] && wrapRef.current && (
            <circle
              cx={
                leftRefs.current[pendingLeft]!.getBoundingClientRect().right -
                wrapRef.current.getBoundingClientRect().left
              }
              cy={
                leftRefs.current[pendingLeft]!.getBoundingClientRect().top +
                leftRefs.current[pendingLeft]!.getBoundingClientRect().height / 2 -
                wrapRef.current.getBoundingClientRect().top
              }
              r={6}
              fill="#10b981"
              className="animate-pulse"
            />
          )}
        </svg>
        <div className="flex-1 space-y-2 z-10">
          {left.map((text, i) => {
            const paired = pairs[i] !== undefined;
            const correct = checked && pairs[i] === i;
            const wrong = checked && pairs[i] !== undefined && pairs[i] !== i;
            return (
              <button
                key={i}
                type="button"
                ref={(el) => {
                  leftRefs.current[i] = el;
                }}
                onClick={() => onLeftClick(i)}
                className={`w-full rounded-xl border-2 px-3 py-3 text-left text-sm font-bold transition-all ${
                  pendingLeft === i
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 ring-2 ring-emerald-400"
                    : paired
                      ? correct
                        ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-900/20"
                        : wrong
                          ? "border-rose-400 bg-rose-50 dark:bg-rose-900/20"
                          : "border-slate-300 dark:border-white/20 bg-white dark:bg-[#06121D]"
                      : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#06121D] hover:border-emerald-300"
                }`}
              >
                {text}
              </button>
            );
          })}
        </div>
        <div className="flex-1 space-y-2 z-10">
          {rightShuffled.map((cell, displayIndex) => {
            const used = Object.values(pairs).includes(cell.origIndex);
            return (
              <button
                key={`${cell.origIndex}-${displayIndex}`}
                type="button"
                ref={(el) => {
                  rightRefs.current[displayIndex] = el;
                }}
                onClick={() => onRightClick(displayIndex)}
                disabled={checked || (used && pendingLeft === null)}
                className={`w-full rounded-xl border-2 px-3 py-3 text-left text-sm font-semibold transition-all ${
                  used && !checked
                    ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/10 opacity-90"
                    : "border-lime-200 dark:border-lime-500/30 bg-lime-50/80 dark:bg-lime-950/20 hover:border-lime-400 disabled:opacity-40"
                }`}
              >
                {cell.text}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            updateLines();
            setChecked(true);
          }}
          disabled={!allPaired || checked}
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-black text-white disabled:opacity-40"
        >
          Перевірити зіставлення
        </motion.button>
        {checked && (
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Вірно пар: {correctCount} з {left.length}
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            setPairs({});
            setPendingLeft(null);
            setChecked(false);
            setLineSvg([]);
          }}
          className="text-xs font-bold text-slate-500 underline"
        >
          Скинути
        </button>
      </div>
    </div>
  );
}
