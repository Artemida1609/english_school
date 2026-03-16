import { useState } from "react";
import { BackButton } from "./BackButton";
import { useThemeStore } from "../store/themeStore";
import { useTranslation } from "react-i18next";
import { useLanguageStore } from "../store/languageStore";
import { LANGUAGES } from "../i18n";
import { useSettingsStore } from "../store/settingsStore";
// import { motion } from "framer-motion";

// ─── Shared UI ────────────────────────────────────────────────────────────────

export const inputCls = `w-full px-4 py-3 rounded-xl
  border border-slate-200 dark:border-slate-700
  bg-white dark:bg-slate-900
  text-slate-800 dark:text-slate-200
  text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600
  focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400
  transition-all duration-200`;

export const labelCls = `block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5`;

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3
    className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 mt-6 first:mt-0
    flex items-center gap-2 after:flex-1 after:h-px after:bg-gradient-to-r
    after:from-slate-200 dark:after:from-slate-700 after:to-transparent"
  >
    {children}
  </h3>
);

export const SaveButton = ({
  onClick,
  label,
}: {
  onClick?: () => void;
  label?: string;
}) => {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      className="mt-6 w-full h-12 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600
        text-white font-bold text-sm tracking-wide
        hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5
        active:translate-y-0 transition-all duration-200"
    >
      {label ?? t("settings.saveChanges")}
    </button>
  );
};

