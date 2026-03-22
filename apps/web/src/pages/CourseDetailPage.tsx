import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { coursesApi, type Course, type Module } from "../api/courses";

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
  if (s >= 1 && s <= 5) return s;
  return inferredStageFromOrderIndex(m.orderIndex);
}

// ─── Mini progress bar for each module card ───────────────────
function ModuleProgressBar({ moduleId }: { moduleId: string }) {
  const [pct, setPct] = useState<number | null>(null);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    coursesApi.getModuleProgress(moduleId)
      .then((data) => {
        setPct(data.percentage);
        setCompleted(data.completedCount);
        setTotal(data.totalCount);
      })
      .catch(() => setPct(0));
  }, [moduleId]);

  if (pct === null) return <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10 animate-pulse" />;
  if (total === 0) return null;

  const done = pct === 100;

  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-bold text-slate-400 dark:text-white/35 uppercase tracking-wider">
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

export const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId?: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stage-level progress (sum of module progress in stage)
  const [stageProgress, setStageProgress] = useState<Record<number, { completed: number; total: number }>>({});

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
        const fullCourse = await coursesApi.getCourseById(targetId);
        setCourse(fullCourse);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const sortedModules = useMemo(() => {
    const modules = course?.modules ?? [];
    return [...modules].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [course]);

  const modulesInStage = useMemo(
    () => sortedModules.filter((m) => moduleStage(m, sortedModules) === selectedStage),
    [sortedModules, selectedStage],
  );

  // Load stage-level progress when modules are known
  useEffect(() => {
    if (sortedModules.length === 0) return;
    const loadAll = async () => {
      const results: Record<number, { completed: number; total: number }> = {};
      await Promise.all(
        sortedModules.map(async (mod) => {
          try {
            const data = await coursesApi.getModuleProgress(mod.id);
            const stage = moduleStage(mod, sortedModules);
            if (!results[stage]) results[stage] = { completed: 0, total: 0 };
            results[stage].completed += data.completedCount;
            results[stage].total += data.totalCount;
          } catch {}
        })
      );
      setStageProgress(results);
    };
    void loadAll();
  }, [sortedModules]);

  const stageProgressForSelected = stageProgress[selectedStage];
  const completedInStage = stageProgressForSelected?.completed ?? 0;
  const totalInStage = stageProgressForSelected?.total ?? (modulesInStage.length > 0 ? modulesInStage.length * 4 : 1);
  const progressPct = totalInStage > 0 ? (completedInStage / totalInStage) * 100 : 0;

  if (loading) {
    return (
      <section className="px-2">
        <div className="py-20 text-center">
          <p className="text-slate-500 dark:text-slate-400">Завантаження...</p>
        </div>
      </section>
    );
  }

  if (error || !course) {
    return (
      <section className="px-2">
        <div className="py-20 text-center">
          <p className="text-rose-600 dark:text-rose-400">{error ?? "Курс не знайдено"}</p>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#030812] overflow-hidden relative text-slate-900 dark:text-white md:rounded-[36px] border border-slate-200/50 dark:border-white/5 shadow-2xl transition-colors duration-500">
      <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] pointer-events-none z-[1] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')] mix-blend-overlay" />
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-300/40 dark:bg-emerald-600/30 blur-[140px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
      <div className="absolute top-[30%] -right-[10%] w-[40%] h-[50%] bg-teal-300/30 dark:bg-teal-600/20 blur-[140px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[40%] bg-green-300/30 dark:bg-green-600/10 blur-[140px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

      <section className="relative z-10 p-6 md:p-10 h-full overflow-y-auto">
        {/* Header */}
        <div className="mb-8 px-1">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-4">
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="text-xs font-black tracking-[0.2em] uppercase text-emerald-600 dark:text-emerald-400 mb-2 drop-shadow-sm">
                Course
              </motion.p>
              <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {course.title.split(" ").slice(0, 1).join(" ")}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                  {course.title.split(" ").slice(1).join(" ")}
                </span>
              </motion.h2>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-4">
                <p className="text-slate-600 dark:text-slate-400 text-lg font-medium tracking-wide max-w-2xl leading-relaxed">{course.description}</p>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-md border border-emerald-200 dark:border-white/10 shadow-lg dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-300 leading-none mb-1">{sortedModules.length}</span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-emerald-200/50 uppercase tracking-widest">modules</span>
            </motion.div>
          </div>
          <div className="mt-8 h-px bg-gradient-to-r from-emerald-200 dark:from-white/10 via-teal-100 dark:via-white/5 to-transparent" />
        </div>

        {/* Stage selector */}
        <div className="mb-6 px-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 mb-3">Оберіть рівень</p>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin md:overflow-visible md:flex-wrap md:pb-0">
            {STAGES.map((stage) => {
              const active = selectedStage === stage;
              const count = sortedModules.filter((m) => moduleStage(m, sortedModules) === stage).length;
              const sp = stageProgress[stage];
              const stagePct = sp && sp.total > 0 ? Math.round((sp.completed / sp.total) * 100) : 0;
              const stageDone = stagePct === 100 && sp && sp.total > 0;

              return (
                <motion.button
                  key={stage}
                  type="button"
                  layout
                  onClick={() => setStage(stage)}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative flex-shrink-0 snap-center w-[88px] sm:w-24 aspect-square rounded-2xl border-2 transition-colors duration-300 flex flex-col items-center justify-center gap-1 overflow-hidden ${
                    active
                      ? "border-emerald-400 dark:border-emerald-500/80 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 shadow-[0_0_28px_rgba(16,185,129,0.35)] dark:shadow-[0_0_32px_rgba(16,185,129,0.25)]"
                      : stageDone
                        ? "border-emerald-300/60 dark:border-emerald-600/40 bg-emerald-50/50 dark:bg-emerald-900/20"
                        : "border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:border-emerald-300/60 dark:hover:border-white/20"
                  }`}
                >
                  {active && <motion.div layoutId="levelGlow" className="absolute inset-0 bg-gradient-to-br from-emerald-400/15 to-transparent pointer-events-none" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                  <span className={`text-[9px] font-black uppercase tracking-widest ${active ? "text-emerald-700 dark:text-emerald-300" : "text-slate-400 dark:text-white/35"}`}>Рівень</span>
                  <span className={`text-2xl font-black tabular-nums ${active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-white/50"}`}>
                    {stageDone ? "✅" : stage}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-white/30">{count} мод.</span>
                  {/* Mini progress ring at bottom */}
                  {stagePct > 0 && !stageDone && (
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${stagePct}%` }} />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedStage}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 dark:bg-emerald-500/10 border border-emerald-400/40 dark:border-emerald-500/30 px-4 py-2 text-xs font-black text-emerald-800 dark:text-emerald-300 shadow-inner">
                <span className="tabular-nums">{completedInStage} / {totalInStage}</span>
                <span className="text-emerald-600/80 dark:text-emerald-400/80 font-bold uppercase tracking-wider">прогрес рівня</span>
              </div>
              <div className="flex-1 min-w-0 h-3 rounded-full bg-slate-200/80 dark:bg-slate-900/80 border border-slate-300/50 dark:border-white/10 overflow-hidden shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Module cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modulesInStage.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-500 dark:text-white/40 font-medium">На цьому рівні ще немає модулів.</div>
          ) : (
            modulesInStage.map((mod, index) => {
              const lessonCount = mod.lessons?.length ?? mod._count?.lessons ?? 0;
              const strip = ACCENT_STRIP[index % ACCENT_STRIP.length];
              return (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  viewport={{ once: true, amount: 0.1 }}
                  whileHover={{ y: -6 }}
                  onClick={() => navigate({ pathname: `/course/modules/${mod.id}`, search: `?tab=video&returnStage=${selectedStage}` })}
                  className="group flex flex-col bg-white/60 dark:bg-[#06121D]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[24px] overflow-hidden cursor-pointer hover:border-emerald-400/50 dark:hover:border-emerald-500/40 shadow-md hover:shadow-2xl dark:shadow-none dark:hover:shadow-[0_20px_50px_rgba(16,185,129,0.18)] transition-shadow duration-500 relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className={`h-1.5 w-full bg-gradient-to-r ${strip} opacity-90 group-hover:opacity-100 transition-opacity`} />

                  <div className="relative overflow-hidden h-44 rounded-t-none">
                    <img src={course.thumbnail ?? DEFAULT_IMG} alt={mod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20" />
                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-[#06121D]/90 backdrop-blur-md text-[10px] font-black text-slate-700 dark:text-emerald-300 px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                      Рівень {selectedStage} · {index + 1}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-emerald-500/90 dark:bg-emerald-500/80 backdrop-blur-md text-[11px] font-black text-white px-3 py-1.5 rounded-full border border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                      {lessonCount} уроків
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 p-6 relative z-10">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors duration-300 leading-tight">
                      {mod.title}
                    </h3>
                    {mod.description && (
                      <p className="text-sm text-slate-500 dark:text-white/50 leading-relaxed flex-1 line-clamp-2">{mod.description}</p>
                    )}

                    {/* ─── Per-module progress bar ─────────────────── */}
                    <ModuleProgressBar moduleId={mod.id} />

                    <div className="border-t border-slate-200 dark:border-white/10 mt-5 pt-5 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest">{lessonCount} lessons</span>
                      <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-emerald-600 dark:text-emerald-400 translate-x-[1px]">
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
  );
};