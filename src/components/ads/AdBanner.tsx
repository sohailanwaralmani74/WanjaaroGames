import React, { useState } from 'react';
import { ExternalLink, Info, Code2, Sparkles } from 'lucide-react';
import { AdSlotType, AdUnitConfig, SAMPLE_SPONSORS } from './adTypes';

interface AdBannerProps {
  slotType: AdSlotType;
  slotId?: string;
  customConfig?: Partial<AdUnitConfig>;
  className?: string;
  showDevTags?: boolean; // When true, shows AdSense/AdManager slot coordinates
}

export function AdBanner({
  slotType,
  slotId = 'wanjaaro-ad-slot',
  customConfig,
  className = '',
  showDevTags = false,
}: AdBannerProps) {
  const [showInfo, setShowInfo] = useState(false);

  // Match sample sponsor based on slotType
  const defaultSponsor =
    SAMPLE_SPONSORS.find((s) => s.slotType === slotType) || SAMPLE_SPONSORS[0];
  const config = { ...defaultSponsor, ...customConfig };

  // Dimensions & Container classes per slot
  if (slotType === 'skyscraper') {
    return (
      <div
        className={`w-[160px] h-[600px] shrink-0 bg-neutral-900/90 border border-neutral-800 rounded-2xl flex flex-col justify-between p-4 relative overflow-hidden shadow-lg select-none ${className}`}
      >
        {/* Subtle backdrop gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${config.colorGradient} pointer-events-none`}
        />

        {/* Top Header */}
        <div className="relative z-10 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
            <span className="uppercase tracking-wider">Ad • 160x600</span>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="hover:text-amber-400"
              title="Ad Quality Standards"
            >
              <Info className="w-3 h-3" />
            </button>
          </div>
          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white/10 text-neutral-300">
            {config.badge}
          </span>
        </div>

        {/* Center Creative Content */}
        <div className="relative z-10 space-y-3 text-center my-auto">
          <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-black font-black text-xs shadow-md">
            W
          </div>
          <h4 className="text-xs font-bold text-white leading-tight">
            {config.title}
          </h4>
          <p className="text-[11px] text-neutral-400 leading-snug">
            {config.description}
          </p>
          <span className="text-[10px] font-semibold text-neutral-500 block">
            {config.sponsorName}
          </span>
        </div>

        {/* Bottom CTA */}
        <div className="relative z-10 pt-2 border-t border-neutral-800/80">
          <div className="w-full py-2 px-3 bg-neutral-800 hover:bg-neutral-750 text-white text-[11px] font-semibold rounded-xl text-center flex items-center justify-center gap-1 border border-neutral-700 transition-colors">
            <span>{config.ctaText}</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </div>
          <div className="text-[9px] text-center text-neutral-400 mt-1.5 font-mono">
            Zero Gameplay Overlap
          </div>
        </div>
      </div>
    );
  }

  if (slotType === 'medium-rectangle') {
    return (
      <div
        className={`w-full max-w-[340px] sm:w-[300px] h-[250px] shrink-0 mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col justify-between p-5 relative overflow-hidden shadow-lg select-none ${className}`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-tr ${config.colorGradient} pointer-events-none`}
        />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="uppercase tracking-wider">Advertisement</span>
            <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-[9px] text-neutral-300">
              300x250
            </span>
          </div>
          <span className="text-neutral-400">{config.sponsorName}</span>
        </div>

        {/* Middle */}
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <Sparkles className="w-3 h-3" /> {config.badge}
          </div>
          <h4 className="text-sm font-bold text-white leading-snug">
            {config.title}
          </h4>
          <p className="text-xs text-neutral-300 leading-relaxed line-clamp-2">
            {config.description}
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between pt-3 border-t border-neutral-800">
          <span className="text-[10px] text-neutral-400 font-mono">
            Verified Safe Partner
          </span>
          <div className="py-1.5 px-3 bg-neutral-800 hover:bg-neutral-750 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-neutral-700 transition-colors">
            <span>{config.ctaText}</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </div>
        </div>
      </div>
    );
  }

  // Default: Leaderboard (Horizontal 728x90 or full-width responsive)
  return (
    <div
      className={`w-full bg-neutral-900/80 border border-neutral-800 rounded-2xl relative overflow-hidden shadow-md ${className}`}
      style={{ minHeight: '90px' }}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${config.colorGradient} pointer-events-none`}
      />

      <div className="relative z-10 p-3.5 sm:px-6 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 min-h-[90px]">
        {/* Left: Sponsor Identity & Badge */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-rose-500 to-cyan-400 shrink-0 flex items-center justify-center text-black font-black text-sm shadow">
            W
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                Sponsored • 728x90
              </span>
              <span className="text-[10px] font-semibold text-amber-400">
                {config.sponsorName}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
              {config.title}
            </h4>
            <p className="text-[11px] text-neutral-300 hidden md:block line-clamp-1">
              {config.description}
            </p>
          </div>
        </div>

        {/* Right: Call to Action Button */}
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
          {showDevTags && (
            <div className="hidden lg:flex items-center gap-1 text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
              <Code2 className="w-3 h-3 text-cyan-400" />
              <span>slot: {slotId}</span>
            </div>
          )}
          <div className="py-2 px-4 bg-neutral-800 hover:bg-neutral-750 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-neutral-700 transition-colors shadow-sm cursor-pointer whitespace-nowrap">
            <span>{config.ctaText}</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