export const EyeIcon = ({ show }: { show: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    {show ? (
      <>
        <path
          d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
          stroke="#94a3b8"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
          stroke="#94a3b8"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="1"
          y1="1"
          x2="23"
          y2="23"
          stroke="#94a3b8"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </>
    ) : (
      <>
        <path
          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
          stroke="#94a3b8"
          strokeWidth="1.6"
        />
        <circle cx="12" cy="12" r="3" stroke="#94a3b8" strokeWidth="1.6" />
      </>
    )}
  </svg>
);

export const cardCls = `bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5`;

// ─── Notifications ────────────────────────────────────────────────────────────

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => (
  <button
    onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0
      ${checked ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
      transition-transform duration-300 ${checked ? "translate-x-5" : "translate-x-0"}`}
    />
  </button>
);

const NotifRow = ({
  icon,
  title,
  sub,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <div className="flex items-center gap-4 py-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
        {title}
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

// ─── Notifications ────────────────────────────────────────────────────────────
// ─── Notifications ────────────────────────────────────────────────────────────
export const NotificationSettings = () => {
  const { t } = useTranslation();
  const { notifications, setNotifications } = useSettingsStore();
  const [local, setLocal] = useState(notifications);
  const toggle = (key: keyof typeof local) =>
    setLocal((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <section className="max-w-lg space-y-4 justify-self-center">
      <BackButton title={t("settings.notifications.title")} />

      <div className={cardCls}>
        <SectionTitle>{t("settings.notifications.channels")}</SectionTitle>

        {/* Push */}
        <NotifRow
          checked={local.push}
          onChange={() => toggle("push")}
          title={t("settings.notifications.push")}
          sub={t("settings.notifications.pushSub")}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="#10b981"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.73 21a2 2 0 0 1-3.46 0"
                stroke="#10b981"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          }
        />

        {/* Email */}
        <NotifRow
          checked={local.email}
          onChange={() => toggle("email")}
          title={t("settings.notifications.emailNotif")}
          sub={t("settings.notifications.emailSub")}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                stroke="#10b981"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <polyline
                points="22,6 12,13 2,6"
                stroke="#10b981"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
      </div>

      <div className={cardCls}>
        <SectionTitle>{t("settings.notifications.types")}</SectionTitle>

        {/* Streak */}
        <NotifRow
          checked={local.streak}
          onChange={() => toggle("streak")}
          title={t("settings.notifications.streak")}
          sub={t("settings.notifications.streakSub")}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2c0 4-4 5-4 9a4 4 0 0 0 8 0c0-2-1-3.5-2-4.5 0 2-1 3-2 3-1 0-1.5-1-1-2.5C11.5 6 12 4 12 2z"
                stroke="#10b981"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />

        {/* Achievements */}
        <NotifRow
          checked={local.achievements}
          onChange={() => toggle("achievements")}
          title={t("settings.notifications.achievements")}
          sub={t("settings.notifications.achievementsSub")}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                stroke="#10b981"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />

        {/* Reminders */}
        <NotifRow
          checked={local.reminders}
          onChange={() => toggle("reminders")}
          title={t("settings.notifications.reminders")}
          sub={t("settings.notifications.remindersSub")}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#10b981" strokeWidth="1.8" />
              <polyline
                points="12 7 12 12 15 15"
                stroke="#10b981"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
      </div>

      <div className={cardCls}>
        <SectionTitle>{t("settings.notifications.emailAddress")}</SectionTitle>
        <label className={labelCls}>
          {t("settings.notifications.forNotifications")}
        </label>
        <input
          className={inputCls}
          type="email"
          placeholder={t("settings.profile.emailPlaceholder")}
        />
      </div>

      <SaveButton onClick={() => setNotifications(local)} />
    </section>
  );
};

// ─── Language ─────────────────────────────────────────────────────────────────

export const LanguageSettings = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const [selected, setSelected] = useState(language);

  return (
    <section className="max-w-lg justify-self-center">
      <BackButton title={t("settings.language.title")} />
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
        <SectionTitle>{t("settings.language.sectionTitle")}</SectionTitle>
        <div className="space-y-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelected(lang.code)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-200
                ${selected === lang.code
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 shadow-sm shadow-emerald-100 dark:shadow-emerald-900"
                  : "border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
            >
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl leading-none">{lang.flag}</span>
              </div>
              <span
                className={`font-semibold text-sm flex-1 text-left
                ${selected === lang.code
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-slate-700 dark:text-slate-300"
                  }`}
              >
                {lang.label}
              </span>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                ${selected === lang.code
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-slate-300 dark:border-slate-600"
                  }`}
              >
                {selected === lang.code && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5l2.5 2.5L8 3"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      <SaveButton onClick={() => setLanguage(selected)} />
    </section>
  );
};

// ─── Goal ─────────────────────────────────────────────────────────────────────

export const GoalSettings = () => {
  const { t } = useTranslation();
  const { goal, setGoal } = useSettingsStore();
  const [selected, setSelected] = useState<string>(goal);

  const goals = [
    {
      id: "casual",
      label: t("settings.goal.casual"),
      sub: t("settings.goal.casualSub"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M8 14s1.5 2 4 2 4-2 4-2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="9"
            y1="9"
            x2="9.01"
            y2="9"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="15"
            y1="9"
            x2="15.01"
            y2="9"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      color: "text-sky-500",
      activeBg: "bg-sky-50 dark:bg-sky-900/20 border-sky-400",
      activeText: "text-sky-700 dark:text-sky-400",
    },
    {
      id: "regular",
      label: t("settings.goal.regular"),
      sub: t("settings.goal.regularSub"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "text-emerald-500",
      activeBg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400",
      activeText: "text-emerald-700 dark:text-emerald-400",
    },
    {
      id: "intense",
      label: t("settings.goal.intense"),
      sub: t("settings.goal.intenseSub"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M8 21h8M12 17v4M7 4H4v3a3 3 0 0 0 3 3M17 4h3v3a3 3 0 0 1-3 3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 4h10v6a5 5 0 0 1-10 0V4z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "text-orange-500",
      activeBg: "bg-orange-50 dark:bg-orange-900/20 border-orange-400",
      activeText: "text-orange-700 dark:text-orange-400",
    },
  ];

  return (
    <section className="max-w-lg justify-self-center">
      <BackButton title={t("settings.goal.sectionTitle")} />
      <div className={cardCls}>
        <SectionTitle>{t("settings.goal.sectionTitle")}</SectionTitle>
        <div className="space-y-3">
          {goals.map((goal) => {
            const isActive = selected === goal.id;
            return (
              <button
                key={goal.id}
                onClick={() => setSelected(goal.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all duration-200 text-left
                  ${isActive ? goal.activeBg : "border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
              >
                <div
                  className={`${isActive ? goal.activeText : goal.color} transition-colors`}
                >
                  {goal.icon}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-bold text-sm ${isActive ? goal.activeText : "text-slate-800 dark:text-slate-200"}`}
                  >
                    {goal.label}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {goal.sub}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
                  ${isActive ? "border-current bg-current " + goal.activeText : "border-slate-300 dark:border-slate-600"}`}
                >
                  {isActive && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5l2.5 2.5L8 3"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <SaveButton onClick={() => setGoal(selected as "casual" | "regular" | "intense")} />
    </section>
  );
};

// ─── Security ────────────────────────────────────────────────────────────────

export const SecuritySettings = () => {
  const { t } = useTranslation();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  return (
    <section className="max-w-lg space-y-4 justify-self-center">
      <BackButton title={t("settings.security.title")} />
      <div className={cardCls}>
        <SectionTitle>{t("settings.security.emailSection")}</SectionTitle>
        <label className={labelCls}>
          {t("settings.security.currentEmail")}
        </label>
        <input
          className={inputCls}
          type="email"
          placeholder={t("settings.profile.emailPlaceholder")}
        />
      </div>

      <div className={`${cardCls} space-y-4`}>
        <SectionTitle>{t("settings.security.changePassword")}</SectionTitle>
        <div>
          <label className={labelCls}>
            {t("settings.security.currentPassword")}
          </label>
          <div className="relative">
            <input
              className={inputCls + " pr-11"}
              type={showOld ? "text" : "password"}
              placeholder={t("settings.security.passwordPlaceholder")}
            />
            <button
              onClick={() => setShowOld(!showOld)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
            >
              <EyeIcon show={showOld} />
            </button>
          </div>
        </div>
        <div>
          <label className={labelCls}>
            {t("settings.security.newPassword")}
          </label>
          <div className="relative">
            <input
              className={inputCls + " pr-11"}
              type={showNew ? "text" : "password"}
              placeholder={t("settings.security.passwordPlaceholder")}
            />
            <button
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
            >
              <EyeIcon show={showNew} />
            </button>
          </div>
        </div>
        <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/40">
          <svg
            className="flex-shrink-0 mt-0.5"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              stroke="#f59e0b"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="12"
              y1="9"
              x2="12"
              y2="13"
              stroke="#f59e0b"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <line
              x1="12"
              y1="17"
              x2="12.01"
              y2="17"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            {t("settings.security.passwordHint")}
          </p>
        </div>
      </div>
      <SaveButton />
    </section>
  );
};

// ─── Theme ────────────────────────────────────────────────────────────────────

export const ThemeSettings = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useThemeStore();
  const [selected, setSelected] = useState(theme); 

  const themes = [
    {
      id: "light" as const,
      label: t("settings.theme.light"),
      sub: t("settings.theme.lightSub"),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="5"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <line
            x1="12"
            y1="1"
            x2="12"
            y2="3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="12"
            y1="21"
            x2="12"
            y2="23"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="4.22"
            y1="4.22"
            x2="5.64"
            y2="5.64"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="18.36"
            y1="18.36"
            x2="19.78"
            y2="19.78"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="1"
            y1="12"
            x2="3"
            y2="12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="21"
            y1="12"
            x2="23"
            y2="12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="4.22"
            y1="19.78"
            x2="5.64"
            y2="18.36"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="18.36"
            y1="5.64"
            x2="19.78"
            y2="4.22"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
      preview: "bg-white border-slate-200",
      previewDot: "bg-slate-200",
    },
    {
      id: "dark" as const,
      label: t("settings.theme.dark"),
      sub: t("settings.theme.darkSub"),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      preview: "bg-slate-800 border-slate-700",
      previewDot: "bg-slate-600",
    },
    {
      id: "system" as const,
      label: t("settings.theme.system"),
      sub: t("settings.theme.systemSub"),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect
            x="2"
            y="3"
            width="20"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <line
            x1="8"
            y1="21"
            x2="16"
            y2="21"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="12"
            y1="17"
            x2="12"
            y2="21"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
      preview: "bg-gradient-to-r from-white to-slate-800 border-slate-300",
      previewDot: "bg-slate-400",
    },
  ];

  return (
    <section className="max-w-lg justify-self-center">
      <BackButton title={t("settings.theme.title")} />
      <div className={cardCls}>
        <SectionTitle>{t("settings.theme.sectionTitle")}</SectionTitle>
        <div className="space-y-2">
          {themes.map((th) => {
            const isActive = selected === th.id;
            return (
              <button
                key={th.id}
                onClick={() => setSelected(th.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 transition-all duration-200
                  ${isActive
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                    : "border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  }`}
              >
                <div
                  className={`w-10 h-7 rounded-lg border-2 ${th.preview} flex items-end justify-start p-1 flex-shrink-0`}
                >
                  <div className={`w-2 h-1.5 rounded-sm ${th.previewDot}`} />
                </div>
                <div
                  className={`${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"} transition-colors`}
                >
                  {th.icon}
                </div>
                <div className="flex-1 text-left">
                  <p
                    className={`font-semibold text-sm ${isActive ? "text-emerald-700 dark:text-emerald-400" : "text-slate-800 dark:text-slate-200"}`}
                  >
                    {th.label}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {th.sub}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${isActive ? "border-emerald-500 bg-emerald-500" : "border-slate-300 dark:border-slate-600"}`}
                >
                  {isActive && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5l2.5 2.5L8 3"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <SaveButton onClick={() => setTheme(selected)} />
    </section>
  );
};

// ─── Privacy ──────────────────────────────────────────────────────────────────

export const PrivacySettings = () => {
  const { t } = useTranslation();

  const items = [
    {
      label: t("settings.privacy.privacyPolicy"),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3L4 6.5V11C4 15.418 7.582 19.25 12 21C16.418 19.25 20 15.418 20 11V6.5L12 3Z"
            stroke="#10b981"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 12L11 14L15 10"
            stroke="#10b981"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: t("settings.privacy.termsOfService"),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M14 3H7C5.895 3 5 3.895 5 5V19C5 20.105 5.895 21 7 21H17C18.105 21 19 20.105 19 19V8L14 3Z"
            stroke="#10b981"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 3V8H19"
            stroke="#10b981"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="8"
            y1="13"
            x2="16"
            y2="13"
            stroke="#10b981"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="8"
            y1="17"
            x2="13"
            y2="17"
            stroke="#10b981"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      label: t("settings.privacy.dataUsage"),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <ellipse
            cx="12"
            cy="5"
            rx="9"
            ry="3"
            stroke="#10b981"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M3 5v5c0 1.657 4.029 3 9 3s9-1.343 9-3V5"
            stroke="#10b981"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M3 10v5c0 1.657 4.029 3 9 3s9-1.343 9-3v-5"
            stroke="#10b981"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="max-w-lg space-y-4 justify-self-center">
      <BackButton title={t("settings.privacy.title")} />

      <div className={cardCls}>
        <SectionTitle>{t("settings.privacy.sectionTitle")}</SectionTitle>
        <div className="space-y-0">
          {items.map((item, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-4 py-4 border-b border-slate-100 dark:border-slate-700 last:border-0
                hover:bg-slate-50 dark:hover:bg-slate-700/30 -mx-5 px-5 transition-colors duration-150"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <span className="flex-1 text-left font-semibold text-sm text-slate-800 dark:text-slate-200">
                {item.label}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 18l6-6-6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-400 dark:text-slate-500"
                />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div
        className={`${cardCls} border-rose-100 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-900/10`}
      >
        <button className="w-full flex items-center gap-4 text-left group">
          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <polyline
                points="3 6 5 6 21 6"
                stroke="#ef4444"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 6l-1 14H6L5 6"
                stroke="#ef4444"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 11v6M14 11v6"
                stroke="#ef4444"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M9 6V4h6v2"
                stroke="#ef4444"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-rose-600 dark:text-rose-400">
              {t("settings.privacy.deleteAccount")}
            </p>
            <p className="text-xs text-rose-400 dark:text-rose-500 mt-0.5">
              {t("settings.privacy.deleteAccountSub")}
            </p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18l6-6-6-6"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  );
};

// ─── Subscription ─────────────────────────────────────────────────────────────

export const SubscriptionSettings = () => {
  const { t } = useTranslation();
  const { subscription, setSubscription } = useSettingsStore();
  const [selected, setSelected] = useState(subscription);

  const plans = [
    {
      id: "free",
      label: t("settings.subscription.free"),
      sub: t("settings.subscription.freeSub"),
      price: "0₴",
      features: [
        t("settings.subscription.feature.courses5"),
        t("settings.subscription.feature.basicStats"),
        t("settings.subscription.feature.push"),
      ],
      activeBg:
        "bg-slate-50 dark:bg-slate-700/30 border-slate-400 dark:border-slate-500",
      activeText: "text-slate-700 dark:text-slate-300",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect
            x="2"
            y="5"
            width="20"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="2"
            y1="10"
            x2="22"
            y2="10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      id: "pro",
      label: t("settings.subscription.pro"),
      sub: t("settings.subscription.proSub"),
      price: "299₴/міс",
      features: [
        t("settings.subscription.feature.unlimitedCourses"),
        t("settings.subscription.feature.analytics"),
        t("settings.subscription.feature.prioritySupport"),
        t("settings.subscription.feature.offline"),
      ],
      activeBg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400",
      activeText: "text-emerald-700 dark:text-emerald-400",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 17L5.5 9L9 13L12 7L15 13L18.5 9L21 17H3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="3"
            y1="20"
            x2="21"
            y2="20"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="max-w-lg space-y-4 justify-self-center">
      <BackButton title={t("settings.subscription.title")} />

      <div className={cardCls}>
        <SectionTitle>{t("settings.subscription.sectionTitle")}</SectionTitle>
        <div className="space-y-3">
          {plans.map((plan) => {
            const isActive = selected === plan.id; // ← використовується
            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id as "free" | "pro")}
                className={`w-full flex items-start gap-4 px-4 py-4 rounded-xl border-2 transition-all duration-200 text-left
          ${isActive ? plan.activeBg : "border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600"}`}
              >
                <div className={`mt-0.5 transition-colors ${isActive ? plan.activeText : "text-slate-400 dark:text-slate-500"}`}>
                  {plan.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`font-bold text-sm ${isActive ? plan.activeText : "text-slate-800 dark:text-slate-200"}`}>
                      {plan.label}
                    </p>
                    <span className={`text-sm font-extrabold ${isActive ? plan.activeText : "text-slate-500 dark:text-slate-400"}`}>
                      {plan.price}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">{plan.sub}</p>
                  <div className="flex flex-wrap gap-1">
                    {plan.features.map((f, i) => (
                      <span key={i} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                ${isActive
                          ? "bg-white/60 dark:bg-slate-800/60 " + plan.activeText
                          : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                        }`}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
          ${isActive ? "border-current bg-current " + plan.activeText : "border-slate-300 dark:border-slate-600"}`}>
                  {isActive && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Кнопка зберігає в store */}
        <button
          onClick={() => setSubscription(selected as "free" | "pro")}
          className="mt-2 w-full h-12 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600
    text-white font-bold text-sm tracking-wide
    hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5
    active:translate-y-0 transition-all duration-200"
        >
          {selected === "pro"
            ? t("settings.subscription.manage")
            : t("settings.subscription.upgrade")}
        </button>

        {selected === "pro" && (
          <button className="w-full py-3 text-sm font-semibold text-rose-400 dark:text-rose-500
    hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
            {t("settings.subscription.cancelSubscription")}
          </button>
        )}
      </div>
    </section>
  );
};
