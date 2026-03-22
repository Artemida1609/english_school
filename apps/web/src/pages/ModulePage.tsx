import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { coursesApi, type Lesson, type LessonDetail, type Module } from "../api/courses";

type TabId = "video" | "exercises" | "theory";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "video", label: "Відео", icon: "▶" },
  { id: "exercises", label: "Вправи", icon: "✏️" },
  { id: "theory", label: "Теорія", icon: "📖" },
];

const tabVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

function extractDriveId(url: string | undefined): string | null {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function renderMarkdownLike(content: string) {
  return content.trim().split("\n").map((line, i) => {
    if (line.startsWith("## "))
      return <h2 key={i} className="text-xl font-black text-slate-900 dark:text-white mb-4 mt-2 drop-shadow-sm">{line.slice(3)}</h2>;
    if (line.startsWith("### "))
      return <h3 key={i} className="text-base font-bold text-slate-800 dark:text-slate-100 mt-5 mb-2">{line.slice(4)}</h3>;
    if (line.startsWith("- "))
      return <li key={i} className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-5 mb-1.5 marker:text-emerald-500 list-disc">{line.slice(2)}</li>;
    if (line.startsWith("*") && line.endsWith("*"))
      return <p key={i} className="text-xs text-slate-500 dark:text-slate-500 italic mt-3 mb-1">{line.slice(1, -1)}</p>;
    if (line.trim() === "") return <div key={i} className="h-3" />;
    return <p key={i} className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed drop-shadow-sm">{line}</p>;
  });
}

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Fireworks Canvas ──────────────────────────────────────────
function FireworksCanvas({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    type Particle = { x: number; y: number; vx: number; vy: number; alpha: number; color: string; radius: number };
    const particles: Particle[] = [];
    const colors = ["#10b981","#14b8a6","#f59e0b","#8b5cf6","#ec4899","#3b82f6","#f97316"];
    function burst(x: number, y: number) {
      for (let i = 0; i < 60; i++) {
        const angle = (Math.PI * 2 * i) / 60 + Math.random() * 0.3;
        const speed = 2 + Math.random() * 6;
        particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, alpha: 1, color: colors[Math.floor(Math.random() * colors.length)], radius: 2 + Math.random() * 3 });
      }
    }
    const w = canvas.width; const h = canvas.height;
    burst(w * 0.3, h * 0.3);
    setTimeout(() => burst(w * 0.7, h * 0.25), 200);
    setTimeout(() => burst(w * 0.5, h * 0.4), 400);
    setTimeout(() => burst(w * 0.2, h * 0.5), 600);
    setTimeout(() => burst(w * 0.8, h * 0.45), 700);
    setTimeout(() => burst(w * 0.5, h * 0.2), 900);
    let animId: number;
    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.vx *= 0.99; p.alpha -= 0.015;
        if (p.alpha <= 0) { particles.splice(i, 1); continue; }
        ctx!.save(); ctx!.globalAlpha = p.alpha; ctx!.fillStyle = p.color;
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx!.fill(); ctx!.restore();
      }
      if (particles.length > 0) animId = requestAnimationFrame(animate);
    }
    animId = requestAnimationFrame(animate);
    const timer = setTimeout(onDone, 3500);
    return () => { cancelAnimationFrame(animId); clearTimeout(timer); };
  }, [onDone]);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[100]" style={{ width: "100vw", height: "100vh" }} />;
}

