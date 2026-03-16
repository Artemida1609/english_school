export const ModulesIcon = ({ size = 24 }: { size?: number }) => {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <style>{`
        .modules-closed {
          position: absolute; inset: 0;
          transition: opacity 0.3s ease, transform 0.3s ease;
          opacity: 1; transform: scale(1);
        }
        .modules-open {
          position: absolute; inset: 0;
          transition: opacity 0.3s ease, transform 0.3s ease;
          opacity: 0; transform: scale(0.85);
        }
        .nav-item:hover .modules-closed { opacity: 0; transform: scale(0.85); }
        .nav-item:hover .modules-open   { opacity: 1; transform: scale(1); }

        .mod-row {
          stroke-dasharray: 14;
          stroke-dashoffset: 14;
          transition: stroke-dashoffset 0.3s ease;
        }
        .mod-row-1 { transition-delay: 0.05s; }
        .mod-row-2 { transition-delay: 0.12s; }
        .mod-row-3 { transition-delay: 0.19s; }
        .nav-item:hover .mod-row { stroke-dashoffset: 0; }

        .mod-dot {
          transform: scale(0);
          transform-origin: center;
          transition: transform 0.25s cubic-bezier(0.34,1.4,0.64,1);
        }
        .mod-dot-1 { transition-delay: 0.08s; }
        .mod-dot-2 { transition-delay: 0.15s; }
        .mod-dot-3 { transition-delay: 0.22s; }
        .nav-item:hover .mod-dot { transform: scale(1); }
      `}</style>

      {/* CLOSED: сітка з 4 блоків */}
      <svg className="modules-closed" width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="3"  y="3"  width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <rect x="13" y="3"  width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <rect x="3"  y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>

      {/* OPEN: список рядків з крапками */}
      <svg className="modules-open" width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Row 1 */}
        <circle className="mod-dot mod-dot-1" cx="4.5" cy="7" r="1.8" fill="currentColor"/>
        <line className="mod-row mod-row-1" x1="8.5" y1="7" x2="21" y2="7"
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>

        {/* Row 2 */}
        <circle className="mod-dot mod-dot-2" cx="4.5" cy="12" r="1.8" fill="currentColor"/>
        <line className="mod-row mod-row-2" x1="8.5" y1="12" x2="21" y2="12"
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>

        {/* Row 3 */}
        <circle className="mod-dot mod-dot-3" cx="4.5" cy="17" r="1.8" fill="currentColor"/>
        <line className="mod-row mod-row-3" x1="8.5" y1="17" x2="17" y2="17"
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    </div>
  );
};