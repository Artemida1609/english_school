export const LanguageIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="circle-clip">
        <circle cx="12" cy="12" r="8.25"/>
      </clipPath>
    </defs>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <g clipPath="url(#circle-clip)">
      <path d="M12 3C12 3 9.5 7 9.5 12C9.5 17 12 21 12 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 3C12 3 14.5 7 14.5 12C14.5 17 12 21 12 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3" y1="15" x2="21" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </g>
  </svg>
);