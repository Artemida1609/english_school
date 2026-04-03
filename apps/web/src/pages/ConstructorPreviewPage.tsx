import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { ConstructorPreviewPayload } from "../types/constructorPreview";
import { CONSTRUCTOR_PREVIEW_SESSION_KEY } from "../types/constructorPreview";

function renderMarkdownLike(content: string) {
  return content.trim().split("\n").map((line, i) => {
    if (line.startsWith("## "))
      return (
        <h2 key={i} className="text-xl font-black text-slate-900 dark:text-white mb-4 mt-2">
          {line.slice(3)}
        </h2>
      );
    if (line.startsWith("### "))
      return (
        <h3 key={i} className="text-base font-bold text-slate-800 dark:text-slate-100 mt-5 mb-2">
          {line.slice(4)}
        </h3>
      );
    if (line.startsWith("- "))
      return (
        <li
          key={i}
          className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-5 mb-1.5 marker:text-emerald-500 list-disc"
        >
          {line.slice(2)}
        </li>
      );
    if (line.trim() === "") return <div key={i} className="h-3" />;
    return (
      <p key={i} className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
        {line}
      </p>
    );
  });
}

export function ConstructorPreviewPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<ConstructorPreviewPayload | null>(null);
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState<"theory" | "exercises">("theory");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(CONSTRUCTOR_PREVIEW_SESSION_KEY);
    if (!raw) {
      setData(null);
      setReady(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as ConstructorPreviewPayload;
      if (parsed?.title && typeof parsed.theoryHtml === "string") {
        setData(parsed);
      } else setData(null);
    } catch {
      setData(null);
    }
    setReady(true);
  }, []);

  const questions = data?.testQuestions ?? [];
  const totalQuestions = questions.length;
  const answeredQuestions = useMemo(
    () => questions.filter((_, i) => selectedAnswers[i] !== undefined).length,
    [questions, selectedAnswers],
  );

  const correctCount = useMemo(() => {
    if (!showResult) return 0;
    let n = 0;
    questions.forEach((q, i) => {
      const sel = selectedAnswers[i];
      const correctIdx = q.answers.findIndex((a) => a.isCorrect);
      if (sel === correctIdx) n += 1;
    });
    return n;
  }, [showResult, questions, selectedAnswers]);

  const isAllCorrect = showResult && totalQuestions > 0 && correctCount === totalQuestions;

  const handleCheck = useCallback(() => {
    setShowResult(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
        <p className="text-slate-600 dark:text-slate-400">Завантаження…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
        <p className="text-slate-600 dark:text-slate-400 mb-4">Немає даних для перегляду.</p>
        <Link to="/constructor" className="text-emerald-600 font-bold hover:underline">
          Повернутися до конструктора
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-slate-50 dark:bg-[#030812] text-slate-900 dark:text-white">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate("/constructor")}
            className="text-sm font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400"
          >
            ← До конструктора
          </button>
          <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 text-[10px] font-black uppercase tracking-wider px-3 py-1">
            Перегляд (не зберігає прогрес)
          </span>
        </div>

        <h1 className="text-2xl font-black mb-6">{data.title}</h1>

        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-white/10 pb-2">
          {(
            [
              ["theory", "Теорія"],
              ["exercises", "Вправи та тест"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActiveTab(id);
                if (id === "exercises") {
                  setShowResult(false);
                }
              }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                activeTab === id
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "theory" && (
            <motion.div
              key="theory"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="prose prose-sm dark:prose-invert max-w-none rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#06121D] p-6 md:p-8"
              dangerouslySetInnerHTML={{ __html: data.theoryHtml }}
            />
          )}

          {activeTab === "exercises" && (
            <motion.div
              key="ex"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <section className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#06121D] p-6 md:p-8">
                <h2 className="text-lg font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4">
                  Вправи
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {renderMarkdownLike(data.taskMarkdown || "## Вправа\n\nОпрацюйте теорію та тест.")}
                </div>
              </section>

              <section className="rounded-3xl border border-violet-200/50 dark:border-violet-500/25 bg-gradient-to-br from-violet-50/80 to-white dark:from-violet-950/25 dark:to-[#06121D] p-6 md:p-8">
                <h2 className="text-lg font-black uppercase tracking-widest text-violet-800 dark:text-violet-200 mb-4">
                  Перевір себе
                </h2>
                {totalQuestions === 0 ? (
                  <p className="text-sm text-slate-500">Немає питань — додайте блок «Пропуски» в конструкторі.</p>
                ) : (
                  <>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                      {answeredQuestions} / {totalQuestions} відповідей
                    </p>
                    <div className="flex flex-col gap-8">
                      {questions.map((question, questionIdx) => {
                        const selectedIndex = selectedAnswers[questionIdx];
                        return (
                          <div
                            key={questionIdx}
                            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-black/20 p-4 sm:p-6"
                          >
                            <p className="text-[11px] font-black uppercase text-slate-400 mb-2">
                              Питання {questionIdx + 1}
                            </p>
                            <p className="text-lg font-black mb-4 leading-tight">{question.questionText}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {question.answers.map((ans, ansIdx) => {
                                const isSelected = selectedIndex === ansIdx;
                                const isErr = showResult && isSelected && !ans.isCorrect;
                                const isSuccess = showResult && ans.isCorrect;
                                return (
                                  <button
                                    key={ansIdx}
                                    type="button"
                                    disabled={showResult}
                                    onClick={() =>
                                      setSelectedAnswers((prev) => ({
                                        ...prev,
                                        [questionIdx]: ansIdx,
                                      }))
                                    }
                                    className={`py-3 px-4 rounded-2xl text-left text-sm font-bold border transition-all ${
                                      showResult
                                        ? isSuccess
                                          ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-400 text-emerald-800 dark:text-emerald-300"
                                          : isErr
                                            ? "bg-rose-50 dark:bg-rose-500/20 border-rose-400 text-rose-800"
                                            : "opacity-40 border-slate-200"
                                        : isSelected
                                          ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-400"
                                          : "bg-white dark:bg-[#06121D]/50 border-slate-200 dark:border-white/10"
                                    }`}
                                  >
                                    {ans.text}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {showResult && (
                      <p
                        className={`mt-4 text-sm font-bold ${
                          isAllCorrect ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isAllCorrect
                          ? "Чудово! Усі відповіді вірні (у прев’ю XP не нараховується)."
                          : `Правильно: ${correctCount} з ${totalQuestions}`}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (!showResult) handleCheck();
                        else {
                          setShowResult(false);
                          setSelectedAnswers({});
                        }
                      }}
                      disabled={!showResult && answeredQuestions !== totalQuestions}
                      className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-black uppercase tracking-widest rounded-2xl disabled:opacity-40"
                    >
                      {!showResult ? "Перевірити" : "Спробувати знову"}
                    </button>
                  </>
                )}
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
