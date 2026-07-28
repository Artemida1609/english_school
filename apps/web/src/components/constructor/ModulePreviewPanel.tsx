/**
 * ModulePreviewPanel
 *
 * Вставте цей компонент у ModuleConstructorPage замість простого
 * <aside> з dangerouslySetInnerHTML.
 *
 * Імпорт:
 *   import { ModulePreviewPanel } from "../components/constructor/ModulePreviewPanel";
 *
 * Використання (замінити весь <aside> блок у конструкторі):
 *   <ModulePreviewPanel
 *     title={title}
 *     htmlExport={htmlExport}
 *     blocks={blocks}
 *     testPayload={testPayload}
 *   />
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ScenarioBlock } from "../../types/scenario";
import {
  buildPracticeFromBlocks,
  buildTestQuestionsFromBlocks,
} from "../../utils/scenarioExport";
import { LetterOrderExercise } from "./LetterOrderExercise";
import { OpenClozeExercise } from "./OpenClozeExercise";
import { ClozeMcqExercise } from "./ClozeMcqExercise";
import { WordBankExercise } from "./WordBankExercise";
import { MultiSelectExercise } from "./MultiSelectExercise";

// ─── Types ─────────────────────────────────────────────────────
type TabId = "theory" | "exercises" | "test";

interface TestQuestion {
  questionText: string;
  answers: { text: string; isCorrect: boolean }[];
}

interface ModulePreviewPanelProps {
  title: string;
  htmlExport: string;
  blocks: ScenarioBlock[];
  testPayload: unknown[];
}

// ─── Tab variants ───────────────────────────────────────────────
const tabVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18 } },
};

// ─── Mini QuizletCards (styled like ModulePage) ─────────────────
function MiniQuizletCards({ items }: { items: { title: string; body: string }[] }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  if (!items.length) return null;
  const current = items[idx];
  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Картки · {idx + 1}/{items.length}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => { setFlipped(false); setIdx(i => Math.max(0, i - 1)); }}
            disabled={idx === 0}
            className="rounded-lg px-2 py-1 text-[10px] font-bold border border-slate-200 dark:border-slate-600 disabled:opacity-30"
          >←</button>
          <button
            type="button"
            onClick={() => { setFlipped(false); setIdx(i => Math.min(items.length - 1, i + 1)); }}
            disabled={idx === items.length - 1}
            className="rounded-lg px-2 py-1 text-[10px] font-bold border border-slate-200 dark:border-slate-600 disabled:opacity-30"
          >→</button>
        </div>
      </div>
      <div
        className="relative cursor-pointer select-none"
        style={{ perspective: 900 }}
        onClick={() => setFlipped(f => !f)}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front */}
          <div
            className="w-full min-h-[90px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow p-4 flex flex-col items-center justify-center gap-1"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-sm font-black text-slate-900 dark:text-white text-center">{current.title}</p>
            <p className="text-[10px] text-slate-400">натисни для перекладу</p>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-200 dark:border-emerald-700/50 shadow p-4 flex items-center justify-center"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-sm font-black text-emerald-700 dark:text-emerald-300 text-center">{current.body}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Mini Matching (styled like ModulePage) ────────────────────
function MiniMatchingExercise({ left, right }: { left: string[]; right: string[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [matched, setMatched] = useState<Record<number, number>>({});
  const [wrong, setWrong] = useState<number | null>(null);

  const handleRight = (ri: number) => {
    if (selected === null) return;
    if (selected === ri) {
      const next = { ...matched, [ri]: ri };
      setMatched(next);
      setSelected(null);
    } else {
      setWrong(ri);
      setTimeout(() => setWrong(null), 600);
      setSelected(null);
    }
  };

  const allDone = Object.keys(matched).length === left.length && left.length > 0;

  return (
    <div className="mt-4 flex flex-col gap-2">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Зіставлення</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          {left.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i === selected ? null : i)}
              className={`rounded-xl px-2 py-2 text-[11px] font-bold text-left border transition-all
                ${matched[i] !== undefined
                  ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300"
                  : selected === i
                    ? "bg-emerald-500 border-emerald-400 text-white"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300"
                }`}
            >{item}</button>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          {right.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleRight(i)}
              disabled={matched[i] !== undefined}
              className={`rounded-xl px-2 py-2 text-[11px] font-bold text-left border transition-all
                ${matched[i] !== undefined
                  ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300"
                  : wrong === i
                    ? "bg-rose-50 dark:bg-rose-900/30 border-rose-300 text-rose-700"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300"
                }`}
            >{item}</button>
          ))}
        </div>
      </div>
      {allDone && (
        <motion.p
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 text-center mt-1"
        >
          🎉 Відмінно!
        </motion.p>
      )}
    </div>
  );
}

