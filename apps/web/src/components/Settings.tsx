import { useState } from "react";
import { BackButton } from "./BackButton";
import { useThemeStore } from "../store/themeStore";
import { useTranslation } from "react-i18next";
import { useLanguageStore } from "../store/languageStore";
import { LANGUAGES } from "../i18n";

// ─── Shared UI ────────────────────────────────────────────────────────────────

const inputCls = `w-full px-4 py-3 rounded-xl
  border border-slate-200 dark:border-slate-700
  bg-white dark:bg-slate-900
  text-slate-800 dark:text-slate-200
  text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600
  focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400
  transition-all duration-200`;

const labelCls = `block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5`;

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 mt-6 first:mt-0
    flex items-center gap-2 after:flex-1 after:h-px after:bg-gradient-to-r
    after:from-slate-200 dark:after:from-slate-700 after:to-transparent">
    {children}
  </h3>
);

const SaveButton = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="mt-6 w-full h-12 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600
      text-white font-bold text-sm tracking-wide
      hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5
      active:translate-y-0 transition-all duration-200"
  >
    Зберегти зміни
  </button>
);

const EyeIcon = ({ show }: { show: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    {show ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="1" y1="1" x2="23" y2="23" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#94a3b8" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="3" stroke="#94a3b8" strokeWidth="1.6" />
      </>
    )}
  </svg>
);

const cardCls = `bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5`;

// ─── Profile ──────────────────────────────────────────────────────────────────

export const ProfileSettings = () => {
  const [avatar, setAvatar] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  return (
    <section className="max-w-lg justify-self-center">
      <BackButton title="Профіль" />
      <div className={`flex items-center gap-5 mb-6 ${cardCls}`}>
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100
            flex items-center justify-center overflow-hidden border-2 border-emerald-200 dark:border-emerald-700">
            {avatar
              ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              : <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
            }
          </div>
          <label className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-emerald-500 rounded-lg
            flex items-center justify-center cursor-pointer hover:bg-emerald-600 transition-colors shadow-md">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <polyline points="17 8 12 3 7 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="3" x2="12" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
        </div>
        <div>
          <p className="font-extrabold text-slate-800 dark:text-slate-100 text-base">Фото профілю</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">JPG, PNG до 5MB</p>
        </div>
      </div>

      <div className={`${cardCls} space-y-4`}>
        <SectionTitle>Особисті дані</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Ім'я</label>
            <input className={inputCls} type="text" placeholder="Артем" />
          </div>
          <div>
            <label className={labelCls}>Прізвище</label>
            <input className={inputCls} type="text" placeholder="Іваненко" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <div className="relative">
            <input className={inputCls + " pl-10"} type="email" placeholder="artem@example.com" />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
              <polyline points="22,6 12,13 2,6" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div>
          <label className={labelCls}>Місто / Країна</label>
          <div className="relative">
            <input className={inputCls + " pl-10"} type="text" placeholder="Київ, Україна" />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" stroke="#94a3b8" strokeWidth="1.6" />
              <circle cx="12" cy="10" r="3" stroke="#94a3b8" strokeWidth="1.6" />
            </svg>
          </div>
        </div>
        <div>
          <label className={labelCls}>Telegram</label>
          <div className="relative">
            <input className={inputCls + " pl-10"} type="text" placeholder="@username" />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
      <SaveButton />
    </section>
  );
};

// ─── Notifications ────────────────────────────────────────────────────────────

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0
      ${checked ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`}>
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
      transition-transform duration-300 ${checked ? "translate-x-5" : "translate-x-0"}`} />
  </button>
);

