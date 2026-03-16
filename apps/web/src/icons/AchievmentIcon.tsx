import { FireIcon } from "./FireIcon";
import { CoinIcon } from "./CoinIcon";

export const AchievementIcon = ({ type, locked }: { type: string; locked: boolean }) => {
  const color = locked ? "#94a3b8" : undefined
  const props = { width: 28, height: 28, viewBox: "0 0 24 24", fill: "none" as const }

  if (type === "trophy") return (
    <svg {...props}>
      <path d="M8 21h8M12 17v4M7 4H4v3a3 3 0 0 0 3 3M17 4h3v3a3 3 0 0 1-3 3" stroke={color ?? "#f59e0b"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 4h10v6a5 5 0 0 1-10 0V4z" stroke={color ?? "#f59e0b"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (type === "fire") return (
    <FireIcon />
  )
  if (type === "bolt") return (
    <svg {...props}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color ?? "#f97316"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (type === "book") return (
    <svg {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke={color ?? "#0ea5e9"} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke={color ?? "#0ea5e9"} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="8.5" y1="7" x2="16" y2="7" stroke={color ?? "#0ea5e9"} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="8.5" y1="11" x2="16" y2="11" stroke={color ?? "#0ea5e9"} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
  if (type === "graduation") return (
    <svg {...props}>
      <path d="M22 10L12 5 2 10l10 5 10-5z" stroke={color ?? "#8b5cf6"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" stroke={color ?? "#8b5cf6"} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="22" y1="10" x2="22" y2="15" stroke={color ?? "#8b5cf6"} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
  if (type === "diamond") return (
    <svg {...props}>
      <path d="M6 3h12l4 6-10 12L2 9z" stroke={color ?? "#06b6d4"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 9h20M6 3l4 6m4 0l4-6" stroke={color ?? "#06b6d4"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (type === "star") return (
    <svg {...props}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color ?? "#eab308"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (type === "rocket") return (
    <svg {...props}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" stroke={color ?? "#10b981"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" stroke={color ?? "#10b981"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 12H4s.55-3.03 2-4h5M12 15v5s3.03-.55 4-2v-5" stroke={color ?? "#10b981"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (type === "coin") return (
    <CoinIcon size={28} className={locked ? "" : ""} />
  )
  return null
}