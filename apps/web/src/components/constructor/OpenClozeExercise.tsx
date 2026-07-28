import { Fragment, useEffect, useMemo, useState } from "react";

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function OpenClozeExercise({
  text,
  answers,
  completed,
  onComplete,
  exerciseIndex,
  title = "Впиши правильні слова",
}: {
  text: string;
  answers: string[];
  completed?: boolean;
  onComplete?: () => void;
  exerciseIndex: number;
  title?: string;
}) {
  const parts = useMemo(() => text.split("___"), [text]);
  const gapCount = Math.max(0, parts.length - 1);
  const [values, setValues] = useState(() => Array.from({ length: gapCount }, () => ""));
  const [checked, setChecked] = useState(Boolean(completed));

  useEffect(() => {
    setValues(Array.from({ length: gapCount }, (_, i) => values[i] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gapCount]);

  useEffect(() => {
    if (completed) setChecked(true);
  }, [completed]);

  const normalizedAnswers = answers.map((answer) => answer.trim().toLowerCase());
  const normalizedValues = values.map((value) => value.trim().toLowerCase());
  const isSolved =
    gapCount > 0 &&
    normalizedAnswers.length >= gapCount &&
    normalizedValues.length >= gapCount &&
    normalizedValues.every((value, index) => value && value === normalizedAnswers[index]);

  const mark = () => {
    setChecked(true);
    if (isSolved) onComplete?.();
  };

  return (
    <div className="rounded-[22px] border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-black/10 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-white/35">
            Відкриті пропуски · Вправа {exerciseIndex + 1}
          </p>
          <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">{title}</h3>
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
              <input
                value={values[index] ?? ""}
                onChange={(e) => {
                  const next = [...values];
                  next[index] = e.target.value;
                  setValues(next);
                }}
                className={`min-w-[120px] rounded-xl border px-3 py-2 text-base font-black outline-none transition-colors ${
                  checked
                    ? normalizedValues[index] === normalizedAnswers[index]
                      ? "border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-200"
                      : "border-rose-400 bg-rose-50 text-rose-800 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-200"
                    : "border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-[#06121D] dark:text-white"
                }`}
                placeholder="Відповідь"
                disabled={checked}
              />
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
            setValues(Array.from({ length: gapCount }, () => ""));
          }
        }}
        disabled={!checked && values.some((value) => !value.trim())}
        className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(16,185,129,0.18)] disabled:opacity-40"
      >
        {!checked ? "Перевірити" : "Спробувати ще раз"}
      </button>
    </div>
  );
}