// ─── Completion Modal ──────────────────────────────────────────
function CompletionModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99] flex items-center justify-center px-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 bg-white dark:bg-[#06121D] rounded-[32px] p-8 max-w-sm w-full text-center border border-emerald-200 dark:border-emerald-500/30 shadow-[0_30px_80px_rgba(16,185,129,0.3)]"
      >
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-400/30 blur-[60px] rounded-full pointer-events-none" />
        <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.6, delay: 0.3 }} className="text-6xl mb-4">🏆</motion.div>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-2xl font-black text-slate-900 dark:text-white mb-2">Вітаємо! 🎉</motion.h2>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-slate-600 dark:text-slate-400 font-medium mb-2">Ви успішно завершили модуль!</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-sm text-emerald-600 dark:text-emerald-400 font-black mb-6 uppercase tracking-wider">+15 XP зараховано ✨</motion.p>
        <div className="flex justify-center gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <motion.span key={i} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.4 + i * 0.15, type: "spring", stiffness: 300 }} className="text-3xl">⭐</motion.span>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onClose} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-[0_0_24px_rgba(16,185,129,0.4)] border border-emerald-400/50">
          Продовжити 🚀
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export const ModulePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [detailVideo, setDetailVideo] = useState<LessonDetail | null>(null);
  const [detailTheory, setDetailTheory] = useState<LessonDetail | null>(null);
  const [detailTask, setDetailTask] = useState<LessonDetail | null>(null);
  const [detailTest, setDetailTest] = useState<LessonDetail | null>(null);

  // ─── Progress state ────────────────────────────────────────
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const videoMarkedRef = useRef(false);
  const theoryMarkedRef = useRef(false);
  const exercisesMarkedRef = useRef(false);

  // ─── Celebration state ─────────────────────────────────────
  const [showFireworks, setShowFireworks] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const celebratedRef = useRef(false);

  const tabParam = searchParams.get("tab") as TabId | null;
  const returnStage = searchParams.get("returnStage");

  const [activeTab, setActiveTab] = useState<TabId>(
    tabParam && TABS.some((x) => x.id === tabParam) ? tabParam : "video",
  );

  useEffect(() => {
    const t = searchParams.get("tab") as TabId | null;
    if (t && TABS.some((x) => x.id === t)) setActiveTab(t);
  }, [searchParams]);

  const setTab = useCallback(
    (tab: TabId) => {
      setActiveTab(tab);
      const next = new URLSearchParams(searchParams);
      next.set("tab", tab);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const { id: moduleId } = useParams<{ id: string }>();

  const sortedLessons = useMemo(() => {
    if (!module?.lessons) return [];
    return [...module.lessons].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [module]);

  const videoLesson = useMemo(() => sortedLessons.find((l) => l.type === "VIDEO"), [sortedLessons]);
  const theoryLesson = useMemo(() => sortedLessons.find((l) => l.type === "THEORY"), [sortedLessons]);
  const taskLesson = useMemo(() => sortedLessons.find((l) => l.type === "TASK"), [sortedLessons]);
  const testLesson = useMemo(() => sortedLessons.find((l) => l.type === "TEST"), [sortedLessons]);

  useEffect(() => {
    if (!moduleId) return;
    setLoading(true);
    setError(null);
    coursesApi
      .getModuleById(moduleId)
      .then(setModule)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [moduleId]);

  useEffect(() => {
    if (!module) return;
    const ls = [...(module.lessons ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
    const v = ls.find((l) => l.type === "VIDEO");
    const th = ls.find((l) => l.type === "THEORY");
    const ta = ls.find((l) => l.type === "TASK");
    const te = ls.find((l) => l.type === "TEST");

    const load = async (lesson: Lesson | undefined, setter: (d: LessonDetail | null) => void) => {
      if (!lesson?.id) { setter(null); return; }
      try { setter(await coursesApi.getLessonById(lesson.id)); }
      catch { setter(null); }
    };

    void load(v, setDetailVideo);
    void load(th, setDetailTheory);
    void load(ta, setDetailTask);
    void load(te, setDetailTest);
  }, [module]);

  // ─── Load existing progress from server ───────────────────
  useEffect(() => {
    if (!moduleId) return;
    coursesApi.getModuleProgress(moduleId)
      .then((data) => {
        const completed = new Set(
          data.lessons.filter((l) => l.progress?.completed).map((l) => l.id)
        );
        setCompletedLessons(completed);
        if (data.lessons.find(l => l.type === "VIDEO" && l.progress?.completed)) videoMarkedRef.current = true;
        if (data.lessons.find(l => l.type === "THEORY" && l.progress?.completed)) theoryMarkedRef.current = true;
        if (data.lessons.find(l => (l.type === "TASK" || l.type === "TEST") && l.progress?.completed)) exercisesMarkedRef.current = true;
        // Don't celebrate if module was already completed before
        if (data.percentage === 100) celebratedRef.current = true;
      })
      .catch(() => {});
  }, [moduleId]);

  // ─── Save progress helper ──────────────────────────────────
  const markComplete = useCallback(async (lessonId: string | undefined) => {
    if (!lessonId || completedLessons.has(lessonId)) return;
    try {
      await coursesApi.saveProgress({ lessonId, completed: true });
      setCompletedLessons((prev) => new Set([...prev, lessonId]));
    } catch {}
  }, [completedLessons]);

  // ─── Auto-mark video after 3s on tab ──────────────────────
  useEffect(() => {
    if (activeTab !== "video" || videoMarkedRef.current || !videoLesson?.id) return;
    const timer = setTimeout(() => {
      videoMarkedRef.current = true;
      void markComplete(videoLesson.id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [activeTab, videoLesson, markComplete]);

  // ─── Auto-mark theory after 2s on tab ─────────────────────
  useEffect(() => {
    if (activeTab !== "theory" || theoryMarkedRef.current || !theoryLesson?.id) return;
    const timer = setTimeout(() => {
      theoryMarkedRef.current = true;
      void markComplete(theoryLesson.id);
    }, 2000);
    return () => clearTimeout(timer);
  }, [activeTab, theoryLesson, markComplete]);

  // ─── Test state ────────────────────────────────────────────
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const currentTest = detailTest?.tests?.[0];
  const questions = currentTest?.questions ?? [];
  const firstQuestion = questions[0];
  const answers = firstQuestion?.answers ?? [];
  const correctIndex = answers.findIndex((a) => a.isCorrect);
  const isCorrect = selectedAnswer !== null && correctIndex >= 0 && selectedAnswer === correctIndex;

  const handleCheck = async () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    if (taskLesson?.id) await markComplete(taskLesson.id);
    if (isCorrect && testLesson?.id) {
      exercisesMarkedRef.current = true;
      await markComplete(testLesson.id);
    }
  };

  // ─── Progress derived values ───────────────────────────────
  const lessonItems = useMemo(() => [
    { lesson: videoLesson, type: "VIDEO", label: "Відео", tab: "video" as TabId },
    { lesson: theoryLesson, type: "THEORY", label: "Теорія", tab: "theory" as TabId },
    { lesson: taskLesson, type: "TASK", label: "Вправи", tab: "exercises" as TabId },
    { lesson: testLesson, type: "TEST", label: "Тест", tab: "exercises" as TabId },
  ], [videoLesson, theoryLesson, taskLesson, testLesson]);

  const completedCount = lessonItems.filter(({ lesson }) => lesson && completedLessons.has(lesson.id)).length;
  const totalCount = lessonItems.filter(({ lesson }) => !!lesson).length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // ─── Trigger celebration when all lessons done ─────────────
  useEffect(() => {
    if (totalCount > 0 && completedCount === totalCount && !celebratedRef.current) {
      celebratedRef.current = true;
      setTimeout(() => {
        setShowFireworks(true);
        setShowModal(true);
      }, 600);
    }
  }, [completedCount, totalCount]);

  const backHref = returnStage ? `/course?stage=${returnStage}` : "/course";

  // ─── Sidebar lesson item ───────────────────────────────────
  const SidebarItem = ({
    lesson, type, label, icon, tab,
  }: { lesson: Lesson | undefined; type: string; label: string; icon: string; tab: TabId }) => {
    if (!lesson) return null;
    const highlight = type === "VIDEO" ? activeTab === "video"
      : type === "THEORY" ? activeTab === "theory"
      : activeTab === "exercises";
    const done = completedLessons.has(lesson.id);

    return (
      <button
        onClick={() => setTab(tab)}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-1.5 text-left transition-all duration-200 group ${
          highlight
            ? "bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-400/30 dark:border-emerald-500/30"
            : "hover:bg-slate-100/80 dark:hover:bg-white/5 border border-transparent"
        }`}
      >
        <div className={`w-1 h-8 rounded-full transition-all duration-200 ${highlight ? "bg-emerald-500" : "bg-transparent group-hover:bg-slate-300 dark:group-hover:bg-white/20"}`} />
        <motion.div
          animate={done ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.4 }}
          className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 border transition-all duration-300 ${
            done
              ? "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]"
              : "bg-slate-100 dark:bg-white/5 border-slate-200/80 dark:border-white/10"
          }`}
        >
          {done ? <CheckIcon /> : icon}
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${highlight ? "text-emerald-500 dark:text-emerald-400" : "text-slate-400 dark:text-white/35"}`}>
            {label}
          </p>
          <p className={`text-sm font-bold truncate ${highlight ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-white/60"}`}>
            {lesson.title}
          </p>
        </div>
        {done && <span className="text-[10px] font-black text-emerald-500 dark:text-emerald-400 shrink-0">✓</span>}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-slate-50 dark:bg-[#030812]">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#030812] px-6">
        <div className="bg-white/80 dark:bg-[#06121D]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[24px] p-8 max-w-sm text-center shadow-xl">
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mb-4">{error ?? "Модуль не знайдено"}</p>
          <button onClick={() => navigate(backHref)} className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-105 transition-transform">
            ← Повернутися
          </button>
        </div>
      </div>
    );
  }

  const tabContent = (
    <AnimatePresence mode="wait">
      {activeTab === "video" && (
        <motion.div key="video" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-6">
          {videoLesson ? (
            <>
              <div className="rounded-[24px] md:rounded-[32px] overflow-hidden border border-slate-200/50 dark:border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-black ring-1 ring-white/10">
                <iframe
                  src={`https://drive.google.com/file/d/${extractDriveId(detailVideo?.videoUrl ?? videoLesson?.videoUrl)}/preview?rm=minimal`}
                  className="w-full aspect-video"
                  allow="autoplay"
                  allowFullScreen
                />
              </div>
              <div className="bg-white/80 dark:bg-[#06121D]/80 backdrop-blur-2xl rounded-[24px] md:rounded-[32px] border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none" />
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">{videoLesson.title}</h3>
                  <AnimatePresence>
                    {completedLessons.has(videoLesson.id) && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5 text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1 rounded-full"
                      >
                        <CheckIcon /> Переглянуто
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium relative z-10">
                  {t("module.videoDescription", "Перегляньте відео, щоб засвоїти теоретичну частину матеріалу.")}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setTab("theory")}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[13px] font-black tracking-widest uppercase rounded-2xl hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-shadow border border-emerald-400/50 relative z-10"
                >
                  {t("module.openTheory", "Теорія →")}
                </motion.button>
              </div>
            </>
          ) : (
            <div className="rounded-[32px] border border-dashed border-slate-300 dark:border-white/15 p-12 text-center text-slate-500">Відео ще не додано.</div>
          )}
        </motion.div>
      )}

      {activeTab === "theory" && (
        <motion.div key="theory" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-6">
          {theoryLesson ? (
            <div className="bg-white/80 dark:bg-[#06121D]/80 backdrop-blur-2xl rounded-[24px] md:rounded-[32px] border border-slate-200 dark:border-white/10 p-6 sm:p-10 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-sky-400/10 blur-[50px] rounded-full pointer-events-none" />
              <AnimatePresence>
                {completedLessons.has(theoryLesson.id) && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mb-4 text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1.5 rounded-full w-fit relative z-10"
                  >
                    <CheckIcon /> Прочитано
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="prose prose-sm dark:prose-invert max-w-none relative z-10 prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-strong:text-emerald-600 dark:prose-strong:text-emerald-400">
                {detailTheory?.content || theoryLesson.content ? (
                  renderMarkdownLike(detailTheory?.content ?? theoryLesson.content ?? "")
                ) : (
                  <div className="py-10 text-center text-slate-500 dark:text-slate-400 font-medium bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
                    Контент ще не додано
                  </div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setTab("exercises")}
                className="mt-8 w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[13px] font-black tracking-widest uppercase rounded-2xl hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-shadow border border-emerald-400/50 relative z-10"
              >
                Вправи →
              </motion.button>
            </div>
          ) : (
            <div className="rounded-[32px] border border-dashed border-slate-300 dark:border-white/15 p-12 text-center">Теорія ще не додана.</div>
          )}
        </motion.div>
      )}

      {activeTab === "exercises" && (
        <motion.div key="exercises" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-8">
          <section className="relative rounded-[24px] md:rounded-[28px] overflow-hidden border border-amber-200/50 dark:border-amber-500/20 bg-gradient-to-br from-amber-50/90 to-white/90 dark:from-amber-950/30 dark:to-[#06121D]/90 backdrop-blur-xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden>✏️</span>
                <h2 className="text-lg font-black uppercase tracking-widest text-amber-800 dark:text-amber-200">Практика</h2>
              </div>
              <AnimatePresence>
                {taskLesson && completedLessons.has(taskLesson.id) && (
                  <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5 text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1 rounded-full">
                    <CheckIcon /> Виконано
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            {taskLesson && (detailTask?.content || taskLesson.content) ? (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-slate-800 dark:prose-p:text-slate-200">
                {renderMarkdownLike(detailTask?.content ?? taskLesson.content ?? "")}
              </div>
            ) : taskLesson ? (
              <p className="text-sm text-slate-500 dark:text-white/50">Контент вправи з'явиться незабаром.</p>
            ) : (
              <p className="text-sm text-slate-500 dark:text-white/40">Текстових вправ для цього модуля немає.</p>
            )}
          </section>

          <section className="relative rounded-[24px] md:rounded-[28px] overflow-hidden border border-violet-200/50 dark:border-violet-500/25 bg-gradient-to-br from-violet-50/80 to-white/90 dark:from-violet-950/25 dark:to-[#06121D]/90 backdrop-blur-xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden>📝</span>
                <h2 className="text-lg font-black uppercase tracking-widest text-violet-800 dark:text-violet-200">Перевір себе</h2>
              </div>
              <AnimatePresence>
                {testLesson && completedLessons.has(testLesson.id) && (
                  <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5 text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1 rounded-full">
                    <CheckIcon /> Пройдено
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {testLesson && firstQuestion ? (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-6">
                  <span className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)] animate-pulse" />
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {t("module.task", "Тест")} 1 / {questions.length || 1}
                  </span>
                </div>
                <p className="text-xl md:text-2xl font-black text-slate-800 dark:text-white mb-8 leading-tight drop-shadow-sm">{firstQuestion.questionText}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {answers.map((ans, i) => {
                    const isSelected = selectedAnswer === i;
                    const isErr = showResult && isSelected && !ans.isCorrect;
                    const isSuccess = showResult && ans.isCorrect;
                    return (
                      <motion.button
                        key={ans.id}
                        whileHover={!showResult ? { scale: 1.02 } : {}}
                        whileTap={!showResult ? { scale: 0.98 } : {}}
                        disabled={showResult}
                        onClick={() => setSelectedAnswer(i)}
                        className={`relative py-4 px-6 rounded-2xl text-base font-bold transition-all duration-300 shadow-sm border text-left overflow-hidden
                          ${showResult
                            ? isSuccess ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-400 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.35)] ring-2 ring-emerald-400/30"
                              : isErr ? "bg-rose-50 dark:bg-rose-500/20 border-rose-400 dark:border-rose-500/50 text-rose-800 dark:text-rose-300"
                              : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/30"
                            : isSelected ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-400 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                              : "bg-white dark:bg-[#06121D]/50 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/80 hover:border-emerald-300 dark:hover:border-emerald-500/30"}`}
                      >
                        {(isSuccess || isErr) && <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${isSuccess ? "bg-emerald-500" : "bg-rose-500"}`} />}
                        <div className="flex items-center justify-between gap-2">
                          <span>{ans.answerText}</span>
                          {showResult && isSuccess && <span className="text-xl">✨</span>}
                          {showResult && isErr && <span className="text-xl">❌</span>}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }}
                      transition={{ type: "spring", stiffness: 320, damping: 24 }}
                      className={`mt-8 rounded-3xl p-6 md:p-8 border shadow-xl backdrop-blur-xl ${isCorrect ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.35)]" : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/30"}`}
                    >
                      <div className="flex items-start gap-4">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border shadow-inner ${isCorrect ? "bg-emerald-100 dark:bg-emerald-500/25 border-emerald-300" : "bg-rose-100 dark:bg-rose-500/20 border-rose-300"}`}>
                          {isCorrect ? "🎯" : "💡"}
                        </motion.div>
                        <div>
                          <p className={`text-lg font-black mb-1 ${isCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
                            {isCorrect ? t("module.correct", "Чудово! Абсолютно вірно.") : t("module.incorrect", "Не зовсім правильно.")}
                          </p>
                          <p className="text-sm font-medium text-slate-600 dark:text-white/60">
                            {isCorrect ? t("module.earnedXp", "Ви успішно засвоїли матеріал і отримуєте +15 XP!") : `${t("module.correctAnswer", "Правильна відповідь")}: "${answers[correctIndex]?.answerText ?? ""}"`}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { if (!showResult) void handleCheck(); else { setShowResult(false); setSelectedAnswer(null); } }}
                  disabled={!showResult && selectedAnswer === null}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[14px] font-black uppercase tracking-widest rounded-2xl disabled:opacity-40 hover:shadow-[0_0_24px_rgba(16,185,129,0.5)] transition-all border border-emerald-400/50 disabled:border-transparent"
                >
                  {!showResult ? t("module.check", "Перевірити відповідь") : "OK"}
                </motion.button>
              </>
            ) : (
              <p className="text-sm text-slate-500 dark:text-white/45">Тест для цього модуля ще не налаштовано.</p>
            )}
          </section>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {showFireworks && <FireworksCanvas onDone={() => setShowFireworks(false)} />}
      <AnimatePresence>{showModal && <CompletionModal onClose={() => setShowModal(false)} />}</AnimatePresence>

    <div className="flex flex-col md:flex-row h-full min-h-full bg-slate-50 dark:bg-[#030812] overflow-hidden relative text-slate-900 dark:text-white md:rounded-[36px] border border-slate-200/50 dark:border-white/5 shadow-2xl transition-colors duration-500">
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-300/30 dark:bg-emerald-600/20 blur-[130px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-300/30 dark:bg-teal-600/20 blur-[130px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

      {/* ─── DESKTOP SIDEBAR ──────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-72 shrink-0 border-r border-slate-200/60 dark:border-white/5 bg-white/40 dark:bg-[#06121D]/60 backdrop-blur-xl relative z-10">
        <div className="px-6 pt-6 pb-4 border-b border-slate-200/60 dark:border-white/5">
          <button onClick={() => navigate(backHref)} className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80 transition-colors mb-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Back to modules
          </button>
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-emerald-500 dark:text-emerald-400 mb-1">Модуль</p>
          <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">{module.title}</h1>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">Progress</span>
              <span className="text-[10px] font-black text-slate-600 dark:text-white/60">{completedCount} / {totalCount}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <AnimatePresence>
              {progressPct === 100 && (
                <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-black text-emerald-500 mt-1.5 text-center uppercase tracking-wider">
                  🎉 Модуль завершено!
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <SidebarItem lesson={videoLesson} type="VIDEO" label="Відео" icon="▶" tab="video" />
          <SidebarItem lesson={theoryLesson} type="THEORY" label="Теорія" icon="📖" tab="theory" />
          <SidebarItem lesson={taskLesson} type="TASK" label="Вправи" icon="✏️" tab="exercises" />
          <SidebarItem lesson={testLesson} type="TEST" label="Тест" icon="📝" tab="exercises" />
        </nav>
      </aside>

      {/* ─── MAIN CONTENT ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative z-10">
        {/* Mobile header */}
        <header className="md:hidden flex flex-col gap-4 px-4 pt-6 pb-2 border-b border-slate-200/60 dark:border-white/5 shrink-0">
          <div className="flex items-start gap-4">
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => navigate(backHref)} className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl cursor-pointer bg-white/80 dark:bg-[#06121D]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white shadow-md">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </motion.button>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black tracking-[0.2em] uppercase text-emerald-500 dark:text-emerald-400 mb-1">Модуль</p>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{module.title}</h1>
            </div>
          </div>
          {/* Mobile progress */}
          <div className="px-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">Прогрес</span>
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">{completedCount} / {totalCount}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
          {/* Mobile tabs */}
          <div className="relative flex rounded-2xl p-1 bg-slate-200/60 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-inner">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              const tabDone =
                tab.id === "video" ? (videoLesson && completedLessons.has(videoLesson.id))
                : tab.id === "theory" ? (theoryLesson && completedLessons.has(theoryLesson.id))
                : (taskLesson && completedLessons.has(taskLesson.id)) || (testLesson && completedLessons.has(testLesson.id));

              return (
                <button key={tab.id} type="button" onClick={() => setTab(tab.id)} className={`relative flex-1 py-3 px-2 text-center text-[11px] font-black uppercase tracking-[0.12em] rounded-xl transition-colors z-10 ${active ? "text-white" : "text-slate-500 dark:text-white/45"}`}>
                  {active && (
                    <motion.div layoutId="moduleTabPill" className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.45)] border border-emerald-400/40" transition={{ type: "spring", stiffness: 420, damping: 32 }} />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-1">
                    {tab.label}
                    {tabDone && !active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />}
                  </span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Desktop title */}
        <div className="hidden md:block px-8 pt-8 pb-2 shrink-0">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-emerald-500 dark:text-emerald-400 mb-1">
            {TABS.find(t => t.id === activeTab)?.label}
          </p>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {activeTab === "video" && (videoLesson?.title ?? "Відео")}
            {activeTab === "theory" && (theoryLesson?.title ?? "Теорія")}
            {activeTab === "exercises" && "Практика та Тест"}
          </h2>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 pb-12">
            {tabContent}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};