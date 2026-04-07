import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../api/client";

export const StreakCard = () => {
  const { t } = useTranslation();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const [streakDays, setStreakDays] = useState(0);
  const [weeklyStreak, setWeeklyStreak] = useState(0);
  const [activeDays, setActiveDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    apiFetch<{
      currentStreak?: number;
      activityDates?: string[];
    }>('/api/progress/activity-calendar')
      .then((data) => {
        setStreakDays(data.currentStreak || 0);

        const activeDayNumbers = new Set<number>();
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        (data.activityDates || []).forEach((dateStr: string) => {
          const date = new Date(dateStr);
          if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            activeDayNumbers.add(date.getDate());
          }
        });

        setActiveDays(activeDayNumbers);
        setWeeklyStreak(data.currentStreak ? 1 : 0);
      })
      .catch(() => {});
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weekDays = t("home.weekDays", { returnObjects: true }) as string[];

  const months = t("home.months", { returnObjects: true }) as string[];
  const monthName = `${months[month]} ${year}`;

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const isActive = (day: number) =>
    activeDays.has(day) && month === today.getMonth();


  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl overflow-hidden
        border border-slate-100 dark:border-slate-700"
    >
      {/* Header */}
      <div className="px-4 md:px-5 pt-4 md:pt-5 pb-3">
        <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-slate-400 dark:text-slate-500 mb-3">
          {t("home.currentStreak", { defaultValue: "Поточний стрік" })}
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-700">
          {/* Денний */}
          <div className="pr-2 md:pr-4">
            <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">
              {t("home.daily", { defaultValue: "Денний" })}
            </p>
            <div className="flex items-center gap-1 md:gap-1.5">
              <span className="text-sm md:text-base">🔥</span>
              <span className="text-lg md:text-2xl font-extrabold text-orange-500 dark:text-orange-400 leading-none">
                {streakDays}
              </span>
            </div>
          </div>

          {/* Заморожено */}
          <div className="px-2 md:px-3">
            <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">
              {t("home.frozen", { defaultValue: "Заморожено" })}
            </p>
            <div className="flex items-center gap-1 md:gap-1.5">
              <span className="text-sm md:text-base">🧊</span>
              <span className="text-lg md:text-2xl font-extrabold text-sky-500 dark:text-sky-400 leading-none">
                {/* {frozenDays} */}
              </span>
            </div>
          </div>

          {/* Тижневий */}
          <div className="pl-2 md:pl-4">
            <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">
              {t("home.weekly", { defaultValue: "Тижневий" })}
            </p>
            <div className="flex items-center gap-1 md:gap-1.5">
              <span className="text-sm md:text-base">⚡</span>
              <span className="text-lg md:text-2xl font-extrabold text-yellow-500 dark:text-yellow-400 leading-none">
                {weeklyStreak}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100 dark:bg-slate-700 mx-4" />

      {/* Calendar */}
      <div className="px-4 md:px-5 py-3 md:py-4">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={prevMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg
              text-slate-400 dark:text-slate-500
              hover:text-slate-600 dark:hover:text-slate-300
              hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">
            {monthName}
          </span>
          <button
            onClick={nextMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg
              text-slate-400 dark:text-slate-500
              hover:text-slate-600 dark:hover:text-slate-300
              hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Week day headers */}
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {/* Empty cells */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const active = isActive(day);
            const todayDay = isToday(day);

            return (
              <div
                key={day}
                className="aspect-square flex items-center justify-center"
              >
                {active ? (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-orange-500
                      flex items-center justify-center
                      shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                  >
                    <span className="text-sm">🔥</span>
                  </motion.div>
                ) : todayDay ? (
                  <div
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full
                      bg-slate-100 dark:bg-slate-700
                      ring-2 ring-slate-300 dark:ring-slate-500
                      flex items-center justify-center"
                  >
                    <span className="text-[11px] md:text-xs font-bold text-slate-700 dark:text-slate-200">
                      {day}
                    </span>
                  </div>
                ) : (
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center">
                    <span className="text-[11px] md:text-xs font-medium text-slate-400 dark:text-slate-500">
                      {day}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};