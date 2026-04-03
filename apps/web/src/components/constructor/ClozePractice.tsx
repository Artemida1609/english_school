import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type Props = {
  text: string;
  answers: string[];
  /** Нумерація в заголовку, якщо кілька блоків */
  exerciseIndex: number;
};

/**
 * Пропуски ___ у тексті — лише на вкладці «Вправи».
 */
export function ClozePractice({ text, answers, exerciseIndex }: Props) {
  const parts = useMemo(() => text.split("___"), [text]);
  const gapCount = Math.max(0, parts.length - 1);
  const [values, setValues] = useState<string[]>(() => Array(gapCount).fill(""));
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setValues(Array(gapCount).fill(""));
    setChecked(false);
  }, [gapCount, text]);

  if (gapCount === 0) return null;

  const norm = (s: string) => s.trim().toLowerCase();
  const correctFor = (i: number) => norm(values[i] ?? "") === norm(answers[i] ?? "");

  return (
    <div className="mb-8 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 dark:border-amber-500/25 dark:bg-amber-950/30">
      <h4 className="text-xs font-black uppercase tracking-widest text-amber-800 dark:text-amber-200 mb-3">
        Пропуски в тексті {exerciseIndex + 1}
      </h4>
      <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed flex flex-wrap items-baseline gap-x-1 gap-y-2">
        {parts.map((chunk, i) => (
          <span key={i} className="contents">
            <span>{chunk}</span>
            {i < gapCount && (
              <input
                type="text"
                value={values[i] ?? ""}
                disabled={checked}
                onChange={(e) => {
                  const next = [...values];
                  next[i] = e.target.value;
                  setValues(next);
                }}
                className={`inline-block min-w-[5.5rem] max-w-[12rem] border-b-2 bg-transparent px-1 text-center text-sm font-semibold outline-none transition-colors ${
                  checked
                    ? correctFor(i)
                      ? "border-emerald-500 text-emerald-700 dark:text-emerald-300"
                      : "border-rose-500 text-rose-700 dark:text-rose-300"
                    : "border-emerald-500/70 text-slate-900 dark:text-white focus:border-emerald-500"
                }`}
                aria-label={`Пропуск ${i + 1}`}
              />
            )}
          </span>
        ))}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => setChecked(true)}
          disabled={checked || values.slice(0, gapCount).some((v) => !v.trim())}
          className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-black text-white disabled:opacity-40 dark:bg-amber-700"
        >
          Перевірити пропуски
        </motion.button>
        {checked && (
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Вірно: {values.slice(0, gapCount).filter((_, i) => correctFor(i)).length} з {gapCount}
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            setChecked(false);
            setValues(Array(gapCount).fill(""));
          }}
          className="text-xs font-bold text-slate-500 underline"
        >
          Скинути
        </button>
      </div>
    </div>
  );
}
