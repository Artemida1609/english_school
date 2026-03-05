import { motion } from "framer-motion";
import settingsData from "../data/settingsData.json";

const groups = [
  { label: "Акаунт",   items: settingsData.slice(0, 2) },
  { label: "Навчання", items: settingsData.slice(2, 4) },
  { label: "Додаток",  items: settingsData.slice(4, 6) },
  { label: "Інше",     items: settingsData.slice(6, 8) },
];

export const SettingsPage = () => {
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
          Налаштування
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
        >
          Мій акаунт
        </motion.h1>
      </div>

      {/* Groups */}
      <div className="flex flex-col gap-4 sm:gap-6">
        {groups.map((group) => (
          <div key={group.label}>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true, amount: 0 }}
              className="text-[10px] sm:text-[11px] font-bold text-slate-400
                uppercase tracking-widest mb-2 px-1"
            >
              {group.label}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true, amount: 0 }}
              className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 overflow-hidden"
            >
              {group.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 sm:gap-4
                    px-3 sm:px-4 py-3 sm:py-3.5
                    border-b border-slate-50 last:border-0
                    hover:bg-slate-50/70 transition-colors duration-150"
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 ${item.bg} rounded-lg sm:rounded-xl
                    flex items-center justify-center text-base sm:text-xl flex-shrink-0`}>
                    {item.icon}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {item.subTitle}
                    </p>
                  </div>

                  {/* Arrow button */}
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8
                    rounded-lg flex items-center justify-center
                    text-emerald-500 bg-emerald-50 border border-emerald-100">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
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
          border border-rose-100 bg-rose-50 hover:bg-rose-100
          text-rose-500 text-sm font-bold transition-colors duration-150"
      >
        🚪 Вийти з акаунту
      </motion.button>

    </section>
  );
};