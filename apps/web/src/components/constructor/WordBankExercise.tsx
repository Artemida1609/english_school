import { Fragment, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export type WordBankItemData = {
  id: string;
  text: string;
  answers: string[];
};

type Props = {
  items: WordBankItemData[];
  distractors?: string[];
  title?: string;
  exerciseIndex: number;
  completed?: boolean;
  onComplete?: () => void;
};

type BankToken = {
  bankId: string;
  word: string;
};

// gapKey is "itemIndex-gapIndex"
type GapPlacements = Record<string, BankToken | null>;

export function WordBankExercise({
  items,
  distractors = [],
  title,
  exerciseIndex,
  completed = false,
  onComplete,
}: Props) {
  // Build initial pool of word tokens
  const allBankTokens = useMemo(() => {
    const tokens: BankToken[] = [];
    let counter = 0;
    items.forEach((item) => {
      item.answers.forEach((ans) => {
        const trimmed = ans.trim();
        if (trimmed) {
          tokens.push({ bankId: `token-${counter++}`, word: trimmed });
        }
      });
    });
    distractors.forEach((dist) => {
      const trimmed = dist.trim();
      if (trimmed) {
        tokens.push({ bankId: `token-${counter++}`, word: trimmed });
      }
    });
    return shuffle(tokens);
  }, [items, distractors]);

  // Pre-fill placements if completed
  const initialPlacements = useMemo(() => {
    if (!completed) return {};
    const placements: GapPlacements = {};
    const usedBankIds = new Set<string>();

    items.forEach((item, itemIdx) => {
      item.answers.forEach((ans, gapIdx) => {
        const matchToken = allBankTokens.find(
          (t) => t.word.toLowerCase() === ans.trim().toLowerCase() && !usedBankIds.has(t.bankId),
        );
        if (matchToken) {
          usedBankIds.add(matchToken.bankId);
          placements[`${itemIdx}-${gapIdx}`] = matchToken;
        }
      });
    });

    return placements;
  }, [completed, items, allBankTokens]);

  const [placements, setPlacements] = useState<GapPlacements>(initialPlacements);
  const [selectedToken, setSelectedToken] = useState<BankToken | null>(null);
  const [checked, setChecked] = useState(completed);
  const [draggedToken, setDraggedToken] = useState<BankToken | null>(null);
  const [dragOverGapKey, setDragOverGapKey] = useState<string | null>(null);

  useEffect(() => {
    if (completed) {
      setChecked(true);
      setPlacements(initialPlacements);
    }
  }, [completed, initialPlacements]);

  // Set of bank IDs currently placed in gaps
  const placedBankIds = useMemo(() => {
    const set = new Set<string>();
    Object.values(placements).forEach((t) => {
      if (t) set.add(t.bankId);
    });
    return set;
  }, [placements]);

  // Total gaps count across all sentences
  const totalGapsCount = useMemo(() => {
    return items.reduce((acc, item) => {
      const parts = item.text.split("___");
      return acc + Math.max(0, parts.length - 1);
    }, 0);
  }, [items]);

  // Check if all gaps are filled correctly
  const { isFullyCorrect, placedCount } = useMemo(() => {
    let correctGaps = 0;
    let count = 0;

    items.forEach((item, itemIdx) => {
      const parts = item.text.split("___");
      const gapCount = Math.max(0, parts.length - 1);
      for (let gapIdx = 0; gapIdx < gapCount; gapIdx++) {
        const gapKey = `${itemIdx}-${gapIdx}`;
        const placed = placements[gapKey];
        if (placed) {
          count++;
          const expectedAnswer = item.answers[gapIdx]?.trim().toLowerCase();
          if (placed.word.trim().toLowerCase() === expectedAnswer) {
            correctGaps++;
          }
        }
      }
    });

    return {
      isFullyCorrect: count === totalGapsCount && correctGaps === totalGapsCount,
      placedCount: count,
    };
  }, [items, placements, totalGapsCount]);

  const handlePlaceToken = (gapKey: string, token: BankToken) => {
    if (checked || completed) return;
    setPlacements((prev) => {
      const next = { ...prev };
      // Remove token if it was placed elsewhere
      Object.keys(next).forEach((key) => {
        if (next[key]?.bankId === token.bankId) {
          next[key] = null;
        }
      });
      next[gapKey] = token;
      return next;
    });
    setSelectedToken(null);
  };

  const handleRemovePlacement = (gapKey: string) => {
    if (checked || completed) return;
    setPlacements((prev) => {
      const next = { ...prev };
      next[gapKey] = null;
      return next;
    });
  };

  const handleCheck = () => {
    setChecked(true);
    if (isFullyCorrect) {
      onComplete?.();
    }
  };

  const handleRetry = () => {
    setChecked(false);
    setPlacements({});
    setSelectedToken(null);
  };

  const heading = title?.trim() || `Слова у пропуски ${exerciseIndex + 1}`;

  return (
    <div className="rounded-[22px] border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-black/10 p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-white/35">
            Перетягування слів · Вправа {exerciseIndex + 1}
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

      <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
        Перетягніть або натисніть слово з банку, а потім виберіть потрібний пропуск у реченні.
      </p>

      {/* Word Bank Pool */}
      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-slate-50/80 dark:border-white/10 dark:bg-slate-900/40 p-3.5 sm:p-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Банк слів ({allBankTokens.length - placedBankIds.size} доступно)
          </span>
          {selectedToken && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-pulse">
              Вибрано: «{selectedToken.word}» (натисніть на пропуск)
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 min-h-[44px]">
          {allBankTokens.map((token) => {
            const isPlaced = placedBankIds.has(token.bankId);
            const isSelected = selectedToken?.bankId === token.bankId;

            if (isPlaced) {
              return (
                <div
                  key={token.bankId}
                  className="rounded-xl border border-dashed border-slate-300 dark:border-white/15 px-3 py-1.5 text-xs font-bold text-slate-400 dark:text-slate-600 bg-transparent select-none"
                >
                  {token.word}
                </div>
              );
            }

            return (
              <button
                key={token.bankId}
                type="button"
                draggable={!checked && !completed}
                onDragStart={(e) => {
                  if (checked || completed) return;
                  setDraggedToken(token);
                  e.dataTransfer.setData("text/plain", token.word);
                }}
                onDragEnd={() => setDraggedToken(null)}
                onClick={() => {
                  if (checked || completed) return;
                  setSelectedToken((prev) => (prev?.bankId === token.bankId ? null : token));
                }}
                disabled={checked || completed}
                className={`rounded-xl border px-3.5 py-1.5 text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95 touch-none select-none cursor-grab active:cursor-grabbing ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500 text-white shadow-emerald-500/25 ring-2 ring-emerald-400"
                    : "border-emerald-400/40 bg-white text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-500/40 dark:text-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/40"
                }`}
              >
                {token.word}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sentences List */}
      <div className="space-y-4 mb-6">
        {items.map((item, itemIdx) => {
          const parts = item.text.split("___");
          const gapCount = Math.max(0, parts.length - 1);

          return (
            <div
              key={item.id || `sent-${itemIdx}`}
              className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#06121D] p-3.5 sm:p-4 leading-loose font-medium text-slate-800 dark:text-slate-200 text-base sm:text-lg flex flex-wrap items-center gap-x-2 gap-y-2"
            >
              <span className="text-xs font-black text-slate-400 dark:text-slate-500 select-none mr-1">
                {itemIdx + 1}.
              </span>
              {parts.map((part, gapIdx) => {
                const gapKey = `${itemIdx}-${gapIdx}`;
                const placed = placements[gapKey];
                const expectedAnswer = item.answers[gapIdx]?.trim();
                const isGapCorrect =
                  checked && placed && expectedAnswer
                    ? placed.word.trim().toLowerCase() === expectedAnswer.toLowerCase()
                    : false;
                const isDragOver = dragOverGapKey === gapKey;

                return (
                  <Fragment key={`${itemIdx}-part-${gapIdx}`}>
                    <span>{part}</span>
                    {gapIdx < gapCount && (
                      <span
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (!checked && !completed) setDragOverGapKey(gapKey);
                        }}
                        onDragLeave={() => setDragOverGapKey(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOverGapKey(null);
                          if (draggedToken) {
                            handlePlaceToken(gapKey, draggedToken);
                          }
                        }}
                        onClick={() => {
                          if (checked || completed) return;
                          if (selectedToken) {
                            handlePlaceToken(gapKey, selectedToken);
                          } else if (placed) {
                            handleRemovePlacement(gapKey);
                          }
                        }}
                        className={`inline-flex items-center justify-center min-w-[100px] sm:min-w-[120px] px-3 py-1 rounded-xl border-2 transition-all cursor-pointer select-none text-sm font-black ${
                          checked
                            ? isGapCorrect
                              ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200"
                              : "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200"
                            : placed
                              ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100 shadow-sm"
                              : isDragOver || selectedToken
                                ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/10 border-dashed animate-pulse"
                                : "border-slate-300 dark:border-white/20 border-dashed bg-slate-50/50 dark:bg-white/5 text-slate-400"
                        }`}
                      >
                        <AnimatePresence mode="wait">
                          {placed ? (
                            <motion.span
                              key={placed.bankId}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              className="flex items-center gap-1"
                            >
                              {placed.word}
                              {checked && (
                                <span className="ml-1 text-xs">
                                  {isGapCorrect ? "✓" : "✗"}
                                </span>
                              )}
                            </motion.span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold">
                              [ пропуск ]
                            </span>
                          )}
                        </AnimatePresence>
                      </span>
                    )}
                  </Fragment>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Result feedback message */}
      {checked && (
        <p
          className={`mb-4 text-sm font-bold ${
            isFullyCorrect
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {isFullyCorrect
            ? "Чудово! Всі слова вставлено правильно."
            : "Деякі слова вставлено невірно — перевірте та спробуйте ще раз."}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        {!checked && !completed && (
          <button
            type="button"
            onClick={handleCheck}
            disabled={placedCount === 0}
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
