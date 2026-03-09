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
      <div className="p-6">
        <p className="text-slate-500 dark:text-slate-400">Завантаження...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-6">
        <p className="text-rose-600 dark:text-rose-400">{error ?? "Курс не знайдено"}</p>
        <button
          onClick={() => navigate("/modules")}
          className="mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          ← Назад до курсів
        </button>
      </div>
    );
  }

  const modules = course.modules ?? [];
  const sortedModules = [...modules].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <section className="px-4 py-6 max-w-4xl mx-auto">
      <motion.button
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/modules")}
        className="flex items-center gap-2 text-slate-500 hover:text-emerald-600
          hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 rounded-lg px-3 py-2 -ml-3 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-sm font-semibold">Назад до курсів</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6"
      >
        <div className="flex gap-4 items-start">
          <img
            src={course.thumbnail ?? DEFAULT_IMG}
            alt={course.title}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {course.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 sm:line-clamp-none">
              {course.description}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              {modules.length} модулів
            </p>
          </div>
        </div>
      </motion.div>

      <div className="mt-10 grid gap-4">
        {sortedModules.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 py-8 text-center">Модулі ще не додано.</p>
        ) : (
          sortedModules.map((mod, i) => {
            const lessonCount = mod.lessons?.length ?? mod._count?.lessons ?? 0;
            return (
              <motion.button
                key={mod.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                onClick={() => navigate(`/modules/${mod.id}`)}
                className="w-full text-left flex items-center gap-4 p-4 sm:p-5
                  bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700
                  rounded-2xl hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800
                  transition-all duration-200 group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30
                  flex items-center justify-center text-xl font-bold text-emerald-600 dark:text-emerald-400
                  group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {mod.title}
                  </h3>
                  {mod.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {mod.description}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">{lessonCount} уроків</p>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            );
          })
        )}
      </div>
    </section>
  );
};
