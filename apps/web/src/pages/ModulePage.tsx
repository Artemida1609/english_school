import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { YoutubePlayer } from "../components/YoutubePlayer";
import { coursesApi, type Lesson, type LessonDetail, type Module } from "../api/courses";

const typeLabels: Record<string, string> = {
  VIDEO: "Відео",
  THEORY: "Теорія",
  TASK: "Завдання",
  TEST: "Тест",
};

const typeIcons: Record<string, string> = {
  VIDEO: "🎬",
  THEORY: "📖",
  TASK: "✏️",
  TEST: "📝",
};

const typeColor: Record<string, string> = {
  VIDEO: "bg-violet-50 text-violet-600 border-violet-100",
  THEORY: "bg-sky-50 text-sky-600 border-sky-100",
  TASK: "bg-amber-50 text-amber-600 border-amber-100",
  TEST: "bg-rose-50 text-rose-600 border-rose-100",
};

const sidebarVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" as const },
  }),
};

const tabVariants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.2 } },
};

function extractYoutubeId(url: string | undefined): string {
  if (!url) return "dQw4w9WgXcQ";
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : url;
}

function renderMarkdownLike(content: string) {
  return content.trim().split("\n").map((line, i) => {
    if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-extrabold text-slate-900 mb-3 mt-0">{line.slice(3)}</h2>;
    if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-bold text-slate-800 mt-4 mb-2">{line.slice(4)}</h3>;
    if (line.startsWith("- ")) return <li key={i} className="text-sm text-slate-600 ml-4 mb-1">{line.slice(2)}</li>;
    if (line.startsWith("*") && line.endsWith("*")) return <p key={i} className="text-xs text-slate-400 italic mt-2">{line.slice(1, -1)}</p>;
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return <p key={i} className="text-sm text-slate-600 leading-relaxed">{line}</p>;
  });
}

