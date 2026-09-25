import React from 'react';
import { Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { AdBanner } from './AdBanner';

interface DesktopSidebarAdLayoutProps {
  showDevTags?: boolean;
}

export function DesktopSidebarAdLayout({ showDevTags = false }: DesktopSidebarAdLayoutProps) {
  return (
    <div
      aria-label="Desktop 25% Right Sponsored & Performance Column"
      className="w-full flex flex-col gap-4 select-none"
    >
      {/* Primary 300x250 Medium Rectangle Sponsor Unit */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-3 pb-2 border-b border-neutral-800">
          <span className="uppercase tracking-wider">Sponsored Partner • 300x250</span>
          <span className="text-emerald-400 flex items-center gap-1 font-sans font-medium text-[11px]">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Verified
          </span>
        </div>

        <AdBanner
          slotType="medium-rectangle"
          slotId="wanjaaro-desktop-right-column"
          showDevTags={showDevTags}
          customConfig={{
            id: 'sponsor-desktop-right',
            sponsorName: 'HyperSpeed Cloud',
            title: 'Sub-15ms Edge Game Hosting',
            description: 'Deploy HTML5 games with zero cold starts and instant CDN asset delivery worldwide.',
            ctaText: 'Deploy Free',
            badge: 'Global Infrastructure',
            colorGradient: 'from-blue-600/20 via-indigo-600/10 to-violet-600/20',
          }}
        />

        <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Non-intrusive placement</span>
          <span className="font-mono text-[10px] text-neutral-400">Ad Standards Compliant</span>
        </div>
      </div>

      {/* Vertical Card (300x250 / 300x600 Spotlight Style) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl space-y-4">
        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pb-2 border-b border-neutral-800">
          <span className="uppercase tracking-wider">Spotlight Sponsor</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[9px]">
            Zero Gameplay Latency
          </span>
        </div>

        {/* Sponsor Creative Box */}
        <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-4 space-y-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-rose-500/10 pointer-events-none" />

          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-rose-500 to-cyan-400 flex items-center justify-center text-black font-black text-xs shadow-md shrink-0">
              W
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                ProGear Gaming
              </span>
              <span className="text-xs font-bold text-white block leading-tight">
                Sub-1ms Optical Switches
              </span>
            </div>
          </div>

          <p className="relative z-10 text-xs text-neutral-400 leading-relaxed">
            Eliminate input lag on reflex benchmarks. Hall-effect magnetic switches with 8000Hz polling rate.
          </p>

          <div className="relative z-10 pt-1">
            <div className="w-full py-2 px-3 bg-neutral-800 hover:bg-neutral-750 text-white text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-1.5 border border-neutral-700 cursor-pointer transition-colors shadow">
              <span>Inspect Gear</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </div>
          </div>
        </div>

        {/* Cognitive Training Tip Companion */}
        <div className="bg-neutral-950/50 border border-neutral-850 rounded-xl p-3.5 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Arcade Benchmark Fact
          </div>
          <p className="text-neutral-400 text-[11px] leading-relaxed">
            Human visual reaction averages ~200-250ms. Practicing reaction micro-games daily improves motor activation latency by up to 15%.
          </p>
        </div>

        <div className="text-[10px] font-mono text-center text-neutral-400 pt-1">
          Wanjaaro Zero-Lag Placement Policy
        </div>
      </div>
    </div>
  );
}
