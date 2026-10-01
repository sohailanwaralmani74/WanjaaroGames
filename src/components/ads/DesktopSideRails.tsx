import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { AdsterraAd } from './AdsterraAd';

interface DesktopSideRailsProps {
  showDevTags?: boolean;
}

export function DesktopSideRails({ showDevTags = false }: DesktopSideRailsProps) {
  const [leftVisible, setLeftVisible] = useState(true);
  const [rightVisible, setRightVisible] = useState(true);

  return (
    <>
      {/* Left Gutter Rail (Only on Ultra-Wide / Desktop Screens: >= 1536px) */}
      {leftVisible && (
        <aside
          aria-label="Desktop Side Advertisement Left"
          className="hidden 2xl:flex fixed left-3 top-24 bottom-6 z-20 flex-col items-center justify-start pointer-events-auto select-none transition-opacity"
        >
          <div className="relative group bg-neutral-900/90 border border-neutral-800 rounded-2xl p-2 shadow-2xl">
            {/* Dismiss button */}
            <button
              onClick={() => setLeftVisible(false)}
              className="absolute -top-2.5 -right-2.5 z-30 p-1 rounded-full bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 shadow-md transition-colors"
              title="Close Ad"
              aria-label="Close Left Advertisement"
            >
              <X className="w-3 h-3" />
            </button>

            <AdsterraAd size="160x600" />

            <div className="flex items-center justify-center gap-1 text-[9px] text-neutral-400 mt-2 font-mono">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Zero Overlap Guarantee</span>
            </div>
          </div>
        </aside>
      )}

      {/* Right Gutter Rail (Only on Ultra-Wide / Desktop Screens: >= 1536px) */}
      {rightVisible && (
        <aside
          aria-label="Desktop Side Advertisement Right"
          className="hidden 2xl:flex fixed right-3 top-24 bottom-6 z-20 flex-col items-center justify-start pointer-events-auto select-none transition-opacity"
        >
          <div className="relative group bg-neutral-900/90 border border-neutral-800 rounded-2xl p-2 shadow-2xl">
            {/* Dismiss button */}
            <button
              onClick={() => setRightVisible(false)}
              className="absolute -top-2.5 -right-2.5 z-30 p-1 rounded-full bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 shadow-md transition-colors"
              title="Close Ad"
              aria-label="Close Right Advertisement"
            >
              <X className="w-3 h-3" />
            </button>

            <AdsterraAd size="160x600" />

            <div className="flex items-center justify-center gap-1 text-[9px] text-neutral-400 mt-2 font-mono">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Zero Overlap Guarantee</span>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
