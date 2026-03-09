import { useNavigate } from "react-router-dom"

export const BackButton = ({ title }: { title: string }) => {
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={() => navigate(-1)}
        className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800
          flex items-center justify-center text-slate-500 dark:text-slate-400
          hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20
          transition-all duration-200"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <h1 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h1>
    </div>
  )
}