import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import settingsData from "../data/settingsData.json";

// settingsData.json більше не містить хардкодних title/subTitle —
// вони беруться з перекладів за ключем item.i18nKey
// Якщо хочеш залишити JSON як є — просто видали useTranslation і залиш {item.title}

const groups = [
  { labelKey: "settings.groups.account",  items: settingsData.slice(0, 2) },
  { labelKey: "settings.groups.learning", items: settingsData.slice(2, 4) },
  { labelKey: "settings.groups.app",      items: settingsData.slice(4, 6) },
  { labelKey: "settings.groups.other",    items: settingsData.slice(6, 8) },
];

export const SettingsPage = () => {
  const { t } = useTranslation();

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
              className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl
                border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              {group.items.map((item, i) => (
                <NavLink to={item.link ?? "#"} key={i}>
                  <div className="flex items-center gap-2.5 sm:gap-4
                    px-3 sm:px-4 py-3 sm:py-3.5
                    border-b border-slate-50 dark:border-slate-700/50 last:border-0
                    hover:bg-slate-50/70 dark:hover:bg-slate-700/50 transition-colors duration-150"
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 ${item.bg} rounded-lg sm:rounded-xl
                      flex items-center justify-center text-base sm:text-xl flex-shrink-0`}>
                      {item.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Якщо є i18nKey — використати переклад, інакше — дані з JSON */}
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.i18nKey ? t(`settings.${item.i18nKey}.title`) : item.title}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        {item.i18nKey ? t(`settings.${item.i18nKey}.subtitle`) : item.subTitle}
                      </p>
                    </div>

                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg
                      flex items-center justify-center
                      text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30
                      border border-emerald-100 dark:border-emerald-800">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2"
                          strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </NavLink>
              ))}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <motion.button
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