export default function Mascot() {
  return (
    <svg className="mascot" viewBox="0 0 120 140" aria-hidden="true">
      <defs>
        <linearGradient id="flame-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff8a3d" />
          <stop offset="0.45" stopColor="#ff5a2b" />
          <stop offset="1" stopColor="#e9212e" />
        </linearGradient>
        <linearGradient id="flame-inner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="1" stopColor="#ffb347" />
        </linearGradient>
      </defs>
      {/* legs */}
      <g stroke="#20242c" strokeWidth="7" strokeLinecap="round">
        <path d="M48 112 L46 128" />
        <path d="M70 112 L72 128" />
      </g>
      <ellipse cx="44" cy="131" rx="10" ry="5" fill="#20242c" />
      <ellipse cx="74" cy="131" rx="10" ry="5" fill="#20242c" />
      {/* waving arm */}
      <g className="mascot-arm">
        <path d="M88 78 Q104 66 106 48" stroke="#ff8a3d" strokeWidth="9" fill="none" strokeLinecap="round" />
        <circle cx="107" cy="44" r="9" fill="#ffd23f" />
        <path d="M103 36 L103 30 M108 35 L110 29 M112 38 L116 33" stroke="#ffd23f" strokeWidth="4" strokeLinecap="round" />
      </g>
      {/* left arm */}
      <path d="M32 80 Q18 84 14 94" stroke="#ff8a3d" strokeWidth="9" fill="none" strokeLinecap="round" />
      <circle cx="13" cy="97" r="8" fill="#ffd23f" />
      {/* flame body */}
      <path
        d="M60 6 C64 22 78 26 84 40 C92 56 92 78 84 94 C76 110 66 116 60 116 C54 116 44 110 36 94 C28 78 28 56 36 40 C42 26 56 22 60 6 Z"
        fill="url(#flame-body)"
      />
      <path
        d="M60 34 C63 44 72 48 76 58 C81 70 80 86 74 96 C69 105 63 108 60 108 C57 108 51 105 46 96 C40 86 39 70 44 58 C48 48 57 44 60 34 Z"
        fill="url(#flame-inner)"
      />
      {/* face */}
      <g>
        <ellipse cx="50" cy="66" rx="6" ry="8" fill="#20242c" />
        <ellipse cx="70" cy="66" rx="6" ry="8" fill="#20242c" />
        <circle cx="52" cy="63" r="2" fill="#fff" />
        <circle cx="72" cy="63" r="2" fill="#fff" />
        <path d="M50 82 Q60 92 70 82" stroke="#20242c" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M55 84 Q60 88 65 84 L65 86 Q60 90 55 86 Z" fill="#ff3b30" />
      </g>
      {/* sparks */}
      <g className="mascot-sparks" fill="#ffd23f">
        <circle cx="30" cy="26" r="3" />
        <circle cx="92" cy="20" r="2.5" />
        <circle cx="62" cy="0" r="2" />
      </g>
    </svg>
  );
}