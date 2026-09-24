import React from 'react';

interface WanjaaroLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export function WanjaaroLogo({ size = 'md', showTagline = false }: WanjaaroLogoProps) {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }[size];

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl sm:text-4xl',
  }[size];

  return (
    <div className="flex items-center gap-2.5 select-none group">
      {/* Vibrant Colored Polygonal Emblem */}
      <div className={`relative ${iconDimensions} shrink-0 drop-shadow-[0_0_12px_rgba(245,158,11,0.35)] transition-transform duration-300 group-hover:scale-105`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Linear Gradients for Colored Facets */}
            <linearGradient id="facetAmber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="facetRose" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>
            <linearGradient id="facetCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="facetViolet" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="facetEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Rounded Hex/Diamond Shield */}
          <polygon
            points="24,2 44,13 44,35 24,46 4,35 4,13"
            fill="#171717"
            stroke="#262626"
            strokeWidth="1.5"
          />

          {/* Facet 1: Top-Left Amber */}
          <polygon
            points="24,5 4,14 24,24"
            fill="url(#facetAmber)"
            opacity="0.95"
          />

          {/* Facet 2: Top-Right Rose */}
          <polygon
            points="24,5 44,14 24,24"
            fill="url(#facetRose)"
            opacity="0.95"
          />

          {/* Facet 3: Bottom-Right Cyan */}
          <polygon
            points="44,14 44,34 24,24"
            fill="url(#facetCyan)"
            opacity="0.92"
          />

          {/* Facet 4: Bottom Base Violet */}
          <polygon
            points="44,34 24,43 24,24"
            fill="url(#facetViolet)"
            opacity="0.95"
          />

          {/* Facet 5: Bottom-Left Emerald */}
          <polygon
            points="4,34 24,43 24,24"
            fill="url(#facetEmerald)"
            opacity="0.92"
          />

          {/* Facet 6: Mid-Left Azure */}
          <polygon
            points="4,14 4,34 24,24"
            fill="url(#facetCyan)"
            opacity="0.8"
          />

          {/* Center Shining Star / Gaming Core */}
          <circle cx="24" cy="24" r="5" fill="#FFFFFF" filter="url(#logoGlow)" />
          <path
            d="M24,17 L25.5,22.5 L31,24 L25.5,25.5 L24,31 L22.5,25.5 L17,24 L22.5,22.5 Z"
            fill="#FFFBEB"
          />
        </svg>
      </div>

      {/* Colorful Wordmark */}
      <div className="flex flex-col">
        <span
          className={`font-black tracking-tight leading-none ${textSizes} font-['Syne',sans-serif]`}
        >
          <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-cyan-400 bg-clip-text text-transparent">
            Wanjaaro
          </span>
        </span>
        {showTagline && (
          <span className="text-[10px] tracking-wider uppercase font-semibold text-neutral-400 mt-0.5 font-mono">
            Mind &amp; Skill Arcade
          </span>
        )}
      </div>
    </div>
  );
}
