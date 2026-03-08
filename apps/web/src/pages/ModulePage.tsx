import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { YoutubePlayer } from "../components/YoutubePlayer";

const mockLessons = [
  { id: 1, title: "Вступ до граматики",   type: "Відео",    icon: "🎬", xp: 15, done: true  },
  { id: 2, title: "Часи в англійській",   type: "Теорія",   icon: "📖", xp: 10, done: true  },
  { id: 3, title: "Present Simple",       type: "Відео",    icon: "🎬", xp: 15, done: false },
  { id: 4, title: "Практика часів",       type: "Завдання", icon: "✏️", xp: 25, done: false },
  { id: 5, title: "Past Simple",          type: "Відео",    icon: "🎬", xp: 15, done: false },
  { id: 6, title: "Неправильні дієслова", type: "Теорія",   icon: "📖", xp: 10, done: false },
  { id: 7, title: "Фінальний тест",       type: "Завдання", icon: "✏️", xp: 50, done: false },
];

const mockTask = {
  question: "Оберіть правильну форму дієслова:",
  sentence: "She ___ to school every day.",
  options: ["go", "goes", "going", "went"],
  correct: 1,
};

const mockTheory = `
## Present Simple

**Present Simple** використовується для опису:
- Регулярних дій та звичок
- Загальних істин та фактів
- Розкладів та програм

### Стверджувальна форма
| Особа | Форма |
|-------|-------|
| I / You / We / They | **work** |
| He / She / It | **works** (+s) |

### Приклади
- I **go** to school every day.
- She **works** at a hospital.
- They **play** football on weekends.

### Маркери часу
*always, usually, often, sometimes, never, every day*
`;

const typeColor = {
  "Відео":    "bg-violet-50 text-violet-600 border-violet-100",
  "Теорія":   "bg-sky-50 text-sky-600 border-sky-100",
  "Завдання": "bg-amber-50 text-amber-600 border-amber-100",
};

const sidebarVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: (i: number) => ({
    x: 0, opacity: 1,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" as const },
  }),
};

const tabVariants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.3, ease: "easeOut" as const } },
  exit:    { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.2 } },
};

