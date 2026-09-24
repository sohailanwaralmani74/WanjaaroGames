import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, X, Shield, Volume2, Sparkles } from 'lucide-react';
import { SAMPLE_SPONSORS, AdUnitConfig } from './adTypes';

interface ClosableStickyMobileAdProps {
  showDevTags?: boolean;
  customConfig?: Partial<AdUnitConfig>;
}

/**
 * Mobile & Tablet Sticky Bottom Ad
 * Designed per User Request & Coalition for Better Ads:
 * - Fixed sticky on the bottom of the screen (mobile & tablet)
 * - Directly closable with an 'X' button or collapsible via 'Hide'
 * - Respects safe area insets (iOS home bar)
 * - Zero sound / non-intrusive height (<15% viewport height vs 30% limit)
 */
export function ClosableStickyMobileAd({
  showDevTags = false,
  customConfig,
}: ClosableStickyMobileAdProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  if (isClosed) return null;

  const defaultSponsor = SAMPLE_SPONSORS.find((s) => s.slotType === 'mobile-anchor') || SAMPLE_SPONSORS[3];
  const config = { ...defaultSponsor, ...customConfig };

  return (
    <aside
      aria-label="Sticky Bottom Advertisement"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 pointer-events-auto select-none"
    >
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-neutral-900/95 border-t border-x border-neutral-800 rounded-t-xl text-[10px] text-neutral-400 font-mono shadow-lg max-w-md mx-auto">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span className="uppercase tracking-wider">Ad • Sticky 320x50</span>
          {showDevTags && <span className="text-cyan-400 text-[9px]">(closable)</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="flex items-center gap-1 hover:text-white px-2 py-0.5 rounded bg-neutral-800 text-[10px] transition-colors"
            aria-label={isMinimized ? 'Expand sticky advertisement' : 'Minimize sticky advertisement'}
          >
            <span>{isMinimized ? 'Expand' : 'Hide'}</span>
            {isMinimized ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setIsClosed(true)}
            className="hover:text-rose-400 p-1 rounded hover:bg-neutral-800 transition-colors"
            title="Close ad permanently this session"
            aria-label="Close sticky advertisement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Banner Bar */}
      {!isMinimized && (
        <div className="bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3 h-[52px]">
            {/* Left Sponsor Icon & Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-rose-500 to-cyan-400 shrink-0 flex items-center justify-center text-black font-black text-xs shadow-sm">
                W
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold text-amber-400 truncate">
                  {config.sponsorName}
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {config.title}
                </div>
              </div>
            </div>

            {/* Right Action CTA & Close Icon */}
            <div className="shrink-0 flex items-center gap-1.5">
              <div className="py-1.5 px-3 bg-neutral-800 hover:bg-neutral-750 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 border border-neutral-700 transition-colors shadow cursor-pointer">
                <span>{config.ctaText}</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </div>
              <button
                onClick={() => setIsClosed(true)}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
