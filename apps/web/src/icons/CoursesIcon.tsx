export const CoursesIcon = ({ size = 24 }: { size?: number }) => {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <style>{`
        .courses-closed {
          position: absolute; inset: 0;
          transition: opacity 0.3s ease, transform 0.35s ease;
          opacity: 1; transform: scale(1);
        }
        .courses-open {
          position: absolute; inset: 0;
          transition: opacity 0.3s ease, transform 0.35s ease;
          opacity: 0; transform: scale(0.8);
        }
        .nav-item:hover .courses-closed { opacity: 0; transform: scale(0.8); }
        .nav-item:hover .courses-open   { opacity: 1; transform: scale(1); }

        .open-page-left {
          transform-origin: 50% 50%;
          transform: perspective(100px) rotateY(25deg) scaleX(0.7);
          transition: transform 0.4s cubic-bezier(0.34,1.1,0.64,1) 0.1s;
        }
        .open-page-right {
          transform-origin: 50% 50%;
          transform: perspective(100px) rotateY(-25deg) scaleX(0.7);
          transition: transform 0.4s cubic-bezier(0.34,1.1,0.64,1) 0.15s;
        }
        .nav-item:hover .open-page-left  { transform: perspective(100px) rotateY(0deg) scaleX(1); }
        .nav-item:hover .open-page-right { transform: perspective(100px) rotateY(0deg) scaleX(1); }

        .open-line {
          stroke-dasharray: 10;
          stroke-dashoffset: 10;
          transition: stroke-dashoffset 0.25s ease;
        }
        .open-line-1 { transition-delay: 0.30s; }
        .open-line-2 { transition-delay: 0.36s; }
        .open-line-3 { transition-delay: 0.42s; }
        .open-line-4 { transition-delay: 0.33s; }
        .open-line-5 { transition-delay: 0.39s; }
        .nav-item:hover .open-line { stroke-dashoffset: 0; }
      `}</style>

      {/* CLOSED */}
      <svg className="courses-closed" width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="8.5" y1="7"  x2="16" y2="7"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="8.5" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="8.5" y1="15" x2="13" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>

      {/* OPEN */}
      <svg className="courses-open" width={size} height={size} viewBox="0 0 28 28" fill="none">
        <g className="open-page-left">
          <path d="M14 8 C12 8 8.5 8.5 5 10 L5 22 C8.5 20.8 12 20.5 14 20.5 Z"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <line className="open-line open-line-1" x1="6.5" y1="13"  x2="12.5" y2="12.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          <line className="open-line open-line-2" x1="6.5" y1="16"  x2="12.5" y2="15.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          <line className="open-line open-line-3" x1="6.5" y1="19"  x2="11"   y2="18.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </g>
        <g className="open-page-right">
          <path d="M14 8 C16 8 19.5 8.5 23 10 L23 22 C19.5 20.8 16 20.5 14 20.5 Z"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <line className="open-line open-line-4" x1="15.5" y1="12.3" x2="21.5" y2="13"  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          <line className="open-line open-line-5" x1="15.5" y1="15.3" x2="21.5" y2="16"  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </g>
        <line x1="14" y1="8" x2="14" y2="20.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    </div>
  );
};