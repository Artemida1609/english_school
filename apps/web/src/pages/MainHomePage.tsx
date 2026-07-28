// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { useTranslation } from "react-i18next";

// // ─── Category Icons (Custom SVG) ────────────────────────────────────
// const BriefcaseIcon = ({ className }: { className?: string }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <rect x="2" y="7" width="20" height="14" rx="2" />
//     <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
//   </svg>
// );

// const PencilIcon = ({ className }: { className?: string }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
//   </svg>
// );

// const SpeechIcon = ({ className }: { className?: string }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
//     <path d="M13 8a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2" />
//     <path d="M17 12h.01" />
//   </svg>
// );

// const BookIcon = ({ className }: { className?: string }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
//     <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
//   </svg>
// );

// const PenIcon = ({ className }: { className?: string }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M12 19l7-7 3 3-7 7-3-3z" />
//     <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
//     <path d="M2 2l7.586 7.586" />
//     <circle cx="11" cy="11" r="2" />
//   </svg>
// );

// const HeadphonesIcon = ({ className }: { className?: string }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
//     <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
//   </svg>
// );

// const TargetIcon = ({ className }: { className?: string }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <circle cx="12" cy="12" r="10" />
//     <circle cx="12" cy="12" r="6" />
//     <circle cx="12" cy="12" r="2" />
//   </svg>
// );

// const RocketIcon = ({ className }: { className?: string }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
//     <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
//     <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
//     <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
//   </svg>
// );

// // ─── Decorative Components ────────────────────────────────────
// const WavyLine = ({ className }: { className?: string }) => (
//   <svg className={className} viewBox="0 0 200 20" fill="none" aria-hidden>
//     <path d="M0 10 C25 2, 50 18, 75 10 S125 2, 150 10 S175 18, 200 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
//   </svg>
// );

// const CurvedUnderline = ({ className }: { className?: string }) => (
//   <svg className={className} viewBox="0 0 300 18" fill="none" aria-hidden>
//     <path d="M4 9 C74 2, 148 16, 220 9 C260 5, 284 11, 296 9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
//   </svg>
// );

// const CurvedArrowRight = ({ className }: { className?: string }) => (
//   <svg className={className} viewBox="0 0 90 60" fill="none" aria-hidden>
//     <path d="M8 48 C20 48, 55 20, 76 14" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" fill="none" />
//     <path d="M68 8 L78 15 L70 24" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
//   </svg>
// );

// const DotsPattern = ({ className }: { className?: string }) => (
//   <svg className={className} viewBox="0 0 80 80" fill="none" aria-hidden>
//     {[10, 30, 50, 70].map(x => [10, 30, 50, 70].map(y => (
//       <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="currentColor" opacity="0.6" />
//     )))}
//   </svg>
// );

// const cabinetScreens = [
//   "/images/hero-dashboard.jpg",
//   "/images/hero-img1.png",
//   "/images/hero-img2.png",
//   "/images/module-img.png",
// ];



// export const MainHomePage = () => {
//   const navigate = useNavigate();
//   const { t } = useTranslation();
//   const [cabinetSlide, setCabinetSlide] = useState(0);
//   const [testimonialPage, setTestimonialPage] = useState(0);
//   const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

//   const cabinetFeatures = [
//     { icon: "📋", title: t("mainHome.cabinet.feature1Title"), desc: t("mainHome.cabinet.feature1Desc") },
//     { icon: "📝", title: t("mainHome.cabinet.feature2Title"), desc: t("mainHome.cabinet.feature2Desc") },
//     { icon: "📈", title: t("mainHome.cabinet.feature3Title"), desc: t("mainHome.cabinet.feature3Desc") },
//   ];

//   useEffect(() => {
//     const handler = () => setIsMobile(window.innerWidth < 768);
//     window.addEventListener("resize", handler);
//     return () => window.removeEventListener("resize", handler);
//   }, []);

//   return (
//     <div className="min-h-full overflow-hidden bg-white dark:bg-[#030812]">

