import React from 'react';
import { AdSlotType, AdUnitConfig } from './adTypes';
import { AdsterraAd } from './AdsterraAd';
import { ResponsiveAdBanner } from './ResponsiveAdBanner';

interface AdBannerProps {
  slotType: AdSlotType;
  slotId?: string;
  customConfig?: Partial<AdUnitConfig>;
  className?: string;
  showDevTags?: boolean;
}

/**
 * Universal AdBanner supporting all standard responsive placements:
 * - Leaderboard -> ResponsiveAdBanner (728x90 on desktop, 468x60 on tablet, 320x50 on mobile)
 * - Medium-Rectangle -> AdsterraAd (300x250)
 * - Skyscraper -> AdsterraAd (160x600)
 * - Mobile-Anchor -> AdsterraAd (320x50)
 */
export function AdBanner({
  slotType,
  slotId = 'wanjaaro-ad-slot',
  className = '',
}: AdBannerProps) {
  if (slotType === 'skyscraper') {
    return (
      <div
        className={`w-[160px] h-[600px] shrink-0 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col justify-center items-center p-2 shadow-lg select-none ${className}`}
      >
        <div className="w-full flex items-center justify-between text-[10px] text-neutral-400 font-mono mb-2 px-1">
          <span className="uppercase tracking-wider">Ad • 160×600</span>
          <span className="text-[9px] text-emerald-400 font-sans font-medium">Safe</span>
        </div>
        <AdsterraAd size="160x600" />
      </div>
    );
  }

  if (slotType === 'medium-rectangle') {
    return (
      <div
        className={`w-full max-w-[340px] sm:w-[320px] shrink-0 mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl p-3 flex flex-col items-center justify-center shadow-lg select-none ${className}`}
      >
        <div className="w-full flex items-center justify-between text-[10px] text-neutral-400 font-mono mb-2 px-1">
          <span className="uppercase tracking-wider">Sponsored • 300×250</span>
          <span className="text-[9px] text-neutral-400 font-sans">Verified</span>
        </div>
        <AdsterraAd size="300x250" />
      </div>
    );
  }

  if (slotType === 'mobile-anchor') {
    return (
      <div className={`w-full flex justify-center py-1 ${className}`}>
        <AdsterraAd size="320x50" />
      </div>
    );
  }

  // Default: Horizontal responsive banner (728x90 desktop / 468x60 tablet / 320x50 mobile)
  return <ResponsiveAdBanner slotId={slotId} className={className} />;
}
