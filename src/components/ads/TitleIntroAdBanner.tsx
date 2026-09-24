import React, { useState } from 'react';
import { Sparkles, ExternalLink, ShieldCheck, X } from 'lucide-react';
import { SAMPLE_SPONSORS, AdUnitConfig } from './adTypes';

interface TitleIntroAdBannerProps {
  slotId?: string;
  customConfig?: Partial<AdUnitConfig>;
  showDevTags?: boolean;
}

/**
 * Mobile & Tablet ad placed cleanly under the title and introductory paragraph.
 * Built strictly according to Google AdSense & Coalition for Better Ads standards:
 * - Natural reading break below title/intro
 * - Responsive 300x100 / 320x100 / 300x250 container
 * - Fixed height styling to prevent Cumulative Layout Shifts (CLS)
 * - Minimum 150px clearance from active interactive game board
 */
export function TitleIntroAdBanner({
  slotId = 'wanjaaro-title-intro-banner',
  customConfig,
  showDevTags = false,
}: TitleIntroAdBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const defaultSponsor = SAMPLE_SPONSORS[1]; // Dev/Performance tool
  const config = { ...defaultSponsor, ...customConfig };

  return (
    <div
      aria-label="Sponsored In-Feed Announcement"
      className="w-full my-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3.5 sm:p-4 relative overflow-hidden shadow-md transition-all select-none"
    >
      {/* Background Accent */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${config.colorGradient} pointer-events-none opacity-80`}
      />

      {/* Top micro bar */}
      <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="uppercase tracking-wider">Advertisement</span>
          <span className="text-neutral-500">•</span>
          <span className="text-amber-400 font-semibold">{config.sponsorName}</span>
        </div>
        <div className="flex items-center gap-2">
          {showDevTags && (
            <span className="text-cyan-400 text-[9px] bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800">
              slot: {slotId}
            </span>
          )}
          <button
            onClick={() => setIsDismissed(true)}
            className="text-neutral-400 hover:text-white p-0.5 transition-colors"
            title="Dismiss ad"
            aria-label="Dismiss advertisement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-rose-500 to-cyan-400 flex items-center justify-center text-black font-black text-xs shadow shrink-0">
            W
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
              {config.title}
            </h4>
            <p className="text-[11px] text-neutral-300 line-clamp-1">
              {config.description}
            </p>
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto flex items-center justify-end">
          <div className="py-1.5 px-3.5 bg-neutral-800 hover:bg-neutral-750 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-neutral-700 transition-colors shadow-sm cursor-pointer whitespace-nowrap">
            <span>{config.ctaText}</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
