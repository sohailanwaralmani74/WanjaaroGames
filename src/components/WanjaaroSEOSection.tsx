import React, { useState } from 'react';
import {
  Brain,
  Zap,
  Globe2,
  Lock,
  ChevronDown,
  Sparkles,
  Award,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { ALL_GAMES } from '../data/gamesCatalog';

export function WanjaaroSEOSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'What is Wanjaaro and how does it work?',
      a: 'Wanjaaro is a free, high-performance browser gaming platform built exclusively with client-side web technologies. Every title runs directly in your browser without requiring installation, third-party plug-ins, or server delays. It is designed to train reflexes, memory, precision, logic, and cognitive speed.',
    },
    {
      q: 'Are all games on Wanjaaro completely free to play?',
      a: 'Yes, 100% free. There are no paywalls, subscriptions, pay-to-win mechanics, or intrusive ads that block active gameplay. Anyone worldwide can play anytime.',
    },
    {
      q: 'How are high scores and personal bests saved?',
      a: 'All personal bests, round history, and settings are stored locally and privately in your browser’s localStorage. Your data stays on your device—no cookies, tracking scripts, or accounts are required.',
    },
    {
      q: 'Can I play Wanjaaro on mobile devices and touchscreens?',
      a: 'Absolutely. Every game on Wanjaaro is built with responsive touch controls, flexible viewport scaling, and keyboard/mouse compatibility, ensuring fluid performance on iPhones, Android smartphones, iPads, Chromebooks, and PCs.',
    },
    {
      q: 'Will more games be added to Wanjaaro?',
      a: 'Yes! Wanjaaro is an expandable gaming ecosystem. We regularly develop and add new games across mental math, spatial puzzles, kinetic arcade challenges, and reflex benchmarks.',
    },
    {
      q: 'Can I play Wanjaaro offline or on slow internet connections?',
      a: 'Once the application is loaded in your browser cache, the games execute entirely on your device’s JavaScript engine without requiring ongoing network bandwidth or server communication.',
    },
  ];

  return (
    <section aria-labelledby="seo-heading" className="space-y-12 pt-10 border-t border-neutral-850">
      {/* Editorial Overview: About Wanjaaro */}
      <div className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 sm:p-10 space-y-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Next-Generation Browser Arcade
          </div>
          <h2 id="seo-heading" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            About Wanjaaro – The Universal Mind &amp; Skill Arcade
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            Wanjaaro is an expanding client-side playground built for players seeking immediate, high-quality
            mental challenges, reflex tests, and casual entertainment. By eliminating accounts, paywalls, and
            cumbersome downloads, Wanjaaro delivers instant gaming pleasure and cognitive training on any screen,
            anywhere in the world.
          </p>
        </div>

        {/* 4 Pillars of Excellence */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-neutral-950/80 border border-neutral-800/80 p-5 rounded-2xl space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Zero Latency &amp; Installs</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Native HTML5, Web Audio, and Canvas engines launch immediately without downloads or bloated loaders.
            </p>
          </div>

          <div className="bg-neutral-950/80 border border-neutral-800/80 p-5 rounded-2xl space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Evidence-Based Training</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Designed around neuropsychological benchmarks including Stroop effect, N-Back, Schulte grids, and motor latency.
            </p>
          </div>

          <div className="bg-neutral-950/80 border border-neutral-800/80 p-5 rounded-2xl space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Global Universal Access</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              GEO-optimized for players across the Americas, Europe, Asia, and worldwide without regional barriers.
            </p>
          </div>

          <div className="bg-neutral-950/80 border border-neutral-800/80 p-5 rounded-2xl space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">100% Private &amp; Offline</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Your high scores and play statistics stay strictly inside your browser. No cookies or server tracking.
            </p>
          </div>
        </div>

        {/* Cognitive Categories Breakdown */}
        <div className="pt-4 border-t border-neutral-850 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Expanding Categories for Every Skill Level
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            With over <strong>{ALL_GAMES.length} games</strong> currently live and more continuously in production,
            Wanjaaro spans 12 specialized disciplines: Reflex &amp; Reaction latency, Aim &amp; Precision,
            Working Memory Recall, Typing Velocity &amp; Anagrams, Sensory Perception, Algorithmic Logic &amp; Puzzles,
            Strategy &amp; Tactics, Bimanual Coordination, Speed Clicking, Mental Math Calculation, Visual Geometry,
            and Classic Arcade Entertainment.
          </p>
        </div>
      </div>

      {/* Semantic FAQ Section for Google Crawlers & Users */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 sm:p-10 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Everything you need to know about playing games and saving scores on Wanjaaro.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-neutral-800 bg-neutral-950/60 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-neutral-200 hover:text-amber-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-neutral-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-neutral-850 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
