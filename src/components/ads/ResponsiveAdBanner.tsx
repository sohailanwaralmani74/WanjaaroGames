import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { AdsterraAd, AdsterraSize } from './AdsterraAd';

interface ResponsiveAdBannerProps {
  className?: string;
  slotId?: string;
  showBadge?: boolean;
}

/**
 * Responsive banner that automatically serves:
 * - 728x90 Leaderboard on desktop/tablets (width >= 768px)
 * - 468x60 Banner on medium mobile/phablets (480px - 767px)
 * - 320x50 Mobile Leaderboard on compact mobile (width < 480px)
 *
 * Guaranteed never to cause horizontal overflow or overlap user interactions.
 */
export function ResponsiveAdBanner({
  className = '',
  slotId,
  showBadge = true,
}: ResponsiveAdBannerProps) {
  const [windowWidth, setWindowWidth] = useState<number>(() => {
    return typeof window !== 'undefined' ? window.innerWidth : 1024;
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  let activeSize: AdsterraSize = '728x90';
  let minHeight = 90;

  if (windowWidth < 480) {
    activeSize = '320x50';
    minHeight = 50;
  } else if (windowWidth < 768) {
    activeSize = '468x60';
    minHeight = 60;
  }

  return (
    <div
      className={`w-full my-4 py-3 px-2 sm:px-4 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl flex flex-col items-center justify-center transition-all select-none overflow-hidden ${className}`}
      data-slot-id={slotId}
    >
      {showBadge && (
        <div className="w-full max-w-[728px] flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-2 px-1">
          <span className="uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
            Sponsored • {activeSize}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-neutral-400">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Non-Intrusive
          </span>
        </div>
      )}

      <div
        className="flex items-center justify-center w-full overflow-hidden"
        style={{ minHeight: `${minHeight}px` }}
      >
        <AdsterraAd size={activeSize} />
      </div>
    </div>
  );
}
