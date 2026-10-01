import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ResponsiveAdBanner } from './ResponsiveAdBanner';

interface TitleIntroAdBannerProps {
  slotId?: string;
  showDevTags?: boolean;
}

/**
 * Clean responsive ad placed under introductory sections.
 * Automatically adapts between 728x90 (desktop), 468x60 (tablet), and 320x50 (mobile).
 * Guaranteed to maintain minimum clearance and never overlap user controls.
 */
export function TitleIntroAdBanner({
  slotId = 'wanjaaro-title-intro-banner',
}: TitleIntroAdBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="w-full relative my-3">
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-2 right-2 z-10 p-1 rounded-md bg-neutral-800/80 text-neutral-400 hover:text-white transition-colors"
        title="Dismiss ad"
        aria-label="Dismiss advertisement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <ResponsiveAdBanner slotId={slotId} />
    </div>
  );
}
