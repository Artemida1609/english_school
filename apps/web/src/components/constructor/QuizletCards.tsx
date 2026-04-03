import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Card = { term: string; definition: string };

export function QuizletCards({ items }: { items: Card[] }) {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  if (!items.length) return null;

  return (
    <div className="mb-8">
      <h3 className="text-sm font-black uppercase tracking-widest text-amber-800 dark:text-amber-200 mb-4">
        Картки (натисніть, щоб перевернути)
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it, i) => {
          const isBack = flipped[i];
          return (
            <motion.button
              key={i}
              type="button"
              layout
              onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}
              className="relative min-h-[120px] rounded-2xl border-2 border-emerald-200 dark:border-emerald-500/40 bg-gradient-to-br from-white to-emerald-50/50 dark:from-[#06121D] dark:to-emerald-950/30 p-4 text-left shadow-md hover:shadow-lg hover:border-emerald-400 transition-all"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isBack ? "def" : "term"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col justify-center min-h-[88px]"
                >
                  {isBack ? (
                    <>
                      <span className="text-[10px] font-black uppercase text-violet-600 dark:text-violet-400 mb-1">
                        Визначення
                      </span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                        {it.definition}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 mb-1">
                        Термін
                      </span>
                      <span className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {it.term}
                      </span>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
