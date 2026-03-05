import { motion } from "framer-motion";

export const HomePage = () => {
  const progress = 100;

  return (
    <main className="grid md:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px] grid-cols-1 gap-4 md:gap-6 p-4 md:p-6">

      {/* ══ LEFT ══ */}
      <div className="order-2 md:order-1">

        {/* Continue Learning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden bg-gradient-to-br from-teal-600 to-emerald-600
            rounded-2xl md:rounded-3xl p-5 md:p-7 text-white mb-4 md:mb-6"
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/[0.07] rounded-full" />
          <div className="absolute -bottom-14 right-14 w-36 h-36 bg-white/[0.05] rounded-full" />

          <p className="text-[11px] font-bold tracking-[0.18em] uppercase opacity-70 mb-3">
            Продовжити навчання
          </p>
          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-5 relative z-10">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/20
              flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                <line x1="8.5" y1="7" x2="16" y2="7" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="8.5" y1="11" x2="16" y2="11" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-[11px] opacity-75 font-medium">Модуль 1</p>
              <h2 className="text-lg md:text-xl font-extrabold tracking-tight">Основи Граматики</h2>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4 relative z-10">
            <span className="text-[14px] font-bold w-10 flex-shrink-0">{progress}%</span>
            <div className="flex-1 h-1.5 bg-white/25 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }} />
            </div>
            <button className="bg-white text-teal-700 text-xs md:text-[13px] font-bold
              px-3 md:px-5 py-2 rounded-xl flex-shrink-0 hover:bg-teal-50 transition-colors whitespace-nowrap">
              Вчитись далі →
            </button>
          </div>
        </motion.div>

        {/* Progress Cards */}
        <h3 className="text-[14px] md:text-[15px] font-bold text-slate-800 mb-3 flex items-center gap-2
          after:flex-1 after:h-px after:bg-gradient-to-r after:from-slate-200 after:to-transparent">
          Твій прогрес
        </h3>
        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6">
          {[
            { icon: "📚", label: "Завдань виконано", value: "23",  sub: "+3 цього тижня", bg: "bg-emerald-50" },
            { icon: "💬", label: "Слів вивчено",     value: "123", sub: "+12 сьогодні",   bg: "bg-yellow-50" },
            { icon: "🎯", label: "Тем вивчено",      value: "8",   sub: "з 12 модулів",   bg: "bg-sky-50" },
            { icon: "⚡", label: "Точність",          value: "87%", sub: "середня оцінка", bg: "bg-purple-50" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="bg-white rounded-xl md:rounded-2xl p-4 md:p-5 border border-slate-100
                hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-100/50
                hover:border-emerald-200 transition-all duration-200 cursor-default"
            >
              <div className={`w-8 h-8 md:w-9 md:h-9 ${s.bg} rounded-lg md:rounded-xl
                flex items-center justify-center text-base md:text-lg mb-2 md:mb-3`}>
                {s.icon}
              </div>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-tight">
                {s.label}
              </p>
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                {s.value}
              </p>
              <p className="text-[11px] md:text-xs text-slate-500 mt-1">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Leaderboard */}
        <h3 className="text-[14px] md:text-[15px] font-bold text-slate-800 mb-3 flex items-center gap-2
          after:flex-1 after:h-px after:bg-gradient-to-r after:from-slate-200 after:to-transparent">
          Таблиця лідерів
        </h3>
        <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 p-3 md:p-4 mb-4 md:mb-6">
          {[
            { rank: "🥇", name: "Maria K.",  xp: "2 840", color: "from-amber-400 to-orange-400" },
            { rank: "🥈", name: "Olena P.",  xp: "2 210", color: "from-violet-400 to-purple-500" },
            { rank: "🥉", name: "Artem S.",  xp: "1 950", color: "from-teal-400 to-emerald-500", you: true },
            { rank: "4",  name: "Sofia D.",  xp: "1 720", color: "from-pink-400 to-rose-500" },
            { rank: "5",  name: "Dmytro L.", xp: "1 580", color: "from-cyan-400 to-blue-500" },
          ].map((l) => (
            <div key={l.name}
              className={`flex items-center gap-2 md:gap-3 py-2 md:py-2.5
                border-b border-slate-50 last:border-0
                ${l.you ? "bg-emerald-50/50 -mx-3 px-3 md:-mx-4 md:px-4 rounded-xl" : ""}`}>
              <span className="text-sm md:text-base w-5 md:w-6 text-center flex-shrink-0">{l.rank}</span>
              <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br ${l.color}
                flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                {l.name[0]}
              </div>
              <span className="flex-1 text-xs md:text-sm font-semibold text-slate-800 min-w-0 truncate">
                {l.name}
                {l.you && (
                  <span className="ml-1.5 text-[10px] font-bold text-emerald-600
                    bg-emerald-100 px-1.5 py-0.5 rounded-full">Ти</span>
                )}
              </span>
              <span className="text-[11px] md:text-xs font-bold text-emerald-600 bg-emerald-50
                px-2 md:px-2.5 py-1 rounded-full flex-shrink-0">{l.xp} XP</span>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <h3 className="text-[14px] md:text-[15px] font-bold text-slate-800 mb-3 flex items-center gap-2
          after:flex-1 after:h-px after:bg-gradient-to-r after:from-slate-200 after:to-transparent">
          Твої здобутки
        </h3>
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          {[
            { icon: "🏆", name: "Перший модуль", locked: false },
            { icon: "🔥", name: "7 днів підряд", locked: false },
            { icon: "⚡", name: "Швидкий старт", locked: false },
            { icon: "📖", name: "100 слів",       locked: false },
            { icon: "🎓", name: "Сертифікат",     locked: true },
            { icon: "💎", name: "Діамант",        locked: true },
            { icon: "🌟", name: "Зірка",          locked: true },
            { icon: "🚀", name: "Ракета",         locked: true },
          ].map((a, i) => (
            <motion.div
              key={a.name}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: a.locked ? 0.4 : 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`bg-white rounded-xl md:rounded-2xl p-2 md:p-3 border border-slate-100
                text-center transition-all duration-200
                ${a.locked ? "grayscale" : "hover:border-emerald-200 hover:-translate-y-0.5"}`}
            >
              <div className="text-xl md:text-2xl mb-1">{a.icon}</div>
              <p className="text-[9px] md:text-[10px] font-semibold text-slate-500 leading-tight">{a.name}</p>
            </motion.div>
          ))}
        </div>

      </div>

      {/* ══ RIGHT ══ */}
      <div className="order-1 md:order-2 flex flex-col gap-3 md:gap-4">

        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 p-4 md:p-6 text-center"
        >
          <div className="relative inline-block mb-3">
            <div className="w-14 h-14 md:w-[72px] md:h-[72px] rounded-full bg-gradient-to-br
              from-teal-400 to-emerald-500 flex items-center justify-center mx-auto text-2xl md:text-3xl">
              👤
            </div>
            <div className="absolute bottom-0.5 right-0.5 w-3 h-3 md:w-3.5 md:h-3.5
              bg-green-400 rounded-full border-2 border-white" />
          </div>
          <h2 className="text-base md:text-lg font-extrabold text-slate-900">Привіт, Артем 👋</h2>
          <p className="text-xs md:text-sm text-slate-400 mb-2">Продовжуй навчатися!</p>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700
            text-[11px] md:text-xs font-bold px-3 py-1.5 rounded-full mb-3 md:mb-4">
            ⭐ Рівень 4 · Intermediate
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[["23", "Завдань"], ["123", "Слів"], ["8", "Тем"]].map(([v, l]) => (
              <div key={l}>
                <p className="text-lg md:text-xl font-extrabold text-slate-900">{v}</p>
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider">{l}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* XP Progress */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 p-4 md:p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs md:text-sm font-bold text-slate-800">Прогрес XP</span>
            <span className="text-xs md:text-sm font-bold text-emerald-600">1 950 / 2 500</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "78%" }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
            />
          </div>
          <div className="flex justify-between text-[11px] md:text-xs text-slate-400">
            <span>Рівень 4</span>
            <span>78% до Рівня 5</span>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50
          border border-orange-100 rounded-xl md:rounded-2xl p-4 md:p-5 flex items-center gap-3 md:gap-4">
          <span className="text-3xl md:text-4xl">🔥</span>
          <div className="min-w-0">
            <p className="text-2xl md:text-3xl font-extrabold text-orange-600 leading-none">7</p>
            <p className="text-xs md:text-sm text-orange-800/70 font-medium mb-2">днів поспіль</p>
            <div className="flex gap-1 md:gap-1.5">
              {["Пн","Вт","Ср","Чт","Пт","Сб","Нд"].map((d, i) => (
                <div key={d} className={`w-6 h-6 md:w-7 md:h-7 rounded-md md:rounded-lg
                  flex items-center justify-center text-[9px] md:text-[10px] font-bold
                  ${i === 6
                    ? "bg-orange-500 text-white shadow-[0_0_0_2px_#fed7aa]"
                    : i < 6
                    ? "bg-orange-400 text-white"
                    : "bg-orange-100 text-orange-300"}`}>
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Purchases */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 p-4 md:p-5">
          <h3 className="text-[14px] md:text-[15px] font-bold text-slate-800 mb-3 flex items-center gap-2
            after:flex-1 after:h-px after:bg-gradient-to-r after:from-slate-200 after:to-transparent">
            Твої покупки
          </h3>
          {[
            { icon: "📦", bg: "bg-emerald-50", name: "XP Boost ×2",     date: "2 дні тому" },
            { icon: "🎨", bg: "bg-yellow-50",  name: "Темна тема",       date: "тиждень тому" },
            { icon: "❄️", bg: "bg-sky-50",     name: "Заморозка стріку", date: "2 тижні тому" },
          ].map((p) => (
            <div key={p.name} className="flex items-center gap-2 md:gap-3 py-2 md:py-2.5
              border-b border-slate-50 last:border-0">
              <div className={`w-8 h-8 md:w-9 md:h-9 ${p.bg} rounded-lg md:rounded-xl
                flex items-center justify-center text-sm md:text-base flex-shrink-0`}>
                {p.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                <p className="text-[11px] md:text-xs text-slate-400">{p.date}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
};