import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BirdTokenId,
  BoardConfig,
  BoardLink,
  GameMode,
  PlayerState,
  SnakeFactEntry,
  evaluateRollOutcome,
  generateBoard,
  getSquareCoords,
  getTodayDateString,
  rollFairDie,
  runBoardValidationSelfTest,
} from './engine';
import {
  SnakeLadderRecords,
  SnakeLadderSettings,
  loadRecords,
  loadSettings,
  recordCompletedGame,
  resetRecords,
  saveSettings,
} from './storage';
import { gameAudio } from './audio';
import { BIRD_TOKENS, BIRD_TOKEN_LIST, BirdTokenSvg } from './BirdTokens';
import { ShareCardModal } from './ShareCardModal';
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
  Bot,
  User,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface SetupPlayerConfig {
  name: string;
  token: BirdTokenId;
  isCpu: boolean;
}

const DEFAULT_PLAYERS_SETUP: SetupPlayerConfig[] = [
  { name: 'Player 1', token: 'parrot', isCpu: false },
  { name: 'Robo Owl', token: 'owl', isCpu: true },
  { name: 'Player 3', token: 'eagle', isCpu: false },
  { name: 'Player 4', token: 'penguin', isCpu: false },
];

export const SnakeAndLadderGame: React.FC = () => {
  // Persisted settings & records
  const [settings, setSettings] = useState<SnakeLadderSettings>(() => loadSettings());
  const [records, setRecords] = useState<SnakeLadderRecords>(() => loadRecords());
  const [isMuted, setIsMuted] = useState<boolean>(() => gameAudio.isMuted());

  // Navigation screens: 'menu' | 'setup' | 'playing' | 'win' | 'records'
  const [screen, setScreen] = useState<'menu' | 'setup' | 'playing' | 'win' | 'records'>('menu');
  const [mode, setMode] = useState<GameMode>('solo');
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [setupPlayers, setSetupPlayers] = useState<SetupPlayerConfig[]>(DEFAULT_PLAYERS_SETUP);

  // Modals
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [confirmResetRecords, setConfirmResetRecords] = useState(false);

  // Active Game State
  const todayDate = getTodayDateString();
  const [board, setBoard] = useState<BoardConfig>(() => generateBoard());
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isAnimatingMove, setIsAnimatingMove] = useState<boolean>(false);
  const [statusAnnouncement, setStatusAnnouncement] = useState<string>(
    'Welcome to Snake and Ladder! Choose a mode to begin.'
  );
  const [lastBitePopup, setLastBitePopup] = useState<{
    playerName: string;
    fromSq: number;
    toSq: number;
    species: SnakeFactEntry;
  } | null>(null);
  const [winner, setWinner] = useState<PlayerState | null>(null);
  const [isNewPersonalBest, setIsNewPersonalBest] = useState<boolean>(false);
  const [selfTestStatus, setSelfTestStatus] = useState<{
    passed: boolean;
    testedCount: number;
  } | null>(null);

  const timersRef = useRef<number[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // Run board placement self-test once on mount
  useEffect(() => {
    const res = runBoardValidationSelfTest(15);
    setSelfTestStatus({ passed: res.passed, testedCount: res.testedCount });
  }, []);

  const updateSetting = <K extends keyof SnakeLadderSettings>(
    key: K,
    value: SnakeLadderSettings[K]
  ) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
  };

  const handleToggleMute = () => {
    const nextMuted = gameAudio.toggleMute();
    setIsMuted(nextMuted);
  };

  // Select a mode from Start Menu and open Setup screen
  const handleSelectMode = (selectedMode: GameMode) => {
    setMode(selectedMode);
    if (selectedMode === 'solo' || selectedMode === 'daily') {
      setPlayerCount(1);
      setSetupPlayers((prev) => [
        { name: prev[0]?.name || 'Explorer', token: prev[0]?.token || 'parrot', isCpu: false },
        ...prev.slice(1),
      ]);
    } else if (selectedMode === 'cpu') {
      setPlayerCount(2);
      setSetupPlayers([
        { name: 'Player 1', token: 'parrot', isCpu: false },
        { name: 'Owl Bot', token: 'owl', isCpu: true },
        { name: 'Eagle Bot', token: 'eagle', isCpu: true },
        { name: 'Penguin Bot', token: 'penguin', isCpu: true },
      ]);
    } else {
      setPlayerCount(2);
      setSetupPlayers([
        { name: 'Player 1', token: 'parrot', isCpu: false },
        { name: 'Player 2', token: 'owl', isCpu: false },
        { name: 'Player 3', token: 'eagle', isCpu: false },
        { name: 'Player 4', token: 'penguin', isCpu: false },
      ]);
    }
    setScreen('setup');
  };

  // Start a new match with current mode & player setup
  const startMatch = () => {
    clearAllTimers();
    const newBoard = mode === 'daily' ? generateBoard(todayDate) : generateBoard();
    setBoard(newBoard);

    const count = mode === 'solo' || mode === 'daily' ? 1 : playerCount;
    const activePlayers: PlayerState[] = [];
    for (let i = 0; i < count; i++) {
      const cfg = setupPlayers[i];
      activePlayers.push({
        id: `player-${i + 1}`,
        name: cfg.name.trim() || `Player ${i + 1}`,
        token: cfg.token,
        isCpu: mode === 'cpu' ? i > 0 : false,
        position: 0,
        turnsTaken: 0,
        consecutiveSixes: 0,
        laddersClimbed: 0,
        snakeBites: 0,
        longestClimb: 0,
      });
    }

    setPlayers(activePlayers);
    setCurrentPlayerIndex(0);
    setDiceValue(null);
    setIsRolling(false);
    setIsAnimatingMove(false);
    setIsPaused(false);
    setLastBitePopup(null);
    setWinner(null);
    setIsNewPersonalBest(false);
    setScreen('playing');
    setStatusAnnouncement(
      `${activePlayers[0].name}'s turn (${BIRD_TOKENS[activePlayers[0].token].speciesLabel}). Press Roll Dice or Spacebar.`
    );
  };

  // Execute a die roll and step-by-step token movement for the current player
  const performTurnRoll = useCallback(() => {
    if (
      screen !== 'playing' ||
      isPaused ||
      isRolling ||
      isAnimatingMove ||
      players.length === 0 ||
      winner
    ) {
      return;
    }

    const activePlayer = players[currentPlayerIndex];
    setIsRolling(true);
    setLastBitePopup(null);
    gameAudio.playDiceRoll();

    const finalRoll = rollFairDie();
    const rollDuration = settings.reducedMotion ? 80 : 380;

    // Visual dice tumble frames if motion enabled
    if (!settings.reducedMotion) {
      for (let f = 1; f <= 4; f++) {
        const t = window.setTimeout(() => {
          setDiceValue(rollFairDie());
        }, f * 70);
        timersRef.current.push(t);
      }
    }

    const rollDoneTimer = window.setTimeout(() => {
      setDiceValue(finalRoll);
      setIsRolling(false);
      setIsAnimatingMove(true);

      const outcome = evaluateRollOutcome(
        activePlayer,
        finalRoll,
        board,
        settings.bonusRollOnSix
      );

      const updatedTurns = activePlayer.turnsTaken + 1;
      const updatedSixes =
        finalRoll === 6
          ? outcome.tripleSixCancelledBonus
            ? 0
            : activePlayer.consecutiveSixes + 1
          : 0;

      // Case 1: Overshot 100
      if (outcome.overshot) {
        const msg = `${activePlayer.name} rolled a ${finalRoll} from ${activePlayer.position}. Exact roll required for 100 — stays on ${activePlayer.position}.`;
        setStatusAnnouncement(msg);

        setPlayers((prev) =>
          prev.map((p, idx) =>
            idx === currentPlayerIndex
              ? { ...p, turnsTaken: updatedTurns, consecutiveSixes: updatedSixes }
              : p
          )
        );

        const nextTimer = window.setTimeout(() => {
          setIsAnimatingMove(false);
          if (outcome.earnedBonusRoll) {
            setStatusAnnouncement(
              `${activePlayer.name} rolled a 6 and gets a bonus roll!`
            );
          } else {
            const nextIdx = (currentPlayerIndex + 1) % players.length;
            setCurrentPlayerIndex(nextIdx);
          }
        }, settings.reducedMotion ? 150 : 600);
        timersRef.current.push(nextTimer);
        return;
      }

      // Case 2: Hop square by square
      const hopDelay = settings.reducedMotion ? 30 : 155;
      outcome.hopSquares.forEach((sq, hopIdx) => {
        const hopTimer = window.setTimeout(() => {
          gameAudio.playHop(hopIdx);
          setPlayers((prev) =>
            prev.map((p, idx) =>
              idx === currentPlayerIndex ? { ...p, position: sq } : p
            )
          );
        }, (hopIdx + 1) * hopDelay);
        timersRef.current.push(hopTimer);
      });

      const afterHopsTime = (outcome.hopSquares.length + 1) * hopDelay;

      const resolveLinkTimer = window.setTimeout(() => {
        let climbSpan = 0;
        let climbed = activePlayer.laddersClimbed;
        let bites = activePlayer.snakeBites;

        if (outcome.linkTriggered) {
          if (outcome.linkTriggered.type === 'ladder') {
            gameAudio.playLadderClimb();
            climbSpan = outcome.linkTriggered.end - outcome.linkTriggered.start;
            climbed += 1;
            setStatusAnnouncement(
              `${activePlayer.name} rolled ${finalRoll} to ${outcome.landedSquare} and climbed a jungle vine up to ${outcome.finalSquare}!`
            );
          } else {
            gameAudio.playSnakeSlide();
            bites += 1;
            const species = outcome.linkTriggered.species || {
              species: 'Jungle Serpent',
              scientificName: 'Serpentes',
              fact: '',
              source: '',
              verified: false,
            };
            setLastBitePopup({
              playerName: activePlayer.name,
              fromSq: outcome.landedSquare,
              toSq: outcome.finalSquare,
              species,
            });
            setStatusAnnouncement(
              `Snake bite! ${activePlayer.name} landed on ${species.species} at ${outcome.landedSquare} and slid down to ${outcome.finalSquare}.`
            );
          }
        } else {
          setStatusAnnouncement(
            `${activePlayer.name} rolled ${finalRoll} and moved to square ${outcome.finalSquare}.`
          );
        }

        const updatedPlayer: PlayerState = {
          ...activePlayer,
          position: outcome.finalSquare,
          turnsTaken: updatedTurns,
          consecutiveSixes: updatedSixes,
          laddersClimbed: climbed,
          snakeBites: bites,
          longestClimb: Math.max(activePlayer.longestClimb, climbSpan),
        };

        setPlayers((prev) =>
          prev.map((p, idx) => (idx === currentPlayerIndex ? updatedPlayer : p))
        );

        const finishTurnTimer = window.setTimeout(() => {
          setIsAnimatingMove(false);

          if (outcome.wonGame) {
            gameAudio.playWinFanfare();
            setWinner(updatedPlayer);
            const humanPlayer =
              currentPlayerIndex === 0 ? updatedPlayer : players[0];
            const recResult = recordCompletedGame({
              mode,
              humanWon: !updatedPlayer.isCpu,
              turnsTaken: updatedPlayer.turnsTaken,
              longestClimbInGame: humanPlayer.longestClimb,
              snakeBitesInGame: humanPlayer.snakeBites,
              dailyDate: mode === 'daily' ? todayDate : undefined,
            });
            setRecords(recResult.updated);
            setIsNewPersonalBest(recResult.isNewPersonalBest);
            setStatusAnnouncement(
              `${updatedPlayer.name} reached square 100 and won the game in ${updatedPlayer.turnsTaken} turns!`
            );
            setScreen('win');
            return;
          }

          if (outcome.tripleSixCancelledBonus) {
            setStatusAnnouncement(
              `Three 6s in a row for ${activePlayer.name}! Bonus roll cancelled.`
            );
          }

          if (outcome.earnedBonusRoll) {
            setStatusAnnouncement(
              `${activePlayer.name} rolled a 6! Bonus turn awarded.`
            );
          } else {
            const nextIdx = (currentPlayerIndex + 1) % players.length;
            setCurrentPlayerIndex(nextIdx);
          }
        }, outcome.linkTriggered && !settings.reducedMotion ? 480 : 160);

        timersRef.current.push(finishTurnTimer);
      }, afterHopsTime);

      timersRef.current.push(resolveLinkTimer);
    }, rollDuration);

    timersRef.current.push(rollDoneTimer);
  }, [
    screen,
    isPaused,
    isRolling,
    isAnimatingMove,
    players,
    winner,
    currentPlayerIndex,
    settings.reducedMotion,
    settings.bonusRollOnSix,
    board,
    mode,
    todayDate,
  ]);

  // Automatic turn trigger for Computer players
  useEffect(() => {
    if (
      screen === 'playing' &&
      !isPaused &&
      !isRolling &&
      !isAnimatingMove &&
      !winner &&
      players[currentPlayerIndex]?.isCpu
    ) {
      const cpuTimer = window.setTimeout(() => {
        performTurnRoll();
      }, settings.reducedMotion ? 250 : 650);
      timersRef.current.push(cpuTimer);
      return () => window.clearTimeout(cpuTimer);
    }
  }, [
    screen,
    isPaused,
    isRolling,
    isAnimatingMove,
    winner,
    players,
    currentPlayerIndex,
    performTurnRoll,
    settings.reducedMotion,
  ]);

  // Keyboard accessibility: Space or Enter rolls the die when playing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        screen === 'playing' &&
        !isPaused &&
        !isHowToPlayOpen &&
        !isSettingsOpen &&
        !isShareOpen
      ) {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
          return;
        }
        if (e.code === 'Space' || e.code === 'Enter') {
          const activePlayer = players[currentPlayerIndex];
          if (activePlayer && !activePlayer.isCpu) {
            e.preventDefault();
            performTurnRoll();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    screen,
    isPaused,
    isHowToPlayOpen,
    isSettingsOpen,
    isShareOpen,
    players,
    currentPlayerIndex,
    performTurnRoll,
  ]);

  const isLight = settings.theme === 'light';

  // Build the 100 board squares in visual top-to-bottom, left-to-right order
  const visualSquares: number[] = [];
  for (let visualRow = 0; visualRow < 10; visualRow++) {
    const rowFromBottom = 9 - visualRow;
    for (let visualCol = 0; visualCol < 10; visualCol++) {
      const offset = rowFromBottom % 2 === 0 ? visualCol : 9 - visualCol;
      const sq = rowFromBottom * 10 + offset + 1;
      visualSquares.push(sq);
    }
  }

  const ladderMap = new Map<number, BoardLink>();
  board.ladders.forEach((l) => ladderMap.set(l.start, l));
  const snakeMap = new Map<number, BoardLink>();
  board.snakes.forEach((s) => snakeMap.set(s.start, s));

  const currentPlayer = players[currentPlayerIndex];

  return (
    <div
      className={`min-h-screen transition-colors ${
        isLight ? 'bg-amber-50/70 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Screen-Reader Live Region for Key Events */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {statusAnnouncement}
      </div>

      {/* Top Ad Container (Strictly Outside Game Board Area) */}
      <div className="max-w-5xl mx-auto px-4 pt-2">
        <div id="ad-slot-top" className="w-full min-h-[4px]" aria-label="Top sponsor slot" />
      </div>

      {/* Main Game Header & Controls Bar */}
      <section className="max-w-5xl mx-auto px-3 sm:px-6 py-3">
        <div
          className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl border ${
            isLight
              ? 'bg-white border-emerald-200 shadow-sm'
              : 'bg-slate-900/90 border-slate-800 shadow-lg'
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                clearAllTimers();
                setScreen('menu');
              }}
              className="text-left group cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-500 rounded-lg"
            >
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
                <span className="text-emerald-500">Snake and Ladder</span>
              </h1>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                Classic 10×10 Jungle Board · ReptileBirds
              </p>
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setScreen('records')}
              aria-label="Open My Records"
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                screen === 'records'
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">My Records</span>
            </button>

            <button
              type="button"
              onClick={() => setIsHowToPlayOpen(true)}
              aria-label="How to play"
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">How to Play</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Game settings"
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() =>
                updateSetting('theme', settings.theme === 'dark' ? 'light' : 'dark')
              }
              aria-label={
                settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
              }
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            <button
              type="button"
              onClick={handleToggleMute}
              aria-label={isMuted ? 'Unmute game audio' : 'Mute game audio'}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-500" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* SCREEN 1: START MENU */}
      {screen === 'menu' && (
        <section className="max-w-5xl mx-auto px-3 sm:px-6 py-4">
          <div
            className={`rounded-3xl border p-6 sm:p-10 space-y-8 ${
              isLight
                ? 'bg-white border-emerald-200 shadow-md'
                : 'bg-slate-900/90 border-slate-800 shadow-2xl'
            }`}
          >
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <p className="text-xs font-semibold tracking-wider uppercase text-emerald-500">
                Original Jungle Edition · 100% Fair Crypto Dice
              </p>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Choose Your Game Mode
              </h2>
              <p
                className={`text-sm sm:text-base ${
                  isLight ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                Climb 8 tropical vines, dodge 8 real reptile species, and land on square 100
                with an exact die roll.
              </p>
            </div>

            {/* 4 Game Mode Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSelectMode('solo')}
                className={`text-left p-5 rounded-2xl border transition-all cursor-pointer group ${
                  isLight
                    ? 'bg-emerald-50/60 hover:bg-emerald-100/70 border-emerald-200'
                    : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 hover:border-emerald-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-500" />
                    Solo Race
                  </span>
                  <span className="text-xs font-mono text-emerald-500">
                    {records.bestSoloTurns
                      ? `Best: ${records.bestSoloTurns} turns`
                      : 'Set a record'}
                  </span>
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  Single-player sprint to square 100 in as few turns as possible. Track your
                  personal record on this device.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('daily')}
                className={`text-left p-5 rounded-2xl border transition-all cursor-pointer group ${
                  isLight
                    ? 'bg-amber-50/70 hover:bg-amber-100/70 border-amber-200'
                    : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 hover:border-amber-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-500" />
                    Daily Board ({todayDate})
                  </span>
                  <span className="text-xs font-mono text-amber-500">
                    {records.dailyBestByDate[todayDate]
                      ? `Today: ${records.dailyBestByDate[todayDate]} turns`
                      : 'Unplayed today'}
                  </span>
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  Seeded from today&apos;s date ({todayDate}) so every player worldwide gets
                  the exact same vine and snake layout. Solo Race rules.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('cpu')}
                className={`text-left p-5 rounded-2xl border transition-all cursor-pointer group ${
                  isLight
                    ? 'bg-sky-50/70 hover:bg-sky-100/70 border-sky-200'
                    : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 hover:border-sky-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold flex items-center gap-2">
                    <Bot className="w-5 h-5 text-sky-500" />
                    Vs Computer
                  </span>
                  <span className="text-xs font-mono text-sky-500">1 Human vs 1–3 CPUs</span>
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  Challenge 1 to 3 automated bird rivals. Pure luck-based dice rolls using
                  cryptographic randomness.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('multi')}
                className={`text-left p-5 rounded-2xl border transition-all cursor-pointer group ${
                  isLight
                    ? 'bg-violet-50/70 hover:bg-violet-100/70 border-violet-200'
                    : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 hover:border-violet-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-violet-500" />
                    Local Multiplayer
                  </span>
                  <span className="text-xs font-mono text-violet-500">2–4 Players</span>
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  Pass and play on one device with 2 to 4 friends. Each player picks their
                  own bird token and custom name.
                </p>
              </button>
            </div>

            {/* Bird Token Showcase */}
            <div
              className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
                isLight
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-semibold text-emerald-500">
                  Original SVG Bird Tokens:
                </span>
                {BIRD_TOKEN_LIST.map((b) => (
                  <div key={b.id} className="flex items-center gap-1.5 text-xs">
                    <BirdTokenSvg token={b.id} size={28} />
                    <span className="font-medium">{b.speciesLabel}</span>
                  </div>
                ))}
              </div>
              <span className="text-xs text-slate-400">
                Scores are saved on this device only.
              </span>
            </div>
          </div>
        </section>
      )}

      {/* SCREEN 2: MODE & PLAYER SETUP */}
      {screen === 'setup' && (
        <section className="max-w-3xl mx-auto px-3 sm:px-6 py-4">
          <div
            className={`rounded-3xl border p-6 sm:p-8 space-y-6 ${
              isLight
                ? 'bg-white border-emerald-200 shadow-md'
                : 'bg-slate-900 border-slate-800 shadow-2xl'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-4">
              <div>
                <p className="text-xs font-semibold text-emerald-500">Match Configuration</p>
                <h2 className="text-xl sm:text-2xl font-bold">
                  {mode === 'solo' && 'Solo Race Setup'}
                  {mode === 'daily' && `Daily Board (${todayDate})`}
                  {mode === 'cpu' && 'Vs Computer Setup'}
                  {mode === 'multi' && 'Local Multiplayer Setup'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setScreen('menu')}
                className="text-xs font-semibold text-slate-400 hover:text-emerald-400 cursor-pointer"
              >
                ← Back to Modes
              </button>
            </div>

            {/* Number of Players Selector for CPU / Local Multi */}
            {(mode === 'cpu' || mode === 'multi') && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold">
                  {mode === 'cpu'
                    ? 'Total Players (1 Human + 1 to 3 Computer Opponents):'
                    : 'Number of Human Players (Pass & Play):'}
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPlayerCount(num)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        playerCount === num
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : isLight
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {mode === 'cpu' ? `1 vs ${num - 1} CPU` : `${num} Players`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Player Name & Bird Token Pickers */}
            <div className="space-y-4">
              {Array.from({
                length: mode === 'solo' || mode === 'daily' ? 1 : playerCount,
              }).map((_, idx) => {
                const cfg = setupPlayers[idx];
                const isCpuSlot = mode === 'cpu' && idx > 0;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border space-y-3 ${
                      isLight
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-emerald-500">
                        {isCpuSlot ? `Computer Opponent #${idx}` : `Player ${idx + 1}`}
                      </span>
                      <span className="text-xs text-slate-400">
                        Selected: {BIRD_TOKENS[cfg.token].name}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div>
                        <label
                          htmlFor={`player-name-${idx}`}
                          className="sr-only"
                        >
                          Player {idx + 1} Name
                        </label>
                        <input
                          id={`player-name-${idx}`}
                          type="text"
                          maxLength={18}
                          value={cfg.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSetupPlayers((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, name: val } : item
                              )
                            );
                          }}
                          placeholder={`Player ${idx + 1} Name`}
                          className={`w-full px-3.5 py-2 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                            isLight
                              ? 'bg-white border-slate-300 text-slate-900'
                              : 'bg-slate-900 border-slate-700 text-white'
                          }`}
                        />
                      </div>

                      {/* 4 Bird Token Buttons */}
                      <div className="flex items-center gap-2">
                        {BIRD_TOKEN_LIST.map((b) => {
                          const active = cfg.token === b.id;
                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() =>
                                setSetupPlayers((prev) =>
                                  prev.map((item, i) =>
                                    i === idx ? { ...item, token: b.id } : item
                                  )
                                )
                              }
                              aria-label={`Select ${b.speciesLabel} token for Player ${idx + 1}`}
                              className={`flex-1 py-1.5 px-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                                active
                                  ? 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/40'
                                  : isLight
                                  ? 'bg-white border-slate-200 hover:bg-slate-100'
                                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                              }`}
                            >
                              <BirdTokenSvg token={b.id} size={28} />
                              <span className="text-[10px] font-semibold">
                                {b.speciesLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Bonus Roll Rule Toggle */}
            <div
              className={`flex items-center justify-between p-3.5 rounded-xl border ${
                isLight
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div>
                <p className="text-xs font-bold">Bonus Roll on 6</p>
                <p className="text-[11px] text-slate-400">
                  Rolling a 6 grants an extra turn (three 6s in a row cancel the third bonus).
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.bonusRollOnSix}
                onClick={() => updateSetting('bonusRollOnSix', !settings.bonusRollOnSix)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  settings.bonusRollOnSix
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {settings.bonusRollOnSix ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={startMatch}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-colors cursor-pointer"
              >
                Start Game →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* SCREEN 3: ACTIVE GAME BOARD & HUD */}
      {(screen === 'playing' || screen === 'win') && (
        <section className="max-w-5xl mx-auto px-2 sm:px-6 py-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* 10x10 Responsive Board Container (Left 8 columns on desktop) */}
            <div className="lg:col-span-8 flex flex-col items-center">
              <div
                className={`relative w-full max-w-[580px] aspect-square rounded-2xl border-2 overflow-hidden shadow-2xl select-none ${
                  isLight
                    ? 'bg-amber-50 border-emerald-700'
                    : 'bg-slate-900 border-emerald-600/70'
                }`}
                role="region"
                aria-label="10 by 10 Snake and Ladder game board, squares 1 to 100"
              >
                {/* 10x10 CSS Grid of Squares */}
                <div className="grid grid-cols-10 grid-rows-10 w-full h-full">
                  {visualSquares.map((sq) => {
                    const { visualRow, visualCol } = getSquareCoords(sq);
                    const isEvenChecker = (visualRow + visualCol) % 2 === 0;
                    const ladderHere = ladderMap.get(sq);
                    const snakeHere = snakeMap.get(sq);

                    let cellBg = isEvenChecker
                      ? isLight
                        ? 'bg-amber-50/90'
                        : 'bg-slate-900/95'
                      : isLight
                      ? 'bg-emerald-100/70'
                      : 'bg-slate-800/85';

                    if (sq === 100) {
                      cellBg = isLight
                        ? 'bg-amber-300/90'
                        : 'bg-amber-500/30';
                    } else if (sq === 1) {
                      cellBg = isLight
                        ? 'bg-emerald-200/90'
                        : 'bg-emerald-500/20';
                    }

                    return (
                      <div
                        key={sq}
                        className={`relative border border-slate-500/15 flex flex-col justify-between p-0.5 sm:p-1 ${cellBg}`}
                      >
                        <div className="flex items-start justify-between w-full leading-none">
                          <span
                            className={`text-[9px] sm:text-xs font-mono font-bold tabular-nums ${
                              sq === 100
                                ? 'text-amber-500 font-extrabold'
                                : isLight
                                ? 'text-slate-700'
                                : 'text-slate-300'
                            }`}
                          >
                            {sq}
                          </span>

                          {/* Color-blind friendly explicit directional indicators */}
                          {ladderHere && (
                            <span
                              title={`Climbing Vine: Square ${ladderHere.start} up to ${ladderHere.end}`}
                              className="text-[8px] sm:text-[10px] font-mono font-bold text-emerald-500 leading-none"
                            >
                              ▲{ladderHere.end}
                            </span>
                          )}
                          {snakeHere && (
                            <span
                              title={`${snakeHere.species?.species || 'Snake'}: Square ${snakeHere.start} down to ${snakeHere.end}`}
                              className="text-[8px] sm:text-[10px] font-mono font-bold text-amber-500 leading-none"
                            >
                              ▼{snakeHere.end}
                            </span>
                          )}
                        </div>

                        {sq === 100 && (
                          <span className="text-[9px] sm:text-xs font-extrabold text-amber-500 self-center">
                            ★100
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* SVG Overlay for 8 Climbing Vines (Ladders) and 8 Patterned Snakes */}
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  aria-hidden="true"
                >
                  {/* 1. Render 8 Climbing Vines (Ladders) */}
                  {board.ladders.map((ladder) => {
                    const startC = getSquareCoords(ladder.start);
                    const endC = getSquareCoords(ladder.end);
                    const dx = endC.xPercent - startC.xPercent;
                    const dy = endC.yPercent - startC.yPercent;
                    const len = Math.hypot(dx, dy) || 1;
                    // Perpendicular unit vector for dual vine rails
                    const nx = (-dy / len) * 1.35;
                    const ny = (dx / len) * 1.35;

                    const steps = Math.max(4, Math.floor(len / 4.5));
                    const rungs = [];
                    for (let s = 1; s < steps; s++) {
                      const t = s / steps;
                      const cx = startC.xPercent + dx * t;
                      const cy = startC.yPercent + dy * t;
                      rungs.push(
                        <g key={`rung-${ladder.id}-${s}`}>
                          <line
                            x1={cx - nx}
                            y1={cy - ny}
                            x2={cx + nx}
                            y2={cy + ny}
                            stroke="#10b981"
                            strokeWidth="0.65"
                            strokeLinecap="round"
                          />
                          {/* Vine leaf node */}
                          <circle
                            cx={cx + (s % 2 === 0 ? nx * 1.3 : -nx * 1.3)}
                            cy={cy + (s % 2 === 0 ? ny * 1.3 : -ny * 1.3)}
                            r="0.7"
                            fill="#34d399"
                          />
                        </g>
                      );
                    }

                    return (
                      <g key={ladder.id} opacity="0.92">
                        <line
                          x1={startC.xPercent - nx}
                          y1={startC.yPercent - ny}
                          x2={endC.xPercent - nx}
                          y2={endC.yPercent - ny}
                          stroke="#059669"
                          strokeWidth="0.85"
                          strokeLinecap="round"
                        />
                        <line
                          x1={startC.xPercent + nx}
                          y1={startC.yPercent + ny}
                          x2={endC.xPercent + nx}
                          y2={endC.yPercent + ny}
                          stroke="#059669"
                          strokeWidth="0.85"
                          strokeLinecap="round"
                        />
                        {rungs}
                        {/* Upward arrow badge at bottom of vine */}
                        <circle
                          cx={startC.xPercent}
                          cy={startC.yPercent}
                          r="2.1"
                          fill="#059669"
                          stroke="#ffffff"
                          strokeWidth="0.4"
                        />
                        <polygon
                          points={`${startC.xPercent},${startC.yPercent - 1.1} ${
                            startC.xPercent - 1
                          },${startC.yPercent + 0.8} ${startC.xPercent + 1},${
                            startC.yPercent + 0.8
                          }`}
                          fill="#ffffff"
                        />
                      </g>
                    );
                  })}

                  {/* 2. Render 8 Snakes (S-curve bodies with distinct dorsal markings & forked tongue) */}
                  {board.snakes.map((snake, sIdx) => {
                    const headC = getSquareCoords(snake.start);
                    const tailC = getSquareCoords(snake.end);
                    const dx = tailC.xPercent - headC.xPercent;
                    const dy = tailC.yPercent - headC.yPercent;
                    const len = Math.hypot(dx, dy) || 1;
                    const curveOffset = (sIdx % 2 === 0 ? 1 : -1) * Math.min(12, len * 0.28);
                    const nx = (-dy / len) * curveOffset;
                    const ny = (dx / len) * curveOffset;

                    const c1x = headC.xPercent + dx * 0.33 + nx;
                    const c1y = headC.yPercent + dy * 0.33 + ny;
                    const c2x = headC.xPercent + dx * 0.66 - nx;
                    const c2y = headC.yPercent + dy * 0.66 - ny;

                    const pathD = `M ${headC.xPercent} ${headC.yPercent} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tailC.xPercent} ${tailC.yPercent}`;

                    return (
                      <g key={snake.id} opacity="0.94">
                        {/* Outer snake body */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#d97706"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                        />
                        {/* High-contrast dashed scales pattern (color-blind friendly differentiation from solid ladders) */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#fef08a"
                          strokeWidth="0.9"
                          strokeDasharray="1.4 1.6"
                          strokeLinecap="round"
                        />
                        {/* Snake Head */}
                        <circle
                          cx={headC.xPercent}
                          cy={headC.yPercent}
                          r="2.4"
                          fill="#b45309"
                          stroke="#fde047"
                          strokeWidth="0.45"
                        />
                        {/* Snake Eyes */}
                        <circle
                          cx={headC.xPercent - 0.7}
                          cy={headC.yPercent - 0.5}
                          r="0.45"
                          fill="#ffffff"
                        />
                        <circle
                          cx={headC.xPercent + 0.7}
                          cy={headC.yPercent - 0.5}
                          r="0.45"
                          fill="#ffffff"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Render Active Player Bird Tokens on the Board */}
                {players.map((p, idx) => {
                  if (p.position <= 0) return null;
                  const coords = getSquareCoords(p.position);
                  // Slight offset when multiple players share a square
                  const sameSquarePlayers = players.filter((pl) => pl.position === p.position);
                  const posInGroup = sameSquarePlayers.findIndex((pl) => pl.id === p.id);
                  const offsetX =
                    sameSquarePlayers.length > 1
                      ? (posInGroup % 2 === 0 ? -1.8 : 1.8)
                      : 0;
                  const offsetY =
                    sameSquarePlayers.length > 2
                      ? posInGroup < 2
                        ? -1.8
                        : 1.8
                      : 0;

                  const isCurrent = idx === currentPlayerIndex;

                  return (
                    <div
                      key={p.id}
                      style={{
                        left: `${coords.xPercent + offsetX}%`,
                        top: `${coords.yPercent + offsetY}%`,
                        transform: 'translate(-50%, -50%)',
                        transition: settings.reducedMotion
                          ? 'none'
                          : 'left 140ms ease-out, top 140ms ease-out',
                      }}
                      className={`absolute z-20 pointer-events-none ${
                        isCurrent ? 'scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]' : 'opacity-90'
                      }`}
                    >
                      <BirdTokenSvg token={p.token} size={32} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Dice Roller, Players Status, & Reptile Species Alert (4 columns on desktop) */}
            <div className="lg:col-span-4 space-y-3.5 w-full">
              {/* Dice & Turn Control Box */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
                  isLight
                    ? 'bg-white border-emerald-200 shadow-sm'
                    : 'bg-slate-900 border-slate-800 shadow-xl'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                    {mode === 'daily' ? `Daily Board · ${todayDate}` : 'Current Turn'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsPaused(true)}
                      aria-label="Pause game"
                      className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                        isLight
                          ? 'bg-slate-100 border-slate-200 text-slate-700'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={startMatch}
                      aria-label="Restart game"
                      className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                        isLight
                          ? 'bg-slate-100 border-slate-200 text-slate-700'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {currentPlayer && (
                  <div className="flex items-center gap-3">
                    <BirdTokenSvg token={currentPlayer.token} size={44} />
                    <div>
                      <p className="text-base font-extrabold leading-tight">
                        {currentPlayer.name}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">
                        Square: {currentPlayer.position === 0 ? 'Start (0)' : currentPlayer.position}{' '}
                        · Turns: {currentPlayer.turnsTaken}
                      </p>
                    </div>
                  </div>
                )}

                {/* Visual 6-Sided Die + Roll Button */}
                <div className="flex items-center gap-4">
                  <div
                    aria-label={diceValue ? `Dice showing ${diceValue}` : 'Dice ready to roll'}
                    className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-mono text-2xl font-black shrink-0 shadow-inner ${
                      isRolling && !settings.reducedMotion ? 'animate-bounce' : ''
                    } ${
                      diceValue === 6
                        ? 'bg-amber-500/20 border-amber-400 text-amber-400'
                        : isLight
                        ? 'bg-slate-100 border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  >
                    {diceValue ?? '🎲'}
                  </div>

                  <button
                    type="button"
                    disabled={
                      isRolling ||
                      isAnimatingMove ||
                      Boolean(currentPlayer?.isCpu) ||
                      screen === 'win'
                    }
                    onClick={performTurnRoll}
                    className="flex-1 py-4 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm sm:text-base shadow-lg transition-all cursor-pointer"
                  >
                    {isRolling
                      ? 'Rolling...'
                      : currentPlayer?.isCpu
                      ? 'CPU Thinking...'
                      : 'Roll Dice'}
                  </button>
                </div>

                {/* Live Play-by-Play Status Feed */}
                <p
                  className={`text-xs leading-relaxed p-2.5 rounded-xl border ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-700'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300'
                  }`}
                >
                  {statusAnnouncement}
                </p>
              </div>

              {/* Snake Bite Species Popup (Accuracy Rule Enforced) */}
              {lastBitePopup && (
                <div
                  role="alert"
                  className={`p-4 rounded-2xl border space-y-1.5 ${
                    isLight
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      Snake Bite at Square {lastBitePopup.fromSq}!
                    </span>
                    <button
                      type="button"
                      onClick={() => setLastBitePopup(null)}
                      className="text-xs opacity-75 hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-sm font-bold">
                    {lastBitePopup.species.species}{' '}
                    <span className="italic font-normal opacity-80">
                      ({lastBitePopup.species.scientificName})
                    </span>
                  </p>
                  <p className="text-xs opacity-90">
                    {lastBitePopup.playerName} slid down to square {lastBitePopup.toSq}.
                  </p>
                  {/* Strictly only render fact if verified === true and non-empty */}
                  {lastBitePopup.species.verified === true &&
                    lastBitePopup.species.fact.trim().length > 0 && (
                      <p className="text-xs pt-1 border-t border-amber-500/20">
                        {lastBitePopup.species.fact}
                      </p>
                    )}
                </div>
              )}

              {/* Player Standings List */}
              <div
                className={`p-4 rounded-2xl border space-y-2.5 ${
                  isLight
                    ? 'bg-white border-emerald-200'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Players ({players.length})
                </h3>
                <div className="space-y-2">
                  {players.map((p, idx) => {
                    const isTurn = idx === currentPlayerIndex && screen === 'playing';
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border ${
                          isTurn
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : isLight
                            ? 'border-slate-200 bg-slate-50'
                            : 'border-slate-800 bg-slate-950/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <BirdTokenSvg token={p.token} size={28} />
                          <div>
                            <p className="text-xs font-bold leading-none">{p.name}</p>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Turns: {p.turnsTaken} · Vines: {p.laddersClimbed} · Bites:{' '}
                              {p.snakeBites}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-extrabold px-2 py-1 rounded bg-slate-800 text-emerald-400">
                          {p.position === 0 ? 'START' : `Sq ${p.position}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SCREEN 4: MY RECORDS */}
      {screen === 'records' && (
        <section className="max-w-3xl mx-auto px-3 sm:px-6 py-4">
          <div
            className={`rounded-3xl border p-6 sm:p-8 space-y-6 ${
              isLight
                ? 'bg-white border-emerald-200 shadow-md'
                : 'bg-slate-900 border-slate-800 shadow-2xl'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-4">
              <div>
                <p className="text-xs font-semibold text-emerald-500">
                  Local Device High Scores
                </p>
                <h2 className="text-2xl font-extrabold">My Records</h2>
              </div>
              <button
                type="button"
                onClick={() => setScreen('menu')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
              >
                ← Back to Game
              </button>
            </div>

            <p className="text-xs text-amber-400 font-medium">
              Note: Scores and statistics are saved on this device only inside your browser&apos;s
              localStorage.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              <div
                className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <p className="text-xs text-slate-400">Best Solo Race</p>
                <p className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
                  {records.bestSoloTurns !== null ? `${records.bestSoloTurns} turns` : '—'}
                </p>
              </div>

              <div
                className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <p className="text-xs text-slate-400">Today&apos;s Daily Best</p>
                <p className="text-2xl font-mono font-extrabold text-amber-400 mt-1">
                  {records.dailyBestByDate[todayDate] !== undefined
                    ? `${records.dailyBestByDate[todayDate]} turns`
                    : '—'}
                </p>
              </div>

              <div
                className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <p className="text-xs text-slate-400">Total Wins / Games</p>
                <p className="text-2xl font-mono font-extrabold text-sky-400 mt-1">
                  {records.totalWins} / {records.totalGames}
                </p>
              </div>

              <div
                className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <p className="text-xs text-slate-400">Longest Vine Climb</p>
                <p className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
                  +{records.longestLadderClimb} sq
                </p>
              </div>

              <div
                className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <p className="text-xs text-slate-400">Total Snake Bites</p>
                <p className="text-2xl font-mono font-extrabold text-rose-400 mt-1">
                  {records.totalSnakeBites}
                </p>
              </div>
            </div>

            {/* Daily Board History Table */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold">Daily Board Records by Date</h3>
              {Object.keys(records.dailyBestByDate).length === 0 ? (
                <p className="text-xs text-slate-400">
                  No Daily Board wins recorded yet. Try today&apos;s Daily Board ({todayDate})!
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(records.dailyBestByDate)
                    .sort((a, b) => b[0].localeCompare(a[0]))
                    .map(([dateKey, bestTurns]) => (
                      <div
                        key={dateKey}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono ${
                          isLight
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <span>{dateKey}</span>
                        <span className="font-bold text-emerald-400">{bestTurns} turns</span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Reset Records Button */}
            <div className="pt-4 border-t border-slate-800/40 flex items-center justify-between">
              {!confirmResetRecords ? (
                <button
                  type="button"
                  onClick={() => setConfirmResetRecords(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-bold cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Reset My Records</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-400 font-semibold">
                    Erase all local records?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRecords(resetRecords());
                      setConfirmResetRecords(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Yes, Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmResetRecords(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* WIN SCREEN OVERLAY MODAL */}
      {screen === 'win' && winner && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="win-modal-heading"
        >
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl">
            {isNewPersonalBest && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-extrabold">
                <Sparkles className="w-4 h-4" />
                New personal best!
              </div>
            )}

            <div className="flex justify-center">
              <BirdTokenSvg token={winner.token} size={72} />
            </div>

            <div className="space-y-1">
              <h2 id="win-modal-heading" className="text-2xl sm:text-3xl font-extrabold text-white">
                {winner.name} Wins!
              </h2>
              <p className="text-emerald-400 font-mono text-lg font-bold">
                Won in {winner.turnsTaken} {winner.turnsTaken === 1 ? 'turn' : 'turns'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
              <div>
                <p className="text-slate-400">Vines</p>
                <p className="font-mono font-bold text-emerald-400 text-base">
                  {winner.laddersClimbed}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Snake Bites</p>
                <p className="font-mono font-bold text-amber-400 text-base">
                  {winner.snakeBites}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Best Climb</p>
                <p className="font-mono font-bold text-sky-400 text-base">
                  +{winner.longestClimb}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Result</span>
              </button>

              <button
                type="button"
                onClick={startMatch}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer"
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
              Return to Main Menu
            </button>
          </div>
        </div>
      )}

      {/* SHAREABLE SCORE CARD MODAL */}
      {winner && (
        <ShareCardModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          winnerName={winner.name}
          winnerToken={winner.token}
          turnsTaken={winner.turnsTaken}
          mode={mode}
          laddersClimbed={winner.laddersClimbed}
          snakeBites={winner.snakeBites}
          personalBestTurns={
            mode === 'daily'
              ? records.dailyBestByDate[todayDate] ?? winner.turnsTaken
              : records.bestSoloTurns ?? winner.turnsTaken
          }
          dateStr={todayDate}
        />
      )}

      {/* PAUSE MODAL */}
      {isPaused && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Game Paused"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
            <h2 className="text-xl font-bold text-white">Game Paused</h2>
            <p className="text-xs text-slate-400">
              Take a breather! Your board position and turns are waiting.
            </p>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPaused(false)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>Resume Game</span>
              </button>
              <button
                type="button"
                onClick={startMatch}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs cursor-pointer"
              >
                Restart Match
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPaused(false);
                  setScreen('menu');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-semibold text-xs cursor-pointer"
              >
                Quit to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Settings"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold">Game Settings</h2>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="font-bold">Sound Effects (Web Audio)</p>
                  <p className="text-slate-400">Dice roll, hops, vine climbs, and snake slides</p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className={`px-3 py-1.5 rounded-lg font-bold ${
                    !isMuted ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {!isMuted ? 'ON' : 'MUTED'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="font-bold">Bonus Roll on 6</p>
                  <p className="text-slate-400">Three 6s in a row cancel the 3rd bonus roll</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateSetting('bonusRollOnSix', !settings.bonusRollOnSix)}
                  className={`px-3 py-1.5 rounded-lg font-bold ${
                    settings.bonusRollOnSix
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {settings.bonusRollOnSix ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="font-bold">Reduced Motion</p>
                  <p className="text-slate-400">Instant movement without hop/bounce animations</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                  className={`px-3 py-1.5 rounded-lg font-bold ${
                    settings.reducedMotion
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {settings.reducedMotion ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="font-bold">Board Color Theme</p>
                  <p className="text-slate-400">Switch between Dark Canopy and Light Jungle</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateSetting('theme', settings.theme === 'dark' ? 'light' : 'dark')
                  }
                  className="px-3 py-1.5 rounded-lg font-bold bg-slate-800 border border-slate-700"
                >
                  {settings.theme === 'dark' ? 'Dark' : 'Light'}
                </button>
              </div>
            </div>

            {selfTestStatus && (
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 pt-2 border-t border-slate-800">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Board generator verified ({selfTestStatus.testedCount} test boards passed all
                  8-snake/8-ladder placement rules).
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
          aria-label="How to Play Snake and Ladder"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold">How to Play Snake and Ladder</h2>
              <button
                type="button"
                onClick={() => setIsHowToPlayOpen(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs"
              >
                ✕
              </button>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed list-disc pl-5">
              <li>
                <strong>10×10 Zigzag Path:</strong> Players start off-board at square 0 and
                advance along squares 1 to 100 in a classic boustrophedon (alternating left-to-right
                and right-to-left) path.
              </li>
              <li>
                <strong>Climbing Vines (▲ Ladders):</strong> Landing on the bottom of one of the
                8 green jungle vines immediately boosts your bird token up to the top square.
              </li>
              <li>
                <strong>Reptile Snakes (▼ Snakes):</strong> Landing on a snake&apos;s head slides
                your token down to its tail and displays the real snake species name.
              </li>
              <li>
                <strong>Bonus Roll on 6:</strong> Rolling a 6 grants a bonus turn (enabled by
                default). Rolling three 6s in a row cancels the third bonus roll.
              </li>
              <li>
                <strong>Exact Roll for 100:</strong> You must roll the exact number needed to
                reach square 100. If your roll overshoots 100, you stay on your current square.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Bottom Ad Container (Strictly Outside Game Board Area) */}
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div id="ad-slot-bottom" className="w-full min-h-[4px]" aria-label="Bottom sponsor slot" />
      </div>

      {/* SEO & CONTENT SECTION: HOW TO PLAY & FAQ BELOW THE GAME */}
      <article
        className={`max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 border-t ${
          isLight ? 'border-emerald-200 text-slate-800' : 'border-slate-800/80 text-slate-200'
        }`}
      >
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            How to Play Snake and Ladder Online
          </h2>
          <p className="text-sm leading-relaxed opacity-90">
            <strong>Snake and Ladder</strong> (traditionally known worldwide as{' '}
            <strong>Snakes and Ladders</strong>) is a classic 10×10 numbered grid board game for 1
            to 4 players. Every player begins off the board at square 0 with an original bird token
            (Scarlet Macaw Parrot, Great Horned Owl, Harpy Eagle, or Emperor Penguin) and takes
            turns rolling a single six-sided die. Your token hops forward square by square along
            the zigzag trail from 1 to 100. If your roll lands at the base of a climbing jungle
            vine, you ascend to the higher square. If you land on a snake head, you slide down to
            its tail. The first player to land on square 100 with an exact die roll wins the match.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Frequently Asked Questions (FAQ)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-2xl border space-y-1.5 ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <h3 className="text-sm font-bold">
                1. What is the difference between Snake and Ladder and Snakes and Ladders?
              </h3>
              <p className="text-xs leading-relaxed opacity-85">
                Both names refer to the exact same traditional 100-square board game originating in
                ancient India. Whether you search for <em>snake and ladder</em> or{' '}
                <em>snakes and ladders</em>, the core rules remain identical: climb ladders to
                advance faster and avoid snake heads that slide you backward.
              </p>
            </div>

            <div
              className={`p-4 rounded-2xl border space-y-1.5 ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <h3 className="text-sm font-bold">
                2. How does the Daily Board mode work?
              </h3>
              <p className="text-xs leading-relaxed opacity-85">
                In Daily Board mode, our deterministic random generator uses today&apos;s date
                (YYYY-MM-DD) as a seed to place the 8 climbing vines and 8 snakes. Every player on
                reptilebirds.com gets the exact same board layout that day and competes to finish
                in the fewest turns.
              </p>
            </div>

            <div
              className={`p-4 rounded-2xl border space-y-1.5 ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <h3 className="text-sm font-bold">
                3. Is the dice roll truly fair in this online Snakes and Ladders game?
              </h3>
              <p className="text-xs leading-relaxed opacity-85">
                Yes. Every die roll is generated client-side using your browser&apos;s cryptographic
                random number API (<code>crypto.getRandomValues</code>) with rejection sampling so
                each face from 1 to 6 has an exact 1-in-6 probability—for both human and computer
                players.
              </p>
            </div>

            <div
              className={`p-4 rounded-2xl border space-y-1.5 ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <h3 className="text-sm font-bold">
                4. What happens if I roll a 6 or overshoot square 100?
              </h3>
              <p className="text-xs leading-relaxed opacity-85">
                Rolling a 6 awards one bonus turn (you can toggle this rule in Settings), though
                rolling three 6s in a row cancels the third bonus roll. To win a snake and ladder
                match, you must roll the exact count required to land on 100; overshooting leaves
                your token on its current square.
              </p>
            </div>

            <div
              className={`p-4 rounded-2xl border space-y-1.5 md:col-span-2 ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <h3 className="text-sm font-bold">
                5. Where are my personal best scores stored?
              </h3>
              <p className="text-xs leading-relaxed opacity-85">
                Your Solo Race personal best, Daily Board history, total wins, longest vine climb,
                and snake bite statistics are stored exclusively in your browser&apos;s local
                storage on your device. You can view or reset them anytime on the My Records screen.
              </p>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
};
