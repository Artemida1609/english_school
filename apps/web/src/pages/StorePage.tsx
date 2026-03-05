import { motion } from "framer-motion";
import storeItems from "../data/storeItems.json";
// import { CoinIcon } from "../icons/CoinIcon";
import { Coins } from "lucide-react";

export const StorePage = () => {
  return (
    <section className="px-3 sm:px-4 py-4 sm:py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-[11px] font-bold tracking-[0.18em] uppercase text-emerald-400 mb-1"
        >
          Магазин
        </motion.p>
        <div className="flex items-end justify-between gap-3">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
          >
            Наш магазин
          </motion.h1>
          {/* Balance */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center gap-1.5 bg-amber-50 border border-amber-100
              px-3 py-1.5 rounded-xl flex-shrink-0"
          >
            <span className="text-base">
              <Coins size={18} className="text-amber-500" />
            </span>
            <span className="text-sm font-extrabold text-amber-600">350</span>
          </motion.div>
        </div>
        <div className="mt-3 h-px bg-gradient-to-r from-emerald-100 via-teal-100 to-transparent" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {storeItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden
              hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-100/50
              hover:border-emerald-200 transition-all duration-300 cursor-pointer group"
          >
            {/* Top gradient area */}
            <div
              className={`bg-gradient-to-br ${item.bg} h-24 sm:h-28
              flex items-center justify-center relative`}
            >
              <span className="text-4xl sm:text-5xl drop-shadow-sm">
                {item.icon}
              </span>
              {/* Badge */}
              <span
                className={`absolute top-3 right-3 text-[10px] font-bold
                px-2 py-0.5 rounded-full ${item.badgeColor}`}
              >
                {item.badge}
              </span>
            </div>

            {/* Content */}
            <div className="p-4">
              <h2
                className="text-sm sm:text-base font-bold text-slate-900 mb-1
                group-hover:text-emerald-600 transition-colors duration-200"
              >
                {item.title}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {item.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-base">
                    <Coins size={18} className="text-amber-500" />
                  </span>
                  <span className="text-base font-extrabold text-slate-800">
                    {item.price}
                  </span>
                </div>
                <button
                  className="text-xs font-bold text-white
                  bg-gradient-to-r from-emerald-500 to-teal-500
                  px-3 py-1.5 rounded-lg
                  hover:shadow-md hover:shadow-emerald-200
                  active:scale-95 transition-all duration-150"
                >
                  Купити
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