export const ModulePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeLesson, setActiveLesson]     = useState(mockLessons[0]);
  const [activeTab, setActiveTab]           = useState(mockLessons[0].type);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult]         = useState(false);
  const [sidebarOpen, setSidebarOpen]       = useState(false);

  const handleCheck = () => { if (selectedAnswer !== null) setShowResult(true); };
  const isCorrect   = selectedAnswer === mockTask.correct;

  const selectLesson = (lesson: typeof mockLessons[0]) => {
    setActiveLesson(lesson);
    setActiveTab(lesson.type);
    setSidebarOpen(false);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  return (
    <div className="flex h-full">

      {/* ══ MOBILE OVERLAY ══ */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ══ SIDEBAR ══ */}
      <aside className={`fixed lg:static top-0 left-0 h-full z-40
        w-72 bg-white border-r border-slate-100 flex flex-col flex-shrink-0
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}
          onClick={() => navigate("/modules")}
          className="flex items-center gap-2 px-4 py-3.5 text-slate-500
            hover:text-emerald-600 hover:bg-emerald-50/50 transition-colors duration-150 group border-b border-slate-50">
          <div className="w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors duration-150">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-sm font-semibold">{t("module.backToModules")}</span>
        </motion.button>

        {/* Module info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="p-4 border-b border-slate-50">
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-emerald-400 mb-0.5">
            {t("modules.module")} 1
          </p>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
            Основи граматики
          </h2>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>{t("module.progress")}</span>
              <span className="font-semibold text-emerald-600">2 / 7</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }} animate={{ width: "28%" }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Lesson list */}
        <div className="flex-1 overflow-y-auto py-2">
          {mockLessons.map((lesson, i) => (
            <motion.button key={lesson.id} custom={i} initial="hidden" animate="visible" variants={sidebarVariants}
              onClick={() => selectLesson(lesson)}
              className={`w-full flex items-center gap-3 px-4 py-3
                hover:bg-emerald-50/70 transition-colors duration-150 text-left group
                ${activeLesson.id === lesson.id ? "bg-emerald-50/70 border-r-2 border-emerald-400" : "cursor-pointer"}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 border transition-all duration-200
                ${lesson.done ? "bg-emerald-50 border-emerald-200" : activeLesson.id === lesson.id ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-100"}`}>
                {lesson.done ? "✅" : lesson.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 mb-0.5">{lesson.type}</p>
                <p className={`text-sm font-semibold truncate transition-colors duration-150 group-hover:text-emerald-700
                  ${activeLesson.id === lesson.id ? "text-emerald-700" : "text-slate-700"}`}>
                  {lesson.title}
                </p>
              </div>
              <span className={`text-[10px] font-bold flex-shrink-0 px-1.5 py-0.5 rounded-full border transition-colors duration-150
                ${lesson.done ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-slate-400 bg-slate-50 border-slate-100"}`}>
                +{lesson.xp}xp
              </span>
            </motion.button>
          ))}
        </div>
      </aside>

      {/* ══ MAIN CONTENT ══ */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-5 sm:px-6">

          {/* Top bar */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="flex items-center gap-3 mb-5">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-100
                text-slate-500 hover:bg-slate-50 active:scale-95 transition-all flex-shrink-0 cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <motion.div key={activeLesson.id + "badge"}
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border mb-1
                  ${typeColor[activeLesson.type as keyof typeof typeColor]}`}>
                {activeLesson.icon} {activeLesson.type}
              </motion.div>
              <motion.h1 key={activeLesson.id + "title"}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
                className="text-lg sm:text-xl font-extrabold text-slate-900 truncate">
                {activeLesson.title}
              </motion.h1>
            </div>
            <motion.div key={activeLesson.id + "xp"}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-xl flex-shrink-0">
              <span className="text-xs font-extrabold text-emerald-600">+{activeLesson.xp} XP</span>
            </motion.div>
          </motion.div>

          {/* ── VIDEO TAB ── */}
          <AnimatePresence mode="wait">
            {activeTab === "Відео" && (
              <motion.div key="video" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                <YoutubePlayer videoId="dQw4w9WgXcQ" title={activeLesson.title} />
                <div className="bg-white rounded-2xl border border-slate-100 p-4">
                  <h3 className="text-sm font-bold text-slate-800 mb-1">{activeLesson.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {t("module.videoDescription")}
                  </p>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab("Теорія")}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-xl
                      hover:shadow-md hover:shadow-emerald-200 transition-shadow duration-150">
                    {t("module.nextTheory")}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── THEORY TAB ── */}
            {activeTab === "Теорія" && (
              <motion.div key="theory" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 mb-4">
                  <div className="prose prose-sm max-w-none text-slate-700">
                    {mockTheory.trim().split("\n").map((line, i) => {
                      if (line.startsWith("## "))  return <h2 key={i} className="text-lg font-extrabold text-slate-900 mb-3 mt-0">{line.slice(3)}</h2>;
                      if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-bold text-slate-800 mt-4 mb-2">{line.slice(4)}</h3>;
                      if (line.startsWith("- "))   return <li key={i} className="text-sm text-slate-600 ml-4 mb-1">{line.slice(2)}</li>;
                      if (line.startsWith("*") && line.endsWith("*")) return <p key={i} className="text-xs text-slate-400 italic mt-2">{line.slice(1, -1)}</p>;
                      if (line.trim() === "")      return <div key={i} className="h-2" />;
                      return <p key={i} className="text-sm text-slate-600 leading-relaxed">{line}</p>;
                    })}
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab("Завдання")}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-xl
                    hover:shadow-md hover:shadow-emerald-200 transition-shadow duration-150">
                  {t("module.nextTask")}
                </motion.button>
              </motion.div>
            )}

            {/* ── TASK TAB ── */}
            {activeTab === "Завдання" && (
              <motion.div key="task" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-3">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    {t("module.task")}
                  </p>
                  <p className="text-base font-semibold text-slate-800 mb-1">{mockTask.question}</p>
                  <p className="text-lg font-bold text-slate-900 mb-5">{mockTask.sentence}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {mockTask.options.map((opt, i) => (
                      <motion.button key={i}
                        whileHover={!showResult ? { scale: 1.02 } : {}}
                        whileTap={!showResult ? { scale: 0.97 } : {}}
                        disabled={showResult}
                        onClick={() => setSelectedAnswer(i)}
                        className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all duration-200
                          ${showResult
                            ? i === mockTask.correct
                              ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                              : i === selectedAnswer && !isCorrect
                              ? "bg-rose-50 border-rose-300 text-rose-600"
                              : "bg-slate-50 border-slate-100 text-slate-400"
                            : selectedAnswer === i
                            ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                            : "bg-slate-50 border-slate-100 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/50"
                          }`}>
                        {opt}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
                      className={`rounded-2xl p-4 mb-3 border ${isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
                      <p className={`text-sm font-bold mb-0.5 ${isCorrect ? "text-emerald-700" : "text-rose-600"}`}>
                        {isCorrect ? t("module.correct") : t("module.incorrect")}
                      </p>
                      <p className="text-xs text-slate-500">
                        {isCorrect
                          ? `${t("module.earnedXp")} +${activeLesson.xp} XP`
                          : `${t("module.correctAnswer")}: "${mockTask.options[mockTask.correct]}"`}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (!showResult) {
                      handleCheck();
                    } else {
                      const next = mockLessons[activeLesson.id];
                      if (next) selectLesson(next);
                      setShowResult(false);
                      setSelectedAnswer(null);
                    }
                  }}
                  disabled={!showResult && selectedAnswer === null}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-xl
                    disabled:opacity-40 hover:shadow-md hover:shadow-emerald-200 transition-all duration-150">
                  {!showResult ? t("module.check") : t("module.nextLesson")}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};