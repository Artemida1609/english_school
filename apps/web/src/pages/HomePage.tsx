import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import progressIcons from "../data/progressIcons.json";
import achievementsData from "../data/achievements.json";
import { ProgressIcon } from "../icons/ProgressIcon";
import { AchievementIcon } from "../icons/AchievmentIcon";
import { StreakCard } from "../components/Streakcard";
import { apiFetch } from "../api/client";

export const HomePage = () => {
  const { t } = useTranslation();
  const progress = 100;
  const { user } = useSelector((s: RootState) => s.auth);
  const [unlockedKeys, setUnlockedKeys] = useState<string[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<
    Record<string, { current: number; target: number }>
  >({});
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [achievementsRes, profileRes] = await Promise.all([
          apiFetch<{
            unlocked: string[];
            progress?: Record<string, { current: number; target: number }>;
          }>("/api/achievements/me"),
          apiFetch<{ profile?: { avatar?: string | null } }>("/api/profile/me"),
        ]);
        setUnlockedKeys(achievementsRes.unlocked);
        if (achievementsRes.progress) {
          setAchievementProgress(achievementsRes.progress);
        }
        setAvatar(profileRes.profile?.avatar ?? null);
      } catch {
        // Fallback
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#030812] overflow-hidden relative text-slate-900 dark:text-white md:rounded-[36px] border border-slate-200/50 dark:border-white/5 shadow-2xl transition-colors duration-500">
      {/* Dynamic Glowing Orbs (adapted for light/dark modes) */}
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-300/40 dark:bg-emerald-600/30 blur-[140px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none transition-colors duration-500" />
      <div className="absolute top-[30%] -right-[10%] w-[40%] h-[50%] bg-teal-300/30 dark:bg-teal-600/20 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none transition-colors duration-500" />
      <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[40%] bg-green-300/30 dark:bg-green-600/10 blur-[140px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none transition-colors duration-500" />

      <main className="relative z-10 grid md:grid-cols-[1fr_280px] xl:grid-cols-[1fr_360px] grid-cols-1 gap-6 md:gap-8 p-6 md:p-10 h-full overflow-y-auto">
        {/* ══ LEFT ══ */}
        <div className="order-2 md:order-1 flex flex-col gap-6 md:gap-8">
          
          {/* Header Section */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-emerald-100 dark:via-white dark:to-teal-200"
              >
                Dashboard
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-slate-500 dark:text-emerald-200/50 text-sm mt-1 font-medium"
              >
                Welcome back, {user?.name || "Student"}!
              </motion.p>
            </div>
          </div>

          {/* Continue Learning Glass Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative overflow-hidden bg-white/60 dark:bg-[#06121D]/80 backdrop-blur-xl
              rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-white/10 
              shadow-[0_10px_40px_rgba(16,185,129,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)]
              hover:border-emerald-400/60 dark:hover:border-emerald-500/30 transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <p className="text-[11px] font-bold tracking-[0.2em] text-emerald-600 dark:text-emerald-400 uppercase mb-4">
              {t("home.continueLearning")}
            </p>
            <div className="flex items-center gap-4 md:gap-6 mb-8 relative z-10">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-[1px] shadow-[0_0_20px_rgba(16,185,129,0.3)] dark:shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                <div className="w-full h-full bg-white dark:bg-[#06121D] backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="url(#paint_emerald_linear)" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="url(#paint_emerald_linear)" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="8.5" y1="7" x2="16" y2="7" stroke="url(#paint_emerald_linear)" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="8.5" y1="11" x2="16" y2="11" stroke="url(#paint_emerald_linear)" strokeWidth="1.5" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="paint_emerald_linear" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#34D399" />
                        <stop offset="1" stopColor="#14B8A6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-emerald-200/60 font-medium mb-1">
                  {t("home.module")} 1
                </p>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
                  Основи Граматики
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-4 relative z-10">
              <span className="text-[15px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-300 dark:to-teal-300 w-12 text-right">
                {progress}%
              </span>
              <div className="flex-1 min-w-0">
                <div className="h-2.5 bg-slate-200 dark:bg-slate-800/60 rounded-full overflow-hidden shadow-inner border border-transparent dark:border-white/5 transition-colors">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-green-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.6)] relative"
                  >
                    <div className="absolute top-0 bottom-0 right-0 w-8 bg-white/40 blur-[4px]"></div>
                  </motion.div>
                </div>
              </div>
              <button
                className="hidden md:inline-flex group relative h-12 items-center justify-center
                overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 pl-6 pr-10 font-bold text-white
                transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95 border border-emerald-400/30"
              >
                <span className="transition-transform duration-300 group-hover:-translate-x-2">
                  {t("home.learnMore")}
                </span>
                <div className="absolute right-4 translate-x-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
            </div>
            <button
              className="md:hidden group relative inline-flex w-full mt-6 h-12 items-center
              justify-center overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 pl-6 pr-10 font-bold text-white
              transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-400/30"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-3">
                {t("home.learnMore")}
              </span>
              <div className="absolute right-4 translate-x-3 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                </svg>
              </div>
            </button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Progress Cards */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[14px] md:text-[15px] font-bold text-slate-700 dark:text-white/80 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                {t("home.yourProgress")}
                <span className="flex-1 h-px bg-gradient-to-r from-slate-200 dark:from-white/10 to-transparent" />
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {progressIcons.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                    className="group relative bg-white/70 dark:bg-[#06121D]/60 backdrop-blur-xl rounded-2xl p-5
                      border border-slate-200 dark:border-white/5 hover:border-emerald-400/50 dark:hover:border-emerald-500/40
                      hover:-translate-y-1 shadow-md hover:shadow-xl dark:shadow-none dark:hover:shadow-[0_15px_30px_rgba(16,185,129,0.15)]
                      transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.08] dark:group-hover:opacity-[0.1] transition-opacity duration-500 group-hover:scale-110">
                      <ProgressIcon type={s.iconType} color={"#10b981"} size={100} />
                    </div>
                    <div className={`w-10 h-10 bg-emerald-50 dark:bg-slate-800/80 rounded-xl flex items-center justify-center mb-3 relative z-10 shadow-sm border border-emerald-100 dark:border-white/10`}>
                      <ProgressIcon type={s.iconType} color={"#10b981"} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-emerald-200/50 uppercase tracking-widest leading-tight relative z-10">
                      {s.label}
                    </p>
                    <p className="text-3xl font-extrabold text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-white dark:group-hover:to-emerald-200 tracking-tight relative z-10 my-1 transition-all">
                      {s.value}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-emerald-200/40 relative z-10 group-hover:text-emerald-600 dark:group-hover:text-emerald-200/70 transition-colors">
                      {s.sub}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[14px] md:text-[15px] font-bold text-slate-700 dark:text-white/80 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.8)]" />
                {t("home.achievements")}
                <span className="flex-1 h-px bg-gradient-to-r from-slate-200 dark:from-white/10 to-transparent" />
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
                {achievementsData.slice(0, 4).map((a, i) => {
                  const unlocked = unlockedKeys.includes(a.key);
                  const prog = achievementProgress[a.key];
                  const hasProgress = !!prog && prog.target > 0;
                  const percent = hasProgress
                    ? Math.min(100, Math.round((prog.current / prog.target) * 100))
                    : 0;
                  return (
                    <motion.div
                      key={a.name}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: unlocked ? 1 : 0.6, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                      className={`relative bg-white/70 dark:bg-[#06121D]/60 backdrop-blur-xl rounded-2xl p-4
                      border border-slate-200 dark:border-white/5 text-center transition-all duration-300
                      ${unlocked ? "hover:border-teal-400/50 dark:hover:border-teal-500/40 hover:-translate-y-1 shadow-md hover:shadow-xl dark:shadow-none dark:hover:shadow-[0_15px_30px_rgba(20,184,166,0.15)]" : "grayscale dark:opacity-60 dark:hover:opacity-100"} overflow-hidden`}
                    >
                      {unlocked && (
                         <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 dark:from-teal-500/10 to-transparent pointer-events-none" />
                      )}
                      <div className="flex items-center justify-center mb-2 relative z-10">
                        <div className={`p-2.5 rounded-xl ${unlocked ? 'bg-teal-50 dark:bg-teal-500/20 shadow-sm dark:shadow-[0_0_15px_rgba(20,184,166,0.3)]' : 'bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5'}`}>
                          <AchievementIcon type={a.type} locked={!unlocked} />
                        </div>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700 dark:text-white/80 leading-tight mb-1 relative z-10">
                        {a.name}
                      </p>
                      {hasProgress && !unlocked && (
                        <div className="mt-2 w-full max-w-[85%] mx-auto relative z-10">
                          <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-1 border border-transparent dark:border-white/5">
                            <div
                              className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <p className="text-[9px] font-semibold text-slate-400 dark:text-white/40">
                            {prog.current}/{prog.target}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="mt-2">
            <h3 className="text-[14px] md:text-[15px] font-bold text-slate-700 dark:text-white/80 flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
              {t("home.leaderboard")}
              <span className="flex-1 h-px bg-gradient-to-r from-slate-200 dark:from-white/10 to-transparent" />
            </h3>
            <div className="bg-white/70 dark:bg-[#06121D]/60 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/5 p-2 shadow-lg dark:shadow-2xl overflow-hidden">
              {[
                { rank: "🥇", name: "Maria K.", xp: "2 840", color: "from-amber-400 to-orange-500" },
                { rank: "🥈", name: "Olena P.", xp: "2 210", color: "from-slate-300 to-slate-400" },
                { rank: "🥉", name: "Artem S.", xp: "1 950", color: "from-emerald-500 to-teal-600", you: true },
                { rank: "4", name: "Sofia D.", xp: "1 720", color: "from-teal-400 to-emerald-500" },
                { rank: "5", name: "Dmytro L.", xp: "1 580", color: "from-green-400 to-emerald-500" },
              ].map((l, i) => (
                <motion.div
                  key={l.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                  className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 border-b border-slate-100 dark:border-white/5 last:border-0 group
                  ${l.you ? "bg-emerald-50 dark:bg-emerald-500/20 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 my-1 shadow-sm dark:shadow-[0_0_20px_rgba(16,185,129,0.15)]" : "hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-colors"}`}
                >
                  <span className={`text-base md:text-lg w-8 text-center font-bold ${l.you ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-400 dark:text-white/40'}`}>
                    {l.rank}
                  </span>
                  <div className={`w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-br ${l.color} shadow-md dark:shadow-lg
                    flex items-center justify-center text-white text-sm font-bold flex-shrink-0
                    group-hover:scale-110 transition-transform`}>
                    {l.name[0]}
                  </div>
                  <span className={`flex-1 text-sm font-bold min-w-0 truncate ${l.you ? 'text-emerald-900 dark:text-white' : 'text-slate-700 dark:text-white/80'}`}>
                    {l.name}
                    {l.you && (
                      <span className="ml-2 text-[10px] font-black tracking-widest text-emerald-700 dark:text-teal-200 bg-emerald-200/50 dark:bg-teal-500/30 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-teal-400/50 shadow-sm dark:shadow-[0_0_10px_rgba(20,184,166,0.4)] uppercase">
                        {t("home.you")}
                      </span>
                    )}
                  </span>
                  <span className={`text-xs font-black px-3 py-1.5 rounded-full flex-shrink-0 backdrop-blur-md shadow-inner tracking-widest
                    ${l.you ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300/50 dark:border-emerald-400/40" : "bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-white/50 border border-slate-200 dark:border-white/10"}`}>
                    {l.xp} XP
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT (User Profile sidebar) ══ */}
        <div className="order-1 md:order-2 flex flex-col gap-6 md:gap-8">
          
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="group relative bg-white/80 dark:bg-[#06121D]/80 backdrop-blur-2xl rounded-3xl border border-slate-200 dark:border-white/10 p-6 md:p-8 text-center shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Inner Glow Map */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-400/10 dark:bg-emerald-500/20 blur-[50px] rounded-full pointer-events-none group-hover:bg-emerald-300/20 dark:group-hover:bg-emerald-400/30 transition-colors duration-700" />
            
            <p className="absolute top-4 left-4 text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.2em]">{t("home.profile", "Profile")}</p>
            <div className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer transition-colors border border-slate-200 dark:border-white/5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-slate-600 dark:text-white">
                <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div className="relative inline-block mt-4 mb-6">
              <div className="p-1 rounded-full bg-gradient-to-tr from-teal-400 via-emerald-400 to-green-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] dark:shadow-[0_0_30px_rgba(16,185,129,0.6)] animate-[spin_10s_linear_infinite] [animation-play-state:paused] group-hover:[animation-play-state:running]">
                <div className="w-20 h-20 md:w-[84px] md:h-[84px] rounded-full bg-slate-100 dark:bg-slate-900 border-[3px] border-white dark:border-[#06121D] flex items-center justify-center text-3xl overflow-hidden relative z-10 animate-[spin_10s_linear_infinite_reverse] [animation-play-state:paused] group-hover:[animation-play-state:running]">
                  {avatar ? (
                    <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    "👤"
                  )}
                </div>
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-black tracking-[0.2em] px-3 py-1 rounded-full border border-emerald-300/50 shadow-[0_0_10px_rgba(16,185,129,0.4)] dark:shadow-[0_0_20px_rgba(20,184,166,0.8)] whitespace-nowrap z-20">
                LVL 4
              </div>
            </div>

            <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:to-emerald-100 tracking-tight">
              {user?.name ?? "Student"}
            </h2>
            <p className="text-[13px] text-emerald-600 dark:text-emerald-300/60 font-semibold mb-6 mt-1 tracking-wide">
              Intermediate
            </p>
            
            <div className="grid grid-cols-3 gap-0 bg-slate-50 dark:bg-[#050B10]/50 rounded-2xl border border-slate-200 dark:border-white/5 divide-x divide-slate-200 dark:divide-white/5 overflow-hidden">
              {[
                ["23", t("progress.tasksCompleted").split(" ")[0] || "Tasks"],
                ["123", t("progress.wordsLearned").split(" ")[0] || "Words"],
                ["8", "Topics"],
              ].map(([v, l], idx) => (
                <div key={idx} className="flex flex-col items-center py-4 px-2 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-default">
                  <p className="text-lg font-black text-slate-800 dark:text-white mb-0.5">{v}</p>
                  <p className="text-[9px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-[0.1em]">{l}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* XP Progress Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group bg-white/80 dark:bg-[#06121D]/80 backdrop-blur-2xl rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-300/20 dark:bg-teal-500/10 blur-[40px] rounded-full pointer-events-none" />
            
            <div className="flex justify-between items-end mb-4 relative z-10">
              <span className="text-sm font-bold text-slate-700 dark:text-white/80 uppercase tracking-widest">
                {t("home.xpProgress")}
              </span>
              <span className="text-base font-black text-emerald-600 dark:text-teal-300 drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(20,184,166,0.6)] text-right">
                1 950 <br/><span className="text-slate-400 dark:text-white/30 text-[10px] font-bold tracking-widest">/ 2500 XP</span>
              </span>
            </div>
            <div className="h-2.5 bg-slate-200 dark:bg-slate-900/90 rounded-full overflow-hidden mb-4 shadow-inner border border-transparent dark:border-white/5 relative z-10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "78%" }}
                transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-green-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] dark:shadow-[0_0_15px_rgba(52,211,153,0.8)] relative"
              >
                <div className="absolute right-0 top-0 bottom-0 w-6 bg-white/40 blur-[3px]" />
              </motion.div>
            </div>
            <div className="flex justify-between text-[11px] font-black text-slate-500 dark:text-white/40 tracking-[0.1em] uppercase relative z-10">
              <span>{t("home.level")} 4</span>
              <span className="text-emerald-600 dark:text-teal-400/80">78% {t("home.toLevel")} 5</span>
            </div>
          </motion.div>

          {/* Streak Card / Daily Quest */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            {/* Make sure the StreakCard inner container respects background and border colors in light/dark mode */}
            <div className="[&>div]:bg-white/80 dark:[&>div]:bg-[#06121D]/80 [&>div]:backdrop-blur-2xl [&>div]:border [&>div]:border-slate-200 dark:[&>div]:border-white/10 [&>div]:shadow-xl dark:[&>div]:shadow-[0_15px_30px_rgba(0,0,0,0.4)] hover:[&>div]:border-emerald-400/50 dark:hover:[&>div]:border-orange-500/40 [&>div]:transition-colors [&>div]:rounded-3xl">
               <StreakCard />
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
};