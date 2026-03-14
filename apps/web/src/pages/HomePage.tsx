import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import progressIcons from "../data/progressIcons.json";
import achievements from "../data/achievements.json";
import { ProgressIcon } from "../icons/ProgressIcon";
import { AchievementIcon } from "../icons/AchievmentIcon";
import { StreakCard } from "../components/Streakcard";

export const HomePage = () => {
  const { t } = useTranslation();
  const progress = 100;
  const { purchases } = useSelector((s: RootState) => s.shop);

  return (
    <main className="grid md:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px] grid-cols-1 gap-4 md:gap-6 p-4 md:p-6">
      {/* ══ LEFT ══ */}
      <div className="order-2 md:order-1">
        {/* Continue Learning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden bg-gradient-to-br from-teal-600 to-emerald-600
            rounded-2xl md:rounded-3xl p-5 md:p-7 text-white mb-4 md:mb-6
            shadow-[0_0_30px_rgba(16,185,129,0.6)] ring-1 ring-emerald-400/30"
        >
          <p className="text-[11px] font-bold tracking-[0.18em] uppercase opacity-70 mb-3">
            {t("home.continueLearning")}
          </p>
          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-5 relative z-10">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <line
                  x1="8.5"
                  y1="7"
                  x2="16"
                  y2="7"
                  stroke="white"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <line
                  x1="8.5"
                  y1="11"
                  x2="16"
                  y2="11"
                  stroke="white"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-[11px] opacity-75 font-medium">
                {t("home.module")} 1
              </p>
              <h2 className="text-lg md:text-xl font-extrabold tracking-tight">
                Основи Граматики
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4 relative z-10">
            <span className="text-[14px] font-bold w-10 flex-shrink-0">
              {progress}%
            </span>
            <div className="flex-1 min-w-0">
              <div className="h-1.5 bg-white/25 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <button
              className="hidden md:inline-flex group relative h-12 items-center justify-center
              overflow-hidden rounded-xl bg-white pl-6 pr-10 font-bold text-teal-700
              transition-all duration-200 hover:bg-teal-50 flex-shrink-0 whitespace-nowrap cursor-pointer"
            >
              <span className="transition-transform duration-200 group-hover:-translate-x-2">
                {t("home.learnMore")}
              </span>
              <div className="absolute right-4 translate-x-2 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  className="h-4 w-4"
                >
                  <path
                    d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </button>
          </div>
          <button
            className="md:hidden group relative inline-flex w-full mt-4 h-11 items-center
            justify-center overflow-hidden rounded-xl bg-white pl-6 pr-10 font-bold text-teal-700
            transition-all duration-200 active:bg-teal-50 flex-shrink-0 whitespace-nowrap"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-2">
              {t("home.learnMore")}
            </span>
            <div className="absolute right-4 translate-x-2 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                className="h-4 w-4"
              >
                <path
                  d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </button>
        </motion.div>

        {/* Progress Cards */}
        <h3
          className="text-[14px] md:text-[15px] font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2
          after:flex-1 after:h-px after:bg-gradient-to-r after:from-slate-200 after:to-transparent dark:after:from-slate-700"
        >
          {t("home.yourProgress")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6">
          {progressIcons.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="relative bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl p-4 md:p-5
                border border-slate-100 dark:border-slate-700
                hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-100/50 dark:hover:shadow-teal-900/30
                hover:border-emerald-200 dark:hover:border-emerald-700
                transition-all duration-200 cursor-default overflow-hidden"
            >
              <div className="absolute -right-6 -bottom-6 opacity-[0.07]">
                <ProgressIcon
                  type={s.iconType}
                  color={s.iconColor}
                  size={120}
                />
              </div>
              <div
                className={`w-8 h-8 md:w-9 md:h-9 ${s.bg} rounded-lg md:rounded-xl
                flex items-center justify-center mb-2 md:mb-3 relative z-10`}
              >
                <ProgressIcon type={s.iconType} color={s.iconColor} />
              </div>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 leading-tight relative z-10">
                {s.label}
              </p>
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-none relative z-10">
                {s.value}
              </p>
              <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mt-1 relative z-10">
                {s.sub}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Leaderboard */}
        <h3
          className="text-[14px] md:text-[15px] font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2
          after:flex-1 after:h-px after:bg-gradient-to-r after:from-slate-200 after:to-transparent dark:after:from-slate-700"
        >
          {t("home.leaderboard")}
        </h3>
        <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700 p-3 md:p-4 mb-4 md:mb-6">
          {[
            {
              rank: "🥇",
              name: "Maria K.",
              xp: "2 840",
              color: "from-amber-400 to-orange-400",
            },
            {
              rank: "🥈",
              name: "Olena P.",
              xp: "2 210",
              color: "from-violet-400 to-purple-500",
            },
            {
              rank: "🥉",
              name: "Artem S.",
              xp: "1 950",
              color: "from-teal-400 to-emerald-500",
              you: true,
            },
            {
              rank: "4",
              name: "Sofia D.",
              xp: "1 720",
              color: "from-pink-400 to-rose-500",
            },
            {
              rank: "5",
              name: "Dmytro L.",
              xp: "1 580",
              color: "from-cyan-400 to-blue-500",
            },
          ].map((l) => (
            <div
              key={l.name}
              className={`flex items-center gap-2 md:gap-3 py-2 md:py-2.5
              border-b border-slate-50 dark:border-slate-700/50 last:border-0
              ${l.you ? "bg-emerald-50/50 dark:bg-emerald-900/20 -mx-3 px-3 md:-mx-4 md:px-4 rounded-xl" : ""}`}
            >
              <span className="text-sm md:text-base w-5 md:w-6 text-center flex-shrink-0">
                {l.rank}
              </span>
              <div
                className={`w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br ${l.color}
                flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
              >
                {l.name[0]}
              </div>
              <span className="flex-1 text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 min-w-0 truncate">
                {l.name}
                {l.you && (
                  <span
                    className="ml-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400
                    bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded-full"
                  >
                    {t("home.you")}
                  </span>
                )}
              </span>
              <span
                className="text-[11px] md:text-xs font-bold text-emerald-600 dark:text-emerald-400
                bg-emerald-50 dark:bg-emerald-900/30 px-2 md:px-2.5 py-1 rounded-full flex-shrink-0"
              >
                {l.xp} XP
              </span>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <h3
          className="text-[14px] md:text-[15px] font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2
          after:flex-1 after:h-px after:bg-gradient-to-r after:from-slate-200 after:to-transparent dark:after:from-slate-700"
        >
          {t("home.achievements")}
        </h3>
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          {achievements.map((a, i) => (
            <motion.div
              key={a.name}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: a.locked ? 0.4 : 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl p-2 md:p-3
                border border-slate-100 dark:border-slate-700 text-center transition-all duration-200
                ${a.locked ? "grayscale" : "hover:border-emerald-200 dark:hover:border-emerald-700 hover:-translate-y-0.5"}`}
            >
              <div className="flex items-center justify-center mb-1.5">
                <AchievementIcon type={a.type} locked={a.locked} />
              </div>
              <p className="text-[9px] md:text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
                {a.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ══ RIGHT ══ */}
      <div className="order-1 md:order-2 flex flex-col gap-3 md:gap-4">
        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-700 p-4 md:p-6 text-center"
        >
          <div className="relative inline-block mb-3">
            <div
              className="w-14 h-14 md:w-[72px] md:h-[72px] rounded-full bg-gradient-to-br
              from-teal-400 to-emerald-500 flex items-center justify-center mx-auto text-2xl md:text-3xl"
            >
              👤
            </div>
            <div
              className="absolute bottom-0.5 right-0.5 w-3 h-3 md:w-3.5 md:h-3.5
              bg-green-400 rounded-full border-2 border-white dark:border-slate-800"
            />
          </div>
          <h2 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-slate-100">
            Привіт, Артем 👋
          </h2>
          <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500 mb-2">
            Продовжуй навчатися!
          </p>
          <div
            className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30
            text-emerald-700 dark:text-emerald-400 text-[11px] md:text-xs font-bold px-3 py-1.5 rounded-full mb-3 md:mb-4"
          >
            ⭐ {t("home.level")} 4 · Intermediate
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["23", t("progress.tasksCompleted")],
              ["123", t("progress.wordsLearned")],
              ["8", t("progress.topicsLearned")],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {v}
                </p>
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {l}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* XP Progress */}
        <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700 p-4 md:p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200">
              {t("home.xpProgress")}
            </span>
            <span className="text-xs md:text-sm font-bold text-emerald-600 dark:text-emerald-400">
              1 950 / 2 500
            </span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "78%" }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
            />
          </div>
          <div className="flex justify-between text-[11px] md:text-xs text-slate-400 dark:text-slate-500">
            <span>{t("home.level")} 4</span>
            <span>78% {t("home.toLevel")} 5</span>
          </div>
        </div>

        {/* Streak */}
        <StreakCard />

        {/* Purchases */}
        <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700 p-4 md:p-5">
          <h3
            className="text-[14px] md:text-[15px] font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2
            after:flex-1 after:h-px after:bg-gradient-to-r after:from-slate-200 after:to-transparent dark:after:from-slate-700"
          >
            {t("home.yourPurchases")}
          </h3>
          {purchases.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {t("home.noPurchases")}
            </p>
          ) : (
            purchases.map((p) => (
              <div
                key={p.name + p.date}
                className="flex items-center gap-2 md:gap-3 py-2 md:py-2.5
      border-b border-slate-50 dark:border-slate-700/50 last:border-0"
              >
                <div
                  className="w-8 h-8 md:w-9 md:h-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg md:rounded-xl
        flex items-center justify-center text-sm md:text-base flex-shrink-0"
                >
                  {p.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {p.name}
                  </p>
                  <p className="text-[11px] md:text-xs text-slate-400 dark:text-slate-500">
                    {p.date}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
};
