import { motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { settingsConfig } from "../data/settingsData";
import { useThemeStore } from "../store/themeStore";
import { useSettingsStore } from "../store/settingsStore";
import { useLanguageStore } from "../store/languageStore";
import { LANGUAGES } from "../i18n";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import type { AppDispatch } from "../store";

const groups = [
  { labelKey: "settings.groups.account", items: settingsConfig.slice(0, 1) },
  { labelKey: "settings.groups.learning", items: settingsConfig.slice(1, 3) },
  { labelKey: "settings.groups.app", items: settingsConfig.slice(3, 5) },
  { labelKey: "settings.groups.other", items: settingsConfig.slice(5, 7) },
];

export const SettingsPage = () => {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const { goal, notifications, subscription } = useSettingsStore();
  const { language } = useLanguageStore();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Динамічні підзаголовки для кожного i18nKey
  const getDynamicSubtitle = (i18nKey: string): string | null => {
    switch (i18nKey) {
      case "theme":
        return t(`settings.theme.${theme}`);

      case "language": {
        const lang = LANGUAGES.find((l) => l.code === language);
        return lang?.label ?? null;
      }

      case "goal":
        return t(`settings.goal.${goal}`);

      case "notifications": {
        const activeCount = Object.values(notifications).filter(Boolean).length;
        const total = Object.values(notifications).length;
        return t("settings.notifications.activeCount", {
          count: activeCount,
          total,
          defaultValue: `${activeCount} з ${total} увімкнено`,
        });
      }

      case "subscription":
        return t(`settings.subscription.${subscription}`);

      default:
        return null;
    }
  };

  return (
    <section className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-5 sm:mb-8">
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-[11px] font-bold tracking-[0.18em] uppercase text-emerald-400 mb-1"
        >
          {t("settings.subtitle")}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight"
        >
          {t("settings.title")}
        </motion.h1>
      </div>

      {/* Groups */}
      <div className="flex flex-col gap-4 sm:gap-6">
        {groups.map((group) => (
          <div key={group.labelKey}>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true, amount: 0 }}
              className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500
                uppercase tracking-widest mb-2 px-1"
            >
              {t(group.labelKey)}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true, amount: 0 }}
              className="bg-white/80 dark:bg-[#06121D]/80 backdrop-blur-2xl rounded-2xl sm:rounded-[32px]
                border border-slate-200 dark:border-white/5 overflow-hidden shadow-xl"
            >
              {group.items.map((item, i) => {
                const dynamicSub = item.i18nKey
                  ? getDynamicSubtitle(item.i18nKey)
                  : null;

                return (
                  <NavLink to={item.link ?? "#"} key={i}>
                    <div
                      className="flex items-center gap-3 sm:gap-5
                      px-4 sm:px-6 py-4 sm:py-5
                      border-b border-slate-200/50 dark:border-white/5 last:border-0
                      hover:bg-emerald-50/50 dark:hover:bg-white/5 transition-colors duration-300 group"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all border border-slate-200 dark:border-white/5 group-hover:border-emerald-200 dark:group-hover:border-emerald-500/30">
                        <item.icon className="w-[60%] h-[60%]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                          {item.i18nKey
                            ? t(`settings.${item.i18nKey}.title`)
                            : item.title}
                        </p>
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5 truncate uppercase tracking-wider">
                          {dynamicSub ?? item.subTitle}
                        </p>
                      </div>

                      <div
                        className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl
                        flex items-center justify-center transition-all
                        text-slate-400 bg-slate-100 dark:bg-white/5 dark:text-white/30
                        border border-slate-200 dark:border-white/10 group-hover:bg-emerald-500 group-hover:border-emerald-400 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M9 18l6-6-6-6"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </NavLink>
                );
              })}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <motion.button
        onClick={handleLogout}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        viewport={{ once: true, amount: 0 }}
        className="w-full mt-6 sm:mt-8 py-3 rounded-xl sm:rounded-2xl
          border border-rose-100 dark:border-rose-900/40
          bg-rose-50 dark:bg-rose-900/20
          hover:bg-rose-100 dark:hover:bg-rose-900/30
          text-rose-500 dark:text-rose-400 text-sm font-bold transition-colors duration-150"
      >
        🚪 {t("settings.logout")}
      </motion.button>
    </section>
  );
};