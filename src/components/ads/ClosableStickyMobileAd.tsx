import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, Shield } from 'lucide-react';
import { AdsterraAd } from './AdsterraAd';

interface ClosableStickyMobileAdProps {
  showDevTags?: boolean;
}

/**
 * Mobile & Tablet Sticky Bottom Ad
 * Designed per User Request & Coalition for Better Ads:
 * - Fixed sticky on the bottom of the screen on mobile/tablet (hidden on lg: screens)
 * - Directly closable with an 'X' button or collapsible via 'Hide'
 * - Respects safe area insets (iOS home bar)
 * - Zero overlap with active game boards
 */
export function ClosableStickyMobileAd({ showDevTags = false }: ClosableStickyMobileAdProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  if (isClosed) return null;

  return (
    <aside
      aria-label="Sticky Bottom Mobile Advertisement"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 transition-transform duration-300 pointer-events-auto select-none"
    >
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-neutral-900/95 border-t border-x border-neutral-800 rounded-t-xl text-[10px] text-neutral-400 font-mono shadow-lg max-w-sm mx-auto">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span className="uppercase tracking-wider">Ad • 320×50</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="flex items-center gap-1 hover:text-white px-2 py-0.5 rounded bg-neutral-800 text-[10px] transition-colors"
            aria-label={isMinimized ? 'Expand mobile advertisement' : 'Minimize mobile advertisement'}
          >
            <span>{isMinimized ? 'Expand' : 'Hide'}</span>
            {isMinimized ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setIsClosed(true)}
            className="hover:text-rose-400 p-1 rounded hover:bg-neutral-800 transition-colors"
            title="Close ad permanently this session"
            aria-label="Close mobile advertisement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Banner Unit */}
      {!isMinimized && (
        <div className="bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-center">
          <AdsterraAd size="320x50" />
        </div>
      )}
    </aside>
  );
}
