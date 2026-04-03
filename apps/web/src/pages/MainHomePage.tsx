import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";


const features_benefits = [
  {
    title: "Learning Experiences",
    desc: "The ultimate destination for knowledge for. We are committed to transforming",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Graduation cap */}
        <path d="M20 8L4 16l16 8 16-8-16-8z" stroke="#2BBFAA" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        <path d="M4 16v10" stroke="#2BBFAA" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M10 19.5V27c0 0 4 4 10 4s10-4 10-4v-7.5" stroke="#2BBFAA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="4" cy="27" r="1.5" fill="#2BBFAA" />
      </svg>
    ),
    bg: "bg-teal-50",
  },
  {
    title: "Professional Instructor",
    desc: "The ultimate destination for knowledge for. We are committed to transforming",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Two people / instructor */}
        <circle cx="14" cy="13" r="5" stroke="#C97B4B" strokeWidth="1.8" fill="none" />
        <path d="M4 32c0-5.523 4.477-10 10-10" stroke="#C97B4B" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="26" cy="13" r="5" stroke="#C97B4B" strokeWidth="1.8" fill="none" />
        <path d="M36 32c0-5.523-4.477-10-10-10" stroke="#C97B4B" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M14 22c1.8-.65 3.8-1 6-1s4.2.35 6 1" stroke="#C97B4B" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M14 32c0-5.523 4.477-10 6-10" stroke="#C97B4B" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M26 32c0-5.523-4.477-10-6-10" stroke="#C97B4B" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    bg: "bg-orange-50",
  },
  {
    title: "Moneyback Gaurantee",
    desc: "The ultimate destination for knowledge for. We are committed to transforming",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Shield with dollar sign */}
        <path d="M20 5L6 11v10c0 8.284 5.8 14.5 14 16 8.2-1.5 14-7.716 14-16V11L20 5z" stroke="#2BBFAA" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        <path d="M20 14v12M17 16.5c0-1.381 1.343-2.5 3-2.5s3 1.119 3 2.5-1.343 2.5-3 2.5-3 1.119-3 2.5 1.343 2.5 3 2.5 3-1.119 3-2.5" stroke="#2BBFAA" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    bg: "bg-blue-50",
  },
];

const popularTracks = [
  { title: "Business Communication", lessons: "28 lessons", weeks: "10 weeks", color: "from-emerald-500 to-teal-400", emoji: "💼" },
  { title: "Grammar For Meetings", lessons: "24 lessons", weeks: "8 weeks", color: "from-teal-500 to-cyan-400", emoji: "📝" },
  { title: "Writing & Emails", lessons: "18 lessons", weeks: "6 weeks", color: "from-cyan-500 to-emerald-400", emoji: "✉️" },
  { title: "Speaking Fluency", lessons: "30 lessons", weeks: "12 weeks", color: "from-emerald-600 to-teal-500", emoji: "🎤" },
];

const features = [
  { icon: "🎯", title: "Персональний прогрес", desc: "Трекінг кожного уроку та модуля в реальному часі" },
  { icon: "🗂", title: "Флеш-картки", desc: "Словник з аудіо та зворотним боком для кращого запам'ятовування" },
  { icon: "🏆", title: "XP та нагороди", desc: "Заробляйте досвід і монети за кожен пройдений урок" },
  { icon: "📊", title: "Аналітика навчання", desc: "Детальна статистика вашого прогресу та серій" },
  { icon: "🎥", title: "Відео уроки", desc: "Структуровані відео з теорією та практичними завданнями" },
  { icon: "✍️", title: "Інтерактивні тести", desc: "Перевіряйте знання після кожного модуля" },
];

// ─── Decorative wavy line (like reference image 2) ─────────────
const WavyLine = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 20" fill="none" aria-hidden>
    <path
      d="M0 10 C25 2, 50 18, 75 10 S125 2, 150 10 S175 18, 200 10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