const NotifRow = ({ icon, title, sub, checked, onChange }: {
  icon: React.ReactNode; title: string; sub: string; checked: boolean; onChange: () => void;
}) => (
  <div className="flex items-center gap-4 py-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{title}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

export const NotificationSettings = () => {
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [streak, setStreak] = useState(true);
  const [achievements, setAchievements] = useState(false);
  const [reminders, setReminders] = useState(true);

  return (
    <section className="max-w-lg space-y-4 justify-self-center">
      <BackButton title="Сповіщення" />
      <div className={cardCls}>
        <SectionTitle>Канали</SectionTitle>
        <NotifRow checked={push} onChange={() => setPush(!push)} title="Push-сповіщення" sub="На пристрій"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
          </svg>}
        />
        <NotifRow checked={email} onChange={() => setEmail(!email)} title="Email-розсилка" sub="На вашу пошту"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
            <polyline points="22,6 12,13 2,6" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>}
        />
      </div>

      <div className={cardCls}>
        <SectionTitle>Типи сповіщень</SectionTitle>
        <NotifRow checked={streak} onChange={() => setStreak(!streak)} title="Серії днів" sub="Нагадування про щоденне навчання"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2c0 4-4 5-4 9a4 4 0 0 0 8 0c0-2-1-3.5-2-4.5 0 2-1 3-2 3-1 0-1.5-1-1-2.5C11.5 6 12 4 12 2z" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>}
        />
        <NotifRow checked={achievements} onChange={() => setAchievements(!achievements)} title="Здобутки" sub="Нові бейджі та нагороди"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>}
        />
        <NotifRow checked={reminders} onChange={() => setReminders(!reminders)} title="Нагадування" sub="Час для уроку"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#10b981" strokeWidth="1.8" />
            <polyline points="12 7 12 12 15 15" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>}
        />
      </div>

      <div className={cardCls}>
        <SectionTitle>Email адреса</SectionTitle>
        <label className={labelCls}>Для сповіщень</label>
        <input className={inputCls} type="email" placeholder="artem@example.com" />
      </div>
      <SaveButton />
    </section>
  );
};

// ─── Language ─────────────────────────────────────────────────────────────────

export const LanguageSettings = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();

  return (
    <section className="max-w-lg justify-self-center">
      <BackButton title={t("settings.language.title")} />
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
        <SectionTitle>{t("settings.language.sectionTitle")}</SectionTitle>
        <div className="space-y-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-200
                ${language === lang.code
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 shadow-sm shadow-emerald-100 dark:shadow-emerald-900"
                  : "border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className={`font-semibold text-sm flex-1 text-left
                ${language === lang.code
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-slate-700 dark:text-slate-300"}`}
              >
                {lang.label}
              </span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                ${language === lang.code
                  ? "border-emerald-500 bg-emerald-500"
                  : "border-slate-300 dark:border-slate-600"}`}
              >
                {language === lang.code && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      <SaveButton />
    </section>
  );
};

// ─── Goal ─────────────────────────────────────────────────────────────────────

const goals = [
  {
    id: "casual", label: "Легко", minutes: 10, sub: "10 хвилин на день",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>),
    color: "text-sky-500",
    activeBg: "bg-sky-50 dark:bg-sky-900/20 border-sky-400",
    activeText: "text-sky-700 dark:text-sky-400",
  },
  {
    id: "regular", label: "Помірно", minutes: 30, sub: "30 хвилин на день",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>),
    color: "text-emerald-500",
    activeBg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400",
    activeText: "text-emerald-700 dark:text-emerald-400",
  },
  {
    id: "intense", label: "Інтенсивно", minutes: 60, sub: "1 година на день",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M8 21h8M12 17v4M7 4H4v3a3 3 0 0 0 3 3M17 4h3v3a3 3 0 0 1-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 4h10v6a5 5 0 0 1-10 0V4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>),
    color: "text-orange-500",
    activeBg: "bg-orange-50 dark:bg-orange-900/20 border-orange-400",
    activeText: "text-orange-700 dark:text-orange-400",
  },
];

export const GoalSettings = () => {
  const [selected, setSelected] = useState("regular");

  return (
    <section className="max-w-lg justify-self-center">
      <BackButton title="Ціль навчання" />
      <div className={cardCls}>
        <SectionTitle>Ціль навчання</SectionTitle>
        <div className="space-y-3">
          {goals.map((goal) => {
            const isActive = selected === goal.id;
            return (
              <button key={goal.id} onClick={() => setSelected(goal.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all duration-200 text-left
                  ${isActive ? goal.activeBg : "border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}>
                <div className={`${isActive ? goal.activeText : goal.color} transition-colors`}>{goal.icon}</div>
                <div className="flex-1">
                  <p className={`font-bold text-sm ${isActive ? goal.activeText : "text-slate-800 dark:text-slate-200"}`}>{goal.label}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{goal.sub}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
                  ${isActive ? "border-current bg-current " + goal.activeText : "border-slate-300 dark:border-slate-600"}`}>
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
      </div>
      <SaveButton />
    </section>
  );
};

