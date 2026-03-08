export const ProgressIcon = ({ type, color, size = 18 }: { type: string; color: string; size?: number }) => {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none" }
  if (type === "clipboard") return (
    <svg {...props}>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <rect x="9" y="3" width="6" height="4" rx="1.5" stroke={color} strokeWidth="1.8"/>
      <line x1="9" y1="12" x2="15" y2="12" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="9" y1="16" x2="13" y2="16" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
  if (type === "chat") return (
    <svg {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="9" y1="10" x2="15" y2="10" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
  if (type === "target") return (
    <svg {...props}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" strokeDasharray="2.5 3.2"/>
      <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.8" strokeDasharray="2 2.8"/>
      <circle cx="12" cy="12" r="2" stroke={color} strokeWidth="1.8"/>
    </svg>
  )
  if (type === "bolt") return (
    <svg {...props}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  return null
}