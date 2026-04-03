import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { BackButton } from "../components/BackButton";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  cardCls,
  inputCls,
  labelCls,
  SaveButton,
  SectionTitle,
} from "../components/Settings";
import type { RootState } from "../store";
import type { AppDispatch } from "../store";
import { apiFetch } from "../api/client";
import { setAvatar as setAvatarInStore, logout } from "../store/authSlice";

export const ProfilePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((s: RootState) => s.auth);

  // Розбиваємо name на firstName / lastName (бекенд зберігає як "Ім'я Прізвище")
  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] ?? "");
  const [lastName, setLastName] = useState(
    user?.name?.split(" ").slice(1).join(" ") ?? "",
  );
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [telegram, setTelegram] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [serverAvatar, setServerAvatar] = useState<string | null>(null);

  // Dynamic profile data
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedModules, setCompletedModules] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // FIX: ChangeElement → ChangeEvent
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  useEffect(() => {
    // Load profile avatar and stats from backend
    apiFetch<{
      profile?: {
        avatar?: string | null;
        xp?: number;
        level?: number;
        levelProgress?: number;
        coins?: number;
      };
      stats?: {
        completedModules?: number;
      };
    }>("/api/profile/me")
      .then((data) => {
        const av = data.profile?.avatar ?? null;
        setServerAvatar(av);
        dispatch(setAvatarInStore(av));
        setXp(data.profile?.xp ?? 0);
        setLevel(data.profile?.level ?? 1);
        setLevelProgress(data.profile?.levelProgress ?? 0);
        // FIX: use stats.completedModules (matches backend response shape)
        setCompletedModules(data.stats?.completedModules ?? 0);
      })
      .catch(() => setServerAvatar(null));

    // Load streak from activity calendar
    fetch("/api/progress/activity-calendar", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setStreak(data.currentStreak ?? 0);
      })
      .catch(() => {});
  }, [dispatch]);

  // Initials для аватара-заглушки
  const initials =
    `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "👤";

  const avatarSrc = avatar ?? serverAvatar;

  return (
    <section className="max-w-lg justify-self-center flex flex-col gap-4 p-6">
      <BackButton title={t("settings.profile.title")} />

      {/* ── Avatar card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`flex items-center gap-5 mb-4 ${cardCls}`}
      >
        <div className="relative flex-shrink-0">
          <div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500
            flex items-center justify-center overflow-hidden border-2 border-emerald-200 dark:border-emerald-700"
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-extrabold text-white">
                {initials}
              </span>
            )}
          </div>
          <label
            className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-emerald-500 rounded-lg
            flex items-center justify-center cursor-pointer hover:bg-emerald-600 transition-colors shadow-md"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <polyline
                points="17 8 12 3 7 8"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="12"
                y1="3"
                x2="12"
                y2="15"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
        </div>

        <div className="min-w-0">
          <p className="font-extrabold text-slate-800 dark:text-slate-100 text-base truncate">
            {firstName || lastName
              ? `${firstName} ${lastName}`.trim()
              : t("settings.profile.photoTitle")}
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            {user?.email || t("settings.profile.photoHint")}
          </p>
          {user?.role && (
            <span
              className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider
              bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400
              px-2 py-0.5 rounded-full"
            >
              {user.role}
            </span>
          )}
        </div>
      </motion.div>

      {/* ── Stats card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.04, ease: "easeOut" }}
        className={`${cardCls} space-y-4`}
      >
        <SectionTitle>{t("mainHome.profile.statsTitle")}</SectionTitle>

        {/* Level progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>{t("mainHome.profile.level")} {level}</span>
            <span>{levelProgress}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {completedModules}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {t("mainHome.profile.completedModules")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {xp}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">XP</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {level}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {t("mainHome.profile.level")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {streak}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {t("mainHome.profile.daysInRow")}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Personal data card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
        className={`${cardCls} space-y-4`}
      >
        <SectionTitle>{t("settings.profile.personalData")}</SectionTitle>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>
              {t("settings.profile.firstName")}
            </label>
            <input
              className={inputCls}
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t("settings.profile.firstNamePlaceholder")}
            />
          </div>
          <div>
            <label className={labelCls}>{t("settings.profile.lastName")}</label>
            <input
              className={inputCls}
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t("settings.profile.lastNamePlaceholder")}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>{t("settings.profile.phone")}</label>
          <div className="relative">
            <input
              className={inputCls + " pl-10"}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+380 XX XXX XX XX"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
                stroke="#94a3b8"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div>
          <label className={labelCls}>{t("settings.profile.city")}</label>
          <div className="relative">
            <input
              className={inputCls + " pl-10"}
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={t("settings.profile.cityPlaceholder")}
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"
                stroke="#94a3b8"
                strokeWidth="1.6"
              />
              <circle cx="12" cy="10" r="3" stroke="#94a3b8" strokeWidth="1.6" />
            </svg>
          </div>
        </div>

        <div>
          <label className={labelCls}>{t("settings.profile.telegram")}</label>
          <div className="relative">
            <input
              className={inputCls + " pl-10"}
              type="text"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder={t("settings.profile.telegramPlaceholder")}
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M22 2L11 13"
                stroke="#94a3b8"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 2L15 22l-4-9-9-4 20-7z"
                stroke="#94a3b8"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </motion.div>

      <SaveButton />

      {/* Logout */}
      <motion.button
        onClick={handleLogout}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        className="w-full py-3 rounded-xl sm:rounded-2xl
          border border-rose-100 dark:border-rose-900/40
          bg-rose-50 dark:bg-rose-900/20
          hover:bg-rose-100 dark:hover:bg-rose-900/30
          text-rose-500 dark:text-rose-400 text-sm font-bold transition-colors duration-150"
      >
        🚪 {t("settings.logout")}
      </motion.button>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-700/50"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-5 mx-auto">
                <svg className="w-6 h-6 text-rose-600 dark:text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
                {t("settings.logoutConfirmTitle")}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
                {t("settings.logoutConfirmText")}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {t("settings.cancel")}
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/30"
                >
                  {t("settings.logout")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};