// ─── Security ────────────────────────────────────────────────────────────────

export const SecuritySettings = () => {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  return (
    <section className="max-w-lg space-y-4 justify-self-center">
      <BackButton title="Безпека" />
      <div className={cardCls}>
        <SectionTitle>Email</SectionTitle>
        <label className={labelCls}>Поточний email</label>
        <input className={inputCls} type="email" placeholder="artem@example.com" />
      </div>

      <div className={`${cardCls} space-y-4`}>
        <SectionTitle>Зміна пароля</SectionTitle>
        <div>
          <label className={labelCls}>Поточний пароль</label>
          <div className="relative">
            <input className={inputCls + " pr-11"} type={showOld ? "text" : "password"} placeholder="••••••••" />
            <button onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
              <EyeIcon show={showOld} />
            </button>
          </div>
        </div>
        <div>
          <label className={labelCls}>Новий пароль</label>
          <div className="relative">
            <input className={inputCls + " pr-11"} type={showNew ? "text" : "password"} placeholder="••••••••" />
            <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
              <EyeIcon show={showNew} />
            </button>
          </div>
        </div>
        <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/40">
          <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="9" x2="12" y2="13" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            Пароль має містити мінімум 8 символів, велику літеру та цифру
          </p>
        </div>
      </div>
      <SaveButton />
    </section>
  );
};

// ─── Theme ────────────────────────────────────────────────────────────────────

export const ThemeSettings = () => {
  const { theme, setTheme } = useThemeStore();

  const themes = [
    {
      id: "light" as const, label: "Світла", sub: "Завжди світла тема",
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8" />
        <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>),
      preview: "bg-white border-slate-200", previewDot: "bg-slate-200",
    },
    {
      id: "dark" as const, label: "Темна", sub: "Завжди темна тема",
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>),
      preview: "bg-slate-800 border-slate-700", previewDot: "bg-slate-600",
    },
    {
      id: "system" as const, label: "Системна", sub: "Слідує за системою",
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>),
      preview: "bg-gradient-to-r from-white to-slate-800 border-slate-300", previewDot: "bg-slate-400",
    },
  ];

  return (
    <section className="max-w-lg justify-self-center">
      <BackButton title="Зовнішній вигляд" />
      <div className={cardCls}>
        <SectionTitle>Оформлення</SectionTitle>
        <div className="space-y-2">
          {themes.map((t) => {
            const isActive = theme === t.id;
            return (
              <button key={t.id} onClick={() => setTheme(t.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 transition-all duration-200
                  ${isActive
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                    : "border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  }`}>
                <div className={`w-10 h-7 rounded-lg border-2 ${t.preview} flex items-end justify-start p-1 flex-shrink-0`}>
                  <div className={`w-2 h-1.5 rounded-sm ${t.previewDot}`} />
                </div>
                <div className={`${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"} transition-colors`}>
                  {t.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-semibold text-sm ${isActive ? "text-emerald-700 dark:text-emerald-400" : "text-slate-800 dark:text-slate-200"}`}>
                    {t.label}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{t.sub}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${isActive ? "border-emerald-500 bg-emerald-500" : "border-slate-300 dark:border-slate-600"}`}>
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
      </div>
      <SaveButton />
    </section>
  );
};