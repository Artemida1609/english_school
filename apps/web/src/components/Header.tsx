import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { FireIcon } from "../icons/FireIcon";
import { LogoIcon } from "../icons/LogoIcon";
import { ProfileIcon } from "../icons/ProfileIcon";
import type { RootState } from "../store";
import { apiFetch } from "../api/client";

export const Header = () => {
  const { avatar } = useSelector((s: RootState) => s.auth);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // FIX: використовуємо apiFetch — він автоматично додає Authorization header
    apiFetch<{ profile?: { xp?: number } }>("/api/profile/me")
      .then((data) => {
        setXp(data.profile?.xp ?? 0);
      })
      .catch(() => {});

    // FIX: apiFetch замість fetch з ручним токеном
    // Якщо ендпоінт ще не існує на бекенді — тихо ігноруємо (streak = 0)
    apiFetch<{ currentStreak?: number }>("/api/progress/activity-calendar")
      .then((data) => {
        setStreak(data.currentStreak ?? 0);
      })
      .catch(() => {
        // ендпоінт ще не реалізований — залишаємо streak = 0
      });
  }, []);

  return (
    <header
      className="fixed z-50 w-full h-16 flex items-center
      bg-slate-50 dark:bg-[#030812]
      transition-colors duration-500"
    >
      {/* Лого */}
      <NavLink
        to="/"
        className="flex items-center justify-center w-16 h-full cursor-pointer group flex-shrink-0"
      >
        <div className="transition-transform duration-200 group-hover:scale-110">
          <LogoIcon />
        </div>
      </NavLink>

      {/* Права частина */}
      <div
        className="flex flex-1 items-center justify-end px-6 h-full
        border-b border-slate-200 dark:border-white/5 transition-colors duration-500"
      >
        <div className="flex items-center gap-2">
          {/* Streak */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl
            border border-orange-100 dark:border-orange-800/40
            bg-orange-50 dark:bg-orange-900/20
            hover:bg-orange-100 dark:hover:bg-orange-900/30
            transition-colors duration-150 cursor-pointer"
          >
            <FireIcon size={20} />
            <span className="text-sm font-bold text-orange-500 dark:text-orange-400 tabular-nums">
              {streak}
            </span>
            <span className="text-sm text-orange-400 dark:text-orange-500 font-medium hidden sm:inline">
              days
            </span>
          </div>

          {/* XP */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl
            border border-emerald-100 dark:border-emerald-800/40
            bg-emerald-50 dark:bg-emerald-900/20
            hover:bg-emerald-100 dark:hover:bg-emerald-900/30
            transition-colors duration-150 cursor-pointer"
          >
            <span
              className="text-xs font-extrabold text-white inline-flex items-center justify-center
              bg-emerald-400 dark:bg-emerald-600 rounded-full w-5 h-5 leading-none tracking-tight"
            >
              xp
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {xp}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1" />

          {/* Profile */}
          <NavLink to="/profile-settings">
            <button
              className="flex items-center justify-center w-9 h-9 rounded-full
              hover:bg-gray-100 dark:hover:bg-slate-800
              transition-colors duration-150 cursor-pointer"
            >
              {avatar ? (
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img
                    src={avatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <ProfileIcon />
              )}
            </button>
          </NavLink>
        </div>
      </div>
    </header>
  );
};