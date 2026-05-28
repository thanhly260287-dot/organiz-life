interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 36, showText = true, className = "" }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Organiz-Life"
      >
        <defs>
          <linearGradient id="ol-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#56CCF2" />
            <stop offset="1" stopColor="#9B51E0" />
          </linearGradient>
        </defs>
        {/* fond arrondi */}
        <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#ol-grad)" />

        {/* étoile / potentiel */}
        <path
          d="M24 6 L25.8 12.2 L32 12.2 L27 16.2 L28.8 22.4 L24 18.4 L19.2 22.4 L21 16.2 L16 12.2 L22.2 12.2 Z"
          fill="#FFD700"
          opacity="0.95"
        />

        {/* tête */}
        <circle cx="24" cy="26" r="3.5" fill="white" />

        {/* corps — ligne fine élégante */}
        <path
          d="M24 29.5 L24 37"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* bras gauche levé vers l'étoile */}
        <path
          d="M24 31.5 L18 24"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* main gauche */}
        <circle cx="18" cy="24" r="1.6" fill="white" />

        {/* bras droit levé vers l'étoile */}
        <path
          d="M24 31.5 L30 24"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* main droite */}
        <circle cx="30" cy="24" r="1.6" fill="white" />

        {/* jambe gauche */}
        <path
          d="M24 37 L19.5 43"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* jambe droite */}
        <path
          d="M24 37 L28.5 43"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <span className="font-display font-bold text-xl tracking-tight">
          Organiz<span className="text-gradient">-Life</span>
        </span>
      )}
    </div>
  );
}

