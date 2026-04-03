import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { coursesApi, type Course, type Module } from "../api/courses";
import { apiFetch } from "../api/client";
import type { RootState } from "../store";

const DEFAULT_IMG = "/images/module-img.png";
const STAGES = [1, 2, 3, 4, 5] as const;
const ACCENT_STRIP = [
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-indigo-500",
  "from-fuchsia-400 to-pink-500",
  "from-violet-400 to-purple-600",
  "from-rose-400 to-red-500",
  "from-cyan-400 to-emerald-500",
];

function inferredStageFromOrderIndex(orderIndex: number): number {
  if (orderIndex <= 2) return 1;
  if (orderIndex <= 5) return 2;
  if (orderIndex <= 8) return 3;
  if (orderIndex <= 11) return 4;
  return 5;
}
function shouldInferStagesFromOrder(modules: Module[]): boolean {
  if (modules.length < 10) return false;
  return modules.every((m) => m.stage == null || m.stage === 1);
}
function moduleStage(m: Module, sortedModules: Module[]): number {
  if (shouldInferStagesFromOrder(sortedModules)) return inferredStageFromOrderIndex(m.orderIndex);
  const s = m.stage ?? 1;
  return s >= 1 && s <= 5 ? s : inferredStageFromOrderIndex(m.orderIndex);
}

// ─── Fireworks Canvas ─────────────────────────────────────────
function FireworksCanvas({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    type Particle = {
      x: number; y: number; vx: number; vy: number;
      alpha: number; color: string; radius: number;
    };

    const particles: Particle[] = [];
    const colors = ["#10b981", "#14b8a6", "#f59e0b", "#8b5cf6", "#ec4899", "#3b82f6", "#f97316"];

    function burst(x: number, y: number) {
      for (let i = 0; i < 60; i++) {
        const angle = (Math.PI * 2 * i) / 60 + Math.random() * 0.3;
        const speed = 2 + Math.random() * 6;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          radius: 2 + Math.random() * 3,
        });
      }
    }

    // Multiple bursts
    const w = canvas.width;
    const h = canvas.height;
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
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.vx *= 0.99;
        p.alpha -= 0.015;
        if (p.alpha <= 0) { particles.splice(i, 1); continue; }
        ctx!.save();
        ctx!.globalAlpha = p.alpha;
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }
      if (particles.length > 0) animId = requestAnimationFrame(animate);
    }
    animId = requestAnimationFrame(animate);

    const timer = setTimeout(onDone, 3500);
    return () => { cancelAnimationFrame(animId); clearTimeout(timer); };
  }, [onDone]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}

