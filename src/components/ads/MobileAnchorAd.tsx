import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, X, Shield } from 'lucide-react';
import { SAMPLE_SPONSORS } from './adTypes';

interface MobileAnchorAdProps {
  showDevTags?: boolean;
}

export function MobileAnchorAd({ showDevTags = false }: MobileAnchorAdProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const sponsor = SAMPLE_SPONSORS.find((s) => s.slotType === 'mobile-anchor') || SAMPLE_SPONSORS[0];

  return (
    <aside
      aria-label="Mobile Bottom Advertisement"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 pointer-events-auto select-none"
    >
      {/* Mini Control Header Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-neutral-900/95 border-t border-x border-neutral-800 rounded-t-xl text-[10px] text-neutral-400 font-mono shadow-md max-w-sm mx-auto">
        <div className="flex items-center gap-1.5">
          <Shield className="w-2.5 h-2.5 text-emerald-400" />
          <span className="uppercase tracking-wider">Ad • 320x50</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="flex items-center gap-0.5 hover:text-white px-1.5 py-0.5 rounded bg-neutral-800 text-[10px]"
            aria-label={isMinimized ? 'Expand mobile advertisement' : 'Minimize mobile advertisement'}
          >
            <span>{isMinimized ? 'Show' : 'Hide'}</span>
            {isMinimized ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="hover:text-white p-0.5 rounded"
            aria-label="Close mobile advertisement"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Banner Unit */}
      {!isMinimized && (
        <div className="bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl">
          <div className="max-w-sm mx-auto flex items-center justify-between gap-3 h-[52px]">
            {/* Left Sponsor Icon & Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-rose-500 to-cyan-400 shrink-0 flex items-center justify-center text-black font-black text-xs shadow-sm">
                W
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold text-amber-400 truncate">
                  {sponsor.sponsorName}
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {sponsor.title}
                </div>
              </div>
            </div>

            {/* Right Action CTA */}
            <div className="shrink-0 flex items-center gap-1">
              <div className="py-1.5 px-3 bg-neutral-800 hover:bg-neutral-750 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 border border-neutral-700 transition-colors shadow">
                <span>{sponsor.ctaText}</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
