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
  BookOpen,
} from 'lucide-react';
import { ALL_GAMES, CATEGORIES } from '../data/gamesCatalog';

export function WanjaaroSEOSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const benchmarks = [
    {
      test: 'Reaction Time Test',
      gameId: 'reflex-reaction-time',
      category: 'Reflex & Reaction',
      metric: 'Visual Millisecond Latency (ms)',
      average: '215ms – 250ms',
      elite: '< 180ms (Pro Esports & Pilots)',
      mechanism: 'Photoreceptor excitation to visual cortex signal conduction, processed through the corticospinal motor tract.',
    },
    {
      test: 'Chimp Memory Test',
      gameId: 'memory-spatial-span',
      category: 'Memory & Recall',
      metric: 'Working Memory Span',
      average: 'Level 7 – 9 (Miller\'s Law)',
      elite: 'Level 12+ (Ayumu Benchmark)',
      mechanism: 'Short-term visual sequence retention and rapid spatial recall under brief stimulus presentation.',
    },
    {
      test: 'Klondike Solitaire Classic',
      gameId: 'solitaire',
      category: 'Casual & Arcade',
      metric: 'Moves & Completion Rate',
      average: '110 – 145 moves (~33% win rate)',
      elite: '< 85 moves (> 80% win rate)',
      mechanism: 'Probabilistic card depth planning, hidden tableau excavation priority, and alternate-color sequencing.',
    },
    {
      test: 'Master Sudoku 9x9',
      gameId: 'sudoku',
      category: 'Logic & Puzzles',
      metric: 'Pure Deduction Solving Time',
      average: '12 – 18 mins (Standard)',
      elite: '< 6 mins (Naked/Hidden Pairs & Subsets)',
      mechanism: 'Systematic constraint satisfaction, candidate elimination grids, and combinatorial deduction.',
    },
    {
      test: 'Mahjong Solitaire Classic',
      gameId: 'mahjong',
      category: 'Casual & Arcade',
      metric: 'Board Clear Time & Pairs/Min',
      average: '7 – 11 mins',
      elite: '< 4 mins (High Layer Clearance)',
      mechanism: 'Depth-first visual layer analysis, free horizontal edge unblocking, and match availability planning.',
    },
    {
      test: 'Picross Nonogram Logic',
      gameId: 'nonogram',
      category: 'Logic & Puzzles',
      metric: 'Grid Deduction Time & Accuracy',
      average: '4 – 7 mins (10x10 Grid)',
      elite: '< 2.5 mins (Zero Penalty Misses)',
      mechanism: 'Binary line constraint deduction, cross-referencing row and column numerical runs, and overlap deduction.',
    },
    {
      test: 'Daily Mind Puzzle',
      gameId: 'daily-puzzle',
      category: 'Logic & Puzzles',
      metric: '4-Group Categorization Accuracy',
      average: '2 – 3 Mistakes Made',
      elite: '0 Mistakes (Flawless Connections)',
      mechanism: 'Semantic concept clustering, lateral association flexibility, and cognitive bias resistance.',
    },
    {
      test: 'Galactic Ore Miner (Idle)',
      gameId: 'idle-games',
      category: 'Casual & Arcade',
      metric: 'Ore per Second (OPS) Compounding',
      average: '1,000 – 50,000 OPS',
      elite: '10M+ OPS (Prestige Ascension)',
      mechanism: 'Mathematical exponential growth optimization, compound resource reinvestment, and timing.',
    },
    {
      test: 'Aim Precision Sniper',
      gameId: 'aim-sniper',
      category: 'Aim & Precision',
      metric: 'Target Acquisition Time',
      average: '420ms – 520ms',
      elite: '< 320ms (Sub-pixel Tracking)',
      mechanism: 'Fitts\'s Law target acquisition, fine motor cursor deceleration curves, and hand-eye ballistic flicks.',
    },
    {
      test: 'Speed Typist Drill',
      gameId: 'typing-speed-words',
      category: 'Typing & Words',
      metric: 'Net Words Per Minute (WPM)',
      average: '42 – 62 WPM',
      elite: '100+ WPM (99th Percentile)',
      mechanism: 'Bimanual neuromuscular muscle memory, anticipatory text buffering, and sub-vocal lexeme parsing.',
    },
    {
      test: 'Stroop Color Challenge',
      gameId: 'perception-stroop-test',
      category: 'Perception & Vision',
      metric: 'Cognitive Inhibition Cost',
      average: '120ms – 180ms delay',
      elite: '< 60ms delay (Laser Focus)',
      mechanism: 'Interference resolution and selective attention when word meaning conflicts with font color.',
    },
    {
      test: 'Schulte Grid 5x5',
      gameId: 'speed-click-25',
      category: 'Speed & Accuracy',
      metric: '25-Digit Ascending Search Time',
      average: '32s – 46s',
      elite: '< 20s (Speed Reader Benchmark)',
      mechanism: 'Visual scanning speed, peripheral target identification, and numerical ordering.',
    },
  ];

  const faqs = [
    {
      q: 'What is Wanjaaro and how does it work without accounts or downloads?',
      a: 'Wanjaaro is an open client-side web arcade engineered with TypeScript, HTML5 Canvas, and Web Audio. When you launch any game, the code executes directly in your web browser using your device\'s processor and graphics chip. No code is streamed from remote game servers, which means there is zero network latency, no software to download, and no registration required. All personal records, round histories, and preferences are saved privately on your device using standard browser localStorage.',
    },
    {
      q: 'What is an average human reaction time, and how can I improve mine?',
      a: 'For visual signals, the average human reaction time is approximately 215 to 250 milliseconds (ms). Scores between 180ms and 200ms are considered fast, typical of competitive gamers, martial artists, and racing drivers. Scores below 170ms approach biological human limits. You can improve your reaction time with consistent practice, adequate sleep, staying hydrated, and using a high-refresh-rate display with a low-latency wired mouse.',
    },
    {
      q: 'How does the Chimp Memory Test work and why can chimpanzees outperform humans?',
      a: 'The test recreates the renowned Kyoto University Primate Research Institute study with the chimpanzee Ayumu. Numbers 1 through 9 are displayed on a grid for a fraction of a second before turning into blank squares. Players must recall and click the hidden numbers in ascending order (1, 2, 3... 9). Most human adults struggle after 7 items due to Miller\'s Law (working memory limit of 7 ± 2 items). Young chimpanzees, however, routinely recall all 9 numbers effortlessly because their working recall excels at brief visual patterns without linguistic distraction.',
    },
    {
      q: 'What are the rules and best winning strategies for Klondike Solitaire?',
      a: 'In Klondike Solitaire, your goal is to transfer all 52 cards into the 4 foundation piles, ordered by suit from Ace to King. In the 7 tableau columns, cards must be arranged in descending rank with alternating red and black suits (for example, a black 8 on a red 9). Key strategies to win include: 1) Always prioritize moves that reveal face-down cards in deep tableau columns rather than drawing from the stock deck; 2) Keep empty columns reserved for Kings to unlock buried cards; 3) Do not rush to move cards to foundation piles if they might still help build sequences in the tableau.',
    },
    {
      q: 'How do you solve 9x9 Sudoku puzzles without guessing?',
      a: 'Every valid Sudoku puzzle has a unique solution that can be found through pure logic. Start by scanning for "naked singles"—cells where only one number from 1 to 9 can fit based on existing numbers in that row, column, and 3x3 block. Next, use note mode to write candidate numbers in cells that have only 2 or 3 possibilities. Look for "hidden singles" (a number that can only go in one specific spot in a 3x3 box) and "naked pairs" (two cells in the same row or box that share the exact same two candidates), which lets you safely eliminate those candidates from neighboring cells.',
    },
    {
      q: 'How does Mahjong Solitaire work and what makes a tile free to match?',
      a: 'Mahjong Solitaire is a tile-matching puzzle played with traditional Chinese tile sets arranged in multi-level layered pyramids. To match and remove a pair of identical tiles, both tiles must be "free." A tile is free if: 1) No tile is resting on top of it, and 2) Either its left edge or right edge is completely open with no neighboring tile touching it. The best strategy is to focus on clearing tall vertical stacks and long horizontal rows early to expose as many new free tiles as possible.',
    },
    {
      q: 'What are Nonograms (Picross) and how do you read the number clues?',
      a: 'Nonograms (also called Picross, Paint by Numbers, or Griddlers) are picture-logic puzzles where number clues along the top and left tell you how many consecutive filled squares exist in each line. For example, a clue of "3 2" means there is a block of 3 filled squares, followed by one or more empty spaces, followed by a block of 2 filled squares. By comparing row clues with column clues, you can logically deduce which squares to fill with color and which to cross out with an X, gradually revealing a hidden pixel-art image.',
    },
    {
      q: 'How does the Daily Mind Puzzle work and when does it reset?',
      a: 'The Daily Mind Puzzle provides a handcrafted word and concept challenge every single calendar day, updating at midnight in your local time zone. Players are given 16 related words and must identify 4 secret groups of 4 connected concepts (such as chess pieces, astronomical terms, or idioms) within 4 mistake lives. Your solving streak is saved locally on your device, and you can copy formatted emoji blocks to share your daily result with friends.',
    },
    {
      q: 'What is an idle / incremental game (like Galactic Ore Miner) and how do ascensions work?',
      a: 'Idle and incremental games feature an addictive loop of extracting resources, purchasing automated production (such as plasma drills and mining stations), and watching numbers grow exponentially. When progress slows down, you can "ascend" or prestige, resetting current minerals in exchange for permanent cosmic multipliers that make future runs significantly faster and deeper.',
    },
    {
      q: 'How does Wanjaaro measure latency and accuracy across different games?',
      a: 'Wanjaaro captures high-resolution timestamps to measure the exact millisecond delta between when a target or prompt appears and when you tap, click, or press a key. For accuracy benchmarks, games calculate the percentage of correct inputs against total attempts under fixed time constraints.',
    },
    {
      q: 'Why do client-side browser games have lower latency than cloud gaming?',
      a: 'Client-side games run directly on your own device\'s hardware via hardware-accelerated rendering loops, responding to mouse clicks and touch taps in under 1 millisecond. In contrast, cloud streaming services (like GeForce Now or Xbox Cloud) must capture input, send it over the internet to a remote data center, render the frame, and stream compressed video back to your screen—introducing 30ms to 120ms of uncontrollable ping that hinders reflex testing.',
    },
    {
      q: 'Where are my scores, streaks, and personal bests stored?',
      a: 'All high scores, reaction times, daily puzzle streaks, and game settings are stored directly in your browser\'s localStorage on your personal phone, tablet, or computer. The site may use cookies for advertisements and analytics as described in the Privacy Policy.',
    },
    {
      q: 'Can I play Wanjaaro on mobile phones, tablets, and offline?',
      a: 'Yes. Every game is built with responsive dual-input controls: smooth touch gestures for smartphones and tablets, alongside precision keyboard and mouse controls for laptops and desktop workstations. Furthermore, because games are lightweight client-side assets, once loaded in your browser, they continue to run smoothly even if your internet connection drops.',
    },
    {
      q: 'Are all games on Wanjaaro completely free to play?',
      a: 'Yes, 100% free. There are no paywalls, subscriptions, in-app purchases, or locked tiers. You can play every game immediately without ever having to create an account or provide payment information.',
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
            zero-latency gaming directly inside any modern web browser across {ALL_GAMES.length} instant games.
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

        {/* Cognitive & Reflex Performance Norms Table */}
        <div className="pt-6 border-t border-neutral-850 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" /> Human Cognitive &amp; Reflex Performance Norms
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Standard baseline norms vs. top 1% elite human performance across core cognitive and logic tests.
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
                        href={`/${b.gameId}`}
                        onClick={(e) => {
                          e.preventDefault();
                          window.history.pushState(null, '', `/${b.gameId}`);
                          window.dispatchEvent(new PopStateEvent('popstate'));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
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

        {/* Directory of Skill Disciplines for Search Engine Indexing */}
        <div className="pt-6 border-t border-neutral-850 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Explore All 12 Cognitive &amp; Reflex Disciplines
          </h3>
          <p className="text-xs text-neutral-400">
            Over {ALL_GAMES.length} instant games engineered across 12 distinct cognitive and arcade domains:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1">
            {CATEGORIES.map((cat) => (
              <a
                key={cat.id}
                href={`/${cat.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState(null, '', `/${cat.id}`);
                  window.dispatchEvent(new PopStateEvent('popstate'));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
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