//       {/* ─── HERO ──────────────────────────────────────────────── */}
//       <section className="relative px-4 sm:px-6 md:px-10 lg:px-12 pt-6 sm:pt-8 md:pt-12 pb-10 sm:pb-12 md:pb-20 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-[#071E1A] dark:via-[#08231E] dark:to-[#0A2C24] overflow-hidden">
//         <div className="absolute -top-24 -right-20 w-56 h-56 sm:w-72 sm:h-72 bg-emerald-300/30 dark:bg-emerald-500/20 blur-[90px] rounded-full pointer-events-none" />
//         <div className="absolute -bottom-28 -left-16 w-64 h-64 sm:w-80 sm:h-80 bg-teal-300/25 dark:bg-teal-500/20 blur-[110px] rounded-full pointer-events-none" />
//         <DotsPattern className="hidden sm:block absolute left-10 top-25 w-12 h-12 text-emerald-400/50 dark:text-emerald-300/40 pointer-events-none" />
//         <div className="absolute right-4 sm:right-10 top-6 sm:top-12 text-emerald-400/70 dark:text-emerald-300/60 text-xl sm:text-2xl pointer-events-none select-none">✦</div>
//         <WavyLine className="hidden md:block absolute right-[18%] bottom-[22%] w-20 h-4 text-teal-500/45 dark:text-teal-300/45 pointer-events-none" />
//         <div className="hidden sm:block absolute left-[12%] top-[38%] w-10 h-10 rounded-full border-2 border-dashed border-emerald-400/50 dark:border-emerald-300/40 pointer-events-none" />
//         <div className="hidden md:block absolute right-[14%] bottom-[28%] w-6 h-6 rounded-full bg-teal-400/50 dark:bg-teal-300/40 pointer-events-none" />

//         <div className="relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
//           <div>
//             <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-[11px] tracking-[0.2em] uppercase font-black text-emerald-700 dark:text-emerald-300 mb-3">
//               {t("mainHome.hero.badge")}
//             </motion.p>
//             <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05] text-slate-900 dark:text-white">
//               Business English
//               <span className="relative block w-fit">
//                 <span className="text-emerald-600 dark:text-teal-300">Tailored for Professional Success</span>
//                 <WavyLine className="absolute -bottom-2 sm:-bottom-3 left-0 w-[90%] h-4 text-emerald-500/70 dark:text-emerald-300/70" />
//               </span>
//               <span className="block text-slate-900 dark:text-white">Forward</span>
//             </motion.h1>
//             <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="relative mt-4 sm:mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
//               {t("mainHome.hero.subtitle")}
//               <CurvedUnderline className="absolute -bottom-3 left-0 w-40 h-3 text-teal-500/55 dark:text-teal-300/60" />
//             </motion.p>
//             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }} className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
//               <button onClick={() => navigate("/course")} className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-sm uppercase tracking-wider shadow-[0_12px_30px_rgba(5,150,105,0.35)] hover:scale-[1.02] hover:shadow-[0_16px_40px_rgba(5,150,105,0.45)] transition-all">
//                 {t("mainHome.hero.startLearning")}
//               </button>
//               <button onClick={() => navigate("/profile")} className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white font-black text-sm uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
//                 {t("mainHome.hero.viewProfile")}
//               </button>
//             </motion.div>
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-7 sm:mt-8 flex items-center gap-3 sm:gap-4 flex-wrap">
//               {[t("mainHome.hero.pill1"), t("mainHome.hero.pill2"), t("mainHome.hero.pill3")].map((label) => (
//                 <div key={label} className="flex items-center gap-2">
//                   <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
//                     <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
//                       <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
//                     </svg>
//                   </div>
//                   <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</span>
//                 </div>
//               ))}
//             </motion.div>
//           </div>

