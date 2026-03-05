export const ChatsIcon = ({ size = 24 }: { size?: number }) => {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <style>{`
        .chats-closed {
          position: absolute; inset: 0;
          transition: opacity 0.3s ease, transform 0.3s ease;
          opacity: 1; transform: scale(1);
        }
        .chats-open {
          position: absolute; inset: 0;
          transition: opacity 0.3s ease, transform 0.3s ease;
          opacity: 0; transform: scale(0.85) translateY(3px);
        }
        .nav-item:hover .chats-closed { opacity: 0; transform: scale(0.85) translateY(3px); }
        .nav-item:hover .chats-open   { opacity: 1; transform: scale(1) translateY(0); }

        .chat-top-bubble {
          transform: translateY(6px);
          opacity: 0;
          transition: transform 0.4s cubic-bezier(0.34,1.4,0.64,1) 0.1s, opacity 0.3s ease 0.1s;
        }
        .nav-item:hover .chat-top-bubble { transform: translateY(0); opacity: 1; }
      `}</style>

      {/* CLOSED: two overlapping bubbles */}
      <svg className="chats-closed" width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M14.86,5.3H5.32A3.81,3.81,0,0,0,1.5,9.11v5.73a3.82,3.82,0,0,0,3.82,3.82H7.23l2.86,2.86L13,18.66h1.91a3.82,3.82,0,0,0,3.82-3.82V9.11A3.81,3.81,0,0,0,14.86,5.3Z"
          stroke="currentColor" strokeWidth="1.91" strokeMiterlimit="10"/>
        <path d="M18.68,14.84A3.82,3.82,0,0,0,22.5,11V5.3a3.82,3.82,0,0,0-3.82-3.82H9.14A3.82,3.82,0,0,0,5.32,5.3"
          stroke="currentColor" strokeWidth="1.91" strokeMiterlimit="10"/>
        <line x1="5.32" y1="11.98" x2="7.23"  y2="11.98" stroke="currentColor" strokeWidth="1.91" strokeMiterlimit="10"/>
        <line x1="9.14" y1="11.98" x2="11.05" y2="11.98" stroke="currentColor" strokeWidth="1.91" strokeMiterlimit="10"/>
        <line x1="12.95" y1="11.98" x2="14.86" y2="11.98" stroke="currentColor" strokeWidth="1.91" strokeMiterlimit="10"/>
      </svg>

      {/* OPEN: small bubble top + main bubble bottom */}
      <svg className="chats-open" width={size} height={size} viewBox="0 0 24 24" fill="none">
        <g className="chat-top-bubble">
          <path d="M8 3 H16 A2.5 2.5 0 0 1 18.5 5.5 v3 A2.5 2.5 0 0 1 16 11 H8 A2.5 2.5 0 0 1 5.5 8.5 v-3 A2.5 2.5 0 0 1 8 3 Z"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <rect x="4" y="13" width="16" height="9" rx="3"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9"  cy="17.5" r="0.9" fill="currentColor"/>
        <circle cx="12" cy="17.5" r="0.9" fill="currentColor"/>
        <circle cx="15" cy="17.5" r="0.9" fill="currentColor"/>
      </svg>
    </div>
  );
};