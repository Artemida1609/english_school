import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { coursesApi, type Course } from "../api/courses";

const difficultyConfig: Record<string, { label: string; color: string }> = {
  BEGINNER: {
    label: "Початківець",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-700",
  },
  ELEMENTARY: {
    label: "Елементарний",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-700",
  },
  INTERMEDIATE: {
    label: "Середній",
    color: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-700",
  },
  UPPER_INTERMEDIATE: {
    label: "Вище середнього",
    color: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-700",
  },
  ADVANCED: {
    label: "Просунутий",
    color: "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-900/30 dark:border-rose-700",
  },
};

const DEFAULT_IMG = "/images/module-img.png";

export const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    coursesApi
      .getCourses()
      .then(setCourses)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="px-2">
        <div className="py-20 text-center">
          <p className="text-slate-500 dark:text-slate-400">Завантаження курсів...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-2">
        <div className="py-20 text-center">
          <p className="text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-[#030812] relative text-slate-900 dark:text-white md:rounded-[36px] border border-slate-200/50 dark:border-white/5 shadow-2xl transition-colors duration-500">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-emerald-300/30 dark:bg-emerald-600/20 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none transition-colors duration-500" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] bg-teal-300/20 dark:bg-teal-600/10 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none transition-colors duration-500" />

      <section className="relative z-10 p-6 md:p-10">
        {/* Header */}
        <div className="mb-12 px-1 text-center">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs font-black tracking-[0.2em] uppercase text-emerald-500 dark:text-emerald-400 mb-3 drop-shadow-sm"
          >
            Навчання
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4 drop-shadow-sm"
          >
            Оберіть{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
              курс
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-slate-600 dark:text-slate-400 text-lg font-medium max-w-sm mx-auto"
          >
            Від основ до впевненого рівня —{" "}
            <span className="text-emerald-600 dark:text-emerald-300 font-bold">крок за кроком</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2.5 mt-6 px-5 py-2
        bg-white/80 dark:bg-[#06121D]/80 backdrop-blur-md
        border border-emerald-200/50 dark:border-white/10 shadow-[0_10px_30px_rgba(16,185,129,0.1)] dark:shadow-none
        rounded-full"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            <span className="text-xs font-black text-slate-800 dark:text-white tracking-widest uppercase">
              {courses.length} {courses.length === 1 ? "курс" : courses.length < 5 ? "курси" : "курсів"} доступно
            </span>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-500 dark:text-slate-400/50 font-bold">
              Курси ще не створені. Зайдіть пізніше.
            </div>
          ) : (
            courses.map((course, index) => {
              const diff = difficultyConfig[course.level] ?? difficultyConfig.BEGINNER;
              const moduleCount = course._count?.modules ?? course.modules?.length ?? 0;
              return (
                <NavLink to={`/courses/${course.id}`} key={course.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                    viewport={{ once: true, amount: 0.1 }}
                    className="group flex flex-col bg-white/60 dark:bg-[#06121D]/60 backdrop-blur-xl
                      border border-slate-200 dark:border-white/5
                      rounded-[24px] overflow-hidden shadow-md cursor-pointer
                      hover:border-emerald-400/50 dark:hover:border-emerald-500/40
                      hover:shadow-xl dark:shadow-none dark:hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)]
                      hover:-translate-y-1.5 transition-all duration-500 relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="relative overflow-hidden h-44 rounded-t-[24px]">
                      <img
                        src={course.thumbnail ?? DEFAULT_IMG}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20" />
                      <div className="absolute top-4 left-4 bg-white/90 dark:bg-[#06121D]/90
                        backdrop-blur-md text-[10px] font-black text-slate-700 dark:text-emerald-300
                        px-3 py-1.5 rounded-full shadow-sm uppercase tracking-widest">
                        КУРС {index + 1}
                      </div>
                      <div className={`absolute top-4 right-4 text-[11px] font-black
                        px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md shadow-sm uppercase tracking-wider ${diff.color}`}>
                        {diff.label}
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 p-6 relative z-10">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2
                        group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors duration-300 leading-tight">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-white/50 leading-relaxed flex-1 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="border-t border-slate-200 dark:border-white/10 mt-5 pt-5 flex items-center justify-between">
                        <span className="text-[11px] font-black text-slate-400 dark:text-white/40 uppercase tracking-widest">
                          {moduleCount} модулів
                        </span>
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-emerald-600 dark:text-emerald-400 translate-x-[1px]">
                             <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                           </svg>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </NavLink>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};