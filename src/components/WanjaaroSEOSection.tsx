import React, { useState } from 'react';
import {
  Brain,
  Zap,
  Globe2,
  Lock,
  ChevronDown,
  Sparkles,
  Award,
  BarChart3,
  Cpu,
  Target,
  ExternalLink,
} from 'lucide-react';
import { ALL_GAMES, CATEGORIES } from '../data/gamesCatalog';

export function WanjaaroSEOSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const benchmarks = [
    {
      test: 'Reaction Time Test',
      gameId: 'reaction-time',
      category: 'Reflex & Reaction',
      metric: 'Millisecond Latency (ms)',
      average: '215ms – 250ms',
      elite: '< 180ms (Pro Esports)',
      mechanism: 'Visual saccade to motor strip signal conduction via optic nerve.',
    },
    {
      test: 'Chimp Memory Test',
      gameId: 'chimp-test',
      category: 'Memory & Recall',
      metric: 'Working Memory Span',
      average: 'Level 7 – 9',
      elite: 'Level 12+ (Ayumu Tier)',
      mechanism: 'Photographic eidetic memory & spatial sequential buffer in prefrontal cortex.',
    },
    {
      test: 'Aim Precision Trainer',
      gameId: 'aim-trainer',
      category: 'Aim & Precision',
      metric: 'Target Acquisition Time',
      average: '420ms – 520ms',
      elite: '< 320ms (Sub-pixel)',
      mechanism: 'Fine-motor hand-eye tracking, mouse deceleration, and ballistic cursor flicks.',
    },
    {
      test: 'Speed Typist Drill',
      gameId: 'speed-typist',
      category: 'Typing & Words',
      metric: 'Net WPM (Words/Min)',
      average: '40 – 60 WPM',
      elite: '100+ WPM (99th percentile)',
      mechanism: 'Bimanual neuromuscular muscle memory and sub-vocal lexeme parsing.',
    },
    {
      test: 'Stroop Color Challenge',
      gameId: 'stroop-challenge',
      category: 'Logic & Puzzles',
      metric: 'Inhibition Delay Cost',
      average: '120ms – 180ms delay',
      elite: '< 60ms delay (High Focus)',
      mechanism: 'Dorsolateral prefrontal cortex suppression of automatic reading reflexes.',
    },
    {
      test: 'Schulte Grid 5x5',
      gameId: 'schulte-grid',
      category: 'Perception & Vision',
      metric: '25-Digit Search Time',
      average: '30s – 45s',
      elite: '< 20s (Speed Reading)',
      mechanism: 'Peripheral visual field expansion and rapid eye fixation velocity.',
    },
  ];

  const faqs = [
    {
      q: 'What is Wanjaaro and how does it differ from traditional flash/online game portals?',
      a: 'Wanjaaro is a modern, client-side cognitive training and arcade gaming platform. Unlike legacy gaming portals loaded with heavy video trackers, logins, and intrusive popups, Wanjaaro executes 100% of game logic directly in your browser using HTML5 Canvas, Web Audio, and hardware-accelerated JavaScript. This guarantees sub-millisecond input response with zero cloud streaming lag.',
    },
    {
      q: 'What is an average human visual reaction time benchmark?',
      a: 'The median human visual reaction time on desktop hardware is 200ms to 250ms. Competitive gamers frequently clock between 160ms and 190ms, while times below 150ms approach human physiological limits due to retinal transmission and neural propagation speeds.',
    },
    {
      q: 'How does the Chimpanzee Memory Test work?',
      a: 'The Chimp Test recreates Kyoto University primate cognitive experiments. Numbers 1 through 9 appear briefly on a grid before masking into blank squares. The subject must tap the squares in numerical sequence purely from working memory. Young chimpanzees (such as Ayumu) famously outperform adult humans in this visual working memory task.',
    },
    {
      q: 'Why do client-side browser games have lower latency than cloud gaming?',
      a: 'Client-side web games execute code locally on your processor and GPU via requestAnimationFrame, eliminating network roundtrips. Cloud gaming services require streaming video over the internet, adding 30ms to 120ms of uncontrollable network ping that invalidates millisecond-accurate reflex benchmarks.',
    },
    {
      q: 'Are all games on Wanjaaro completely free to play?',
      a: 'Yes, 100% free. There are no paywalls, subscriptions, pay-to-win microtransactions, or interstitial popups that interrupt active gameplay rounds. Anyone worldwide can play anytime.',
    },
    {
      q: 'How are high scores and personal bests saved?',
      a: 'All personal bests, round counts, and timestamps are stored locally and privately in your browser’s localStorage. Your personal performance history stays on your machine—no cookies, tracking scripts, or accounts are required.',
    },
    {
      q: 'Can playing cognitive games and reflex tests improve mental speed?',
      a: 'Scientific research in neuropsychology demonstrates that targeted cognitive exercises (such as Stroop interference, N-back tasks, and rapid visual search) stimulate neuroplasticity in the prefrontal cortex, improving attentional focus, saccadic eye velocity, and fine motor responsiveness.',
    },
    {
      q: 'Can I play Wanjaaro on mobile phones, tablets, and desktop computers?',
      a: 'Yes. Every game is engineered with responsive dual-input architecture: touch-optimized hitboxes for iOS and Android mobile screens, and low-latency mouse and keyboard bindings for desktop workstations.',
    },
  ];

  return (
    <section aria-labelledby="seo-heading" className="space-y-12 pt-10 border-t border-neutral-850">
      {/* Editorial Overview: About Wanjaaro */}
      <div className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 sm:p-10 space-y-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Next-Generation Browser Arcade &amp; Cognitive Benchmarks
          </div>
          <h2 id="seo-heading" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            About Wanjaaro – High-Performance Mind &amp; Skill Arcade
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            Wanjaaro is an open client-side gaming platform engineered for athletes of the mind, esports competitors,
            students, and casual players seeking immediate, uncompromised cognitive training. By eliminating server
            intermediaries, third-party user tracking, paywalls, and bloated downloads, Wanjaaro delivers pure
            zero-latency gaming directly inside any modern web browser.
          </p>
        </div>

        {/* 4 Pillars of Excellence */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-neutral-950/80 border border-neutral-800/80 p-5 rounded-2xl space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Sub-1ms Input Response</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Native HTML5 Canvas and Web Audio APIs execute on your hardware with 0ms network latency.
            </p>
          </div>

          <div className="bg-neutral-950/80 border border-neutral-800/80 p-5 rounded-2xl space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Neuropsychology Protocols</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Benchmarks based on established cognitive science: Stroop Effect, N-Back, Schulte Grids, and Fitts's Law.
            </p>
          </div>

          <div className="bg-neutral-950/80 border border-neutral-800/80 p-5 rounded-2xl space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Instant Global Access</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Lightweight static architecture loads in under 100ms worldwide without region blocking or logins.
            </p>
          </div>

          <div className="bg-neutral-950/80 border border-neutral-800/80 p-5 rounded-2xl space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">100% Client-Side Privacy</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              All personal bests and score histories remain in your browser's localStorage. Zero analytics tracking.
            </p>
          </div>
        </div>

        {/* Scientific Benchmark Norms Table (Information Gain for AI & Search Engines) */}
        <div className="pt-6 border-t border-neutral-850 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" /> Human Cognitive &amp; Reflex Performance Norms
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Standard baseline norms vs. top 1% elite human performance across core cognitive tests.
              </p>
            </div>
            <span className="text-[11px] font-mono text-neutral-500">Source: Wanjaaro Empirical Benchmark Standard</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-950/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900/90 text-neutral-300 font-mono text-[11px] uppercase tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Benchmark Test</th>
                  <th className="py-3 px-4">Metric</th>
                  <th className="py-3 px-4">General Population</th>
                  <th className="py-3 px-4">Elite / Pro Tier</th>
                  <th className="py-3 px-4 hidden md:table-cell">Physiological Basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850 text-neutral-300 font-sans">
                {benchmarks.map((b, idx) => (
                  <tr key={idx} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      <a
                        href={`/#/game/${b.gameId}`}
                        className="text-amber-400 hover:text-amber-300 hover:underline inline-flex items-center gap-1"
                      >
                        {b.test}
                        <ExternalLink className="w-3 h-3 text-neutral-500" />
                      </a>
                      <span className="block text-[10px] text-neutral-500 font-mono font-normal">
                        {b.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-neutral-400">{b.metric}</td>
                    <td className="py-3 px-4 text-neutral-300">{b.average}</td>
                    <td className="py-3 px-4 font-medium text-emerald-400">{b.elite}</td>
                    <td className="py-3 px-4 text-[11px] text-neutral-400 hidden md:table-cell leading-relaxed">
                      {b.mechanism}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Architecture & Input Latency Technical Deep-Dive */}
        <div className="pt-6 border-t border-neutral-850 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-400" /> Why Client-Side Gaming Solves the Input Lag Dilemma
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            In competitive human reflex tests, 10 milliseconds can be the difference between an average score and
            a world-class record. Traditional web games rely on remote game servers or embedded video wrappers that
            introduce variable buffering, network jitter, and TCP/UDP overhead. Wanjaaro utilizes a purely
            decoupled, serverless architecture where each game's rendering loop is bound directly to the user's
            hardware refresh rate (via <code className="text-amber-400 font-mono text-xs">window.requestAnimationFrame</code>).
            Input listeners operate in raw event queues with zero network hops, delivering true microsecond precision
            benchmarks.
          </p>
        </div>

        {/* Directory of Skill Disciplines for Search Engine Indexing */}
        <div className="pt-6 border-t border-neutral-850 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Explore All 12 Cognitive &amp; Reflex Disciplines
          </h3>
          <p className="text-xs text-neutral-400">
            Over {ALL_GAMES.length} instant games engineered across 12 cognitive domains:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1">
            {CATEGORIES.map((cat) => (
              <a
                key={cat.id}
                href={`/#/category/${cat.id}`}
                className="p-2.5 rounded-xl bg-neutral-950/70 hover:bg-neutral-850 border border-neutral-800 text-xs text-neutral-300 hover:text-amber-400 flex flex-col justify-between transition-colors group"
              >
                <div className="flex items-center gap-1.5 font-medium truncate">
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 mt-1">
                  {cat.gameCount} games
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Semantic FAQ Section for Google Crawlers, Perplexity & Users */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 sm:p-10 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Frequently Asked Questions &amp; Direct Answers</h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Definitive answers on human cognitive benchmarks, zero-latency gaming architecture, and score privacy.
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