//           <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative flex justify-center lg:justify-end mt-4 lg:mt-0">
//             <div className="absolute -z-10 top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-emerald-300/50 dark:bg-emerald-500/35 blur-[70px]" />
//             <div className="absolute -z-10 bottom-0 left-8 w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-teal-300/40 dark:bg-teal-500/30 blur-[60px]" />
//             <CurvedArrowRight className="hidden md:block absolute left-[2%] top-[18%] w-16 h-12 text-emerald-500/55 dark:text-emerald-300/50 pointer-events-none" />
//             <motion.div initial={{ opacity: 0, scale: 0.8, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 1.0, type: "spring", stiffness: 280 }} className="hidden md:flex absolute left-[22%] top-2 bg-emerald-500 rounded-2xl w-[90px] h-[90px] flex-col items-center justify-center shadow-[0_8px_25px_rgba(16,185,129,0.5)] z-20 gap-0.5">
//               <span className="text-2xl">📚</span>
//               <p className="text-base font-black text-white leading-none">120+</p>
//               <p className="text-[10px] text-emerald-100 font-semibold">{t("mainHome.hero.modules")}</p>
//             </motion.div>
//             <motion.div initial={{ opacity: 0, scale: 0.8, x: 10 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ delay: 0.9, type: "spring", stiffness: 280 }} className="absolute -right-2 sm:-right-4 top-6 sm:top-10 bg-white dark:bg-[#06121D] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-emerald-100 dark:border-emerald-800/40 z-20">
//               <div className="flex items-center gap-0.5 mb-0.5">
//                 {[1, 2, 3, 4, 5].map(i => (
//                   <svg key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                   </svg>
//                 ))}
//               </div>
//               <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none">4.9</p>
//               <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{t("mainHome.hero.ratingFrom")}</p>
//             </motion.div>
//             <motion.div initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 1.15, type: "spring", stiffness: 260 }} className="absolute bottom-3 sm:bottom-20 left-1/2 md:left-auto md:right-80 -translate-x-1/2 bg-emerald-500 rounded-2xl px-4 py-2.5 shadow-[0_8px_30px_rgba(16,185,129,0.45)] z-20 whitespace-nowrap">
//               <div className="flex items-center gap-2.5">
//                 <div className="flex -space-x-2">
//                   {["👩", "👨", "👩‍🦱"].map((emoji, i) => (
//                     <div key={i} className="w-7 h-7 rounded-full bg-white/20 border-2 border-emerald-400 flex items-center justify-center text-sm">{emoji}</div>
//                   ))}
//                 </div>
//                 <div>
//                   <p className="text-sm font-black text-white leading-none">16 500+</p>
//                   <p className="text-[10px] text-emerald-100 font-medium">{t("mainHome.hero.students")}</p>
//                 </div>
//               </div>
//             </motion.div>
//             <div className="relative w-full max-w-[320px] sm:max-w-[400px] md:max-w-[460px] lg:max-w-[500px]">
//               <div className="absolute inset-4 rounded-full bg-emerald-400/20 dark:bg-emerald-400/15 blur-[30px] -z-10" />
//               <div className="hidden sm:flex absolute -left-6 top-[28%] flex-col gap-2 pointer-events-none">
//                 {[0, 1, 2].map(i => (
//                   <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 + i * 0.1 }} className="w-8 h-2.5 rounded-full bg-emerald-500" style={{ transform: `rotate(${-15 + i * 8}deg)` }} />
//                 ))}
//               </div>
//               <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[85%] pointer-events-none z-10">
//                 <WavyLine className="w-full h-5 text-emerald-500/40 dark:text-emerald-400/30" />
//                 <WavyLine className="w-full h-5 text-emerald-400/30 dark:text-emerald-300/20 -mt-1" />
//               </div>
//               <img src="/images/hero-img2.png" alt="Hero Image" className="w-full h-auto object-cover relative z-10" />
//             </div>
//             <div className="hidden sm:block absolute -right-1 top-[45%] text-emerald-500/60 dark:text-emerald-300/60 text-xl pointer-events-none select-none">✦</div>
//             <div className="hidden sm:block absolute left-2 bottom-[30%] text-teal-500/55 dark:text-teal-300/55 text-sm pointer-events-none select-none">✧</div>
//           </motion.div>
//         </div>
//       </section>

//       {/* ─── PERSONAL CABINET ──────────────────────────────────── */}
//       <section className="px-4 sm:px-6 md:px-10 lg:px-12 py-14 md:py-20 bg-white dark:bg-[#030812] relative overflow-hidden">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.5 }}
//           className="text-center mb-6"
//         >
//           <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
//             {t("mainHome.cabinet.title")}
//           </h2>
//           <p className="mt-3 text-base sm:text-lg text-slate-500 dark:text-slate-400">{t("mainHome.cabinet.subtitle")}</p>
//         </motion.div>

