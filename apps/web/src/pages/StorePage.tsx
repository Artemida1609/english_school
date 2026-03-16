import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CoinIcon } from "../icons/CoinIcon";
import { setBalance, addPurchase } from "../store/shopSlice";
import type { RootState } from "../store";
import { apiFetch } from "../api/client";

const styleByKey: Record<
  string,
  { bg: string; badge: string; badgeColor: string }
> = {
  "xp-boost-x2": {
    bg: "from-amber-400 to-orange-400",
    badge: "Популярне",
    badgeColor: "bg-orange-100 text-orange-600",
  },
  "freeze-streak": {
    bg: "from-sky-400 to-blue-500",
    badge: "Корисне",
    badgeColor: "bg-sky-100 text-sky-600",
  },
  "dark-theme": {
    bg: "from-violet-400 to-purple-500",
    badge: "Новинка",
    badgeColor: "bg-violet-100 text-violet-600",
  },
  "gold-profile": {
    bg: "from-emerald-400 to-teal-500",
    badge: "Преміум",
    badgeColor: "bg-emerald-100 text-emerald-600",
  },
  "unlimited-hints": {
    bg: "from-rose-400 to-pink-500",
    badge: "Корисне",
    badgeColor: "bg-rose-100 text-rose-600",
  },
  "turbo-mode": {
    bg: "from-indigo-400 to-blue-500",
    badge: "Топ",
    badgeColor: "bg-indigo-100 text-indigo-600",
  },
};

type StoreItemFromApi = {
  id: string;
  key: string;
  title: string;
  description?: string;
  price: number;
  icon?: string | null;
  maxPurchases: number;
  purchasedCount: number;
};

export const StorePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const balance = useSelector((s: RootState) => s.shop.balance);
  const [items, setItems] = useState<StoreItemFromApi[]>([]);

  useEffect(() => {
    apiFetch<{ coins: number; items: StoreItemFromApi[] }>("/api/store/me")
      .then((data) => {
        dispatch(setBalance(data.coins));
        setItems(data.items);
      })
      .catch(() => {
        // тихо ігноруємо помилку, Store просто покаже 0 монет
      });
  }, [dispatch]);

  const handleBuy = async (itemKey: string) => {
    const item = items.find((i) => i.key === itemKey);
    if (!item) return;

    if (balance < item.price) return;

    const reachedLimit = item.purchasedCount >= item.maxPurchases;
    if (reachedLimit) return;

    try {
      const res = await apiFetch<{
        coins: number;
        purchase: {
          itemKey: string;
          title: string;
          icon?: string;
          createdAt: string;
          purchasedCount: number;
          maxPurchases: number;
        };
      }>("/api/store/buy", {
        method: "POST",
        body: JSON.stringify({ key: itemKey }),
      });

      dispatch(setBalance(res.coins));
      dispatch(
        addPurchase({
          icon: res.purchase.icon ?? "🛒",
          title: res.purchase.title,
          createdAt: res.purchase.createdAt,
        })
      );

      setItems((prev: StoreItemFromApi[]) =>
        prev.map((it: StoreItemFromApi) =>
          it.key === res.purchase.itemKey
            ? { ...it, purchasedCount: res.purchase.purchasedCount, maxPurchases: res.purchase.maxPurchases }
            : it
        )
      );
    } catch {
      // можна додати тости/повідомлення пізніше
    }
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
        {items.map((item: StoreItemFromApi, i: number) => {
          const style = styleByKey[item.key] ?? {
            bg: "from-slate-200 to-slate-300",
            badge: "",
            badgeColor: "bg-slate-100 text-slate-500",
          };
          const isBought = item.purchasedCount > 0;
          const reachedLimit = item.purchasedCount >= item.maxPurchases;
          const cannotAfford = balance < item.price;
          const disabled = reachedLimit || cannotAfford;

          return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
            className={`bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden
              transition-all duration-300 cursor-pointer group
              ${reachedLimit ? "border-slate-200 dark:border-slate-700 opacity-80" : "border-slate-100 dark:border-slate-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-100/50 dark:hover:shadow-teal-900/30 hover:border-emerald-200 dark:hover:border-emerald-700"}`}
          >
            <div
              className={`bg-gradient-to-br ${style.bg} h-24 sm:h-28 flex items-center justify-center relative`}
            >
              <span className="text-4xl sm:text-5xl drop-shadow-sm">
                {item.icon ?? "🛒"}
              </span>
              <span
                className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badgeColor}`}
              >
                {style.badge}
              </span>
              {isBought && (
                <span
                  className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full
                  bg-emerald-500 text-white shadow-sm"
                >
                  {reachedLimit ? "Максимум" : "Придбано"}
                </span>
              )}
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
                  onClick={() => handleBuy(item.key)}
                  disabled={disabled}
                  className={`text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500
                  px-3 py-1.5 rounded-lg hover:shadow-md hover:shadow-emerald-200 dark:hover:shadow-emerald-900
                  active:scale-95 transition-all duration-150
                  ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {reachedLimit ? "Використано ліміт" : t("store.buy")}
                </button>
              </div>
            </div>
          </motion.div>
          );
        })}
      </div>
    </section>
  );
};
