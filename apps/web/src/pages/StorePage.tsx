import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import storeItems from "../data/storeItems.json";
import { CoinIcon } from "../icons/CoinIcon";
import { buyItem } from "../store/shopSlice";
import type { RootState } from "../store";

export const StorePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const balance = useSelector((s: RootState) => s.shop.balance);

  const handleBuy = (item: { icon: string; title: string; price: number }) => {
    if (balance < item.price) return;
    dispatch(buyItem(item));
  };

  return (
    <section className="px-3 sm:px-4 py-4 sm:py-6 max-w-4xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-[11px] font-bold tracking-[0.18em] uppercase text-emerald-400 mb-1"
        >
          {t("store.subtitle")}
        </motion.p>
        <div className="flex items-end justify-between gap-3">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight"
          >
            {t("store.title")}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20
              border border-amber-100 dark:border-amber-800/40 px-3 py-1.5 rounded-xl flex-shrink-0"
          >
            <CoinIcon size={20} className="text-amber-500" />
            <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
              {balance}
            </span>
          </motion.div>
        </div>
        <div className="mt-3 h-px bg-gradient-to-r from-emerald-100 dark:from-emerald-900 via-teal-100 dark:via-teal-900 to-transparent" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {storeItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden
              hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-100/50 dark:hover:shadow-teal-900/30
              hover:border-emerald-200 dark:hover:border-emerald-700 transition-all duration-300 cursor-pointer group"
          >
            <div
              className={`bg-gradient-to-br ${item.bg} h-24 sm:h-28 flex items-center justify-center relative`}
            >
              <span className="text-4xl sm:text-5xl drop-shadow-sm">
                {item.icon}
              </span>
              <span
                className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
              >
                {item.badge}
              </span>
            </div>
            <div className="p-4">
              <h2
                className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mb-1
                group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200"
              >
                {item.title}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed mb-4">
                {item.description}
              </p>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <CoinIcon size={18} className="text-amber-500" />
                  <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                    {item.price}
                  </span>
                </div>
                <button
                  onClick={() =>
                    handleBuy({
                      icon: item.icon,
                      title: item.title,
                      price: item.price,
                    })
                  }
                  disabled={balance < item.price}
                  className="text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500
                  px-3 py-1.5 rounded-lg hover:shadow-md hover:shadow-emerald-200 dark:hover:shadow-emerald-900
                  active:scale-95 transition-all duration-150 cursor-pointer"
                >
                  {t("store.buy")}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