function MiniClozeExercise({ text, answers, distractors }: { text: string; answers: string[]; distractors?: string[] }) {
  return (
    <div className="mt-4">
      <ClozeMcqExercise text={text} answers={answers} distractors={distractors} exerciseIndex={0} />
    </div>
  );
}

function MiniOpenClozeExercise({ text, answers }: { text: string; answers: string[] }) {
  return (
    <div className="mt-4">
      <OpenClozeExercise text={text} answers={answers} exerciseIndex={0} />
    </div>
  );
}

function MiniLetterOrderExercise({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  return (
    <div className="mt-4">
      <LetterOrderExercise paragraphs={paragraphs} exerciseIndex={0} title={title} />
    </div>
  );
}

// ─── Mini Test ──────────────────────────────────────────────────
function MiniTest({ questions }: { questions: TestQuestion[] }) {
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  if (!questions.length) return (
    <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
      Тест для цього модуля ще не налаштовано.
    </p>
  );

  const answered = Object.keys(selected).length;
  const correct = questions.reduce((sum, q, qi) => {
    const si = selected[qi];
    if (si === undefined) return sum;
    const ci = q.answers.findIndex(a => a.isCorrect);
    return si === ci ? sum + 1 : sum;
  }, 0);
  const allCorrect = correct === questions.length;

  return (
    <div className="flex flex-col gap-4">
      {questions.map((q, qi) => {
        const si = selected[qi];
        const ci = q.answers.findIndex(a => a.isCorrect);
        return (
          <div key={qi} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-black/10 p-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
              Питання {qi + 1}
            </p>
            <p className="text-sm font-bold text-slate-800 dark:text-white mb-3 leading-snug">
              {q.questionText}
            </p>
            <div className="flex flex-col gap-1.5">
              {q.answers.map((ans, ai) => {
                const isSelected = si === ai;
                const isErr = showResult && isSelected && !ans.isCorrect;
                const isSuccess = showResult && ans.isCorrect;
                return (
                  <motion.button
                    key={ai}
                    type="button"
                    whileHover={!showResult ? { scale: 1.01 } : {}}
                    whileTap={!showResult ? { scale: 0.99 } : {}}
                    disabled={showResult}
                    onClick={() => setSelected(prev => ({ ...prev, [qi]: ai }))}
                    className={`relative py-2 px-3 rounded-xl text-xs font-bold text-left border transition-all
                      ${showResult
                        ? isSuccess
                          ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-400 text-emerald-800 dark:text-emerald-300"
                          : isErr
                            ? "bg-rose-50 dark:bg-rose-500/20 border-rose-400 text-rose-800 dark:text-rose-300"
                            : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400"
                        : isSelected
                          ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-400 text-emerald-700 dark:text-emerald-300"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white/80 hover:border-emerald-300"
                      }`}
                  >
                    {showResult && (isSuccess || isErr) && (
                      <div className={`absolute top-0 bottom-0 left-0 w-1 rounded-l-xl ${isSuccess ? "bg-emerald-500" : "bg-rose-500"}`} />
                    )}
                    <span className="pl-1">{ans.text}</span>
                    {showResult && isSuccess && <span className="float-right">✨</span>}
                    {showResult && isErr && <span className="float-right">❌</span>}
                  </motion.button>
                );
              })}
            </div>
            {showResult && (
              <p className={`mt-2 text-[10px] font-bold ${si === ci ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {si === ci ? "Правильно" : `Відповідь: ${q.answers[ci]?.text ?? "-"}`}
              </p>
            )}
          </div>
        );
      })}

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`rounded-2xl p-4 border ${allCorrect
              ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-500/40"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{allCorrect ? "🎯" : "💡"}</span>
              <div>
                <p className={`text-xs font-black ${allCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
                  {allCorrect ? "Чудово! Всі відповіді правильні." : `Правильно: ${correct} з ${questions.length}`}
                </p>
                {allCorrect && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">+15 XP зараховано ✨</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (!showResult) setShowResult(true);
          else { setShowResult(false); setSelected({}); }
        }}
        disabled={!showResult && answered !== questions.length}
        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl disabled:opacity-40 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all border border-emerald-400/50"
      >
        {!showResult ? "Перевірити" : "OK"}
      </motion.button>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────
export function ModulePreviewPanel({
  title,
  htmlExport,
  blocks,
  testPayload,
}: ModulePreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("theory");

  const practice = useMemo(() => buildPracticeFromBlocks(blocks), [blocks]);
  const testQuestions = useMemo(() => buildTestQuestionsFromBlocks(blocks), [blocks]);

  const hasExercises = practice.sections.length > 0;
  const hasTest = testQuestions.length > 0;
  const hasTheory = htmlExport.trim().length > 0;

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: "theory", label: "Теорія", icon: "📖" },
    ...(hasExercises ? [{ id: "exercises" as TabId, label: "Вправи", icon: "✏️" }] : []),
    ...(hasTest ? [{ id: "test" as TabId, label: "Тест", icon: "📝" }] : []),
  ];

  // keep active tab valid
  const validTab = tabs.some(t => t.id === activeTab) ? activeTab : "theory";

  return (
    <aside className="lg:sticky lg:top-24 h-fit">
      {/* Header label */}
      <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-0.5">
        Перегляд модуля
      </h2>

      {/* ── Module card wrapper — mirrors ModulePage shell ── */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white/80 dark:bg-[#06121D]/80 backdrop-blur-xl shadow-xl overflow-hidden relative">
        {/* Decorative blurs */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-300/20 dark:bg-emerald-600/15 blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-teal-300/20 dark:bg-teal-600/15 blur-[50px] rounded-full pointer-events-none" />

        {/* Module title bar */}
        <div className="px-4 pt-4 pb-3 border-b border-slate-200/60 dark:border-white/5 relative z-10">
          <p className="text-[9px] font-black tracking-[0.2em] uppercase text-emerald-500 dark:text-emerald-400 mb-0.5">
            Модуль · Перегляд
          </p>
          <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight truncate">
            {title || "Новий модуль"}
          </h3>

          {/* Progress bar (decorative — shows 0%) */}
          <div className="mt-2.5 h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
            <div className="h-full w-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
          </div>
        </div>

        {/* Tab pills — identical to ModulePage mobile tabs */}
        <div className="relative flex rounded-xl m-2 p-0.5 bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 gap-0.5 relative z-10">
          {tabs.map(tab => {
            const active = validTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 py-2 px-1 text-center text-[10px] font-black uppercase tracking-[0.08em] rounded-lg transition-colors z-10 whitespace-nowrap ${active ? "text-white" : "text-slate-500 dark:text-white/45"}`}
              >
                {active && (
                  <motion.div
                    layoutId="previewTabPill"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-[0_0_14px_rgba(16,185,129,0.4)] border border-emerald-400/40"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{tab.icon} {tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="max-h-[62vh] overflow-y-auto relative z-10">
          <div className="px-4 pb-5 pt-2">
            <AnimatePresence mode="wait">

              {/* ── THEORY ── */}
              {validTab === "theory" && (
                <motion.div key="theory" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                  {hasTheory ? (
                    <>
                      <div
                        dangerouslySetInnerHTML={{ __html: htmlExport }}
                        className="
                          text-sm
                          [&_h2]:text-base [&_h2]:font-black [&_h2]:text-slate-900 [&_h2]:dark:text-white [&_h2]:mb-3 [&_h2]:mt-4
                          [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-slate-800 [&_h3]:dark:text-slate-100 [&_h3]:mt-4 [&_h3]:mb-2
                          [&_p]:text-[13px] [&_p]:text-slate-700 [&_p]:dark:text-slate-300 [&_p]:leading-relaxed [&_p]:mb-2
                          [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:mb-3
                          [&_li]:text-[13px] [&_li]:text-slate-700 [&_li]:dark:text-slate-300 [&_li]:mb-1 [&_li]:marker:text-emerald-500
                          [&_strong]:text-emerald-600 [&_strong]:dark:text-emerald-400 [&_strong]:font-bold
                          [&_em]:italic [&_em]:text-slate-600 [&_em]:dark:text-slate-400
                          [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_table]:text-xs
                          [&_th]:bg-emerald-50 [&_th]:dark:bg-emerald-900/30 [&_th]:text-emerald-700 [&_th]:dark:text-emerald-300
                          [&_th]:font-bold [&_th]:px-3 [&_th]:py-2 [&_th]:border [&_th]:border-slate-200 [&_th]:dark:border-white/10 [&_th]:text-left
                          [&_td]:px-3 [&_td]:py-2 [&_td]:border [&_td]:border-slate-200 [&_td]:dark:border-white/10
                          [&_td]:text-slate-700 [&_td]:dark:text-slate-300
                          [&_tr:nth-child(even)_td]:bg-slate-50 [&_tr:nth-child(even)_td]:dark:bg-white/5
                          prose-sm dark:prose-invert max-w-none
                        "
                      />
                      {hasExercises && (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveTab("exercises")}
                          className="mt-5 w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] font-black tracking-widest uppercase rounded-xl hover:shadow-[0_0_16px_rgba(16,185,129,0.4)] transition-shadow border border-emerald-400/50"
                        >
                          Вправи →
                        </motion.button>
                      )}
                    </>
                  ) : (
                    <div className="py-10 text-center text-slate-400 dark:text-slate-600">
                      <p className="text-2xl mb-2">📖</p>
                      <p className="text-xs font-bold">Додайте текстовий блок, щоб побачити теорію</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── EXERCISES ── */}
              {validTab === "exercises" && (
                <motion.div key="exercises" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                  <section className="rounded-2xl border border-amber-200/50 dark:border-amber-500/20 bg-gradient-to-br from-amber-50/90 to-white/90 dark:from-amber-950/30 dark:to-transparent p-4 mt-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg" aria-hidden>✏️</span>
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-amber-800 dark:text-amber-200">
                        Практика
                      </h4>
                    </div>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium mb-3 opacity-80">
                      ## Вправа{"\n"}Закріпіть матеріал з теорії та виконайте вправи нижче.
                    </p>

                    {practice.sections.map((section, idx) => {
                      if (section.type === "cards") {
                        return (
                          <MiniQuizletCards
                            key={section.id}
                            items={section.items.map((item) => ({
                              title: item.term,
                              body: item.definition,
                            }))}
                          />
                        );
                      }
                      if (section.type === "match") {
                        return <MiniMatchingExercise key={section.id} left={section.left} right={section.right} />;
                      }
                      if (section.type === "letterOrder") {
                        return (
                          <MiniLetterOrderExercise
                            key={section.id}
                            title={section.title}
                            paragraphs={section.paragraphs}
                          />
                        );
                      }
                      if (section.type === "openCloze") {
                        return (
                          <MiniOpenClozeExercise
                            key={section.id}
                            text={section.text}
                            answers={section.answers}
                          />
                        );
                      }
                      if (section.type === "wordBank") {
                        return (
                          <WordBankExercise
                            key={section.id}
                            items={section.items}
                            distractors={section.distractors}
                            title={section.title}
                            exerciseIndex={idx}
                          />
                        );
                      }
                      if (section.type === "multiSelect") {
                        return (
                          <MultiSelectExercise
                            key={section.id}
                            questions={section.questions}
                            title={section.title}
                            exerciseIndex={idx}
                          />
                        );
                      }
                      return (
                        <MiniClozeExercise
                          key={section.id}
                          text={section.text}
                          answers={section.answers}
                          distractors={section.distractors}
                        />
                      );
                    })}

                    {hasTest && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab("test")}
                        className="mt-5 w-full py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white text-[11px] font-black tracking-widest uppercase rounded-xl hover:shadow-[0_0_16px_rgba(139,92,246,0.4)] transition-shadow border border-violet-400/50"
                      >
                        Тест →
                      </motion.button>
                    )}
                  </section>
                </motion.div>
              )}

              {/* ── TEST ── */}
              {validTab === "test" && (
                <motion.div key="test" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                  <section className="rounded-2xl border border-violet-200/50 dark:border-violet-500/25 bg-gradient-to-br from-violet-50/80 to-white/90 dark:from-violet-950/25 dark:to-transparent p-4 mt-1">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg" aria-hidden>📝</span>
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-violet-800 dark:text-violet-200">
                        Перевір себе
                      </h4>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.8)] animate-pulse" />
                      <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        Тест · {testQuestions.length} питань
                      </span>
                    </div>
                    <MiniTest questions={testQuestions} />
                  </section>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* Bottom badge */}
        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-white/5 bg-slate-50/60 dark:bg-white/2 relative z-10">
          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 text-center uppercase tracking-widest">
            Live Preview · Так бачать студенти
          </p>
        </div>
      </div>

      {/* Cloze exercise payload (collapsed, like before) */}
      {(testPayload as unknown[]).length > 0 && (
        <details className="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <summary className="cursor-pointer px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 select-none">
            🧩 JSON вправи ({(testPayload as unknown[]).length})
          </summary>
          <pre className="max-h-40 overflow-auto bg-slate-900 p-3 text-xs text-emerald-300 m-0">
            {JSON.stringify(testPayload, null, 2)}
          </pre>
        </details>
      )}
    </aside>
  );
}