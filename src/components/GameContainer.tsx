import React, { useState, useEffect } from 'react';
import { GameMeta } from '../types/game';
import { recordScore, getScore, getStats } from '../utils/storage';
import { sound } from '../utils/sound';
import { GameDispatcher } from '../games/GameDispatcher';
import { ALL_GAMES, CATEGORIES } from '../data/gamesCatalog';
import {
  Trophy,
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowLeft,
  Share2,
  Sparkles,
  ChevronRight,
  Info,
  Clock,
  Target,
  Brain,
  ShieldCheck,
  CheckCircle,
  BarChart2,
} from 'lucide-react';
import { AdBanner } from './ads/AdBanner';
import { TitleIntroAdBanner } from './ads/TitleIntroAdBanner';
import { DesktopSidebarAdLayout } from './ads/DesktopSidebarAdLayout';
import { updateMetaTags } from '../utils/seo';

interface GameContainerProps {
  game: GameMeta;
  onNavigateHome: () => void;
  onNavigateGame: (gameId: string) => void;
  onNavigateCategory: (categoryId: string) => void;
}

export function GameContainer({
  game,
  onNavigateHome,
  onNavigateGame,
  onNavigateCategory,
}: GameContainerProps) {
  const [personalBest, setPersonalBest] = useState<string | null>(null);
  const [playCount, setPlayCount] = useState<number>(0);
  const [isMuted, setIsMuted] = useState(sound.isSoundMuted());
  const [lastResult, setLastResult] = useState<{ score: number; formatted: string; isNewPb: boolean } | null>(null);
  const [gameKey, setGameKey] = useState(0); // to force remount game on restart
  const [copiedShare, setCopiedShare] = useState(false);

  const category = CATEGORIES.find((c) => c.id === game.category);

  // Load existing stats
  useEffect(() => {
    const stat = getScore(game.id);
    if (stat) {
      setPersonalBest(stat.formattedScore || stat.formattedBest || null);
      setPlayCount(stat.playCount);
    } else {
      setPersonalBest(null);
      setPlayCount(0);
    }
    setLastResult(null);
    setGameKey((k) => k + 1);

    // Update dynamic SEO & Answer Engine metadata for this game
    updateMetaTags({
      title: `${game.title} – Free Online Reflex & Skill Benchmark | Wanjaaro`,
      description: `Play ${game.title} online on Wanjaaro. ${game.description || game.summary} Free instant client-side execution, zero latency, local best score tracking.`,
      path: `/game/${game.id}`,
      game,
    });
  }, [game.id, game.title, game.description, game.summary]);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleGameFinish = (score: number, formattedScore: string) => {
    const res = recordScore(game.id, score, formattedScore, game.scoringCriterion);
    setPersonalBest(res.userStat.formattedScore || res.userStat.formattedBest);
    setPlayCount(res.userStat.playCount);
    setLastResult({
      score,
      formatted: formattedScore,
      isNewPb: res.isNewHighScore,
    });
  };

  const handleRestart = () => {
    setLastResult(null);
    setGameKey((k) => k + 1);
  };

  const handleShare = async () => {
    const shareText = `I scored ${lastResult?.formatted || personalBest || 'great'} on ${game.title} at Wanjaaro! Can you beat it? https://wanjaaro.com/#/game/${game.id}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  // Find next game in category
  const categoryGames = ALL_GAMES.filter((g) => g.category === game.category);
  const currentIndex = categoryGames.findIndex((g) => g.id === game.id);
  const nextGame = categoryGames[(currentIndex + 1) % categoryGames.length];

  // Related games
  const relatedGames = categoryGames
    .filter((g) => g.id !== game.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 animate-in fade-in duration-300">
      {/* Desktop 2-Column: Left 75% Game Experience + Right 25% Sticky Ads */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left 75% Column (Full Width on Mobile/Tablet) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-neutral-400">
            <button
              onClick={onNavigateHome}
              className="hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Platform Home
            </button>
            <span>/</span>
            <button
              onClick={() => onNavigateCategory(game.category)}
              className="hover:text-amber-400 transition-colors"
            >
              {category?.name || game.category}
            </button>
            <span>/</span>
            <span className="text-neutral-200 font-medium truncate">{game.title}</span>
          </nav>

      {/* Game Header Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-white">{game.title}</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
              {game.mechanic}
            </span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-md font-mono font-medium ${
                game.difficulty === 'Easy'
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                  : game.difficulty === 'Medium'
                  ? 'bg-amber-950/60 text-amber-400 border border-amber-800'
                  : 'bg-rose-950/60 text-rose-400 border border-rose-800'
              }`}
            >
              {game.difficulty}
            </span>
          </div>
          <p className="text-sm text-neutral-400 mt-1 max-w-xl">{game.description}</p>
        </div>

        {/* Action Controls & Best Score */}
        <div className="flex items-center gap-3 shrink-0">
          {personalBest && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-mono font-medium">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Best: <strong>{personalBest}</strong></span>
            </div>
          )}

          <button
            onClick={toggleSound}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 border border-neutral-700 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={handleRestart}
            title="Restart Game"
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 border border-neutral-700 transition-colors flex items-center gap-1.5 text-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Restart</span>
          </button>
        </div>
      </div>

      {/* Ad under title and intro description (Mobile & Tablet priority) */}
      <section aria-label="Game Title Sponsor" className="w-full">
        <TitleIntroAdBanner slotId={`wanjaaro-${game.id}-intro-banner`} />
      </section>

      {/* Main Interactive Game Canvas Container */}
      <div className="relative bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col items-center justify-center min-h-[380px] overflow-hidden">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Live Game Component */}
        <div key={gameKey} className="w-full flex justify-center z-10">
          <GameDispatcher gameId={game.id} onFinish={handleGameFinish} />
        </div>

        {/* Result Overlay Modal */}
        {lastResult && (
          <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
              {lastResult.isNewPb ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold animate-bounce">
                  <Sparkles className="w-3.5 h-3.5" /> NEW PERSONAL BEST!
                </div>
              ) : (
                <div className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Round Completed</div>
              )}

              <div>
                <p className="text-xs text-neutral-400">Final Result</p>
                <p className="text-4xl font-mono font-extrabold text-white mt-1">{lastResult.formatted}</p>
                {personalBest && !lastResult.isNewPb && (
                  <p className="text-xs text-neutral-400 mt-1 font-mono">Personal Best: {personalBest}</p>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleRestart}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2 text-sm"
                >
                  <RotateCcw className="w-4 h-4" /> Play Again
                </button>

                {nextGame && nextGame.id !== game.id && (
                  <button
                    onClick={() => onNavigateGame(nextGame.id)}
                    className="w-full py-2.5 px-4 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-semibold rounded-xl border border-neutral-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <span>Next: {nextGame.title}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className="w-full py-2 px-3 text-xs text-neutral-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  {copiedShare ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Result Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Score</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Non-Interfering Ad Placement: Below Game Controls & Board */}
      <section aria-label="Game Sponsor Banner" className="w-full">
        <AdBanner slotType="leaderboard" slotId={`wanjaaro-${game.id}-bottom-banner`} />
      </section>

      {/* Comprehensive How-To-Play & Cognitive Guide (Rich Content) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-amber-400" />
            Game Guide & Mechanics: {game.title}
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Learn the rules, the underlying cognitive science, scoring metrics, and strategies to improve your score.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Rules & Controls */}
          <div className="space-y-4">
            <div className="bg-neutral-950/70 border border-neutral-850 p-4 rounded-xl space-y-2">
              <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" /> How to Play
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">{game.howToPlay}</p>
            </div>

            <div className="bg-neutral-950/70 border border-neutral-850 p-4 rounded-xl space-y-2">
              <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" /> Scoring & Objective
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Objective: <strong>{game.objective || game.summary}</strong>. Scores are measured in <strong>{game.scoreUnit || game.scoringUnit}</strong>.
                Achieving a {(game.scoreUnit || game.scoringUnit || 'points').toLowerCase()} ranking reflects faster neuromuscular processing, precise finger
                trajectory, and optimal visual saccades.
              </p>
            </div>
          </div>

          {/* Cognitive Benefits & Strategy */}
          <div className="space-y-4">
            <div className="bg-neutral-950/70 border border-neutral-850 p-4 rounded-xl space-y-2">
              <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                <Brain className="w-4 h-4 text-amber-400" /> Cognitive Skills Tested
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                This game directly trains your <strong>{game.skill}</strong> faculties and <strong>{game.mechanic}</strong>{' '}
                patterns. Consistent 3-minute daily sessions stimulate neuroplasticity in the prefrontal cortex and motor strip.
              </p>
            </div>

            <div className="bg-neutral-950/70 border border-neutral-850 p-4 rounded-xl space-y-2">
              <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" /> Privacy & Local Leaderboard
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                100% Free & Client-Side. Your personal bests, total rounds played ({playCount} rounds), and preferences are
                saved locally in your browser’s localStorage. No cookies, trackers, or accounts required.
              </p>
            </div>
          </div>
        </div>

        {/* Empirical Performance Tiers (Information Gain for AI & Players) */}
        <div className="pt-4 border-t border-neutral-850/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 mb-2.5">
            <BarChart2 className="w-4 h-4 text-amber-400" />
            <span>Empirical Performance Benchmarks &amp; Percentiles: {game.title}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block">Beginner</span>
              <span className="text-xs font-semibold text-neutral-300">Baseline Focus</span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Initial Calibration</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
              <span className="text-[10px] font-mono text-cyan-400 uppercase block">Average</span>
              <span className="text-xs font-semibold text-white">50th Percentile</span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Typical Baseline</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
              <span className="text-[10px] font-mono text-amber-400 uppercase block">Advanced</span>
              <span className="text-xs font-semibold text-white">85th Percentile</span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Competitive Tier</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
              <span className="text-[10px] font-mono text-emerald-400 uppercase block">Elite Pro</span>
              <span className="text-xs font-semibold text-emerald-400">99th Percentile</span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Peak Neuro-Performance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Games in Same Category */}
      {relatedGames.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              More {category?.name} Games
            </h2>
            <button
              onClick={() => onNavigateCategory(game.category)}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              View All {categoryGames.length} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedGames.map((rel) => {
              const relStat = getScore(rel.id);
              return (
                <div
                  key={rel.id}
                  onClick={() => onNavigateGame(rel.id)}
                  className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between group"
                >
                  <div className="space-y-1.5">
                    <span className="text-2xl block mb-2">{rel.icon}</span>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                      {rel.title}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2">{rel.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                    <span>{rel.difficulty}</span>
                    {relStat ? (
                      <span className="text-amber-400 font-medium">{relStat.formattedScore}</span>
                    ) : (
                      <span className="text-neutral-500">Unplayed</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
        </div>

        {/* Right 25% Desktop Ads Column (Sticky, scrolls only when bottom matches loaded page bottom) */}
        <aside
          aria-label="Desktop 25% Right Sponsored Column"
          className="hidden lg:block lg:col-span-1 h-full select-none"
        >
          <div className="sticky top-20">
            <DesktopSidebarAdLayout />
          </div>
        </aside>
      </div>
    </div>
  );
}
