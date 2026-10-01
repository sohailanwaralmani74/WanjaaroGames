import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { DesktopSidebarCpmAd } from './DesktopSidebarCpmAd';
import { AdsterraAd } from './AdsterraAd';

interface DesktopSidebarAdLayoutProps {
  showDevTags?: boolean;
}

export function DesktopSidebarAdLayout({ showDevTags = false }: DesktopSidebarAdLayoutProps) {
  return (
    <div
      aria-label="Desktop 25% Right Sponsored & Performance Column"
      className="w-full flex flex-col gap-4 select-none"
    >
      {/* Unit 1: Dedicated Desktop View Sidebar CPM Network Ad */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-3 pb-2 border-b border-neutral-800">
          <span className="uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Sponsored Sidebar
          </span>
          <span className="text-emerald-400 flex items-center gap-1 font-sans font-medium text-[11px]">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Verified
          </span>
        </div>

        <DesktopSidebarCpmAd />

        <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Non-intrusive placement</span>
          <span className="font-mono text-[10px] text-neutral-400">Ad Standards Compliant</span>
        </div>
      </div>

      {/* Unit 2: 300x250 Medium Rectangle Ad */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pb-2 border-b border-neutral-800">
          <span className="uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Partner Spotlight • 300×250
          </span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[9px]">
            Zero Lag
          </span>
        </div>

        <div className="flex justify-center">
          <AdsterraAd size="300x250" />
        </div>

        {/* Cognitive Training Tip Companion */}
        <div className="bg-neutral-950/50 border border-neutral-850 rounded-xl p-3 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Arcade Benchmark Fact
          </div>
          <p className="text-neutral-400 text-[11px] leading-relaxed">
            Human visual reaction averages ~200-250ms. Practicing reaction micro-games daily improves motor activation latency by up to 15%.
          </p>
        </div>

        <div className="text-[10px] font-mono text-center text-neutral-400 pt-1">
          Wanjaaro Zero-Overlap Placement Guarantee
        </div>
      </div>
    </div>
  );
}
