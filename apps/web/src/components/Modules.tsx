  import modules from "../data/modules.json";
  import { motion } from "framer-motion";

  const difficultyConfig = {
    Beginner: {
      label: "Початківець",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    Intermediate: {
      label: "Середній",
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    Advanced: {
      label: "Просунутий",
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
  };

  export const Modules = () => {
    return (
      <section className="px-2">
        {/* Header */}
        <div className="mb-10 px-1">
          <motion.p 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-xs font-bold tracking-[0.2em] uppercase text-emerald-400 mb-2">
            Course
          </motion.p>

          <div className="flex items-end justify-between gap-4">
            <div>
              <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                English{" "}
                <span className="relative">
                  <span className="text-emerald-500">IELTS</span>
                  {/* animated underline */}
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-[3px] 
              bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full"
                  />
                </span>
              </motion.h2>

              <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mt-2">
                <p className="text-gray-400 text-lg font-medium tracking-wide">
                  from <span className="text-gray-600 font-semibold">zero</span>{" "}
                  to <span className="text-gray-600 font-semibold">hero</span>
                </p>
                {/* decorative dots */}
                <div className="flex gap-1 pb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-300" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-200" />
                </div>
              </motion.div>
            </div>

            {/* right side: module count badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="flex-shrink-0 flex flex-col items-center justify-center 
        w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100"
            >
              <span className="text-2xl font-extrabold text-emerald-500 leading-none">
                12
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 tracking-wide">
                modules
              </span>
            </motion.div>
          </div>

          {/* thin decorative line */}
          <div className="mt-5 h-px bg-gradient-to-r from-emerald-100 via-teal-100 to-transparent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => {
            const diff =
              difficultyConfig[
                module.difficulty as keyof typeof difficultyConfig
              ];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.1 }}
                className="group flex flex-col bg-white border border-gray-100 rounded-2xl 
                  overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 
                  transition-all duration-300 cursor-pointer"
              >
                {/* Image */}
                <div className="relative overflow-hidden h-48">
                  <img
                    src={module.img}
                    alt={module.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Module number badge */}
                  <div
                    className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm 
                    text-xs font-bold text-gray-500 px-2 py-1 rounded-full"
                  >
                    МОДУЛЬ {index + 1}
                  </div>
                  {/* Difficulty badge */}
                  <div
                    className={`absolute top-3 right-3 text-xs font-semibold 
                    px-2.5 py-1 rounded-full border backdrop-blur-sm bg-white/90 ${diff.color}`}
                  >
                    {diff.label}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-5">
                  <h3
                    className="text-lg font-bold text-gray-900 mb-1.5 group-hover:text-emerald-600 
                    transition-colors duration-200"
                  >
                    {module.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1">
                    {module.description}
                  </p>

                  {/* Divider */}
                  <div className="border-t border-gray-100 mt-4 pt-4">
                    <div className="flex items-center justify-between">
                      {/* Duration */}
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          />
                          <path
                            d="M12 7v5l3 3"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="text-xs font-medium">
                          {module.duration}
                        </span>
                      </div>

                      {/* XP */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-xs font-extrabold text-white inline-flex items-center 
                          justify-center bg-emerald-400 rounded-full w-5 h-5 leading-none tracking-tight"
                        >
                          xp
                        </span>
                        <span className="text-sm font-bold text-emerald-600">
                          +{module.xp}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    );
  };
