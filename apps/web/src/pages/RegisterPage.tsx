import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { register, clearError } from "../store/authSlice";

const inputCls = `w-full px-4 py-3 rounded-xl
  border border-slate-200 dark:border-slate-700
  bg-white dark:bg-slate-900
  text-slate-800 dark:text-slate-200
  text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600
  focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400
  transition-all duration-200`;

const labelCls = "block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5";

export const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (token) navigate("/", { replace: true });
    return () => { dispatch(clearError()); };
  }, [token, navigate, dispatch]);

  const handleSubmit = () => {
    setValidationError(null);
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setValidationError("Заповніть усі поля");
      return;
    }
    if (form.password.length < 8) {
      setValidationError("Пароль має містити мінімум 8 символів");
      return;
    }
    if (form.password !== form.confirm) {
      setValidationError("Паролі не співпадають");
      return;
    }
    dispatch(register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password }));
  };

  const displayError = validationError ?? error;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
            bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-emerald-500/30 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="8.5" y1="7" x2="16" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="8.5" y1="11" x2="16" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Створити акаунт
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Почніть навчання вже сьогодні
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">

          {displayError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20
                border border-rose-100 dark:border-rose-800/40 rounded-xl mb-4"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <circle cx="12" cy="12" r="9" stroke="#ef4444" strokeWidth="1.8"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{displayError}</p>
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Ім'я</label>
                <input className={inputCls} type="text" placeholder="Артем"
                  value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}/>
              </div>
              <div>
                <label className={labelCls}>Прізвище</label>
                <input className={inputCls} type="text" placeholder="Іваненко"
                  value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}/>
              </div>
            </div>

            <div>
              <label className={labelCls}>Email</label>
              <div className="relative">
                <input className={inputCls + " pl-10"} type="email" placeholder="artem@example.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/>
                <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round"/>
                  <polyline points="22,6 12,13 2,6" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <div>
              <label className={labelCls}>Пароль</label>
              <div className="relative">
                <input className={inputCls + " pl-10 pr-11"} type={showPassword ? "text" : "password"} placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}/>
                <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="#94a3b8" strokeWidth="1.6"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                <button onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.6"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className={labelCls}>Підтвердження пароля</label>
              <div className="relative">
                <input className={inputCls + " pl-10"} type="password" placeholder="••••••••"
                  value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}/>
                <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="#94a3b8" strokeWidth="1.6"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-6 w-full h-12 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600
              text-white font-bold text-sm tracking-wide
              hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5
              active:translate-y-0 transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
              flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10"/>
              </svg>
            ) : "Зареєструватися"}
          </button>
        </div>

        <p className="text-center text-sm text-slate-400 dark:text-slate-500 mt-4">
          Вже є акаунт?{" "}
          <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
            Увійти
          </Link>
        </p>
      </motion.div>
    </div>
  );
};