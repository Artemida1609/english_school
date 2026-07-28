import { Fragment, useEffect, useMemo, useState } from "react";

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildGapOptions(gapIndex: number, answers: string[], distractors: string[]): string[] {
  const correct = answers[gapIndex]?.trim();
  const pool = new Set<string>();
  if (correct) pool.add(correct);
  distractors.forEach((item) => {
    const trimmed = item.trim();
    if (trimmed) pool.add(trimmed);
  });
  answers.forEach((answer, index) => {
    if (index !== gapIndex) {
      const trimmed = answer.trim();
      if (trimmed) pool.add(trimmed);
    }
  });
  return shuffle([...pool]);
}

export function ClozeMcqExercise({
  text,
  answers,
  distractors = [],
  completed,
  onComplete,
  exerciseIndex,
}: {
  text: string;
  answers: string[];
  distractors?: string[];
  completed?: boolean;
  onComplete?: () => void;
  exerciseIndex: number;
}) {
  const parts = useMemo(() => text.split("___"), [text]);
  const gapCount = Math.max(0, parts.length - 1);
  const gapOptions = useMemo(
    () => Array.from({ length: gapCount }, (_, index) => buildGapOptions(index, answers, distractors)),
    [gapCount, answers, distractors],
  );

  const [selected, setSelected] = useState<(string | null)[]>(() => Array.from({ length: gapCount }, () => null));
  const [checked, setChecked] = useState(Boolean(completed));

  useEffect(() => {
    setSelected(Array.from({ length: gapCount }, (_, i) => selected[i] ?? null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gapCount]);

  useEffect(() => {
    if (completed) setChecked(true);
  }, [completed]);

  const normalizedAnswers = answers.map((answer) => answer.trim().toLowerCase());
  const isSolved =
    gapCount > 0 &&
    selected.length >= gapCount &&
    selected.every((value, index) => value?.trim().toLowerCase() === normalizedAnswers[index]);

  const allFilled = selected.every((value) => Boolean(value?.trim()));

  const mark = () => {
    setChecked(true);
    if (isSolved) onComplete?.();
  };

  return (
    <div className="rounded-[22px] border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-black/10 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-white/35">
            Пропуски · Вправа {exerciseIndex + 1}
          </p>
          <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
            Обери правильні слова
          </h3>
        </div>
        {completed && (
          <span className="flex items-center gap-1.5 text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1 rounded-full">
            <CheckIcon /> Виконано
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-lg md:text-xl font-semibold text-slate-800 dark:text-white leading-relaxed mb-5">
        {parts.map((part, index) => (
          <Fragment key={`${exerciseIndex}-${index}`}>
            <span>{part}</span>
            {index < gapCount && (
              <select
                value={selected[index] ?? ""}
                onChange={(e) => {
                  const next = [...selected];
                  next[index] = e.target.value || null;
                  setSelected(next);
                }}
                disabled={checked}
                className={`min-w-[140px] max-w-[220px] rounded-xl border px-3 py-2 text-base font-black outline-none transition-colors ${
                  checked
                    ? selected[index]?.trim().toLowerCase() === normalizedAnswers[index]
                      ? "border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-200"
                      : "border-rose-400 bg-rose-50 text-rose-800 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-200"
                    : "border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-[#06121D] dark:text-white"
                }`}
              >
                <option value="">Обери…</option>
                {gapOptions[index]?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
          </Fragment>
        ))}
      </div>

      {checked && (
        <p className={`mb-4 text-sm font-bold ${isSolved ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
          {isSolved ? "Правильно" : `Правильні відповіді: ${answers.join(", ")}`}
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          if (!checked) mark();
          else {
            setChecked(false);
            setSelected(Array.from({ length: gapCount }, () => null));
          }
        }}
        disabled={!checked && !allFilled}
        className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(16,185,129,0.18)] disabled:opacity-40"
      >
        {!checked ? "Перевірити" : "Спробувати ще раз"}
      </button>
    </div>
  );
}