//         <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-6xl mx-auto">
//           {/* Phone Carousel */}
//           <motion.div
//             initial={{ opacity: 0, x: -30 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.6 }}
//             className="relative flex flex-col items-center"
//           >
//             <div className="relative w-[160px] sm:w-[180px] md:w-[200px] mx-auto">
//               {/* Phone frame */}
//               <div className="relative rounded-[1.5rem] border-4 border-slate-800 dark:border-slate-600 bg-slate-900 shadow-2xl overflow-hidden aspect-[9/18]">
//                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70px] h-[16px] bg-slate-800 dark:bg-slate-600 rounded-b-lg z-20" />
//                 <AnimatePresence mode="wait">
//                   <motion.img
//                     key={cabinetSlide}
//                     src={cabinetScreens[cabinetSlide]}
//                     alt={`Cabinet screen ${cabinetSlide + 1}`}
//                     initial={{ opacity: 0, x: 40 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: -40 }}
//                     transition={{ duration: 0.35 }}
//                     className="w-full h-full object-cover"
//                   />
//                 </AnimatePresence>
//               </div>
//             </div>

//             {/* Navigation arrows */}
//             <div className="flex items-center gap-6 mt-6">
//               <button
//                 onClick={() => setCabinetSlide((p) => (p === 0 ? cabinetScreens.length - 1 : p - 1))}
//                 className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
//                 aria-label="Previous"
//               >
//                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
//               </button>

//               {/* Dots */}
//               <div className="flex gap-2">
//                 {cabinetScreens.map((_, i) => (
//                   <button
//                     key={i}
//                     onClick={() => setCabinetSlide(i)}
//                     className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
//                       i === cabinetSlide
//                         ? 'bg-emerald-500 scale-125'
//                         : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
//                     }`}
//                   />
//                 ))}
//               </div>

//               <button
//                 onClick={() => setCabinetSlide((p) => (p === cabinetScreens.length - 1 ? 0 : p + 1))}
//                 className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
//                 aria-label="Next"
//               >
//                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
//               </button>
//             </div>
//           </motion.div>

//           {/* Features List */}
//           <motion.div
//             initial={{ opacity: 0, x: 30 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.6, delay: 0.15 }}
//             className="space-y-8"
//           >
//             {cabinetFeatures.map((f, idx) => (
//               <motion.div
//                 key={idx}
//                 initial={{ opacity: 0, y: 16 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ duration: 0.4, delay: idx * 0.12 }}
//                 className="flex gap-4"
//               >
//                 <div className="text-3xl shrink-0 mt-1">{f.icon}</div>
//                 <div>
//                   <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">{f.title}</h3>
//                   <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
//                 </div>
//               </motion.div>
//             ))}


//           </motion.div>
//         </div>
//       </section>

//       {/* ─── ABOUT US ──────────────────────────────────────────────── */}
//       <section className="px-4 sm:px-6 md:px-10 lg:px-12 py-12 md:py-20 bg-white dark:bg-[#030812] relative overflow-hidden">
//         <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
//           <div className="relative h-[320px] sm:h-[380px]">
//             <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="absolute left-0 top-0 w-[70%] sm:w-[65%] rounded-2xl overflow-hidden shadow-xl z-10">
//               <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=350&fit=crop" alt="Online English class" className="w-full h-48 sm:h-56 object-cover hover:scale-105 transition-transform duration-500" />
//             </motion.div>
//             <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="absolute right-0 bottom-0 w-[55%] sm:w-[50%] rounded-2xl overflow-hidden shadow-xl z-20 border-4 border-white dark:border-[#030812]">
//               <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=280&fit=crop" alt="Professional English teacher" className="w-full h-40 sm:h-48 object-cover hover:scale-105 transition-transform duration-500" />
//             </motion.div>
//             <div className="absolute -bottom-4 right-[35%] w-16 h-16 rounded-full bg-emerald-500/20 blur-xl" />
//             <div className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-dashed border-emerald-400/50" />
//           </div>
//           <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
//             <p className="text-[11px] uppercase tracking-[0.2em] font-black text-emerald-500 dark:text-emerald-400 mb-3">{t("mainHome.about.badge")}</p>
//             <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-4">
//               {t("mainHome.about.title")}
//             </h2>
//             <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
//               {t("mainHome.about.desc")}
//             </p>
//             <div className="space-y-3 mb-8">
//               {[
//                 t("mainHome.about.item1"),
//                 t("mainHome.about.item2"),
//                 t("mainHome.about.item3"),
//               ].map((item, i) => (
//                 <div key={i} className="flex items-center gap-3">
//                   <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center flex-shrink-0">
//                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
//                       <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
//                     </svg>
//                   </div>
//                   <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
//                 </div>
//               ))}
//             </div>
//             <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/course")} className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-[0_8px_25px_rgba(16,185,129,0.35)]">
//               {t("mainHome.about.button")}
//             </motion.button>
//           </motion.div>
//         </div>
//       </section>

