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
    <section className="px-2">
      {/* Header */}
      <div className="mb-10 px-1 text-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xs font-bold tracking-[0.2em] uppercase text-emerald-400 mb-3"
        >
          Навчання
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold text-gray-900 dark:text-slate-100 tracking-tight leading-tight mb-3"
        >
          Оберіть{" "}
          <span className="relative inline-block">
            <span className="text-emerald-500">курс</span>
            <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full" />
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-gray-400 dark:text-slate-500 text-base font-medium max-w-sm mx-auto"
        >
          Від основ до впевненого рівня —{" "}
          <span className="text-gray-600 dark:text-slate-300 font-semibold">крок за кроком</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 mt-4 px-4 py-1.5
      bg-emerald-50 dark:bg-emerald-900/30
      border border-emerald-100 dark:border-emerald-800
      rounded-full"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wide">
            {courses.length} {courses.length === 1 ? "курс" : courses.length < 5 ? "курси" : "курсів"} доступно
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
        </motion.div>

        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-emerald-100 dark:via-emerald-900 to-transparent" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 dark:text-slate-400">
            Курси ще не створені. Зайдіть пізніше.
          </div>
        ) : (
          courses.map((course, index) => {
            const diff = difficultyConfig[course.level] ?? difficultyConfig.BEGINNER;
            const moduleCount = course._count?.modules ?? course.modules?.length ?? 0;
            return (
              // ← новий шлях /courses/:courseId
              <NavLink to={`/courses/${course.id}`} key={course.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.1 }}
                  className="group flex flex-col bg-white dark:bg-slate-800
                    border border-gray-100 dark:border-slate-700
                    rounded-2xl overflow-hidden shadow-sm
                    hover:shadow-xl dark:hover:shadow-slate-900/50
                    hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={course.thumbnail ?? DEFAULT_IMG}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-800/90
                      backdrop-blur-sm text-xs font-bold text-gray-500 dark:text-slate-400
                      px-2 py-1 rounded-full">
                      КУРС {index + 1}
                    </div>
                    <div className={`absolute top-3 right-3 text-xs font-semibold
                      px-2.5 py-1 rounded-full border backdrop-blur-sm bg-white/90 dark:bg-slate-800/90 ${diff.color}`}>
                      {diff.label}
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 p-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1.5
                      group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed flex-1 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="border-t border-gray-100 dark:border-slate-700 mt-4 pt-4">
                      <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                        {moduleCount} модулів
                      </span>
                    </div>
                  </div>
                </motion.div>
              </NavLink>
            );
          })
        )}
      </div>
    </section>
  );
};