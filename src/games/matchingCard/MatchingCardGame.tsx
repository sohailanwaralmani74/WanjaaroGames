import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ALL_SPECIES_LIST,
  CardSlot,
  DIFFICULTY_CONFIGS,
  MatchingDifficulty,
  MatchingGameMode,
  SpeciesFactEntry,
  applyMismatchPenalty,
  calculateMatchGain,
  calculateStarRating,
  calculateTimeBonus,
  generateDeck,
  getTodayDateString,
  runMatchingBoardSelfTest,
} from './engine';
import {
  MatchingGameRecords,
  MatchingGameSettings,
  getDiffModeKey,
  loadMatchingRecords,
  loadMatchingSettings,
  recordCompletedMatchingGame,
  resetMatchingRecords,
  saveMatchingSettings,
} from './storage';
import { matchingAudio } from './audio';
import { SpeciesArtSvg } from './SpeciesArt';
import { MatchingShareModal, formatDurationMmSs } from './MatchingShareModal';
import {
  Volume2,
  VolumeX,
  Trophy,
  Settings,
  HelpCircle,
  Pause,
  Play,
  RotateCcw,
  Share2,
  Sun,
  Moon,
  Sparkles,
  Calendar,
  Users,
  Clock,
  BookOpen,
  Trash2,
  CheckCircle2,
  ChevronDown,
  Home,
  Flame,
} from 'lucide-react';

interface MatchingCardGameProps {
  onNavigateHome?: () => void;
}

