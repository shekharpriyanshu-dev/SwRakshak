import React from 'react';

interface SwRakshakLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  showName?: boolean;
  nameInSmall?: boolean;
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const SwRakshakLogoIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-[0_0_12px_rgba(34,211,238,0.35)] ${className}`}
    >
      <defs>
        <linearGradient id="logoBgGrad" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0c1726" />
          <stop offset="100%" stopColor="#08101a" />
        </linearGradient>
        <linearGradient id="cyanTealGrad" x1="40" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="swooshGrad" x1="10" y1="100" x2="190" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a5f3fc" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="maskGrad" x1="50" y1="40" x2="80" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0e7490" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Background Rounded Shield / Pill Container */}
      <rect
        x="6"
        y="6"
        width="188"
        height="188"
        rx="28"
        fill="url(#logoBgGrad)"
        stroke="#22d3ee"
        strokeWidth="1.5"
        strokeOpacity="0.25"
      />

      {/* Subtle Blueprint Grid Pattern Background */}
      <path
        d="M6 50 H194 M6 100 H194 M6 150 H194 M50 6 V194 M100 6 V194 M150 6 V194"
        stroke="#22d3ee"
        strokeWidth="0.5"
        strokeOpacity="0.08"
      />

      {/* Medical Cross Symbol in Top Right */}
      <g opacity="0.9">
        <path
          d="M142 32 H158 V42 H168 V58 H158 V68 H142 V58 H132 V42 H142 Z"
          fill="#38bdf8"
          fillOpacity="0.85"
        />
        <path
          d="M142 32 H158 V42 H168 V58 H158 V68 H142 V58 H132 V42 H142 Z"
          stroke="#a5f3fc"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </g>

      {/* Nebulizer Face Mask on Left */}
      <g>
        {/* Mask Body Outline & Translucent Fill */}
        <path
          d="M48 48 C44 58 46 80 52 92 C56 100 64 102 70 94 C76 86 82 66 78 52 C75 42 62 40 48 48 Z"
          fill="url(#maskGrad)"
          stroke="#22d3ee"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Breathing Air Ports / Slots */}
        <ellipse cx="61" cy="62" rx="4.5" ry="7" fill="#0891b2" opacity="0.6" />
        <path d="M57 78 Q63 81 69 77" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
        {/* Mask connector elbow */}
        <path
          d="M74 65 L88 65 C91 65 93 67 93 70 L93 82"
          stroke="#22d3ee"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </g>

      {/* Nebulizer Medicine Cup / Chamber */}
      <g>
        {/* Cup cap & collar */}
        <rect x="85" y="80" width="16" height="5" rx="2" fill="#38bdf8" />
        {/* Medicine Cup Body */}
        <path
          d="M87 85 H99 L96 112 C95.5 116 90.5 116 90 112 Z"
          fill="#0e7490"
          stroke="#22d3ee"
          strokeWidth="2"
        />
        {/* Medicine Fluid Level */}
        <path d="M89 98 Q93 100 97 98 L95 111 Q93 113 91 111 Z" fill="#22d3ee" opacity="0.75" />
        {/* Nozzle stem */}
        <rect x="91" y="113" width="4" height="6" fill="#38bdf8" />
      </g>

      {/* Flexible Nebulizer Air Tubing */}
      <path
        d="M93 119 C93 135 78 156 94 163 C110 170 126 142 121 118 C120 110 124 100 128 92"
        stroke="#22d3ee"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Nebulizer Compressor Main Base Unit */}
      <g>
        {/* Compressor Main Rounded Housing */}
        <path
          d="M98 102 C104 90 148 91 156 100 C162 107 163 128 162 142 C161 149 157 154 148 155 C124 157 106 156 97 151 C92 148 92 136 94 124 Z"
          fill="#0891b2"
          stroke="#22d3ee"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Compressor Top Cover Highlight */}
        <path
          d="M102 106 C108 97 144 98 152 105 C155 109 154 116 149 119 C140 123 118 123 105 119 C100 117 99 111 102 106 Z"
          fill="#22d3ee"
          opacity="0.45"
        />
        {/* Air Hose Connector Inlet Port on Top */}
        <circle cx="127" cy="100" r="3.5" fill="#38bdf8" stroke="#0891b2" strokeWidth="1.5" />
        <circle cx="127" cy="100" r="1.5" fill="#0c1726" />
        {/* Power On/Off Switch Button */}
        <circle cx="140" cy="110" r="4.5" fill="#0e7490" stroke="#22d3ee" strokeWidth="1" />
        <circle cx="140" cy="110" r="2.5" fill="#38bdf8" />
        {/* Compressor Front Cooling Air Vent Ridges */}
        <path d="M124 130 V147" stroke="#0c1726" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M132 129 V146" stroke="#0c1726" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M140 128 V145" stroke="#0c1726" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M148 126 V143" stroke="#0c1726" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Dynamic Swooshing Orbital Crescent Arc */}
      <path
        d="M20 120 C36 144 94 148 168 108 C138 126 76 135 34 118 C26 115 22 117 20 120 Z"
        fill="url(#swooshGrad)"
      />
    </svg>
  );
};

export const SwRakshakLogo: React.FC<SwRakshakLogoProps> = ({
  size = 'md',
  showName = true,
  nameInSmall = false,
  showSubtitle = true,
  className = '',
  onClick,
}) => {
  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'xs'
      ? 28
      : size === 'sm'
      ? 34
      : size === 'md'
      ? 42
      : size === 'lg'
      ? 52
      : 64;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${
        onClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''
      } ${className}`}
    >
      {/* Logo Graphic (Vector SVG with fallbacks) */}
      <div className="relative shrink-0 flex items-center justify-center">
        <SwRakshakLogoIcon size={pixelSize} />
      </div>

      {/* Brand Name & Tagline */}
      {showName && (
        <div className="flex flex-col justify-center leading-none">
          {nameInSmall ? (
            /* Compact name presentation preserving exact brand casing pattern: SwRakshak */
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-white font-mono drop-shadow-[0_1px_4px_rgba(34,211,238,0.25)]">
                <span className="text-cyan-400">Sw</span>Rakshak
              </span>
              {showSubtitle && (
                <span className="text-[9px] sm:text-[10px] tracking-wider text-slate-300 font-mono font-medium mt-0.5 opacity-80">
                  SINCE 2026
                </span>
              )}
            </div>
          ) : (
            /* Standard / Prominent Display preserving exact brand casing pattern: SwRakshak */
            <div className="flex flex-col">
              <span className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white font-mono drop-shadow-[0_2px_8px_rgba(34,211,238,0.35)]">
                <span className="text-cyan-400">Sw</span>Rakshak
              </span>
              {showSubtitle && (
                <span className="text-[10px] sm:text-[11px] tracking-widest text-slate-300 font-mono font-medium mt-0.5">
                  SINCE 2026
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