//       {/* ─── TOP CATEGORIES ─────────────────────────────────────────────── */}
//       <section className="relative py-20 md:py-28 overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-[#0a0f1a] dark:via-[#0d1117] dark:to-[#071a14]" />
        
//         <div className="absolute top-20 left-[10%] w-72 h-72 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" />
//         <div className="absolute bottom-20 right-[15%] w-96 h-96 bg-teal-400/15 dark:bg-teal-500/10 rounded-full blur-[120px]" />
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-r from-emerald-500/5 via-transparent to-teal-500/5 rounded-full blur-[80px]" />

//         <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.5 }}
//             className="text-center mb-16"
//           >
//             <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight">
//               {t("mainHome.categories.title")}{' '}
//               <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
//                 {t("mainHome.categories.titleHighlight")}
//               </span>
//             </h2>
//             <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
//               {t("mainHome.categories.subtitle")}
//             </p>
//           </motion.div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {[
//               { name: "Business English", Icon: BriefcaseIcon, desc: "Professional communication", gradient: "from-emerald-500 to-teal-600", bgLight: "bg-emerald-50", count: "24 lessons" },
//               { name: "Grammar", Icon: PencilIcon, desc: "Build solid foundations", gradient: "from-teal-500 to-cyan-600", bgLight: "bg-teal-50", count: "18 lessons" },
//               { name: "Speaking", Icon: SpeechIcon, desc: "Fluency & confidence", gradient: "from-cyan-500 to-blue-600", bgLight: "bg-cyan-50", count: "32 lessons" },
//               { name: "Vocabulary", Icon: BookIcon, desc: "Expand your word bank", gradient: "from-blue-500 to-indigo-600", bgLight: "bg-blue-50", count: "28 lessons" },
//               { name: "Writing", Icon: PenIcon, desc: "Craft perfect texts", gradient: "from-violet-500 to-purple-600", bgLight: "bg-violet-50", count: "15 lessons" },
//               { name: "Listening", Icon: HeadphonesIcon, desc: "Understand with ease", gradient: "from-fuchsia-500 to-pink-600", bgLight: "bg-fuchsia-50", count: "20 lessons" },
//               { name: "IELTS Prep", Icon: TargetIcon, desc: "Ace your exam", gradient: "from-amber-500 to-orange-600", bgLight: "bg-amber-50", count: "12 lessons" },
//               { name: "All Lessons", Icon: RocketIcon, desc: "Explore everything", gradient: "from-rose-500 to-red-600", bgLight: "bg-rose-50", count: "149+ lessons", featured: true },
//             ].map((cat, idx) => (
//               <motion.div
//                 key={cat.name}
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ duration: 0.4, delay: idx * 0.08, ease: [0.25, 0.4, 0.25, 1] }}
//                 whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.05, ease: "easeIn" } }}
//                 onClick={() => navigate("/course")}
//                 className={`group relative cursor-pointer rounded-3xl p-6 ${cat.bgLight} dark:bg-slate-800/50 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-200 ${cat.featured ? 'sm:col-span-2 lg:col-span-1' : ''}`}
//               >
//                 <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300`} />
                
//                 <div className="relative">
//                   <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
//                     <cat.Icon className="w-7 h-7 text-white" />
//                   </div>
                  
//                   <span className="absolute top-0 right-0 px-2.5 py-1 rounded-full bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm text-[10px] font-semibold text-slate-600 dark:text-slate-300">
//                     {cat.count}
//                   </span>
//                 </div>

//                 <div className="mt-5">
//                   <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
//                     {cat.name}
//                   </h3>
//                   <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
//                     {cat.desc}
//                   </p>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ─── TESTIMONIALS ──────────────────────────────────────────────── */}
//       <section className="px-4 sm:px-6 md:px-10 lg:px-12 py-12 md:py-16 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-[#0d1117] dark:via-[#0a0f1a] dark:to-[#071a14] relative overflow-hidden">
//         <div className="absolute top-0 left-1/4 w-72 h-72 bg-emerald-400/10 dark:bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />
//         <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-400/8 dark:bg-teal-500/6 rounded-full blur-[120px] pointer-events-none" />

