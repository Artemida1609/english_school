import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export type MultiSelectQuestionData = {
  id: string;
  questionText: string;
  options: { text: string; isCorrect: boolean }[];
};

type Props = {
  questions: MultiSelectQuestionData[];
  title?: string;
  exerciseIndex: number;
  completed?: boolean;
  onComplete?: () => void;
};

// Map key: "qIdx-oIdx" -> boolean
type Selections = Record<string, boolean>;

export function MultiSelectExercise({
  questions,
  title,
  exerciseIndex,
  completed = false,
  onComplete,
}: Props) {
  // Pre-fill if completed
  const initialSelections = useMemo(() => {
    if (!completed) return {};
    const sel: Selections = {};
    questions.forEach((q, qIdx) => {
      q.options.forEach((opt, oIdx) => {
        if (opt.isCorrect) {
          sel[`${qIdx}-${oIdx}`] = true;
        }
      });
    });
    return sel;
  }, [completed, questions]);

  const [selections, setSelections] = useState<Selections>(initialSelections);
  const [checked, setChecked] = useState(completed);

  useEffect(() => {
    if (completed) {
      setChecked(true);
      setSelections(initialSelections);
    }
  }, [completed, initialSelections]);

  const toggleOption = (qIdx: number, oIdx: number) => {
    if (checked || completed) return;
    const key = `${qIdx}-${oIdx}`;
    setSelections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const { isFullyCorrect, totalSelectionsCount } = useMemo(() => {
    let allOk = true;
    let count = 0;

    questions.forEach((q, qIdx) => {
      q.options.forEach((opt, oIdx) => {
        const key = `${qIdx}-${oIdx}`;
        const isSelected = Boolean(selections[key]);
        if (isSelected) count++;
        if (isSelected !== Boolean(opt.isCorrect)) {
          allOk = false;
        }
      });
    });

    return {
      isFullyCorrect: allOk,
      totalSelectionsCount: count,
    };
  }, [questions, selections]);

  const handleCheck = () => {
    setChecked(true);
    if (isFullyCorrect) {
      onComplete?.();
    }
  };

  const handleRetry = () => {
    setChecked(false);
    setSelections({});
  };

  const heading = title?.trim() || `Множинний вибір ${exerciseIndex + 1}`;

  return (
    <div className="rounded-[22px] border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-black/10 p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-white/35">
            Чекбокси · Вправа {exerciseIndex + 1}
          </p>
          <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
            {heading}
          </h3>
        </div>
        {completed && (
          <span className="flex items-center gap-1.5 text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1 rounded-full shrink-0">
            <CheckIcon /> Виконано
          </span>
        )}
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
        Оберіть <strong>усі правильні</strong> варіанти відповідей (поставте прапорці) та натисніть «Перевірити».
      </p>

      {/* Questions list */}
      <div className="space-y-6 mb-6">
        {questions.map((q, qIdx) => (
          <div
            key={q.id || `msq-${qIdx}`}
            className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/60 dark:bg-slate-900/30 p-4 sm:p-5"
          >
            <div className="flex items-start gap-2.5 mb-4">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 px-2.5 py-0.5 rounded-lg shrink-0 mt-0.5">
                {questions.length > 1 ? `Питання ${qIdx + 1}` : "Завдання"}
              </span>
              <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug">
                {q.questionText}
              </p>
            </div>

            <div className="space-y-2.5">
              {q.options.map((opt, oIdx) => {
                const key = `${qIdx}-${oIdx}`;
                const isSelected = Boolean(selections[key]);
                const isCorrect = Boolean(opt.isCorrect);

                let statusStyle = "border-slate-200 dark:border-white/10 bg-white dark:bg-[#06121D] hover:border-emerald-400/60";
                if (checked) {
                  if (isSelected && isCorrect) {
                    statusStyle = "border-emerald-500 bg-emerald-50/90 dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-100";
                  } else if (isSelected && !isCorrect) {
                    statusStyle = "border-rose-500 bg-rose-50/90 dark:bg-rose-500/15 text-rose-900 dark:text-rose-100";
                  } else if (!isSelected && isCorrect) {
                    statusStyle = "border-amber-400 bg-amber-50/70 dark:bg-amber-500/10 text-amber-900 dark:text-amber-200";
                  }
                } else if (isSelected) {
                  statusStyle = "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 ring-1 ring-emerald-400/40";
                }

                return (
                  <div
                    key={oIdx}
                    onClick={() => toggleOption(qIdx, oIdx)}
                    className={`flex items-start gap-3.5 p-3 sm:p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none ${statusStyle}`}
                  >
                    {/* Custom Checkbox */}
                    <div
                      className={`w-5 h-5 rounded-md border-2 mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                        checked
                          ? isSelected
                            ? isCorrect
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "bg-rose-500 border-rose-500 text-white"
                            : isCorrect
                              ? "border-amber-400 bg-amber-100 dark:bg-amber-900/40 text-amber-600"
                              : "border-slate-300 dark:border-slate-600"
                          : isSelected
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                      }`}
                    >
                      <AnimatePresence>
                        {(isSelected || (checked && isCorrect)) && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="text-xs font-black"
                          >
                            {checked && !isSelected && isCorrect ? "!" : "✓"}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    <span className="text-sm sm:text-base font-medium leading-relaxed flex-1 text-slate-800 dark:text-slate-200">
                      {opt.text}
                    </span>

                    {checked && (
                      <span className="shrink-0 text-xs font-bold mt-0.5">
                        {isSelected && isCorrect && (
                          <span className="text-emerald-600 dark:text-emerald-400">Вірно</span>
                        )}
                        {isSelected && !isCorrect && (
                          <span className="text-rose-600 dark:text-rose-400">Хибно</span>
                        )}
                        {!isSelected && isCorrect && (
                          <span className="text-amber-600 dark:text-amber-400">Пропущено</span>
                        )}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Result feedback */}
      {checked && (
        <p
          className={`mb-4 text-sm font-bold ${
            isFullyCorrect
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {isFullyCorrect
            ? "Чудово! Всі правильні варіанти обрано."
            : "Перевірте виділені відповіді та спробуйте ще раз (зверніть увагу на пропущені або зайві прапорці)."}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        {!checked && !completed && (
          <button
            type="button"
            onClick={handleCheck}
            disabled={totalSelectionsCount === 0}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(16,185,129,0.18)] disabled:opacity-40 hover:opacity-95 transition-opacity"
          >
            Перевірити
          </button>
        )}
        {checked && (
          <button
            type="button"
            onClick={handleRetry}
            className="w-full rounded-2xl border border-slate-300 dark:border-white/15 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Спробувати ще раз
          </button>
        )}
      </div>
    </div>
  );
}