export const MatchingCardGame: React.FC<MatchingCardGameProps> = ({ onNavigateHome }) => {
  const [settings, setSettings] = useState<MatchingGameSettings>(() => loadMatchingSettings());
  const [records, setRecords] = useState<MatchingGameRecords>(() => loadMatchingRecords());
  const [isMuted, setIsMuted] = useState<boolean>(() => matchingAudio.isMuted());

  // Screens: 'menu' | 'setup' | 'playing' | 'result' | 'gallery' | 'records'
  const [screen, setScreen] = useState<
    'menu' | 'setup' | 'playing' | 'result' | 'gallery' | 'records'
  >('menu');

  const [mode, setMode] = useState<MatchingGameMode>('classic');
  const [difficulty, setDifficulty] = useState<MatchingDifficulty>('medium');

  // Modals
  const [isPaused, setIsPaused] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showFaqDrawer, setShowFaqDrawer] = useState(false);

  const todayDate = getTodayDateString();

  // Active Match State
  const [cards, setCards] = useState<CardSlot[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isLockedForMismatch, setIsLockedForMismatch] = useState<boolean>(false);
  const [moves, setMoves] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [comboStreak, setComboStreak] = useState<number>(0);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [remainingSec, setRemainingSec] = useState<number>(90);
  const [focusedCardIdx, setFocusedCardIdx] = useState<number>(0);

  // Two-Player State
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  const [p1Score, setP1Score] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);
  const [p1Pairs, setP1Pairs] = useState<number>(0);
  const [p2Pairs, setP2Pairs] = useState<number>(0);

  // Result State
  const [didWin, setDidWin] = useState<boolean>(true);
  const [isNewPersonalBest, setIsNewPersonalBest] = useState<boolean>(false);
  const [dailyAlreadyCounted, setDailyAlreadyCounted] = useState<boolean>(false);
  const [srAnnouncement, setSrAnnouncement] = useState<string>(
    'Welcome to Matching Card Game on ReptileBirds.'
  );
  const [selfTestStatus, setSelfTestStatus] = useState<{
    passed: boolean;
    testedCount: number;
  } | null>(null);

  const cardButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const mismatchTimerRef = useRef<number | null>(null);

  // Run board verification self-test once on mount
  useEffect(() => {
    const res = runMatchingBoardSelfTest();
    setSelfTestStatus({ passed: res.passed, testedCount: res.testedCount });
  }, []);

  useEffect(() => {
    return () => {
      if (mismatchTimerRef.current) window.clearTimeout(mismatchTimerRef.current);
    };
  }, []);

  const updateSetting = <K extends keyof MatchingGameSettings>(
    key: K,
    val: MatchingGameSettings[K]
  ) => {
    const next = { ...settings, [key]: val };
    setSettings(next);
    saveMatchingSettings(next);
  };

  const handleToggleMute = () => {
    const next = matchingAudio.toggleMute();
    setIsMuted(next);
  };

  // Start a new board
  const startMatch = useCallback(
    (overrideMode?: MatchingGameMode, overrideDiff?: MatchingDifficulty) => {
      if (mismatchTimerRef.current) window.clearTimeout(mismatchTimerRef.current);

      const activeMode = overrideMode ?? mode;
      const activeDiff: MatchingDifficulty =
        activeMode === 'daily' ? 'medium' : overrideDiff ?? difficulty;

      if (activeMode === 'daily') {
        setDifficulty('medium');
      }

      const cfg = DIFFICULTY_CONFIGS[activeDiff];
      const newDeck = generateDeck(
        activeDiff,
        activeMode === 'daily' ? todayDate : undefined
      );

      setCards(newDeck);
      setFlippedIndices([]);
      setIsLockedForMismatch(false);
      setMoves(0);
      setScore(0);
      setComboStreak(0);
      setElapsedSec(0);
      setRemainingSec(cfg.timeLimitSec);
      setFocusedCardIdx(0);
      setActivePlayer(1);
      setP1Score(0);
      setP2Score(0);
      setP1Pairs(0);
      setP2Pairs(0);
      setDidWin(true);
      setIsNewPersonalBest(false);
      setDailyAlreadyCounted(false);
      setIsPaused(false);
      setScreen('playing');
      setSrAnnouncement(
        `Started ${activeMode} mode on ${cfg.label} grid with ${cfg.pairs} pairs.`
      );
    },
    [mode, difficulty, todayDate]
  );

  // 1-second timer tick during active gameplay
  useEffect(() => {
    if (screen !== 'playing' || isPaused) return;

    const interval = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1);

      if (mode === 'timed') {
        setRemainingSec((prev) => {
          if (prev <= 1) {
            window.clearInterval(interval);
            matchingAudio.playMiss();
            setDidWin(false);
            const activeDiff: MatchingDifficulty = difficulty;
            const matchedCount = cards.filter((c) => c.status === 'matched').length / 2;
            const recOut = recordCompletedMatchingGame({
              mode,
              difficulty: activeDiff,
              won: false,
              score,
              moves,
              elapsedSec: DIFFICULTY_CONFIGS[activeDiff].timeLimitSec,
              matchesMade: matchedCount,
              stars: 1,
            });
            setRecords(recOut.updated);
            setSrAnnouncement('Time is up! Game over.');
            setScreen('result');
            return 0;
          }
          if (prev <= 11) {
            matchingAudio.playTimeWarning();
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [screen, isPaused, mode, difficulty, cards, score, moves]);

  // Handle flipping a card
  const handleCardFlip = useCallback(
    (idx: number) => {
      if (screen !== 'playing' || isPaused || isLockedForMismatch) return;
      const targetCard = cards[idx];
      if (!targetCard || targetCard.status !== 'down') return;
      if (flippedIndices.includes(idx)) return;

      matchingAudio.playFlip();
      setFocusedCardIdx(idx);

      const nextCards = cards.map((c, i) =>
        i === idx ? { ...c, status: 'up' as const } : c
      );
      const nextFlipped = [...flippedIndices, idx];
      setCards(nextCards);
      setFlippedIndices(nextFlipped);

      if (nextFlipped.length === 1) {
        setSrAnnouncement(
          `Card ${idx + 1} flipped: ${targetCard.species} (${targetCard.animalType}).`
        );
        return;
      }

      // Second card flipped -> evaluate match vs miss
      const [firstIdx, secondIdx] = nextFlipped;
      const firstCard = nextCards[firstIdx];
      const secondCard = nextCards[secondIdx];
      const nextMoves = moves + 1;
      setMoves(nextMoves);

      if (firstCard.species === secondCard.species) {
        // MATCH!
        const nextStreak = comboStreak + 1;
        setComboStreak(nextStreak);
        matchingAudio.playMatch(nextStreak);

        const gain = calculateMatchGain(nextStreak);
        const nextScore = score + gain.totalAdded;
        setScore(nextScore);

        if (mode === 'two-player') {
          if (activePlayer === 1) {
            setP1Score((s) => s + gain.totalAdded);
            setP1Pairs((p) => p + 1);
          } else {
            setP2Score((s) => s + gain.totalAdded);
            setP2Pairs((p) => p + 1);
          }
        }

        const matchedDeck = nextCards.map((c, i) =>
          i === firstIdx || i === secondIdx ? { ...c, status: 'matched' as const } : c
        );
        setCards(matchedDeck);
        setFlippedIndices([]);

        // Check if all pairs are matched
        const allMatched = matchedDeck.every((c) => c.status === 'matched');
        if (allMatched) {
          matchingAudio.playWin();
          const activeDiff: MatchingDifficulty =
            mode === 'daily' ? 'medium' : difficulty;
          const totalPairs = DIFFICULTY_CONFIGS[activeDiff].pairs;

          // Add time bonus for Timed and Daily modes
          const timeBonus =
            mode === 'timed'
              ? calculateTimeBonus(remainingSec)
              : mode === 'daily'
              ? calculateTimeBonus(Math.max(0, 90 - elapsedSec))
              : 0;
          const finalScore = nextScore + timeBonus;
          setScore(finalScore);

          const stars = calculateStarRating(nextMoves, totalPairs);
          const recResult = recordCompletedMatchingGame({
            mode,
            difficulty: activeDiff,
            won: true,
            score: finalScore,
            moves: nextMoves,
            elapsedSec,
            matchesMade: totalPairs,
            stars,
            dailyDate: mode === 'daily' ? todayDate : undefined,
          });
          setRecords(recResult.updated);
          setIsNewPersonalBest(recResult.isNewPersonalBest);
          setDailyAlreadyCounted(recResult.dailyAlreadyCountedToday);
          setDidWin(true);
          setSrAnnouncement(
            `Matched ${firstCard.species}! All ${totalPairs} pairs complete in ${nextMoves} moves! Final score ${finalScore}.`
          );
          setScreen('result');
        } else {
          setSrAnnouncement(
            `Match found! Pair of ${firstCard.species}. +${gain.totalAdded} points.`
          );
        }
      } else {
        // MISS: lock board for 900ms, deduct 10 points (floor 0), reset combo
        setIsLockedForMismatch(true);
        setComboStreak(0);
        const penalized = applyMismatchPenalty(score);
        setScore(penalized);
        matchingAudio.playMiss();

        setSrAnnouncement(
          `Card ${secondIdx + 1} is ${secondCard.species}. No match — cards will flip back.`
        );

        mismatchTimerRef.current = window.setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, status: 'down' as const } : c
            )
          );
          setFlippedIndices([]);
          setIsLockedForMismatch(false);
          if (mode === 'two-player') {
            setActivePlayer((p) => (p === 1 ? 2 : 1));
          }
        }, 900);
      }
    },
    [
      screen,
      isPaused,
      isLockedForMismatch,
      cards,
      flippedIndices,
      moves,
      comboStreak,
      score,
      mode,
      activePlayer,
      difficulty,
      remainingSec,
      elapsedSec,
      todayDate,
    ]
  );

  // Keyboard navigation across the card grid (Arrow keys + Enter/Space)
  const activeDiff: MatchingDifficulty = mode === 'daily' ? 'medium' : difficulty;
  const gridCfg = DIFFICULTY_CONFIGS[activeDiff];

  const handleCardKeyDown = (e: React.KeyboardEvent, idx: number) => {
    const cols = gridCfg.cols;
    const total = cards.length;
    let nextIdx = idx;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextIdx = (idx + 1) % total;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIdx = (idx - 1 + total) % total;
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      nextIdx = (idx + cols) % total;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      nextIdx = (idx - cols + total) % total;
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardFlip(idx);
      return;
    } else {
      return;
    }

    setFocusedCardIdx(nextIdx);
    cardButtonsRef.current[nextIdx]?.focus();
  };

  const isLight = settings.theme === 'light';
  const currentBestObj =
    mode === 'daily'
      ? {
          bestScore: records.dailyByDate[todayDate]?.score || 0,
          fewestMoves: records.dailyByDate[todayDate]?.moves || null,
          fastestTimeSec: records.dailyByDate[todayDate]?.timeSec || null,
        }
      : records.byDiffAndMode[getDiffModeKey(mode, activeDiff)] || {
          bestScore: 0,
          fewestMoves: null,
          fastestTimeSec: null,
        };

  // Distinct species on the current board for the share card
  const uniqueBoardSpecies: SpeciesFactEntry[] = [];
  const seenSp = new Set<string>();
  cards.forEach((c) => {
    if (!seenSp.has(c.species)) {
      seenSp.add(c.species);
      const found = ALL_SPECIES_LIST.find((s) => s.species === c.species);
      if (found) uniqueBoardSpecies.push(found);
    }
  });

  const earnedStars = calculateStarRating(moves, gridCfg.pairs);

  return (
    <div
      className={`flex-1 flex flex-col justify-between transition-colors select-none ${
        isLight
          ? 'rb-light-theme bg-gradient-to-b from-emerald-100 via-amber-50 to-emerald-100 text-slate-900'
          : 'bg-transparent text-slate-100'
      }`}
    >
      {/* Screen-Reader Live Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {srAnnouncement}
      </div>

      {/* Top Ad Container (Strictly Outside Game Area) */}
      <div id="ad-slot-top" className="w-full h-0 overflow-hidden" aria-label="Top sponsor slot" />

      {/* MAIN GAME STAGE */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-2 sm:px-4 py-1.5">
        {/* SCREEN 1: START MENU */}
        {screen === 'menu' && (
          <div
            className={`w-full max-w-3xl rounded-3xl border-2 p-4 sm:p-6 space-y-4 shadow-2xl ${
              isLight
                ? 'bg-white/95 border-emerald-400'
                : 'bg-slate-900/95 border-emerald-500/40'
            }`}
          >
            {/* Compact Utility Header Inside Menu */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/50">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                Matching Card Game • 18 Species
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setScreen('gallery')}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border bg-slate-800 border-slate-700 text-slate-200 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Species</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScreen('records')}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border bg-slate-800 border-slate-700 text-slate-200 cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Records</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsHowToPlayOpen(true)}
                  className="p-1.5 rounded-xl border bg-slate-800 border-slate-700 text-emerald-400 cursor-pointer"
                  aria-label="How to Play"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-1.5 rounded-xl border bg-slate-800 border-slate-700 text-slate-200 cursor-pointer"
                  aria-label="Settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="p-1.5 rounded-xl border bg-slate-800 border-slate-700 cursor-pointer"
                  aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                >
                  {isMuted ? (
                    <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </button>
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="flex justify-center items-center gap-3">
                <SpeciesArtSvg species="Scarlet Macaw" size={44} />
                <SpeciesArtSvg species="Green Sea Turtle" size={44} />
                <SpeciesArtSvg species="Barn Owl" size={44} />
                <SpeciesArtSvg species="Panther Chameleon" size={44} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Matching Card Game
              </h2>
              <p className="text-xs opacity-80 max-w-md mx-auto">
                Flip cards to match pairs of 9 birds and 9 reptiles. Features 4 grid sizes,
                combo streaks, and daily seeded challenges.
              </p>
            </div>

            {/* 4 Modes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setMode('classic');
                  setScreen('setup');
                }}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  isLight
                    ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300'
                    : 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/40'
                }`}
              >
                <div>
                  <p className="font-extrabold text-sm sm:text-base">Classic Mode</p>
                  <p className="text-[11px] opacity-75">
                    No timer · Finish in fewest moves
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">SELECT →</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('timed');
                  setScreen('setup');
                }}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  isLight
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-300'
                    : 'bg-amber-950/30 hover:bg-amber-900/40 border-amber-500/40'
                }`}
              >
                <div>
                  <p className="font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Timed Mode</span>
                  </p>
                  <p className="text-[11px] opacity-75">
                    Beat the clock (+2 pts/sec bonus)
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">SELECT →</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('daily');
                  startMatch('daily', 'medium');
                }}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  isLight
                    ? 'bg-sky-50 hover:bg-sky-100 border-sky-300'
                    : 'bg-sky-950/30 hover:bg-sky-900/40 border-sky-500/40'
                }`}
              >
                <div>
                  <p className="font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-sky-400" />
                    <span>Daily Challenge</span>
                  </p>
                  <p className="text-[11px] opacity-75">
                    Medium 4×4 · Seed {todayDate}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-sky-400">
                  {records.dailyByDate[todayDate]
                    ? `${records.dailyByDate[todayDate].score} pts`
                    : 'PLAY →'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('two-player');
                  setScreen('setup');
                }}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  isLight
                    ? 'bg-violet-50 hover:bg-violet-100 border-violet-300'
                    : 'bg-violet-950/30 hover:bg-violet-900/40 border-violet-500/40'
                }`}
              >
                <div>
                  <p className="font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-violet-400" />
                    <span>Two Players</span>
                  </p>
                  <p className="text-[11px] opacity-75">
                    Pass device · Match keeps your turn
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-violet-400">2P →</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/40 text-xs">
              <button
                type="button"
                onClick={() => setScreen('gallery')}
                className="text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                🦜🐍 Browse All 18 Bird &amp; Reptile Species →
              </button>
              <span className="text-[11px] opacity-70">
                Scores are saved on this device only.
              </span>
            </div>
          </div>
        )}

        {/* SCREEN 2: DIFFICULTY SELECT */}
        {screen === 'setup' && (
          <div
            className={`w-full rounded-3xl border-2 p-5 sm:p-6 space-y-5 shadow-2xl ${
              isLight ? 'bg-white border-emerald-400' : 'bg-slate-900 border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
              <div>
                <p className="text-xs font-bold text-emerald-400 uppercase">
                  {mode === 'classic'
                    ? 'Classic Mode'
                    : mode === 'timed'
                    ? 'Timed Mode'
                    : 'Two Players Mode'}
                </p>
                <h2 className="text-xl font-extrabold">Select Grid Difficulty</h2>
              </div>
              <button
                type="button"
                onClick={() => setScreen('menu')}
                className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                ← Back
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['easy', 'medium', 'hard', 'expert'] as const).map((diffKey) => {
                const cfg = DIFFICULTY_CONFIGS[diffKey];
                const active = difficulty === diffKey;
                const rec = records.byDiffAndMode[getDiffModeKey(mode, diffKey)];
                return (
                  <button
                    key={diffKey}
                    type="button"
                    onClick={() => setDifficulty(diffKey)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      active
                        ? 'bg-emerald-600/20 border-emerald-400'
                        : isLight
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <p className="font-extrabold text-sm capitalize">{diffKey}</p>
                    <p className="text-xs font-mono opacity-80">
                      {cfg.cols}×{cfg.rows} ({cfg.pairs} pairs)
                    </p>
                    {mode === 'timed' && (
                      <p className="text-[11px] text-amber-400 font-mono mt-1">
                        ⏱ {cfg.timeLimitSec}s limit
                      </p>
                    )}
                    <p className="text-[10px] font-mono text-emerald-400 mt-1">
                      Best: {rec ? rec.bestScore : 0}
                    </p>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => startMatch(mode, difficulty)}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg transition-all cursor-pointer"
            >
              Deal Cards →
            </button>
          </div>
        )}

        {/* SCREEN 3: ACTIVE CARD GRID & HUD (DESKTOP: STACKED LEFT STATS | MOBILE: TOP STATS) */}
        {(screen === 'playing' || screen === 'result') && (
          <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-3 lg:gap-6">
            {/* BIG SCREEN (lg+): STACKED LEFT STATISTICS & CONTROLS */}
            <aside className="hidden lg:flex lg:flex-col lg:w-60 shrink-0 gap-2.5">
              <div
                className={`rounded-2xl border p-3.5 shadow-lg space-y-2 ${
                  isLight ? 'bg-white border-emerald-300' : 'bg-slate-900/95 border-emerald-500/30'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400">
                    {mode === 'daily'
                      ? `Daily (${todayDate})`
                      : `${activeDiff.toUpperCase()} (${gridCfg.cols}×${gridCfg.rows})`}
                  </span>
                  <span className="text-[10px] font-mono text-amber-300">
                    {matchedPairs}/{gridCfg.pairs} Pairs
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl px-3 py-2 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      Score
                    </span>
                    <span className="text-xl font-black text-emerald-400 tabular-nums">
                      {score}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl px-3 py-2 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300/90">
                      Best Score
                    </span>
                    <span className="text-xl font-black text-amber-400 tabular-nums">
                      {records.byDiffAndMode[getDiffModeKey(mode, activeDiff)]?.bestScore ?? 0}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-1.5">
                    <span className="text-[9px] uppercase text-slate-400 font-bold block">
                      Moves
                    </span>
                    <span className="font-mono font-extrabold text-xs text-white tabular-nums">
                      {moves}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-1.5">
                    <span className="text-[9px] uppercase text-slate-400 font-bold block">
                      {mode === 'timed' ? 'Time Left' : 'Time'}
                    </span>
                    <span
                      className={`font-mono font-extrabold text-xs tabular-nums ${
                        mode === 'timed' && remainingSec <= 10
                          ? 'text-rose-400 animate-pulse'
                          : 'text-amber-400'
                      }`}
                    >
                      {formatDurationMmSs(mode === 'timed' ? remainingSec : elapsedSec)}
                    </span>
                  </div>
                </div>

                {comboStreak > 1 && (
                  <div className="bg-sky-500/15 border border-sky-400/40 rounded-xl px-2.5 py-1 text-center text-xs font-extrabold text-sky-300">
                    Combo Streak: {comboStreak}x 🔥
                  </div>
                )}

                {mode === 'two-player' && (
                  <div className="space-y-1.5 pt-1">
                    <div
                      className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-between text-xs ${
                        activePlayer === 1
                          ? 'bg-emerald-500/20 border-emerald-400 font-bold'
                          : 'bg-slate-900/60 border-slate-800 opacity-75'
                      }`}
                    >
                      <span>P1 {activePlayer === 1 ? '●' : ''}</span>
                      <span className="font-mono text-emerald-400">
                        {p1Pairs}p · {p1Score}
                      </span>
                    </div>
                    <div
                      className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-between text-xs ${
                        activePlayer === 2
                          ? 'bg-amber-500/20 border-amber-400 font-bold'
                          : 'bg-slate-900/60 border-slate-800 opacity-75'
                      }`}
                    >
                      <span>P2 {activePlayer === 2 ? '●' : ''}</span>
                      <span className="font-mono text-amber-400">
                        {p2Pairs}p · {p2Score}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Left Stacked Action Controls */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 flex flex-col gap-1.5 shadow-md">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsPaused((p) => !p)}
                    className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => startMatch()}
                    className="py-2 px-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5 border border-emerald-500/30 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restart</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setScreen('menu')}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 cursor-pointer"
                >
                  Change Mode / Grid
                </button>
              </div>
            </aside>

            {/* CENTER COLUMN: MOBILE TOP STATS + ERGONOMIC RESPONSIVE CARD GRID */}
            <div className="flex-1 flex flex-col items-center w-full max-w-[min(95vw,660px)] gap-2">
              {/* MOBILE (< lg): COMPACT TOP SCORE, BEST, MOVES & TIME BAR */}
              <div className="lg:hidden w-full grid grid-cols-5 gap-1 text-center">
                <div
                  className={`px-1.5 py-1 rounded-xl border ${
                    isLight ? 'bg-white border-emerald-200' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <span className="text-[9px] opacity-70 block">SCORE</span>
                  <span className="font-mono font-extrabold text-xs text-emerald-400 tabular-nums">
                    {score}
                  </span>
                </div>

                <div
                  className={`px-1.5 py-1 rounded-xl border ${
                    isLight ? 'bg-white border-emerald-200' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <span className="text-[9px] opacity-70 block">BEST</span>
                  <span className="font-mono font-extrabold text-xs text-amber-400 tabular-nums">
                    {records.byDiffAndMode[getDiffModeKey(mode, activeDiff)]?.bestScore ?? 0}
                  </span>
                </div>

                <div
                  className={`px-1.5 py-1 rounded-xl border ${
                    isLight ? 'bg-white border-emerald-200' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <span className="text-[9px] opacity-70 block">MOVES</span>
                  <span className="font-mono font-extrabold text-xs tabular-nums">
                    {moves}
                  </span>
                </div>

                <div
                  className={`px-1.5 py-1 rounded-xl border ${
                    isLight ? 'bg-white border-emerald-200' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <span className="text-[9px] opacity-70 block">
                    {mode === 'timed' ? 'LEFT' : 'TIME'}
                  </span>
                  <span
                    className={`font-mono font-extrabold text-xs tabular-nums ${
                      mode === 'timed' && remainingSec <= 10
                        ? 'text-rose-400 animate-pulse'
                        : 'text-amber-400'
                    }`}
                  >
                    {formatDurationMmSs(mode === 'timed' ? remainingSec : elapsedSec)}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => startMatch()}
                    className="p-1.5 rounded-xl bg-emerald-600 text-white cursor-pointer"
                    aria-label="Restart"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreen('menu')}
                    className="p-1.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-bold cursor-pointer"
                  >
                    Menu
                  </button>
                </div>
              </div>

              {/* Two-Player Scoreboard Bar (Mobile) */}
              {mode === 'two-player' && (
                <div className="lg:hidden w-full grid grid-cols-2 gap-2 text-xs">
                  <div
                    className={`px-3 py-1 rounded-xl border flex items-center justify-between ${
                      activePlayer === 1
                        ? 'bg-emerald-500/20 border-emerald-400 font-bold'
                        : 'bg-slate-900/60 border-slate-800 opacity-75'
                    }`}
                  >
                    <span>Player 1 {activePlayer === 1 ? '●' : ''}</span>
                    <span className="font-mono text-emerald-400">
                      {p1Pairs} pairs · {p1Score} pts
                    </span>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-xl border flex items-center justify-between ${
                      activePlayer === 2
                        ? 'bg-amber-500/20 border-amber-400 font-bold'
                        : 'bg-slate-900/60 border-slate-800 opacity-75'
                    }`}
                  >
                    <span>Player 2 {activePlayer === 2 ? '●' : ''}</span>
                    <span className="font-mono text-amber-400">
                      {p2Pairs} pairs · {p2Score} pts
                    </span>
                  </div>
                </div>
              )}

              {/* ERGONOMIC RESPONSIVE CARD GRID FOR HUMANS */}
              <div
                style={{
                  gridTemplateColumns: `repeat(${gridCfg.cols}, minmax(0, 1fr))`,
                }}
                className={`relative w-full ${
                  gridCfg.cols === 6
                    ? 'max-w-[min(94vw,75dvh,640px)]'
                    : 'max-w-[min(92vw,72dvh,540px)]'
                } grid gap-1.5 sm:gap-2.5 p-2.5 sm:p-4 rounded-2xl border-2 bg-slate-900/85 border-emerald-500/50 shadow-2xl`}
                role="grid"
                aria-label={`Matching Card Game grid with ${cards.length} cards`}
              >
                {cards.map((card, idx) => {
                  const isFaceUp = card.status === 'up' || card.status === 'matched';
                  const isMatched = card.status === 'matched';
                  const ariaLabel = isMatched
                    ? `Card ${idx + 1}, matched ${card.species}`
                    : isFaceUp
                    ? `Card ${idx + 1}, face up, ${card.species}`
                    : `Card ${idx + 1}, face down`;

                  const svgSize =
                    activeDiff === 'expert' ? 28 : activeDiff === 'hard' ? 32 : 38;

                return (
                  <button
                    key={card.uid}
                    ref={(el) => {
                      cardButtonsRef.current[idx] = el;
                    }}
                    type="button"
                    tabIndex={focusedCardIdx === idx ? 0 : -1}
                    aria-label={ariaLabel}
                    aria-pressed={isFaceUp}
                    onClick={() => handleCardFlip(idx)}
                    onKeyDown={(e) => handleCardKeyDown(e, idx)}
                    className={`relative aspect-[5/7] rounded-lg focus-visible:outline-2 focus-visible:outline-amber-400 cursor-pointer select-none ${
                      settings.reducedMotion
                        ? 'transition-opacity duration-150'
                        : 'transition-transform duration-300'
                    }`}
                    style={
                      settings.reducedMotion
                        ? undefined
                        : {
                            transformStyle: 'preserve-3d',
                            transform: isFaceUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
                          }
                    }
                  >
                    {/* Card Back (Face-Down Jungle Leaf Emblem) */}
                    {(!isFaceUp || !settings.reducedMotion) && (
                      <div
                        style={
                          settings.reducedMotion
                            ? { display: isFaceUp ? 'none' : 'flex' }
                            : { backfaceVisibility: 'hidden' }
                        }
                        className={`absolute inset-0 rounded-lg border flex flex-col items-center justify-center shadow-sm ${
                          isLight
                            ? 'bg-emerald-700 border-emerald-500 text-emerald-100'
                            : 'bg-emerald-900/90 border-emerald-500/60 text-emerald-300 hover:border-emerald-400'
                        }`}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 32 32"
                          aria-hidden="true"
                          className="opacity-80"
                        >
                          <path
                            d="M6 26 C6 12, 16 6, 26 6 C26 16, 20 26, 6 26 Z"
                            fill="currentColor"
                          />
                          <path
                            d="M8 24 L22 10"
                            stroke="#022c22"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Card Front (Face-Up Animal SVG + Name Label Underneath) */}
                    <div
                      style={
                        settings.reducedMotion
                          ? { display: isFaceUp ? 'flex' : 'none' }
                          : {
                              backfaceVisibility: 'hidden',
                              transform: 'rotateY(180deg)',
                            }
                      }
                      className={`absolute inset-0 rounded-lg border p-0.5 flex flex-col items-center justify-between shadow-sm ${
                        isMatched
                          ? isLight
                            ? 'bg-emerald-100 border-emerald-500'
                            : 'bg-emerald-950/90 border-emerald-400 ring-1 ring-emerald-400/50'
                          : isLight
                          ? 'bg-white border-amber-400'
                          : 'bg-slate-950 border-amber-400/80'
                      }`}
                    >
                      <span
                        className={`self-end text-[7px] font-mono px-0.5 leading-none rounded ${
                          card.animalType === 'bird'
                            ? 'text-sky-400 bg-sky-500/10'
                            : 'text-emerald-400 bg-emerald-500/10'
                        }`}
                      >
                        {card.animalType === 'bird' ? 'B' : 'R'}
                      </span>

                      <div className="flex-1 flex items-center justify-center">
                        <SpeciesArtSvg species={card.species} size={svgSize} />
                      </div>

                      {settings.showCardNames && (
                        <span
                          className={`w-full text-center font-bold leading-none truncate px-0.5 pb-0.5 ${
                            activeDiff === 'expert'
                              ? 'text-[6px] sm:text-[7px]'
                              : 'text-[7px] sm:text-[8px]'
                          } ${isLight ? 'text-slate-900' : 'text-slate-100'}`}
                        >
                          {card.species}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Pause Overlay */}
              {isPaused && screen === 'playing' && (
                <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center gap-3 p-4">
                  <h2 className="text-lg font-extrabold text-white">Game Paused</h2>
                  <button
                    type="button"
                    onClick={() => setIsPaused(false)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>Resume Game</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreen('menu')}
                    className="text-xs text-slate-300 hover:text-white underline cursor-pointer"
                  >
                    Main Menu
                  </button>
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 4: SPECIES GALLERY (All 18 Birds & Reptiles) */}
        {screen === 'gallery' && (
          <div
            className={`w-full rounded-3xl border-2 p-5 sm:p-6 space-y-4 shadow-2xl ${
              isLight ? 'bg-white border-emerald-400' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
              <div>
                <h2 className="text-xl font-extrabold">Species Gallery (18 Animals)</h2>
                <p className="text-xs text-emerald-400">
                  9 Birds &amp; 9 Reptiles · Original SVG Card Illustrations
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScreen('menu')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
              >
                ← Back
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {ALL_SPECIES_LIST.map((sp) => (
                <div
                  key={sp.species}
                  className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-1.5 ${
                    isLight
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <SpeciesArtSvg species={sp.species} size={52} />
                  <div>
                    <p className="font-bold text-xs sm:text-sm">{sp.species}</p>
                    <p className="text-[11px] italic opacity-75">{sp.scientificName}</p>
                    <span className="text-[10px] font-mono uppercase text-emerald-400">
                      {sp.type}
                    </span>
                    {sp.verified === true && sp.fact.trim().length > 0 && (
                      <p className="text-[11px] mt-1 opacity-90">
                        {sp.fact} {sp.source ? `(${sp.source})` : ''}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCREEN 5: MY RECORDS */}
        {screen === 'records' && (
          <div
            className={`w-full rounded-3xl border-2 p-5 sm:p-6 space-y-4 shadow-2xl ${
              isLight ? 'bg-white border-emerald-400' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
              <div>
                <h2 className="text-xl font-extrabold">My Records</h2>
                <p className="text-[11px] text-amber-400">
                  Scores are saved on this device only.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScreen('menu')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
              >
                ← Back
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl border bg-slate-950/60 border-slate-800">
                <p className="text-slate-400">Total Matches</p>
                <p className="text-lg font-mono font-extrabold text-emerald-400">
                  {records.totalMatches}
                </p>
              </div>
              <div className="p-3 rounded-2xl border bg-slate-950/60 border-slate-800">
                <p className="text-slate-400">Games Played</p>
                <p className="text-lg font-mono font-extrabold text-sky-400">
                  {records.totalGames}
                </p>
              </div>
              <div className="p-3 rounded-2xl border bg-slate-950/60 border-slate-800">
                <p className="text-slate-400">Daily Streak</p>
                <p className="text-lg font-mono font-extrabold text-amber-400 flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  {records.dailyStreak}d
                </p>
              </div>
              <div className="p-3 rounded-2xl border bg-slate-950/60 border-slate-800">
                <p className="text-slate-400">Today&apos;s Daily</p>
                <p className="text-lg font-mono font-extrabold text-emerald-400">
                  {records.dailyByDate[todayDate]
                    ? `${records.dailyByDate[todayDate].score} pts`
                    : '—'}
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              <h3 className="text-xs font-bold uppercase text-slate-400">
                Best Score, Fewest Moves &amp; Fastest Time
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                {(['classic', 'timed'] as const).map((m) =>
                  (['easy', 'medium', 'hard', 'expert'] as const).map((d) => {
                    const r = records.byDiffAndMode[getDiffModeKey(m, d)];
                    return (
                      <div
                        key={`${m}-${d}`}
                        className="p-2 rounded-xl border bg-slate-950/50 border-slate-800 flex items-center justify-between"
                      >
                        <span className="capitalize">
                          {m} · {d}
                        </span>
                        <span className="text-emerald-400 font-bold">
                          {r
                            ? `${r.bestScore}p · ${r.fewestMoves ?? '—'}m · ${
                                r.fastestTimeSec !== null
                                  ? formatDurationMmSs(r.fastestTimeSec)
                                  : '—'
                              }`
                            : 'No record'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/40 flex items-center justify-between">
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-400 text-xs font-bold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset Records</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRecords(resetMatchingRecords());
                      setConfirmReset(false);
                    }}
                    className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1 rounded-lg bg-slate-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Ad Container (Strictly Outside Game Area) */}
      <div id="ad-slot-bottom" className="w-full h-0 overflow-hidden" aria-label="Bottom sponsor slot" />

      {/* FOOTER WITH COLLAPSIBLE HOW TO PLAY & 5 FAQ ITEMS */}
      <footer className="w-full max-w-3xl mx-auto px-3 pb-3 pt-1 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60 pt-2">
          <span>
            Scores are stored only on your device. No data leaves your browser. ·{' '}
            <strong className="text-emerald-400">ReptileBirds</strong>
          </span>
          <button
            type="button"
            onClick={() => setShowFaqDrawer(!showFaqDrawer)}
            className="flex items-center gap-1 text-emerald-400 font-semibold cursor-pointer"
          >
            <span>How to Play &amp; FAQ</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${
                showFaqDrawer ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {showFaqDrawer && (
          <article className="mt-3 p-4 rounded-2xl bg-slate-900/95 border border-slate-800 space-y-4 text-xs text-slate-300 leading-relaxed">
            <section className="space-y-1">
              <h2 className="font-bold text-white text-sm">
                How to Play Matching Card Game
              </h2>
              <p>
                In this <strong>matching card game</strong>, flip two face-down cards per turn
                using touch, mouse, or keyboard (Arrow keys to navigate, Enter/Space to flip).
                If the two cards show the same bird or reptile species, the pair stays face-up
                and awards 100 points plus up to +300 in combo streak bonuses. If they do not
                match, both cards flip back after 900 ms. Match all <strong>pairs</strong> on
                the board to win!
              </p>
            </section>
            <section className="space-y-2">
              <h3 className="font-bold text-white">Frequently Asked Questions</h3>
              <p>
                <strong>1. What grid sizes are available in this matching game?</strong> Choose
                from Easy (4×3, 6 pairs), Medium (4×4, 8 pairs), Hard (6×4, 12 pairs), and
                Expert (6×6, 18 pairs featuring all 9 birds and 9 reptiles).
              </p>
              <p>
                <strong>2. How does the Daily Challenge work?</strong> Daily Challenge deals a
                Medium 4×4 board seeded from today&apos;s date ({todayDate}) so every player gets
                the exact same card layout. Your first completed run of the day sets your daily
                record and extends your daily streak.
              </p>
              <p>
                <strong>3. How are stars and combo points calculated?</strong> Each consecutive
                match without a miss adds +50 streak bonus (up to +300), while a wrong flip
                deducts 10 points (never below 0). Finishing in ≤1.5× moves per pair earns 3
                stars (⭐⭐⭐).
              </p>
              <p>
                <strong>4. Is this pairs game accessible for color-blind and keyboard players?</strong>{' '}
                Yes. Every card displays a distinct original SVG animal illustration, a bird/reptile
                indicator, and the species name label underneath, plus full Arrow-key and
                screen-reader support.
              </p>
              <p>
                <strong>5. Are my high scores private?</strong> Yes, all records and streaks are
                stored only in your browser&apos;s <code>localStorage</code> on your device.
              </p>
            </section>
          </article>
        )}
      </footer>

      {/* WIN / LOSE RESULT MODAL */}
      {screen === 'result' && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl max-w-sm w-full p-5 text-center space-y-4 shadow-2xl">
            {isNewPersonalBest && didWin && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-extrabold">
                <Sparkles className="w-3.5 h-3.5" />
                New personal best!
              </div>
            )}

            <div>
              <h2 className="text-2xl font-black text-white">
                {!didWin
                  ? "Time's Up!"
                  : mode === 'two-player'
                  ? p1Score > p2Score
                    ? 'Player 1 Wins!'
                    : p2Score > p1Score
                    ? 'Player 2 Wins!'
                    : "It's a Tie!"
                  : 'Board Cleared!'}
              </h2>
              {didWin && (
                <p className="text-2xl mt-1" aria-label={`${earnedStars} out of 3 stars`}>
                  {'⭐'.repeat(earnedStars)}
                </p>
              )}
              {dailyAlreadyCounted && (
                <p className="text-[11px] text-amber-300 mt-1">
                  Practice run complete (your first run today already counted toward your Daily
                  record).
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-xs">
              <div>
                <p className="text-slate-400">Score</p>
                <p className="font-mono font-bold text-emerald-400 text-base">{score}</p>
              </div>
              <div>
                <p className="text-slate-400">Moves</p>
                <p className="font-mono font-bold text-amber-400 text-base">{moves}</p>
              </div>
              <div>
                <p className="text-slate-400">Time</p>
                <p className="font-mono font-bold text-sky-400 text-base">
                  {formatDurationMmSs(elapsedSec)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {didWin && (
                <button
                  type="button"
                  onClick={() => setIsShareOpen(true)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Result</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => startMatch()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setScreen('menu')}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Main Menu
            </button>
          </div>
        </div>
      )}

      {/* SHAREABLE SCORE CARD MODAL */}
      <MatchingShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        difficulty={activeDiff}
        mode={mode}
        score={score}
        moves={moves}
        elapsedSec={elapsedSec}
        stars={earnedStars}
        personalBestScore={currentBestObj.bestScore}
        dateStr={todayDate}
        matchedSpecies={uniqueBoardSpecies}
      />

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-3 text-slate-100 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-base font-bold">Matching Game Settings</h2>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-2 py-1 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span>Sound Effects</span>
              <button
                type="button"
                onClick={handleToggleMute}
                className={`px-3 py-1 rounded-lg font-bold ${
                  !isMuted ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {!isMuted ? 'ON' : 'MUTED'}
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span>Show Species Names on Cards</span>
              <button
                type="button"
                onClick={() => updateSetting('showCardNames', !settings.showCardNames)}
                className={`px-3 py-1 rounded-lg font-bold ${
                  settings.showCardNames
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {settings.showCardNames ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span>Reduced Motion (Fade Flip)</span>
              <button
                type="button"
                onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                className={`px-3 py-1 rounded-lg font-bold ${
                  settings.reducedMotion
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {settings.reducedMotion ? 'ON' : 'OFF'}
              </button>
            </div>

            {selfTestStatus && (
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Verified {selfTestStatus.testedCount} balanced pair decks &amp; daily seeds
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HOW TO PLAY MODAL */}
      {isHowToPlayOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-3 text-slate-100 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-base font-bold">How to Play Matching Card Game</h2>
              <button
                type="button"
                onClick={() => setIsHowToPlayOpen(false)}
                className="px-2 py-1 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>
            <ul className="space-y-2 text-slate-300 list-disc pl-4 leading-relaxed">
              <li>
                <strong>Flip Two Cards:</strong> Tap any two face-down cards (or use Arrow keys
                and Enter/Space). Matching bird or reptile pairs stay face-up; mismatches flip
                back after 900 ms.
              </li>
              <li>
                <strong>Scoring &amp; Combos:</strong> +100 pts per match, +50 per consecutive
                streak step (up to +300), -10 pts for a miss (never below 0), and +2 pts/sec
                remaining in Timed/Daily modes.
              </li>
              <li>
                <strong>3-Star Mastery:</strong> Clear the board in ≤1.5× moves per pair for
                ⭐⭐⭐!
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
