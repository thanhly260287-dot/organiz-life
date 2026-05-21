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
        <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#ol-grad)" />
        {/* ascending bars + arrow */}
        <rect x="11" y="28" width="5" height="9" rx="1.5" fill="white" opacity="0.85" />
        <rect x="19" y="22" width="5" height="15" rx="1.5" fill="white" opacity="0.9" />
        <rect x="27" y="16" width="5" height="21" rx="1.5" fill="white" />
        <path d="M11 14 L20 14 L20 9 L30 17 L20 25 L20 20 L11 20 Z" fill="white" opacity="0.95" transform="rotate(-12 22 17)" />
      </svg>
      {showText && (
        <span className="font-display font-bold text-xl tracking-tight">
          Organiz<span className="text-gradient">-Life</span>
        </span>
      )}
    </div>
  );
}
