import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CoinIcon } from "../icons/CoinIcon";
import { setBalance, addPurchase } from "../store/shopSlice";
import { setAvatar } from "../store/authSlice";
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
        avatar?: string | null;
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
      if (res.avatar !== undefined) {
        dispatch(setAvatar(res.avatar));
      }
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
    <div className="min-h-full bg-slate-50 dark:bg-[#030812] overflow-hidden relative text-slate-900 dark:text-white md:rounded-[36px] border border-slate-200/50 dark:border-white/5 shadow-2xl transition-colors duration-500">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-amber-300/20 dark:bg-amber-600/10 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none transition-colors duration-500" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-300/20 dark:bg-teal-600/10 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none transition-colors duration-500" />

      <section className="relative z-10 p-6 md:p-10 max-w-5xl mx-auto h-full overflow-y-auto custom-scrollbar">
        <div className="mb-10 sm:mb-12">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-[11px] font-black tracking-[0.2em] uppercase text-emerald-500 dark:text-emerald-400 mb-2 drop-shadow-sm"
          >
            {t("store.subtitle", "КРАМНИЦЯ")}
          </motion.p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-4">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight drop-shadow-sm"
            >
              {t("store.title", "Store")}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex items-center gap-2 bg-white/80 dark:bg-[#06121D]/80 backdrop-blur-md
                border border-amber-200/50 dark:border-white/10 px-4 py-2.5 rounded-2xl flex-shrink-0 shadow-[0_10px_30px_rgba(245,158,11,0.15)] dark:shadow-none"
            >
              <CoinIcon size={24} className="text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
              <span className="text-xl font-black text-amber-600 dark:text-amber-400 translate-y-[1px]">
                {balance}
              </span>
            </motion.div>
          </div>
          <div className="mt-8 h-px bg-gradient-to-r from-emerald-200 dark:from-white/10 via-teal-100 dark:via-white/5 to-transparent" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item: StoreItemFromApi, i: number) => {
            const style = styleByKey[item.key] ?? {
              bg: "from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700",
              badge: "",
              badgeColor: "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-white/70",
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
              className={`bg-white/60 dark:bg-[#06121D]/60 backdrop-blur-xl rounded-[24px] border overflow-hidden
                transition-all duration-500 cursor-pointer group shadow-md
                ${reachedLimit 
                  ? "border-slate-200 dark:border-white/5 opacity-80" 
                  : "border-slate-200 dark:border-white/5 hover:-translate-y-1.5 hover:shadow-xl dark:shadow-none hover:border-emerald-400/50 dark:hover:border-emerald-500/40"}`}
            >
              <div
                className={`bg-gradient-to-br ${style.bg} h-32 flex items-center justify-center relative shadow-inner`}
              >
                <div className="absolute inset-0 bg-white/20 dark:bg-black/20 mix-blend-overlay" />
                <span className="text-5xl sm:text-6xl drop-shadow-md group-hover:scale-110 transition-transform duration-500 z-10">
                  {item.icon ?? "🛒"}
                </span>
                
                {style.badge && (
                  <span
                    className={`absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full z-10 shadow-sm ${style.badgeColor}`}
                  >
                    {style.badge}
                  </span>
                )}
                
                {isBought && (
                  <span
                    className="absolute bottom-3 left-3 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full
                    bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)] z-10"
                  >
                    {reachedLimit ? "Максимум" : "Придбано"}
                  </span>
                )}
              </div>
              <div className="p-6 relative z-10">
                <h2
                  className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight
                  group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300"
                >
                  {item.title}
                </h2>
                <p className="text-sm font-medium text-slate-500 dark:text-white/50 leading-relaxed mb-6 line-clamp-2">
                  {item.description}
                </p>
                <div className="border-t border-slate-200 dark:border-white/10 mt-2 mb-6" />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <CoinIcon size={20} className="text-amber-500 drop-shadow-sm" />
                    <span className="text-xl font-black text-slate-800 dark:text-white">
                      {item.price}
                    </span>
                  </div>
                  <button
                    onClick={() => handleBuy(item.key)}
                    disabled={disabled}
                    className={`text-[11px] font-black uppercase tracking-widest text-white 
                    px-4 py-2.5 rounded-xl transition-all duration-300 border border-transparent
                    ${disabled 
                      ? "bg-slate-300 dark:bg-white/10 text-slate-500 dark:text-white/30 cursor-not-allowed" 
                      : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] border-emerald-400/50 hover:scale-105 active:scale-95"}`}
                  >
                    {reachedLimit ? "Використано" : t("store.buy", "Придбати")}
                  </button>
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