// ─── Curved underline (like reference image 2) ─────────────────
const CurvedUnderline = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 300 18" fill="none" aria-hidden>
    <path
      d="M4 9 C74 2, 148 16, 220 9 C260 5, 284 11, 296 9"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

// ─── Arrow that actually curves (fixed) ────────────────────────
const CurvedArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 90 60" fill="none" aria-hidden>
    <path
      d="M8 48 C20 48, 55 20, 76 14"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M68 8 L78 15 L70 24"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Scattered dots pattern ────────────────────────────────────
const DotsPattern = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 80 80" fill="none" aria-hidden>
    {[10, 30, 50, 70].map(x =>
      [10, 30, 50, 70].map(y => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="currentColor" opacity="0.6" />
      ))
    )}
  </svg>
);

// ─── Orange dots scattered (like reference image 2) ────────────
const OrangeDots = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 70 70" fill="none" aria-hidden>
    {[
      [10, 10], [25, 5], [40, 12], [55, 8],
      [8, 28], [22, 24], [38, 30], [52, 22],
      [12, 45], [28, 42], [44, 48], [58, 40],
      [6, 62], [20, 58], [36, 65], [50, 58],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="3.5" fill="#f59e0b" opacity="0.75" />
    ))}
  </svg>
);

export const MainHomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full overflow-hidden bg-white dark:bg-[#030812]">

      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section className="relative px-4 sm:px-6 md:px-10 lg:px-12 pt-6 sm:pt-8 md:pt-12 pb-10 sm:pb-12 md:pb-20 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-[#071E1A] dark:via-[#08231E] dark:to-[#0A2C24] overflow-hidden">

        {/* Blobs */}
        <div className="absolute -top-24 -right-20 w-56 h-56 sm:w-72 sm:h-72 bg-emerald-300/30 dark:bg-emerald-500/20 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-28 -left-16 w-64 h-64 sm:w-80 sm:h-80 bg-teal-300/25 dark:bg-teal-500/20 blur-[110px] rounded-full pointer-events-none" />

        {/* Dots pattern top-left */}
        <DotsPattern className="hidden sm:block absolute left-10 top-25 w-12 h-12 text-emerald-400/50 dark:text-emerald-300/40 pointer-events-none" />

        {/* Sparkles */}
        <div className="absolute right-4 sm:right-10 top-6 sm:top-12 text-emerald-400/70 dark:text-emerald-300/60 text-xl sm:text-2xl pointer-events-none select-none">✦</div>
        <div className="hidden sm:block absolute right-[32%] bottom-10 text-teal-500/60 dark:text-teal-300/60 text-xl pointer-events-none select-none">✧</div>
        <div className="hidden md:block absolute left-[30%] top-[18%] text-emerald-500/60 dark:text-emerald-300/60 text-lg pointer-events-none select-none">✦</div>
        <div className="hidden md:block absolute left-[16%] top-[46%] text-teal-500/55 dark:text-teal-300/55 text-base pointer-events-none select-none">✧</div>
        <div className="hidden md:block absolute right-[22%] top-[22%] text-emerald-500/55 dark:text-emerald-300/55 text-base pointer-events-none select-none">✦</div>
        <div className="hidden md:block absolute right-[8%] top-[48%] text-teal-500/55 dark:text-teal-300/55 text-base pointer-events-none select-none">✧</div>

        {/* Wavy decorative lines */}
        <WavyLine className="hidden md:block absolute right-[18%] bottom-[22%] w-20 h-4 text-teal-500/45 dark:text-teal-300/45 pointer-events-none" />

        {/* Geometric circle outline */}
        <div className="hidden sm:block absolute left-[12%] top-[38%] w-10 h-10 rounded-full border-2 border-dashed border-emerald-400/50 dark:border-emerald-300/40 pointer-events-none" />

        {/* Small teal circle — center area decoration */}
        <div className="hidden md:block absolute left-[52%] top-[55%] w-12 h-12 rounded-full border-2 border-emerald-400/40 dark:border-emerald-300/30 pointer-events-none" />
        <div className="hidden sm:block absolute right-[14%] bottom-[28%] w-6 h-6 rounded-full bg-teal-400/50 dark:bg-teal-300/40 pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          {/* Left */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[11px] tracking-[0.2em] uppercase font-black text-emerald-700 dark:text-emerald-300 mb-3"
            >
              Online Learning Course
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05] text-slate-900 dark:text-white"
            >
              Business English
              <span className="relative block w-fit">
                <span className="text-emerald-600 dark:text-teal-300">Tailored for Professional Success</span>
                {/* Wavy underline */}
                <WavyLine className="absolute -bottom-2 sm:-bottom-3 left-0 w-[90%] h-4 text-emerald-500/70 dark:text-emerald-300/70" />
              </span>
              <span className="block text-slate-900 dark:text-white">Forward</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative mt-4 sm:mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed"
            >
              Практична бізнес-англійська для роботи, комунікації та впевненості у міжнародному середовищі.
              <CurvedUnderline className="absolute -bottom-3 left-0 w-40 h-3 text-teal-500/55 dark:text-teal-300/60" />
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
            >
              <button
                onClick={() => navigate("/course")}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-sm uppercase tracking-wider shadow-[0_12px_30px_rgba(5,150,105,0.35)] hover:scale-[1.02] hover:shadow-[0_16px_40px_rgba(5,150,105,0.45)] transition-all"
              >
                Start Learning
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white font-black text-sm uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                View Profile
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-7 sm:mt-8 flex items-center gap-3 sm:gap-4 flex-wrap"
            >
              {["Real business scenarios", "Structured learning path", "Measurable progress"].map((label) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ─── Right — hero image ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end mt-4 lg:mt-0"
          >
            {/* Glow blobs */}
            <div className="absolute -z-10 top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-emerald-300/50 dark:bg-emerald-500/35 blur-[70px]" />
            <div className="absolute -z-10 bottom-0 left-8 w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-teal-300/40 dark:bg-teal-500/30 blur-[60px]" />

            {/* Arrow pointing to the modules badge */}
            <CurvedArrowRight className="hidden md:block absolute left-[2%] top-[18%] w-16 h-12 text-emerald-500/55 dark:text-emerald-300/50 pointer-events-none" />

            {/* Modules count badge — positioned above image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.0, type: "spring", stiffness: 280 }}
              className="hidden md:flex absolute left-[22%] top-2 bg-emerald-500 rounded-2xl w-[90px] h-[90px] flex-col items-center justify-center shadow-[0_8px_25px_rgba(16,185,129,0.5)] z-20 gap-0.5"
            >
              {/* You can swap this emoji for an image icon if desired */}
              <span className="text-2xl">📚</span>
              <p className="text-base font-black text-white leading-none">120+</p>
              <p className="text-[10px] text-emerald-100 font-semibold">модулів</p>
            </motion.div>

            {/* Rating badge — top right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.9, type: "spring", stiffness: 280 }}
              className="absolute -right-2 sm:-right-4 top-6 sm:top-10 bg-white dark:bg-[#06121D] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-emerald-100 dark:border-emerald-800/40 z-20"
            >
              <div className="flex items-center gap-0.5 mb-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <svg key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none">4.9</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">від 2 400 учнів</p>
            </motion.div>

            {/* Students badge — bottom center */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.15, type: "spring", stiffness: 260 }}
              className="absolute bottom-3 sm:bottom-20 left-1/2 md:left-auto md:right-80 -translate-x-1/2 bg-emerald-500 rounded-2xl px-4 py-2.5 shadow-[0_8px_30px_rgba(16,185,129,0.45)] z-20 whitespace-nowrap"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-2">
                  {["👩", "👨", "👩‍🦱"].map((emoji, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-white/20 border-2 border-emerald-400 flex items-center justify-center text-sm">
                      {emoji}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-black text-white leading-none">16 500+</p>
                  <p className="text-[10px] text-emerald-100 font-medium">Активних учнів</p>
                </div>
              </div>
            </motion.div>

            {/* ── NEW IMAGE: person on dark circle with wavy bottom ── */}
            {/* The image already has a dark circular background and green wavy bottom built in */}
            <div className="relative w-full max-w-[320px] sm:max-w-[400px] md:max-w-[460px] lg:max-w-[500px]">
              {/* Extra glow ring behind the circular image */}
              <div className="absolute inset-4 rounded-full bg-emerald-400/20 dark:bg-emerald-400/15 blur-[30px] -z-10" />

              {/* Three decorative green dashes — like the ones in the screenshot */}
              <div className="hidden sm:flex absolute -left-6 top-[28%] flex-col gap-2 pointer-events-none">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + i * 0.1 }}
                    className="w-8 h-2.5 rounded-full bg-emerald-500"
                    style={{ transform: `rotate(${-15 + i * 8}deg)` }}
                  />
                ))}
              </div>

              {/* Wavy bottom decoration behind image bottom — mimics the image's own waves */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[85%] pointer-events-none z-10">
                <WavyLine className="w-full h-5 text-emerald-500/40 dark:text-emerald-400/30" />
                <WavyLine className="w-full h-5 text-emerald-400/30 dark:text-emerald-300/20 -mt-1" />
              </div>

              <img
                src="/images/hero-img2.png"
                alt="Hero Image"
                className="w-full h-auto object-cover relative z-10"
              />


              {/* ── OLD IMAGE (keep for reference) ──
                <div className="w-full rounded-[22px] sm:rounded-[28px] overflow-hidden border border-emerald-200/80 dark:border-emerald-400/30 shadow-[0_20px_45px_rgba(16,185,129,0.25)]">
                  <img src="/images/hero-img.png" alt="Hero Image" className="w-full h-auto object-cover" />
                </div> */}

            </div>

            {/* Sparkles around image */}
            <div className="hidden sm:block absolute -right-1 top-[45%] text-emerald-500/60 dark:text-emerald-300/60 text-xl pointer-events-none select-none">✦</div>
            <div className="hidden sm:block absolute left-2 bottom-[30%] text-teal-500/55 dark:text-teal-300/55 text-sm pointer-events-none select-none">✧</div>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ─────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 py-10 md:py-14 bg-emerald-50/60 dark:bg-[#061813] border-y border-emerald-100 dark:border-emerald-900/40 relative overflow-hidden">
        {/* Top-left decorative grid of squares */}
        <div className="absolute top-5 left-5 grid grid-cols-2 gap-1">
          <div className="w-3 h-3 rounded-sm bg-rose-400" />
          <div className="w-3 h-3 rounded-sm bg-emerald-400" />
          <div className="w-3 h-3 rounded-sm bg-blue-400" />
          <div className="w-3 h-3 rounded-sm bg-amber-400" />
        </div>

        {/* Top-right decorative asterisk */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          className="absolute top-5 right-6 text-emerald-500 text-3xl font-light select-none rotate-45">
          <g stroke="#2FAF8F" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="3" x2="12" y2="21" />
            <line x1="4.5" y1="7" x2="19.5" y2="17" />
            <line x1="19.5" y1="7" x2="4.5" y2="17" />
          </g>
        </svg>

        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-10 mt-6">
          {/* Left label */}
          <div className="flex flex-col items-center gap-2 text-xs font-semibold tracking-widest text-gray-400 uppercase md:pt-2 shrink-0">
            <div className="flex flex-row items-center gap-2">
              <div className="text-emerald-500/55 dark:text-emerald-300/55 text-base pointer-events-none select-none">✦</div>
              <span>Core Features</span>
            </div>
            <div className="h-[1px] w-30 bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"></div>
          </div>

          {/* Right heading */}
          <div className="md:text-right">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white leading-snug">
              Interactive Online Learning <br className="hidden sm:block" />
              Key Features &amp; Benefits
            </h2>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {features_benefits.map((item, index) => (
            <div
              key={index}
              className={`${item.bg} dark:bg-white/5 rounded-2xl p-6 flex flex-col gap-4 shadow-sm`}
            >
              {/* Icon */}
              <div>{item.icon}</div>

              {/* Text */}
              <div>
                <p className="font-bold text-gray-800 dark:text-white text-sm mb-1">{item.title}</p>
                <p className="text-gray-400 dark:text-gray-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ──────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-12 py-12 md:py-16 bg-white dark:bg-[#030812] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-[80px] pointer-events-none" />
        <OrangeDots className="hidden sm:block absolute right-8 top-8 w-16 h-16 opacity-40 pointer-events-none" />

        <div className="mb-10 relative z-10">
          <p className="text-[11px] uppercase tracking-[0.2em] font-black text-emerald-500 dark:text-emerald-300/70">Чому обирають нас</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mt-2 relative w-fit">
            Все що потрібно для навчання
            <WavyLine className="absolute -bottom-3 left-0 w-full h-4 text-emerald-400/60 dark:text-emerald-400/50" />
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 relative z-10">
          {features.map((f, idx) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: idx * 0.07 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-slate-100 dark:border-white/8 bg-gradient-to-b from-white to-slate-50/60 dark:from-white/5 dark:to-transparent p-6 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="font-black text-slate-900 dark:text-white mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA BANNER ────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-12 py-10 md:py-12 bg-gradient-to-r from-emerald-500 to-teal-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <DotsPattern className="absolute top-4 left-8 w-20 h-20 text-white" />
          <DotsPattern className="absolute bottom-4 right-8 w-20 h-20 text-white" />
        </div>
        <WavyLine className="absolute top-3 left-1/4 w-32 h-5 text-white/30 pointer-events-none" />
        <WavyLine className="absolute bottom-3 right-1/4 w-24 h-4 text-white/25 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] font-black text-emerald-100 mb-1">Починай зараз</p>
            <h2 className="text-2xl md:text-3xl font-black text-white">Готовий почати навчання? 🚀</h2>
            <p className="text-emerald-100 mt-1 text-sm">Понад 16 500 учнів вже навчаються разом з нами</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/course")}
            className="shrink-0 px-8 py-4 rounded-2xl bg-white text-emerald-700 font-black text-sm uppercase tracking-wider shadow-[0_8px_25px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.2)] transition-all"
          >
            Розпочати безкоштовно →
          </motion.button>
        </div>
      </section>

      {/* ─── POPULAR COURSES ───────────────────────────────────── */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-12 py-10 md:py-14 bg-white dark:bg-[#030812] relative overflow-hidden">
        <OrangeDots className="hidden sm:block absolute left-6 bottom-6 w-14 h-14 opacity-30 pointer-events-none" />

        <div className="mb-7 relative z-10">
          <p className="text-[11px] uppercase tracking-[0.2em] font-black text-emerald-500 dark:text-emerald-300/70">Popular Courses</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mt-2 relative w-fit">
            Our Popular Online Courses
            <CurvedUnderline className="absolute -bottom-3 left-0 w-full h-3 text-emerald-400/60 dark:text-emerald-400/50" />
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 relative z-10">
          {popularTracks.map((track, idx) => (
            <motion.article
              key={track.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-gradient-to-b from-white to-slate-50 dark:from-white/5 dark:to-white/[0.02] overflow-hidden group hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800/40 transition-all"
            >
              <div className={`h-28 bg-gradient-to-r ${track.color} flex items-center justify-center relative overflow-hidden`}>
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{track.emoji}</span>
                {/* Decorative wavy line on card header */}
                <WavyLine className="absolute bottom-2 left-0 w-full h-3 text-white/20" />
              </div>
              <div className="p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] font-black text-slate-400 dark:text-white/40 mb-1">{track.weeks}</p>
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">{track.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-300 mt-2">{track.lessons}</p>
                <button
                  onClick={() => navigate("/course")}
                  className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-colors"
                >
                  Open Course
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
};