export const ModulePage = () => {
  const { id: moduleId } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [lessonDetail, setLessonDetail] = useState<LessonDetail | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!moduleId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    coursesApi
      .getModuleById(moduleId)
      .then((m) => {
        setModule(m);
        const lessons = [...(m.lessons ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
        setActiveLesson(lessons.length > 0 ? lessons[0] : null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [moduleId]);

  useEffect(() => {
    if (!activeLesson?.id) return;
    coursesApi
      .getLessonById(activeLesson.id)
      .then(setLessonDetail)
      .catch(() => setLessonDetail(null));
  }, [activeLesson?.id]);

  const lessons = module ? [...(module.lessons ?? [])].sort((a, b) => a.orderIndex - b.orderIndex) : [];
  const completedCount = 0;
  const currentTest = lessonDetail?.tests?.[0];
  const questions = currentTest?.questions ?? [];
  const firstQuestion = questions[0];
  const answers = firstQuestion?.answers ?? [];
  const correctIndex = answers.findIndex((a) => a.isCorrect);
  const isCorrect = selectedAnswer !== null && correctIndex >= 0 && selectedAnswer === correctIndex;

  const selectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setSidebarOpen(false);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  const goToNextLesson = () => {
    const idx = lessons.findIndex((l) => l.id === activeLesson?.id);
    if (idx >= 0 && idx < lessons.length - 1) {
      selectLesson(lessons[idx + 1]);
    }
  };

  const handleCheck = () => {
    if (selectedAnswer !== null) setShowResult(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500">{t("module.loading") ?? "Завантаження..."}</p>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="p-6">
        <p className="text-rose-600">{error ?? "Модуль не знайдено"}</p>
        <button onClick={() => navigate("/modules")} className="mt-4 text-emerald-600 font-semibold">
          ← {t("module.backToModules")}
        </button>
      </div>
    );
  }

  const courseId = module.course?.id;
  const displayType = activeLesson ? typeLabels[activeLesson.type] ?? activeLesson.type : "";
  const displayIcon = activeLesson ? typeIcons[activeLesson.type] ?? "📄" : "";

  return (
    <div className="flex h-full">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed lg:static top-0 left-0 h-full z-40 w-72 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 flex flex-col flex-shrink-0
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onClick={() => (courseId ? navigate(`/courses/${courseId}`) : navigate("/modules"))}
          className="flex items-center gap-2 px-4 py-3.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors duration-150 group border-b border-slate-50 dark:border-slate-700"
        >
          <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 flex items-center justify-center transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-sm font-semibold">{t("module.backToModules")}</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="p-4 border-b border-slate-50 dark:border-slate-700"
        >
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-emerald-400 mb-0.5">
            {t("modules.module")}
          </p>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            {module.title}
          </h2>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>{t("module.progress")}</span>
              <span className="font-semibold text-emerald-600">
                {completedCount} / {lessons.length}
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: lessons.length ? `${(completedCount / lessons.length) * 100}%` : "0%" }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto py-2">
          {lessons.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">Уроків немає</p>
          ) : (
            lessons.map((lesson, i) => (
              <motion.button
                key={lesson.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={sidebarVariants}
                onClick={() => selectLesson(lesson)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50/70 dark:hover:bg-emerald-900/20 transition-colors duration-150 text-left group
                  ${activeLesson?.id === lesson.id ? "bg-emerald-50/70 dark:bg-emerald-900/20 border-r-2 border-emerald-400" : ""}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 border transition-all duration-200
                    ${activeLesson?.id === lesson.id ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200" : "bg-slate-50 dark:bg-slate-700 border-slate-100 dark:border-slate-600"}`}
                >
                  {typeIcons[lesson.type] ?? "📄"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 mb-0.5">{typeLabels[lesson.type] ?? lesson.type}</p>
                  <p
                    className={`text-sm font-semibold truncate transition-colors duration-150
                    ${activeLesson?.id === lesson.id ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}
                  >
                    {lesson.title}
                  </p>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </aside>

      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-5 sm:px-6">
          {!activeLesson ? (
            <p className="text-slate-500 py-12 text-center">Оберіть урок</p>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-3 mb-5"
              >
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all flex-shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                <div className="flex-1 min-w-0">
                  <motion.div
                    key={activeLesson.id + "badge"}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border mb-1
                      ${typeColor[activeLesson.type] ?? "bg-slate-50 text-slate-600 border-slate-100"}`}
                  >
                    {displayIcon} {displayType}
                  </motion.div>
                  <motion.h1
                    key={activeLesson.id + "title"}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 truncate"
                  >
                    {activeLesson.title}
                  </motion.h1>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {activeLesson.type === "VIDEO" && (
                  <motion.div key="video" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                    <YoutubePlayer videoId={extractYoutubeId(lessonDetail?.videoUrl ?? activeLesson.videoUrl)} title={activeLesson.title} />
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 mt-4">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{activeLesson.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed mb-3">{t("module.videoDescription")}</p>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={goToNextLesson}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-xl hover:shadow-md hover:shadow-emerald-200 transition-shadow"
                      >
                        {t("module.nextTheory")}
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {(activeLesson.type === "THEORY" || activeLesson.type === "TASK") && !currentTest && (
                  <motion.div key="theory" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 sm:p-6 mb-4">
                      <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300">
                        {lessonDetail?.content
                          ? renderMarkdownLike(lessonDetail.content)
                          : activeLesson.content
                          ? renderMarkdownLike(activeLesson.content)
                          : <p className="text-slate-500">Контент відсутній</p>}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={goToNextLesson}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-xl hover:shadow-md hover:shadow-emerald-200 transition-shadow"
                    >
                      {t("module.nextTask")}
                    </motion.button>
                  </motion.div>
                )}

                {(activeLesson.type === "TEST" || (currentTest && firstQuestion)) && (
                  <motion.div key="test" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 mb-3">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">{t("module.task")}</p>
                      <p className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">{firstQuestion?.questionText ?? "Оберіть правильну відповідь:"}</p>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {answers.map((ans, i) => (
                          <motion.button
                            key={ans.id}
                            whileHover={!showResult ? { scale: 1.02 } : {}}
                            whileTap={!showResult ? { scale: 0.97 } : {}}
                            disabled={showResult}
                            onClick={() => setSelectedAnswer(i)}
                            className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all duration-200
                              ${showResult
                                ? ans.isCorrect
                                  ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 text-emerald-700"
                                  : i === selectedAnswer && !ans.isCorrect
                                  ? "bg-rose-50 dark:bg-rose-900/30 border-rose-300 text-rose-600"
                                  : "bg-slate-50 dark:bg-slate-700 border-slate-100 text-slate-400"
                                : selectedAnswer === i
                                ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 text-emerald-700"
                                : "bg-slate-50 dark:bg-slate-700 border-slate-100 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20"
                              }`}
                          >
                            {ans.answerText}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <AnimatePresence>
                      {showResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.25 }}
                          className={`rounded-2xl p-4 mb-3 border ${isCorrect ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200" : "bg-rose-50 dark:bg-rose-900/20 border-rose-200"}`}
                        >
                          <p className={`text-sm font-bold mb-0.5 ${isCorrect ? "text-emerald-700" : "text-rose-600"}`}>
                            {isCorrect ? t("module.correct") : t("module.incorrect")}
                          </p>
                          <p className="text-xs text-slate-500">
                            {isCorrect ? t("module.earnedXp") : `${t("module.correctAnswer")}: "${answers[correctIndex]?.answerText ?? ""}"`}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        if (!showResult) handleCheck();
                        else {
                          goToNextLesson();
                          setShowResult(false);
                          setSelectedAnswer(null);
                        }
                      }}
                      disabled={!showResult && selectedAnswer === null}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-xl disabled:opacity-40 hover:shadow-md hover:shadow-emerald-200 transition-all"
                    >
                      {!showResult ? t("module.check") : t("module.nextLesson")}
                    </motion.button>
                  </motion.div>
                )}

                {activeLesson.type === "TASK" && !currentTest && !lessonDetail?.content && !activeLesson.content && (
                  <motion.div key="empty" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                    <p className="text-slate-500 py-8">Завдання без контенту</p>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={goToNextLesson}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-xl"
                    >
                      {t("module.nextLesson")}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