//         <div className="relative z-10">
//           <div className="text-center mb-10">
//             <p className="text-[11px] uppercase tracking-[0.2em] font-black text-emerald-500 dark:text-emerald-400 mb-2">{t("mainHome.testimonials.badge")}</p>
//             <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
//               {t("mainHome.testimonials.title")}
//             </h2>
//           </div>

//           {(() => {
//             const allTestimonials = [
//               { name: "Олександр Петренко", role: "IT Project Manager", quote: "За 3 місяці навчання мій рівень англійського виріс з Intermediate до Upper-Intermediate. Тепер впевнено веду зустрічі з міжнародними клієнтами.", avatar: "👨‍💼" },
//               { name: "Марія Коваленко", role: "Marketing Director", quote: "Курс Business English повністю змінив мій підхід до робочої комунікації. Раніше боялася телефонних дзвінків іноземцям, а тепер проводила презентацію для 50 людей з Лондона.", avatar: "👩‍💼" },
//               { name: "Андрій Шевченко", role: "Software Engineer", quote: "Структурована програма з практичними завданнями — це саме те, що потрібно для розробників. Відеоуроки з технічною англійською та інтерактивні тести зробили навчання цікавим.", avatar: "👨‍💻" },
//               { name: "Олена Бондаренко", role: "HR Manager", quote: "Завдяки курсу я нарешті почала читати оригінальну англійську документацію без перекладача. Викладачі дуже уважні до потреб кожного студента.", avatar: "👩‍🦱" },
//               { name: "Дмитро Іванченко", role: "Financial Analyst", quote: "Пройшов курс Business English за 4 місяці. Тепер веду переговори з іноземними партнерами самостійно. Рекомендую всім, хто хоче зростати в кар'єрі.", avatar: "👨‍💼" },
//               { name: "Наталія Сергієнко", role: "UX Designer", quote: "English School допомогла мені підготуватися до співбесіди в міжнародній компанії. Отримала офер! Дякую всій команді за підтримку і відмінну програму.", avatar: "👩‍💼" },
//               { name: "Ігор Мельник", role: "Product Manager", quote: "Інтерактивні тести та відеоуроки — відмінний формат для зайнятих людей. Навчаюся у вільний час і вже відчуваю реальний прогрес у читанні та письмі.", avatar: "👨‍🎓" },
//             ];
//             const perPage = isMobile ? 1 : 3;
//             const totalPages = Math.ceil(allTestimonials.length / perPage);
//             const page = testimonialPage % totalPages;
//             const visible = allTestimonials.slice(page * perPage, page * perPage + perPage);
//             return (
//               <>
//                 <div className="h-[280px] md:h-[220px]">
//                 <AnimatePresence mode="wait">
//                   <motion.div
//                     key={page}
//                     initial={{ opacity: 0, x: 30 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: -30 }}
//                     transition={{ duration: 0.35 }}
//                     className={`grid gap-5 max-w-5xl mx-auto h-full items-stretch ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}
//                   >
//                     {visible.map((t) => (
//                       <div
//                         key={t.name}
//                         className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:border-emerald-400/50 dark:hover:border-emerald-500/30 shadow-sm hover:shadow-md transition-all flex flex-col h-full"
//                       >
//                         <div className="flex items-center gap-3 mb-4">
//                           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl shrink-0">
//                             {t.avatar}
//                           </div>
//                           <div>
//                             <p className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</p>
//                             <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
//                           </div>
//                           <span className="ml-auto text-2xl text-emerald-500 dark:text-emerald-400 shrink-0">❝</span>
//                         </div>
//                         <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{t.quote}</p>
//                       </div>
//                     ))}
//                   </motion.div>
//                 </AnimatePresence>
//                 </div>