// ─── Completion Modal ─────────────────────────────────────────
function CompletionModal({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99] flex items-center justify-center px-6"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 bg-white dark:bg-[#06121D] rounded-[32px] p-8 max-w-sm w-full text-center border border-emerald-200 dark:border-emerald-500/30 shadow-[0_30px_80px_rgba(16,185,129,0.3)]"
        >
          {/* Glow */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-400/30 blur-[60px] rounded-full pointer-events-none" />

          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-6xl mb-4"
          >
            🏆
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-black text-slate-900 dark:text-white mb-2"
          >
            Вітаємо! 🎉
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-slate-600 dark:text-slate-400 font-medium mb-2"
          >
            Ви успішно завершили модуль!
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-emerald-600 dark:text-emerald-400 font-black mb-6 uppercase tracking-wider"
          >
            +15 XP зараховано ✨
          </motion.p>

          {/* Stars */}
          <div className="flex justify-center gap-2 mb-6">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4 + i * 0.15, type: "spring", stiffness: 300 }}
                className="text-3xl"
              >
                ⭐
              </motion.span>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-[0_0_24px_rgba(16,185,129,0.4)] border border-emerald-400/50"
          >
            Продовжити 🚀
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Module progress bar ──────────────────────────────────────
function ModuleProgressBar({
  moduleId,
  onComplete,
}: {
  moduleId: string;
  onComplete?: () => void;
}) {
  const [pct, setPct] = useState<number | null>(null);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);
  const prevPct = useRef<number | null>(null);

  useEffect(() => {
    coursesApi
      .getModuleProgress(moduleId)
      .then((data) => {
        setPct(data.percentage);
        setCompleted(data.completedCount);
        setTotal(data.totalCount);
        if (prevPct.current !== null && prevPct.current < 100 && data.percentage === 100) {
          onComplete?.();
        }
        prevPct.current = data.percentage;
      })
      .catch(() => setPct(0));
  }, [moduleId, onComplete]);

  if (pct === null) return <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10 animate-pulse mt-3" />;
  if (total === 0) return null;

  const done = pct === 100;

  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${done ? "text-emerald-500" : "text-slate-400 dark:text-white/35"}`}>
          {done ? "✅ Завершено" : "Прогрес"}
        </span>
        <span className={`text-[10px] font-black ${done ? "text-emerald-500" : "text-slate-500 dark:text-white/40"}`}>
          {completed}/{total}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${done ? "bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]" : "bg-gradient-to-r from-emerald-400 to-teal-400"}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export const CourseDetailPage = () => {
  const staffRole = useSelector((s: RootState) => s.auth.user?.role);
  const isStaff = staffRole === "TEACHER" || staffRole === "ADMIN";

  const { courseId } = useParams<{ courseId?: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stageProgress, setStageProgress] = useState<Record<number, { completed: number; total: number }>>({});
  const [moduleLocks, setModuleLocks] = useState<Record<string, { unlocked: boolean; completed: boolean; progress: number }>>({});

  // Celebration state
  const [showFireworks, setShowFireworks] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const stageFromUrl = Number.parseInt(searchParams.get("stage") ?? "1", 10);
  const initialStage = STAGES.includes(stageFromUrl as (typeof STAGES)[number]) ? stageFromUrl : 1;
  const [selectedStage, setSelectedStage] = useState(initialStage);

  useEffect(() => {
    const s = Number.parseInt(searchParams.get("stage") ?? "1", 10);
    if (STAGES.includes(s as (typeof STAGES)[number])) setSelectedStage(s);
  }, [searchParams]);

  useEffect(() => {
    if (!searchParams.get("stage")) {
      setSearchParams((prev) => { const next = new URLSearchParams(prev); next.set("stage", "1"); return next; }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const setStage = (n: number) => {
    setSelectedStage(n);
    setSearchParams({ stage: String(n) }, { replace: true });
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        let targetId = courseId;
        if (!targetId) {
          const courses = await coursesApi.getCourses();
          if (courses.length === 0) throw new Error("Курси не знайдені");
          const preferred = courses.find((c) => c.id === "seed-course-3") ?? courses.find((c) => c.title.includes("Present & Past")) ?? courses[0];
          targetId = preferred.id;
        }
        setCourse(await coursesApi.getCourseById(targetId));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    if (!course?.id) return;

    const loadProfileModules = async () => {
      try {
        const profileRes = await apiFetch<{
          learning?: {
            modules?: Array<{
              id: string;
              completed: boolean;
              progress: number;
              unlocked: boolean;
            }>;
          };
        }>("/api/profile/me?courseId=" + course.id);

        const locks: Record<string, { unlocked: boolean; completed: boolean; progress: number }> = {};
        profileRes.learning?.modules?.forEach((mod) => {
          locks[mod.id] = {
            unlocked: mod.unlocked ?? true,
            completed: mod.completed ?? false,
            progress: mod.progress ?? 0,
          };
        });
        setModuleLocks(locks);
      } catch {
        setModuleLocks({});
      }
    };

    void loadProfileModules();
  }, [course?.id]);

  const sortedModules = useMemo(() => [...(course?.modules ?? [])].sort((a, b) => a.orderIndex - b.orderIndex), [course]);
  const modulesInStage = useMemo(() => sortedModules.filter((m) => moduleStage(m, sortedModules) === selectedStage), [sortedModules, selectedStage]);

  const [moduleCompletions, setModuleCompletions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (sortedModules.length === 0) return;
    const loadAll = async () => {
      const results: Record<number, { completed: number; total: number }> = {};
      const newCompletions: Record<string, boolean> = {};

      await Promise.all(sortedModules.map(async (mod) => {
        try {
          const data = await coursesApi.getModuleProgress(mod.id);
          const stage = moduleStage(mod, sortedModules);
          if (!results[stage]) results[stage] = { completed: 0, total: 0 };
          results[stage].completed += data.completedCount;
          results[stage].total += data.totalCount;
          newCompletions[mod.id] = data.percentage === 100;
        } catch (error) {
          console.warn(`Module progress load failed for module ${mod.id}:`, error);
        }
      }));
      setStageProgress(results);
      setModuleCompletions(newCompletions);
    };
    void loadAll();
  }, [sortedModules]);

  const stageUnlocked = useMemo(() => {
    const result: Record<number, boolean> = {};
    let canOpen = true;

    for (const stage of STAGES) {
      const modules = sortedModules.filter((m) => moduleStage(m, sortedModules) === stage);
      if (modules.length === 0) {
        result[stage] = canOpen;
        continue;
      }
      const allCompleted = modules.every((m) => moduleCompletions[m.id] ?? false);
      result[stage] = canOpen;
      canOpen = canOpen && allCompleted;
    }

    return result;
  }, [sortedModules, moduleCompletions]);

  const moduleUnlockState = useMemo(() => {
    const result: Record<string, boolean> = {};
    let sequentialOpen = true;

    for (const mod of sortedModules) {
      const stage = moduleStage(mod, sortedModules);
      const isStageOpen = stageUnlocked[stage] ?? (stage === 1);
      const unlocked = isStageOpen && sequentialOpen;

      result[mod.id] = unlocked;
      const completed = moduleCompletions[mod.id] ?? false;
      sequentialOpen = sequentialOpen && completed;
    }

    return result;
  }, [sortedModules, stageUnlocked, moduleCompletions]);

  const handleModuleComplete = useCallback(() => {
    setShowFireworks(true);
    setShowModal(true);
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    setShowFireworks(false);
  };

  const stageProgressForSelected = stageProgress[selectedStage];
  const completedInStage = stageProgressForSelected?.completed ?? 0;
  const totalInStage = stageProgressForSelected?.total ?? (modulesInStage.length > 0 ? modulesInStage.length * 4 : 1);
  const progressPct = totalInStage > 0 ? (completedInStage / totalInStage) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#030812]">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6 bg-slate-50 dark:bg-[#030812]">
        <p className="text-rose-600 dark:text-rose-400 text-center">{error ?? "Курс не знайдено"}</p>
      </div>
    );
  }

  return (
    <>
      {/* Fireworks */}
      {showFireworks && <FireworksCanvas onDone={() => setShowFireworks(false)} />}

      {/* Completion modal */}
      {showModal && <CompletionModal onClose={handleCloseModal} />}

      <div className="min-h-full bg-slate-50 dark:bg-[#030812] overflow-hidden relative text-slate-900 dark:text-white md:rounded-[36px] border border-slate-200/50 dark:border-white/5 shadow-2xl transition-colors duration-500">
        {/* BG blobs */}
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-300/40 dark:bg-emerald-600/30 blur-[140px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
        <div className="absolute top-[30%] -right-[10%] w-[40%] h-[50%] bg-teal-300/30 dark:bg-teal-600/20 blur-[140px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

        <section className="relative z-10 p-4 sm:p-6 md:p-10 overflow-y-auto">

          {/* ─── HEADER ────────────────────────────────────────── */}
          <div className="mb-6 sm:mb-8">
            {/* Row: title + modules badge */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <motion.p
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  className="text-[10px] font-black tracking-[0.2em] uppercase text-emerald-600 dark:text-emerald-400 mb-1"
                >
                  Course
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                  className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight"
                >
                  {course.title.split(" ").slice(0, 1).join(" ")}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                    {course.title.split(" ").slice(1).join(" ")}
                  </span>
                </motion.h2>
              </div>

              {/* Modules badge — compact on mobile */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-md border border-emerald-200 dark:border-white/10 shadow-lg"
              >
                <span className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-300 leading-none">
                  {sortedModules.length}
                </span>
                <span className="text-[8px] sm:text-[10px] font-bold text-slate-500 dark:text-emerald-200/50 uppercase tracking-widest">
                  mod
                </span>
              </motion.div>
            </div>

            {/* Description — hidden on very small screens to save space */}
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
              className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed line-clamp-2 sm:line-clamp-none"
            >
              {course.description}
            </motion.p>

            <div className="mt-4 sm:mt-6 h-px bg-gradient-to-r from-emerald-200 dark:from-white/10 via-teal-100 dark:via-white/5 to-transparent" />
          </div>

          {/* ─── STAGE SELECTOR ────────────────────────────────── */}
          <div className="mb-5 sm:mb-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 mb-3">
              Оберіть рівень
            </p>

            {/* Scrollable row — fits perfectly on mobile */}
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap snap-x snap-mandatory scrollbar-none">
              {STAGES.map((stage) => {
                const active = selectedStage === stage;
                const count = sortedModules.filter((m) => moduleStage(m, sortedModules) === stage).length;
                const sp = stageProgress[stage];
                const stagePct = sp && sp.total > 0 ? Math.round((sp.completed / sp.total) * 100) : 0;
                const stageDone = stagePct === 100 && sp && sp.total > 0;
                const isUnlocked = stageUnlocked[stage] ?? (stage === 1);

                return (
                  <motion.button
                    key={stage}
                    type="button"
                    onClick={() => {
                      if (!isUnlocked) return;
                      setStage(stage);
                    }}
                    title={
                      isUnlocked
                        ? `Рівень ${stage} доступний`
                        : `Заблоковано: завершіть попередні рівні перед переходом`
                    }
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex-shrink-0 snap-center w-[72px] sm:w-[88px] md:w-24 aspect-square rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-0.5 overflow-hidden ${
                      !isUnlocked
                        ? "border-slate-200/40 dark:border-white/10 bg-slate-100/70 dark:bg-white/10 opacity-60 cursor-not-allowed"
                        : active
                          ? "border-emerald-400 dark:border-emerald-500/80 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 shadow-[0_0_24px_rgba(16,185,129,0.35)]"
                          : stageDone
                            ? "border-emerald-300/60 dark:border-emerald-600/40 bg-emerald-50/50 dark:bg-emerald-900/20"
                            : "border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-white/5"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="levelGlow"
                        className="absolute inset-0 bg-gradient-to-br from-emerald-400/15 to-transparent pointer-events-none"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${active ? "text-emerald-700 dark:text-emerald-300" : "text-slate-400 dark:text-white/35"}`}>
                      Рівень
                    </span>
                    <span className={`text-xl sm:text-2xl font-black tabular-nums ${active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-white/50"}`}>
                      {stageDone ? "✅" : stage}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 dark:text-white/30">{count} мод.</span>
                    {stagePct > 0 && !stageDone && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${stagePct}%` }} />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Stage progress bar */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedStage}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="mt-4 flex items-center gap-3"
              >
                <div className="flex-shrink-0 flex items-center gap-2 bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-400/30 dark:border-emerald-500/25 px-3 py-1.5 rounded-full">
                  <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300 tabular-nums">
                    {completedInStage}/{totalInStage}
                  </span>
                </div>
                <div className="flex-1 h-2.5 rounded-full bg-slate-200/80 dark:bg-slate-900/80 border border-slate-300/40 dark:border-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                </div>
                <span className="flex-shrink-0 text-[10px] font-black text-slate-500 dark:text-white/40">
                  {Math.round(progressPct)}%
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ─── MODULE CARDS ───────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {modulesInStage.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-500 dark:text-white/40 font-medium">
                На цьому рівні ще немає модулів.
              </div>
            ) : (
              modulesInStage.map((mod, index) => {
                const lessonCount = mod.lessons?.length ?? mod._count?.lessons ?? 0;
                const strip = ACCENT_STRIP[index % ACCENT_STRIP.length];
                const completed =
                  moduleLocks[mod.id]?.completed ?? moduleCompletions[mod.id] ?? false;
                const locked = isStaff ? false : !moduleUnlockState[mod.id];

                return (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    viewport={{ once: true, amount: 0.1 }}
                    whileHover={{ y: locked ? 0 : -4 }}
                    onClick={() => {
                      if (locked) return;
                      navigate({ pathname: `/course/modules/${mod.id}`, search: `?tab=video&returnStage=${selectedStage}` });
                    }}
                    title={
                      locked
                        ? "Цей модуль заблоковано; завершіть попередній модуль, щоб розблокувати"
                        : "Перейти до модуля"
                    }
                    className={`group flex flex-col bg-white/70 dark:bg-[#06121D]/60 backdrop-blur-xl border ${locked ? "border-slate-200 dark:border-white/20 opacity-60" : "border-slate-200 dark:border-white/5 hover:border-emerald-400/50 dark:hover:border-emerald-500/40"} rounded-[20px] sm:rounded-[24px] overflow-hidden ${locked ? "cursor-not-allowed" : "cursor-pointer"} ${locked ? "shadow-none" : "shadow-md hover:shadow-xl dark:shadow-none dark:hover:shadow-[0_16px_40px_rgba(16,185,129,0.15)]"} transition-all duration-400 relative`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className={`h-1 sm:h-1.5 w-full bg-gradient-to-r ${strip}`} />

                    {/* Image */}
                    <div className="relative overflow-hidden h-36 sm:h-44">
                      <img
                        src={course.thumbnail ?? DEFAULT_IMG}
                        alt={mod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/15" />
                      <div className="absolute top-3 left-3 bg-white/90 dark:bg-[#06121D]/90 backdrop-blur-md text-[9px] sm:text-[10px] font-black text-slate-700 dark:text-emerald-300 px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
                        Рівень {selectedStage} · {index + 1}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-emerald-500/90 text-[10px] sm:text-[11px] font-black text-white px-2.5 py-1 rounded-full border border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                        {lessonCount} уроків
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-4 sm:p-6 relative z-10">
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors duration-300 leading-tight">
                          {mod.title}
                        </h3>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${completed ? "text-emerald-500" : locked ? "text-rose-500" : "text-slate-400"}`}>
                          {completed ? "Завершено" : locked ? "Заблоковано" : "Активний"}
                        </span>
                      </div>
                      {mod.description && (
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-white/50 leading-relaxed flex-1 line-clamp-2">
                          {mod.description}
                        </p>
                      )}

                      <ModuleProgressBar moduleId={mod.id} onComplete={handleModuleComplete} />

                      {locked && (
                        <div className="absolute inset-0 bg-black/45 z-20 flex items-center justify-center rounded-[20px]">
                          <span className="text-sm font-black text-white uppercase tracking-widest">
                            Блоковано
                          </span>
                        </div>
                      )}

                      <div className="border-t border-slate-200 dark:border-white/10 mt-4 pt-4 flex items-center justify-between">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest">
                          {lessonCount} lessons
                        </span>
                        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-emerald-600 dark:text-emerald-400 translate-x-[1px]">
                            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </>
  );
};