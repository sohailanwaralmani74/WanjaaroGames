import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { AdBanner } from './AdBanner';

interface DesktopSideRailsProps {
  showDevTags?: boolean;
}

export function DesktopSideRails({ showDevTags = false }: DesktopSideRailsProps) {
  const [leftVisible, setLeftVisible] = useState(true);
  const [rightVisible, setRightVisible] = useState(true);

  return (
    <>
      {/* Left Gutter Rail (Only on Ultra-Wide / Desktop Screens: >= 1440px) */}
      {leftVisible && (
        <aside
          aria-label="Desktop Side Advertisement Left"
          className="hidden 2xl:flex fixed left-4 top-24 bottom-6 z-20 flex-col items-center justify-start pointer-events-auto select-none transition-opacity"
        >
          <div className="relative group">
            {/* Dismiss button */}
            <button
              onClick={() => setLeftVisible(false)}
              className="absolute -top-2.5 -right-2.5 z-30 p-1 rounded-full bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 shadow-md transition-colors"
              title="Close Ad"
              aria-label="Close Left Advertisement"
            >
              <X className="w-3 h-3" />
            </button>

            <AdBanner
              slotType="skyscraper"
              slotId="wanjaaro-desktop-left-rail"
              showDevTags={showDevTags}
              customConfig={{
                id: 'rail-left',
                sponsorName: 'SpeedStack',
                title: 'Lightning Fast Global Cloud Hosting',
                description: 'Serverless compute & edge edge latency under 15ms.',
                ctaText: 'Deploy Now',
                badge: 'Verified Hosting',
                colorGradient: 'from-blue-600/15 via-indigo-600/10 to-violet-600/15',
              }}
            />

            <div className="flex items-center justify-center gap-1 text-[9px] text-neutral-400 mt-2 font-mono">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Zero Overlap Guarantee</span>
            </div>
          </div>
        </aside>
      )}

      {/* Right Gutter Rail (Only on Ultra-Wide / Desktop Screens: >= 1440px) */}
      {rightVisible && (
        <aside
          aria-label="Desktop Side Advertisement Right"
          className="hidden 2xl:flex fixed right-4 top-24 bottom-6 z-20 flex-col items-center justify-start pointer-events-auto select-none transition-opacity"
        >
          <div className="relative group">
            {/* Dismiss button */}
            <button
              onClick={() => setRightVisible(false)}
              className="absolute -top-2.5 -right-2.5 z-30 p-1 rounded-full bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 shadow-md transition-colors"
              title="Close Ad"
              aria-label="Close Right Advertisement"
            >
              <X className="w-3 h-3" />
            </button>

            <AdBanner
              slotType="skyscraper"
              slotId="wanjaaro-desktop-right-rail"
              showDevTags={showDevTags}
              customConfig={{
                id: 'rail-right',
                sponsorName: 'ProFocus Optics',
                title: 'Blue-Light Gaming Glasses',
                description: 'High contrast visual clarity & zero fatigue during sessions.',
                ctaText: 'View Collection',
                badge: 'Eye Comfort',
                colorGradient: 'from-emerald-500/15 via-teal-600/10 to-cyan-500/15',
              }}
            />

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