//                 <div className="flex items-center justify-center gap-3 mt-8">
//                   <button
//                     onClick={() => setTestimonialPage(p => (p - 1 + totalPages) % totalPages)}
//                     className="w-8 h-8 rounded-full border border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
//                   >
//                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
//                   </button>
//                   {Array.from({ length: totalPages }).map((_, i) => (
//                     <button
//                       key={i}
//                       onClick={() => setTestimonialPage(i)}
//                       className={`rounded-full transition-all duration-300 ${i === page ? 'w-6 h-2.5 bg-emerald-500' : 'w-2.5 h-2.5 bg-slate-300 dark:bg-white/20 hover:bg-slate-400 dark:hover:bg-white/40'}`}
//                     />
//                   ))}
//                   <button
//                     onClick={() => setTestimonialPage(p => (p + 1) % totalPages)}
//                     className="w-8 h-8 rounded-full border border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
//                   >
//                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
//                   </button>
//                 </div>
//               </>
//             );
//           })()}
//         </div>
//       </section>

//       {/* ─── SERVICES / PLANS ────────────────────────────────────────────── */}
//       <section className="px-4 sm:px-6 md:px-10 lg:px-12 py-12 md:py-16 bg-white dark:bg-[#030812] relative overflow-hidden">
//         <div className="text-center mb-10">
//           <p className="text-[11px] uppercase tracking-[0.2em] font-black text-emerald-500 dark:text-emerald-400 mb-2">{t("mainHome.pricing.badge")}</p>
//           <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white relative inline-block">
//             {t("mainHome.pricing.title")}
//             <CurvedUnderline className="absolute -bottom-3 left-0 w-full h-3 text-emerald-400/60" />
//           </h2>
//         </div>

//         <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
//           {[
//             { title: t("mainHome.pricing.starter.title"), price: t("mainHome.pricing.starter.price"), desc: t("mainHome.pricing.starter.desc"), bg: "bg-slate-100 dark:bg-slate-800/50", border: "border-slate-200 dark:border-slate-700/50", features: [t("mainHome.pricing.starter.f1"), t("mainHome.pricing.starter.f2"), t("mainHome.pricing.starter.f3")] },
//             { title: t("mainHome.pricing.basic.title"), price: "$9.99", period: t("mainHome.pricing.basic.period"), desc: t("mainHome.pricing.basic.desc"), bg: "bg-emerald-500", border: "border-emerald-600", textLight: true, popular: true, features: [t("mainHome.pricing.basic.f1"), t("mainHome.pricing.basic.f2"), t("mainHome.pricing.basic.f3"), t("mainHome.pricing.basic.f4")] },
//             { title: t("mainHome.pricing.pro.title"), price: "$19.99", period: t("mainHome.pricing.pro.period"), desc: t("mainHome.pricing.pro.desc"), bg: "bg-slate-900", border: "border-slate-800", textLight: true, features: [t("mainHome.pricing.pro.f1"), t("mainHome.pricing.pro.f2"), t("mainHome.pricing.pro.f3"), t("mainHome.pricing.pro.f4")] },
//             { title: t("mainHome.pricing.enterprise.title"), price: t("mainHome.pricing.enterprise.price"), desc: t("mainHome.pricing.enterprise.desc"), bg: "bg-slate-100 dark:bg-slate-800/50", border: "border-slate-200 dark:border-slate-700/50", features: [t("mainHome.pricing.enterprise.f1"), t("mainHome.pricing.enterprise.f2"), t("mainHome.pricing.enterprise.f3"), t("mainHome.pricing.enterprise.f4")] },
//           ].map((plan, idx) => (
//             <motion.div
//               key={plan.title}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.4, delay: idx * 0.1 }}
//               whileHover={{ y: -4 }}
//               className={`${plan.bg} ${plan.border} border rounded-2xl p-6 relative overflow-hidden group cursor-pointer flex flex-col`}
//             >
//               {plan.popular && (
//                 <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-[10px] font-black px-3 py-1 rounded-bl-lg">
//                   {t("mainHome.pricing.popular")}
//                 </div>
//               )}
//               <div className="relative z-10 flex flex-col h-full">
//                 <p className={`text-lg font-black mb-1 ${plan.textLight ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
//                   {plan.title}
//                 </p>
//                 <div className="flex items-baseline gap-1 mb-2">
//                   <span className={`text-3xl font-black ${plan.textLight ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
//                     {plan.price}
//                   </span>
//                   {plan.period && (
//                     <span className={`text-sm ${plan.textLight ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
//                       {plan.period}
//                     </span>
//                   )}
//                 </div>
//                 <p className={`text-xs mb-4 ${plan.textLight ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
//                   {plan.desc}
//                 </p>
//                 <ul className="space-y-2 mb-6 flex-grow">
//                   {plan.features.map((feature, i) => (
//                     <li key={i} className={`flex items-center gap-2 text-xs ${plan.textLight ? 'text-white/80' : 'text-slate-600 dark:text-slate-300'}`}>
//                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={plan.textLight ? 'text-white' : 'text-emerald-500'}>
//                         <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//                       </svg>
//                       {feature}
//                     </li>
//                   ))}
//                 </ul>
//                 <button 
//                   onClick={() => navigate("/course")}
//                   className={`w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
//                     plan.textLight 
//                       ? 'bg-white text-emerald-600 hover:bg-white/90' 
//                       : 'bg-emerald-600 text-white hover:bg-emerald-700'
//                   }`}
//                 >
//                   {t("mainHome.pricing.getStarted")}
//                 </button>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </section>

