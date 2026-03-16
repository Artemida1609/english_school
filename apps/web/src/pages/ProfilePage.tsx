import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { BackButton } from "../components/BackButton";
import { motion } from "framer-motion";
import {
  cardCls,
  inputCls,
  labelCls,
  SaveButton,
  SectionTitle,
} from "../components/Settings";
import type { RootState } from "../store";

export const ProfilePage = () => {
  const { t } = useTranslation();
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  // Initials для аватара-заглушки
  const initials =
    `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "👤";

  return (
    <section className="max-w-lg justify-self-center">
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
            {avatar ? (
              <img
                src={avatar}
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
              <circle
                cx="12"
                cy="10"
                r="3"
                stroke="#94a3b8"
                strokeWidth="1.6"
              />
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
    </section>
  );
};
