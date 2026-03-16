import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { coursesApi, type Course } from "../api/courses";

const DEFAULT_IMG = "/images/module-img.png";

export const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    coursesApi
      .getCourseById(courseId)
      .then(setCourse)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [courseId]);

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
          <button
            onClick={() => navigate("/courses")}
            className="mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            ← Назад до курсів
          </button>
        </div>
      </section>
    );
  }

  const modules = course.modules ?? [];
  const sortedModules = [...modules].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <section className="px-2">
      {/* Header — стиль як в Modules але з даними курсу */}
      <div className="mb-10 px-1">
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/courses")}
          className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-500
            transition-colors duration-150 mb-4 group"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs font-bold tracking-wide uppercase">Назад до курсів</span>
        </motion.button>

        <div className="flex items-end justify-between gap-4">
          <div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xs font-bold tracking-[0.2em] uppercase text-emerald-400 mb-2"
            >
              Course
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-extrabold text-gray-900 dark:text-slate-100 tracking-tight leading-tight"
            >
              {/* перше слово звичайне, решта — виділена */}
              {course.title.split(" ").slice(0, 1).join(" ")}{" "}
              <span className="relative">
                <span className="text-emerald-500">
                  {course.title.split(" ").slice(1).join(" ")}
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-[3px]
                  bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full" />
              </span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center gap-3 mt-2"
            >
              <p className="text-gray-400 dark:text-slate-500 text-lg font-medium tracking-wide line-clamp-1 max-w-sm">
                {course.description}
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-shrink-0 flex flex-col items-center justify-center
              w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30
              border border-emerald-100 dark:border-emerald-800"
          >
            <span className="text-2xl font-extrabold text-emerald-500 dark:text-emerald-400 leading-none">
              {sortedModules.length}
            </span>
            <span className="text-[10px] font-semibold text-emerald-400 dark:text-emerald-500 tracking-wide">
              modules
            </span>
          </motion.div>
        </div>

        <div className="mt-5 h-px bg-gradient-to-r from-emerald-100 dark:from-emerald-900 via-teal-100 dark:via-teal-900 to-transparent" />
      </div>

      {/* Modules grid — картки як в Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedModules.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 dark:text-slate-400">
            Модулі ще не додано.
          </div>
        ) : (
          sortedModules.map((mod, index) => {
            const lessonCount = mod.lessons?.length ?? mod._count?.lessons ?? 0;
            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.1 }}
                onClick={() => navigate(`/courses/${courseId}/modules/${mod.id}`)}
                className="group flex flex-col bg-white dark:bg-slate-800
                  border border-gray-100 dark:border-slate-700
                  rounded-2xl overflow-hidden shadow-sm cursor-pointer
                  hover:shadow-xl dark:hover:shadow-slate-900/50
                  hover:-translate-y-1 transition-all duration-300"
              >
                {/* Зображення */}
                <div className="relative overflow-hidden h-48">
                  <img
                    src={course.thumbnail ?? DEFAULT_IMG}
                    alt={mod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-800/90
                    backdrop-blur-sm text-xs font-bold text-gray-500 dark:text-slate-400
                    px-2 py-1 rounded-full">
                    МОДУЛЬ {index + 1}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90
                    backdrop-blur-sm text-xs font-bold text-emerald-600 dark:text-emerald-400
                    px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                    {lessonCount} уроків
                  </div>
                </div>

                {/* Контент */}
                <div className="flex flex-col flex-1 p-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1.5
                    group-hover:text-emerald-600 dark:group-hover:text-emerald-400
                    transition-colors duration-200">
                    {mod.title}
                  </h3>
                  {mod.description && (
                    <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed flex-1 line-clamp-2">
                      {mod.description}
                    </p>
                  )}
                  <div className="border-t border-gray-100 dark:border-slate-700 mt-4 pt-4">
                    <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                      {lessonCount} уроків
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </section>
  );
};