//       {/* ─── FOOTER ──────────────────────────────────────────────── */}
//       <footer className="bg-slate-900 dark:bg-black text-white relative overflow-hidden">
//         <div className="absolute inset-0">
//           <div className="absolute top-0 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px]" />
//           <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/8 rounded-full blur-[140px]" />
//         </div>

//         <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
//           {/* Top section */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
//             {/* Brand */}
//             <div className="lg:col-span-1">
//               <div className="flex items-center gap-2 mb-4">
//                 <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
//                   <span className="text-white font-black text-sm">F</span>
//                 </div>
//                 <span className="text-xl font-black">English School</span>
//               </div>
//               <p className="text-sm text-slate-400 leading-relaxed mb-5">
//                 {t("mainHome.footer.brand")}
//               </p>
//               <div className="flex gap-3">
//                 {[
//                   { label: "Instagram", path: "M7.8 2h8.4C19 2 22 5 22 7.8v8.4A5.8 5.8 0 0116.2 22H7.8C5 22 2 19 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6z" },
//                   { label: "Telegram", path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" },
//                   { label: "Facebook", path: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" },
//                 ].map((social) => (
//                   <a
//                     key={social.label}
//                     href="#"
//                     aria-label={social.label}
//                     className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-emerald-500 flex items-center justify-center transition-colors duration-300 group"
//                   >
//                     <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-slate-400 group-hover:text-white transition-colors">
//                       <path d={social.path} />
//                     </svg>
//                   </a>
//                 ))}
//               </div>
//             </div>

//             {/* Quick Links */}
//             <div>
//               <h4 className="font-bold text-sm uppercase tracking-wider text-white mb-4">{t("mainHome.footer.nav")}</h4>
//               <ul className="space-y-2.5">
//                 {(t("mainHome.footer.navLinks", { returnObjects: true }) as string[]).map((link) => (
//                   <li key={link}>
//                     <a href="#" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200">
//                       {link}
//                     </a>
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {/* Contact */}
//             <div>
//               <h4 className="font-bold text-sm uppercase tracking-wider text-white mb-4">{t("mainHome.footer.contact")}</h4>
//               <ul className="space-y-3">
//                 <li className="flex items-start gap-2.5">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500 mt-0.5 shrink-0"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
//                   <span className="text-sm text-slate-400">hello@friends.school</span>
//                 </li>
//                 <li className="flex items-start gap-2.5">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500 mt-0.5 shrink-0"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
//                   <span className="text-sm text-slate-400">+380 (67) 123-45-67</span>
//                 </li>
//                 <li className="flex items-start gap-2.5">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500 mt-0.5 shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
//                   <span className="text-sm text-slate-400">Київ, Україна</span>
//                 </li>
//               </ul>
//             </div>
//           </div>

//           {/* Divider */}
//           <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-6" />

//           {/* Bottom */}
//           <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//             <p className="text-xs text-slate-500">
//               © {new Date().getFullYear()} English School. {t("mainHome.footer.rights")}
//             </p>
//             <div className="flex gap-6">
//               {[t("mainHome.footer.privacy"), t("mainHome.footer.terms")].map((link) => (
//                 <a key={link} href="#" className="text-xs text-slate-500 hover:text-emerald-400 transition-colors">
//                   {link}
//                 </a>
//               ))}
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };