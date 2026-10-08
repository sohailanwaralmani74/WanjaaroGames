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
  Dices,
  ChevronDown,
  Home,
} from 'lucide-react';

interface SetupPlayerConfig {
  name: string;
  token: BirdTokenId;
  isCpu: boolean;
}

interface SnakeAndLadderGameProps {
  onNavigateHome?: () => void;
}

const DEFAULT_PLAYERS_SETUP: SetupPlayerConfig[] = [
  { name: 'Player 1', token: 'parrot', isCpu: false },
  { name: 'Robo Owl', token: 'owl', isCpu: true },
  { name: 'Player 3', token: 'eagle', isCpu: false },
  { name: 'Player 4', token: 'penguin', isCpu: false },
];

/**
 * Renders an authentic 6-sided game die face with crisp pips (1-6)
 */
const DiceFaceSvg: React.FC<{ value: number | null; size?: number; isRolling?: boolean }> = ({
  value,
  size = 48,
  isRolling = false,
}) => {
  const pipCoords: Record<number, [number, number][]> = {
    1: [[32, 32]],
    2: [
      [18, 18],
      [46, 46],
    ],
    3: [
      [18, 18],
      [32, 32],
      [46, 46],
    ],
    4: [
      [18, 18],
      [46, 18],
      [18, 46],
      [46, 46],
    ],
    5: [
      [18, 18],
      [46, 18],
      [32, 32],
      [18, 46],
      [46, 46],
    ],
    6: [
      [18, 16],
      [46, 16],
      [18, 32],
      [46, 32],
      [18, 48],
      [46, 48],
    ],
  };

  const pips = value ? pipCoords[value] || pipCoords[6] : pipCoords[5];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`drop-shadow-lg transition-transform ${
        isRolling ? 'animate-spin' : ''
      }`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="diceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      {/* 3D bevel base */}
      <rect x="4" y="6" width="56" height="54" rx="14" fill="#94a3b8" />
      {/* Top ivory face */}
      <rect
        x="4"
        y="4"
        width="56"
        height="54"
        rx="14"
        fill="url(#diceGrad)"
        stroke={value === 6 ? '#f59e0b' : '#cbd5e1'}
        strokeWidth="2.5"
      />
      {/* Pips */}
      {pips.map(([cx, cy], idx) => (
        <circle
          key={idx}
          cx={cx}
          cy={cy}
          r={value === 1 ? 6.5 : 5}
          fill={value === 1 || value === 6 ? '#dc2626' : '#0f172a'}
        />
      ))}
    </svg>
  );
};

export const SnakeAndLadderGame: React.FC<SnakeAndLadderGameProps> = ({ onNavigateHome }) => {
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
  const [showRulesDrawer, setShowRulesDrawer] = useState(false);

  // Active Game State
  const todayDate = getTodayDateString();
  const [board, setBoard] = useState<BoardConfig>(() => generateBoard());
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isAnimatingMove, setIsAnimatingMove] = useState<boolean>(false);
  // Dynamic on-board dice roll animation coordinates (% across the board)
  const [boardDicePos, setBoardDicePos] = useState<{
    visible: boolean;
    x: number;
    y: number;
    rot: number;
  }>({ visible: false, x: 50, y: 50, rot: 0 });

  const [statusAnnouncement, setStatusAnnouncement] = useState<string>(
    'Tap the Dice button or press Space to roll!'
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
    setBoardDicePos({ visible: false, x: 50, y: 50, rot: 0 });
    setIsPaused(false);
    setLastBitePopup(null);
    setWinner(null);
    setIsNewPersonalBest(false);
    setScreen('playing');
    setStatusAnnouncement(
      `${activePlayers[0].name}'s turn! Click the Dice button to roll onto the board.`
    );
  };

  // Execute a die roll that tumbles directly across the board
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
    const rollDuration = settings.reducedMotion ? 90 : 460;

    // Launch the die onto the board surface
    setBoardDicePos({
      visible: true,
      x: 24,
      y: 78,
      rot: -180,
    });

    if (!settings.reducedMotion) {
      const bouncePositions = [
        { x: 38, y: 36, rot: -90 },
        { x: 64, y: 32, rot: 45 },
        { x: 54, y: 56, rot: 160 },
        { x: 50, y: 48, rot: 360 },
      ];
      bouncePositions.forEach((pos, idx) => {
        const t = window.setTimeout(() => {
          setDiceValue(rollFairDie());
          setBoardDicePos({ visible: true, ...pos });
        }, (idx + 1) * 85);
        timersRef.current.push(t);
      });
    } else {
      setBoardDicePos({ visible: true, x: 50, y: 50, rot: 0 });
    }

    const rollDoneTimer = window.setTimeout(() => {
      setDiceValue(finalRoll);
      setIsRolling(false);
      setIsAnimatingMove(true);

      // Hide the floating center die shortly after showing the final face so tokens hop cleanly
      const hideBoardDieTimer = window.setTimeout(() => {
        setBoardDicePos((prev) => ({ ...prev, visible: false }));
      }, settings.reducedMotion ? 150 : 420);
      timersRef.current.push(hideBoardDieTimer);

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

      if (outcome.overshot) {
        setStatusAnnouncement(
          `${activePlayer.name} rolled ${finalRoll} (needs exact roll for 100) — stays on ${activePlayer.position}.`
        );

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
            setStatusAnnouncement(`${activePlayer.name} rolled a 6! Bonus roll!`);
          } else {
            const nextIdx = (currentPlayerIndex + 1) % players.length;
            setCurrentPlayerIndex(nextIdx);
          }
        }, settings.reducedMotion ? 150 : 520);
        timersRef.current.push(nextTimer);
        return;
      }

      const hopDelay = settings.reducedMotion ? 30 : 145;
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
              `Vine Climb! ${activePlayer.name} climbed ${outcome.landedSquare} → ${outcome.finalSquare}!`
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
              `Snake Bite! ${species.species} at ${outcome.landedSquare} → slid to ${outcome.finalSquare}.`
            );
          }
        } else {
          setStatusAnnouncement(
            `${activePlayer.name} rolled ${finalRoll} → Square ${outcome.finalSquare}.`
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
              `${updatedPlayer.name} reached 100 in ${updatedPlayer.turnsTaken} turns!`
            );
            setScreen('win');
            return;
          }

          if (outcome.tripleSixCancelledBonus) {
            setStatusAnnouncement(`Three 6s in a row! Bonus roll cancelled.`);
          }

          if (outcome.earnedBonusRoll) {
            setStatusAnnouncement(`${activePlayer.name} rolled 6! Roll again!`);
          } else {
            const nextIdx = (currentPlayerIndex + 1) % players.length;
            setCurrentPlayerIndex(nextIdx);
          }
        }, outcome.linkTriggered && !settings.reducedMotion ? 440 : 150);

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
      }, settings.reducedMotion ? 220 : 580);
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

  // Keyboard accessibility: Space or Enter rolls the die
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
      className={`flex-1 flex flex-col justify-between transition-colors select-none ${
        isLight
          ? 'bg-gradient-to-b from-emerald-100 via-amber-50 to-emerald-100 text-slate-900'
          : 'bg-transparent text-slate-100'
      }`}
    >
      {/* Screen-Reader Live Region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {statusAnnouncement}
      </div>

      {/* Top Ad Container (Strictly Outside Game Board Area) */}
      <div id="ad-slot-top" className="w-full h-0 overflow-hidden" aria-label="Top sponsor slot" />

      {/* MAIN GAME STAGE */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-2 sm:px-4 py-1.5">
        {/* SCREEN 1: GAME-LIKE ARCADE LAUNCHER */}
        {screen === 'menu' && (
          <div
            className={`w-full max-w-2xl rounded-3xl border-2 p-5 sm:p-7 space-y-5 shadow-2xl ${
              isLight
                ? 'bg-white/95 border-emerald-400'
                : 'bg-slate-900/95 border-emerald-500/40'
            }`}
          >
            {/* Compact Utility Bar Inside Menu */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/50">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                Snake and Ladder • 10×10 Board
              </span>
              <div className="flex items-center gap-1">
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
            <div className="text-center space-y-1.5">
              <div className="flex justify-center gap-2 pb-1">
                {BIRD_TOKEN_LIST.map((b) => (
                  <BirdTokenSvg key={b.id} token={b.id} size={34} />
                ))}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Select Game Mode
              </h2>
              <p className="text-xs opacity-75">
                10×10 Jungle Board · 8 Climbing Vines · 8 Real Snake Species
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSelectMode('solo')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  isLight
                    ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300'
                    : 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/40 hover:border-emerald-400'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 font-extrabold text-sm sm:text-base">
                    <User className="w-4 h-4 text-emerald-400" />
                    <span>Solo Race</span>
                  </div>
                  <p className="text-[11px] opacity-75 mt-0.5">
                    Reach 100 in minimum turns
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {records.bestSoloTurns ? `${records.bestSoloTurns}t` : 'PLAY'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('daily')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  isLight
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-300'
                    : 'bg-amber-950/30 hover:bg-amber-900/40 border-amber-500/40 hover:border-amber-400'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 font-extrabold text-sm sm:text-base">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>Daily Board</span>
                  </div>
                  <p className="text-[11px] opacity-75 mt-0.5">
                    Seed: {todayDate}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {records.dailyBestByDate[todayDate]
                    ? `${records.dailyBestByDate[todayDate]}t`
                    : 'PLAY'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('cpu')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  isLight
                    ? 'bg-sky-50 hover:bg-sky-100 border-sky-300'
                    : 'bg-sky-950/30 hover:bg-sky-900/40 border-sky-500/40 hover:border-sky-400'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 font-extrabold text-sm sm:text-base">
                    <Bot className="w-4 h-4 text-sky-400" />
                    <span>Vs Computer</span>
                  </div>
                  <p className="text-[11px] opacity-75 mt-0.5">
                    1 Human vs 1–3 Bot Birds
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-sky-400">1–3 CPU</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('multi')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  isLight
                    ? 'bg-violet-50 hover:bg-violet-100 border-violet-300'
                    : 'bg-violet-950/30 hover:bg-violet-900/40 border-violet-500/40 hover:border-violet-400'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 font-extrabold text-sm sm:text-base">
                    <Users className="w-4 h-4 text-violet-400" />
                    <span>Pass &amp; Play</span>
                  </div>
                  <p className="text-[11px] opacity-75 mt-0.5">
                    2–4 Players on this device
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-violet-400">2–4P</span>
              </button>
            </div>

            <p className="text-[11px] text-center opacity-70">
              Scores are saved on this device only.
            </p>
          </div>
        )}

        {/* SCREEN 2: PLAYER & TOKEN SETUP */}
        {screen === 'setup' && (
          <div
            className={`w-full rounded-3xl border-2 p-4 sm:p-6 space-y-4 shadow-2xl ${
              isLight
                ? 'bg-white border-emerald-400'
                : 'bg-slate-900 border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-700/40 pb-3">
              <h2 className="text-lg sm:text-xl font-extrabold">
                {mode === 'solo' && 'Solo Race Setup'}
                {mode === 'daily' && `Daily Board (${todayDate})`}
                {mode === 'cpu' && 'Vs Computer Setup'}
                {mode === 'multi' && 'Local Multiplayer Setup'}
              </h2>
              <button
                type="button"
                onClick={() => setScreen('menu')}
                className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
              >
                ← Modes
              </button>
            </div>

            {(mode === 'cpu' || mode === 'multi') && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold">Players:</span>
                <div className="flex gap-1.5">
                  {[2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPlayerCount(num)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                        playerCount === num
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : isLight
                          ? 'bg-slate-100 border-slate-300'
                          : 'bg-slate-800 border-slate-700'
                      }`}
                    >
                      {mode === 'cpu' ? `1 vs ${num - 1} Bot` : `${num}P`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2.5 max-h-[48vh] overflow-y-auto pr-1">
              {Array.from({
                length: mode === 'solo' || mode === 'daily' ? 1 : playerCount,
              }).map((_, idx) => {
                const cfg = setupPlayers[idx];
                const isCpuSlot = mode === 'cpu' && idx > 0;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border flex flex-col sm:flex-row items-center gap-2.5 ${
                      isLight
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="w-full sm:w-44">
                      <label className="text-[10px] font-bold text-emerald-400 block mb-0.5">
                        {isCpuSlot ? `CPU #${idx}` : `Player ${idx + 1}`}
                      </label>
                      <input
                        type="text"
                        maxLength={16}
                        value={cfg.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSetupPlayers((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, name: val } : item
                            )
                          );
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-bold ${
                          isLight
                            ? 'bg-white border-slate-300'
                            : 'bg-slate-900 border-slate-700 text-white'
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-1.5 w-full sm:flex-1">
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
                            className={`flex-1 py-1 px-1.5 rounded-xl border flex flex-col items-center cursor-pointer transition-all ${
                              active
                                ? 'bg-emerald-500/20 border-emerald-400 scale-105'
                                : 'opacity-65 hover:opacity-100 border-transparent'
                            }`}
                          >
                            <BirdTokenSvg token={b.id} size={26} />
                            <span className="text-[9px] font-bold mt-0.5">
                              {b.speciesLabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={startMatch}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg transition-all cursor-pointer"
            >
              Launch Board →
            </button>
          </div>
        )}

        {/* SCREEN 3: COMPACT ALL-SCREEN GAME BOARD (DESKTOP: LEFT STACKED STATS & DICE | MOBILE: TOP STATS + BOARD) */}
        {(screen === 'playing' || screen === 'win') && (
          <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-3 lg:gap-6">
            {/* BIG SCREEN (lg+): STACKED LEFT PLAYER POSITIONS, BEST RECORDS, DICE ROLLER & ACTIONS */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 shrink-0 gap-2.5">
              <div
                className={`rounded-2xl border p-3.5 shadow-lg space-y-2 ${
                  isLight ? 'bg-white border-emerald-300' : 'bg-slate-900/95 border-emerald-500/30'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400">
                    {mode === 'daily'
                      ? `Daily (${todayDate})`
                      : mode === 'solo'
                      ? 'Solo Race'
                      : mode === 'cpu'
                      ? 'Vs Computer'
                      : 'Pass & Play'}
                  </span>
                  <span className="text-[10px] font-mono text-amber-300">
                    Best: {records.bestSoloTurns ? `${records.bestSoloTurns}t` : '—'}
                  </span>
                </div>

                {/* Stacked Player Cards */}
                <div className="space-y-1.5">
                  {players.map((p, idx) => {
                    const active = idx === currentPlayerIndex && screen === 'playing';
                    return (
                      <div
                        key={p.id}
                        className={`p-2 rounded-xl border flex items-center justify-between ${
                          active
                            ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <BirdTokenSvg token={p.token} size={22} />
                          <span className="text-xs truncate">
                            {p.name} {active ? '◀' : ''}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-extrabold text-emerald-400">
                          Sq {p.position}/100
                        </span>
                      </div>
                    );
                  })}
                </div>

                {currentPlayer && (
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs">
                    <span className="text-[10px] uppercase text-slate-400 font-bold">
                      Turns Taken
                    </span>
                    <span className="font-mono font-extrabold text-amber-400">
                      {currentPlayer.turnsTaken}
                    </span>
                  </div>
                )}
              </div>

              {/* Desktop Dice Roller Stacked on Left */}
              <div
                className={`rounded-2xl border p-3 shadow-xl space-y-2.5 ${
                  isLight ? 'bg-white border-emerald-300' : 'bg-slate-900/95 border-emerald-500/40'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {currentPlayer && <BirdTokenSvg token={currentPlayer.token} size={30} />}
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold truncate">
                      {currentPlayer?.name}&apos;s Turn
                    </p>
                    <p className="text-[10px] opacity-75 truncate">{statusAnnouncement}</p>
                  </div>
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
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 disabled:opacity-50 text-white font-black text-xs shadow-lg cursor-pointer"
                >
                  <DiceFaceSvg value={diceValue} size={32} isRolling={isRolling} />
                  <div className="text-left leading-tight">
                    <span className="flex items-center gap-1">
                      <Dices className="w-3.5 h-3.5" />
                      {isRolling
                        ? 'Rolling...'
                        : currentPlayer?.isCpu
                        ? 'CPU Turn'
                        : 'Roll Dice'}
                    </span>
                    <span className="text-[10px] font-mono opacity-85 block">
                      {diceValue ? `Last: ${diceValue}` : 'Space / Click'}
                    </span>
                  </div>
                </button>
              </div>

              {/* Left Stacked Action Controls */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 flex gap-1.5 shadow-md">
                <button
                  type="button"
                  onClick={startMatch}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5 border border-emerald-500/30 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearAllTimers();
                    setScreen('menu');
                  }}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 cursor-pointer"
                >
                  Menu
                </button>
              </div>
            </aside>

            {/* CENTER COLUMN: MOBILE TOP STATS + 10x10 BOARD + MOBILE DICE DOCK */}
            <div className="flex flex-col items-center gap-1.5">
              {/* MOBILE (< lg): COMPACT TOP PLAYER TURN & STATUS STRIP */}
              <div className="lg:hidden w-[94vw] sm:w-[min(86vw,74dvh)] flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl border bg-slate-900/90 border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {players.map((p, idx) => {
                    const active = idx === currentPlayerIndex && screen === 'playing';
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all ${
                          active
                            ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 opacity-75'
                        }`}
                      >
                        <BirdTokenSvg token={p.token} size={18} />
                        <span className="text-[11px] truncate max-w-[60px]">{p.name}</span>
                        <span className="font-mono text-[10px] px-1 rounded bg-slate-800 text-emerald-400">
                          {p.position === 0 ? '0' : p.position}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {currentPlayer && (
                    <span className="text-[10px] font-mono text-amber-400">
                      T:{currentPlayer.turnsTaken}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={startMatch}
                    className="p-1 rounded-lg bg-emerald-600 text-white cursor-pointer"
                    aria-label="Restart"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearAllTimers();
                      setScreen('menu');
                    }}
                    className="px-1.5 py-0.5 rounded-lg bg-slate-800 text-slate-200 text-[10px] font-bold cursor-pointer"
                  >
                    Menu
                  </button>
                </div>
              </div>

              {/* 10x10 RESPONSIVE BOARD SCALED FOR MOBILE & DESKTOP */}
              <div
                className={`relative w-[94vw] h-[94vw] max-w-[68dvh] max-h-[68dvh] lg:w-[min(58vw,78dvh)] lg:h-[min(58vw,78dvh)] lg:max-w-none lg:max-h-none rounded-2xl border-4 overflow-hidden shadow-2xl ${
                  isLight
                    ? 'bg-amber-50 border-emerald-700'
                    : 'bg-slate-900 border-emerald-600/80'
                }`}
                role="region"
                aria-label="10 by 10 Snake and Ladder board"
              >
              {/* 10x10 Grid */}
              <div className="grid grid-cols-10 grid-rows-10 w-full h-full">
                {visualSquares.map((sq) => {
                  const { visualRow, visualCol } = getSquareCoords(sq);
                  const isEvenChecker = (visualRow + visualCol) % 2 === 0;
                  const ladderHere = ladderMap.get(sq);
                  const snakeHere = snakeMap.get(sq);

                  let cellBg = isEvenChecker
                    ? isLight
                      ? 'bg-amber-50/95'
                      : 'bg-slate-900/95'
                    : isLight
                    ? 'bg-emerald-100/75'
                    : 'bg-slate-800/90';

                  if (sq === 100) {
                    cellBg = isLight ? 'bg-amber-300' : 'bg-amber-500/35';
                  } else if (sq === 1) {
                    cellBg = isLight ? 'bg-emerald-200' : 'bg-emerald-500/25';
                  }

                  return (
                    <div
                      key={sq}
                      className={`relative border border-slate-500/15 flex flex-col justify-between p-0.5 ${cellBg}`}
                    >
                      <div className="flex items-start justify-between w-full leading-none">
                        <span
                          className={`text-[8px] sm:text-[10px] font-mono font-bold tabular-nums ${
                            sq === 100
                              ? 'text-amber-400 font-black'
                              : isLight
                              ? 'text-slate-700'
                              : 'text-slate-300'
                          }`}
                        >
                          {sq}
                        </span>

                        {ladderHere && (
                          <span
                            title={`Vine up to ${ladderHere.end}`}
                            className="text-[7px] sm:text-[8px] font-mono font-bold text-emerald-400 leading-none"
                          >
                            ▲{ladderHere.end}
                          </span>
                        )}
                        {snakeHere && (
                          <span
                            title={`${snakeHere.species?.species || 'Snake'} down to ${snakeHere.end}`}
                            className="text-[7px] sm:text-[8px] font-mono font-bold text-amber-400 leading-none"
                          >
                            ▼{snakeHere.end}
                          </span>
                        )}
                      </div>

                      {sq === 100 && (
                        <span className="text-[8px] sm:text-[10px] font-black text-amber-400 self-center">
                          ★
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* CLEAN NON-CROSSING SVG LADDERS (VINES) & SNAKES */}
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full pointer-events-none"
                aria-hidden="true"
              >
                {/* 8 Climbing Vines (Ladders) */}
                {board.ladders.map((ladder) => {
                  const startC = getSquareCoords(ladder.start);
                  const endC = getSquareCoords(ladder.end);
                  const dx = endC.xPercent - startC.xPercent;
                  const dy = endC.yPercent - startC.yPercent;
                  const len = Math.hypot(dx, dy) || 1;
                  const nx = (-dy / len) * 1.15;
                  const ny = (dx / len) * 1.15;

                  const steps = Math.max(4, Math.floor(len / 4.2));
                  const rungs = [];
                  for (let s = 1; s < steps; s++) {
                    const t = s / steps;
                    const cx = startC.xPercent + dx * t;
                    const cy = startC.yPercent + dy * t;
                    rungs.push(
                      <line
                        key={`rung-${ladder.id}-${s}`}
                        x1={cx - nx}
                        y1={cy - ny}
                        x2={cx + nx}
                        y2={cy + ny}
                        stroke="#34d399"
                        strokeWidth="0.6"
                        strokeLinecap="round"
                      />
                    );
                  }

                  return (
                    <g key={ladder.id} opacity="0.95">
                      <line
                        x1={startC.xPercent - nx}
                        y1={startC.yPercent - ny}
                        x2={endC.xPercent - nx}
                        y2={endC.yPercent - ny}
                        stroke="#10b981"
                        strokeWidth="0.8"
                        strokeLinecap="round"
                      />
                      <line
                        x1={startC.xPercent + nx}
                        y1={startC.yPercent + ny}
                        x2={endC.xPercent + nx}
                        y2={endC.yPercent + ny}
                        stroke="#10b981"
                        strokeWidth="0.8"
                        strokeLinecap="round"
                      />
                      {rungs}
                      <circle
                        cx={startC.xPercent}
                        cy={startC.yPercent}
                        r="1.6"
                        fill="#059669"
                        stroke="#ffffff"
                        strokeWidth="0.35"
                      />
                    </g>
                  );
                })}

                {/* 8 Clean Non-Overlapping Snakes */}
                {board.snakes.map((snake, sIdx) => {
                  const headC = getSquareCoords(snake.start);
                  const tailC = getSquareCoords(snake.end);
                  const dx = tailC.xPercent - headC.xPercent;
                  const dy = tailC.yPercent - headC.yPercent;
                  const len = Math.hypot(dx, dy) || 1;
                  // Gentle S-wave kept strictly inside its own lane (max 3.2 units wave amplitude)
                  const wave = (sIdx % 2 === 0 ? 1 : -1) * Math.min(3.2, len * 0.14);
                  const nx = (-dy / len) * wave;
                  const ny = (dx / len) * wave;

                  const c1x = headC.xPercent + dx * 0.33 + nx;
                  const c1y = headC.yPercent + dy * 0.33 + ny;
                  const c2x = headC.xPercent + dx * 0.66 - nx;
                  const c2y = headC.yPercent + dy * 0.66 - ny;

                  const pathD = `M ${headC.xPercent} ${headC.yPercent} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tailC.xPercent} ${tailC.yPercent}`;

                  return (
                    <g key={snake.id} opacity="0.95">
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#ea580c"
                        strokeWidth="1.55"
                        strokeLinecap="round"
                      />
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#fde047"
                        strokeWidth="0.7"
                        strokeDasharray="1.2 1.4"
                        strokeLinecap="round"
                      />
                      <circle
                        cx={headC.xPercent}
                        cy={headC.yPercent}
                        r="2.0"
                        fill="#dc2626"
                        stroke="#fef08a"
                        strokeWidth="0.4"
                      />
                      <circle
                        cx={headC.xPercent - 0.6}
                        cy={headC.yPercent - 0.4}
                        r="0.38"
                        fill="#ffffff"
                      />
                      <circle
                        cx={headC.xPercent + 0.6}
                        cy={headC.yPercent - 0.4}
                        r="0.38"
                        fill="#ffffff"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Player Bird Tokens on the Board */}
              {players.map((p, idx) => {
                if (p.position <= 0) return null;
                const coords = getSquareCoords(p.position);
                const sameSquarePlayers = players.filter((pl) => pl.position === p.position);
                const posInGroup = sameSquarePlayers.findIndex((pl) => pl.id === p.id);
                const offsetX =
                  sameSquarePlayers.length > 1 ? (posInGroup % 2 === 0 ? -1.6 : 1.6) : 0;
                const offsetY =
                  sameSquarePlayers.length > 2 ? (posInGroup < 2 ? -1.6 : 1.6) : 0;

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
                        : 'left 135ms ease-out, top 135ms ease-out',
                    }}
                    className={`absolute z-20 pointer-events-none ${
                      isCurrent
                        ? 'scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.95)]'
                        : 'opacity-90'
                    }`}
                  >
                    <BirdTokenSvg token={p.token} size={26} />
                  </div>
                );
              })}

              {/* 3D DICE ROLLING DIRECTLY ON THE BOARD SURFACE */}
              {boardDicePos.visible && (
                <div
                  style={{
                    left: `${boardDicePos.x}%`,
                    top: `${boardDicePos.y}%`,
                    transform: `translate(-50%, -50%) rotate(${boardDicePos.rot}deg)`,
                    transition: settings.reducedMotion
                      ? 'none'
                      : 'left 85ms ease-out, top 85ms ease-out, transform 85ms ease-out',
                  }}
                  className="absolute z-30 pointer-events-none drop-shadow-[0_10px_18px_rgba(0,0,0,0.65)]"
                >
                  <DiceFaceSvg value={diceValue} size={58} isRolling={isRolling} />
                </div>
              )}

              {/* Compact On-Board Snake Bite Species Toast */}
              {lastBitePopup && (
                <div
                  role="alert"
                  className="absolute bottom-2 left-2 right-2 z-30 bg-slate-950/95 border border-amber-500/60 text-amber-200 px-3 py-2 rounded-xl shadow-xl flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <p className="font-bold leading-tight">
                        {lastBitePopup.species.species}{' '}
                        <span className="italic opacity-75 font-normal">
                          ({lastBitePopup.species.scientificName})
                        </span>
                      </p>
                      {lastBitePopup.species.verified === true &&
                        lastBitePopup.species.fact.trim().length > 0 && (
                          <p className="text-[11px] opacity-90 mt-0.5">
                            {lastBitePopup.species.fact}
                          </p>
                        )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLastBitePopup(null)}
                    className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-300"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

              {/* MOBILE (< lg) INTERACTIVE DICE BUTTON DOCK BELOW BOARD */}
              <div
                className={`lg:hidden w-[94vw] sm:w-[min(86vw,74dvh)] mt-2 flex items-center justify-between gap-2 px-3 py-2 rounded-2xl border shadow-xl ${
                  isLight
                    ? 'bg-white border-emerald-300'
                    : 'bg-slate-900/95 border-emerald-500/40'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {currentPlayer && <BirdTokenSvg token={currentPlayer.token} size={28} />}
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold truncate">
                      {currentPlayer?.name}&apos;s Turn
                    </p>
                    <p className="text-[10px] opacity-75 truncate">{statusAnnouncement}</p>
                  </div>
                </div>

                {/* Clickable Dice Icon Button to Roll */}
                <button
                  type="button"
                  disabled={
                    isRolling ||
                    isAnimatingMove ||
                    Boolean(currentPlayer?.isCpu) ||
                    screen === 'win'
                  }
                  onClick={performTurnRoll}
                  aria-label="Click dice to roll on board"
                  className="shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs shadow-lg transition-all cursor-pointer"
                >
                  <DiceFaceSvg value={diceValue} size={30} isRolling={isRolling} />
                  <div className="text-left leading-tight">
                    <span className="flex items-center gap-1">
                      <Dices className="w-3.5 h-3.5" />
                      {isRolling
                        ? 'Rolling...'
                        : currentPlayer?.isCpu
                        ? 'CPU Turn'
                        : 'Roll Dice'}
                    </span>
                    <span className="text-[9px] font-mono opacity-85 block">
                      {diceValue ? `Last: ${diceValue}` : 'Tap / Space'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 4: MY RECORDS */}
        {screen === 'records' && (
          <div
            className={`w-full rounded-3xl border-2 p-5 sm:p-6 space-y-4 shadow-2xl ${
              isLight ? 'bg-white border-emerald-300' : 'bg-slate-900 border-slate-800'
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

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl border bg-slate-950/60 border-slate-800">
                <p className="text-slate-400">Best Solo Race</p>
                <p className="text-lg font-mono font-extrabold text-emerald-400 mt-0.5">
                  {records.bestSoloTurns !== null ? `${records.bestSoloTurns} turns` : '—'}
                </p>
              </div>
              <div className="p-3 rounded-2xl border bg-slate-950/60 border-slate-800">
                <p className="text-slate-400">Today&apos;s Daily</p>
                <p className="text-lg font-mono font-extrabold text-amber-400 mt-0.5">
                  {records.dailyBestByDate[todayDate] !== undefined
                    ? `${records.dailyBestByDate[todayDate]} turns`
                    : '—'}
                </p>
              </div>
              <div className="p-3 rounded-2xl border bg-slate-950/60 border-slate-800">
                <p className="text-slate-400">Wins / Games</p>
                <p className="text-lg font-mono font-extrabold text-sky-400 mt-0.5">
                  {records.totalWins} / {records.totalGames}
                </p>
              </div>
              <div className="p-3 rounded-2xl border bg-slate-950/60 border-slate-800">
                <p className="text-slate-400">Longest Climb</p>
                <p className="text-lg font-mono font-extrabold text-emerald-400 mt-0.5">
                  +{records.longestLadderClimb} sq
                </p>
              </div>
              <div className="p-3 rounded-2xl border bg-slate-950/60 border-slate-800">
                <p className="text-slate-400">Snake Bites</p>
                <p className="text-lg font-mono font-extrabold text-rose-400 mt-0.5">
                  {records.totalSnakeBites}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/40 flex items-center justify-between">
              {!confirmResetRecords ? (
                <button
                  type="button"
                  onClick={() => setConfirmResetRecords(true)}
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
                      setRecords(resetRecords());
                      setConfirmResetRecords(false);
                    }}
                    className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmResetRecords(false)}
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

      {/* Bottom Ad Container (Strictly Outside Game Board Area) */}
      <div id="ad-slot-bottom" className="w-full h-0 overflow-hidden" aria-label="Bottom sponsor slot" />

      {/* COMPACT GAME FOOTER WITH COLLAPSIBLE RULES & FAQ */}
      <footer className="w-full max-w-2xl mx-auto px-3 pb-3 pt-1 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60 pt-2">
          <span>
            Scores are stored only on your device. No data leaves your browser. ·{' '}
            <strong className="text-emerald-400">ReptileBirds</strong>
          </span>
          <button
            type="button"
            onClick={() => setShowRulesDrawer(!showRulesDrawer)}
            className="flex items-center gap-1 text-emerald-400 font-semibold cursor-pointer"
          >
            <span>Rules &amp; FAQ</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${
                showRulesDrawer ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {showRulesDrawer && (
          <article className="mt-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs text-slate-300">
            <section className="space-y-1">
              <h2 className="font-bold text-white text-sm">
                How to Play Snake and Ladder (Snakes and Ladders)
              </h2>
              <p>
                Players start at square 0 and roll a fair 6-sided die to move along the 10×10
                zigzag path from 1 to 100. Landing at the bottom of a green climbing vine moves
                your bird token up to its top. Landing on a snake head slides you down to its
                tail. Roll an exact number to land on 100 and win!
              </p>
            </section>
            <section className="space-y-2">
              <h3 className="font-bold text-white">Frequently Asked Questions</h3>
              <p>
                <strong>1. Snake and Ladder vs Snakes and Ladders:</strong> Both names refer to
                the exact same classic 100-square board game.
              </p>
              <p>
                <strong>2. Daily Board Mode:</strong> Generated deterministically from today&apos;s
                date ({todayDate}) so everyone plays the same board layout.
              </p>
              <p>
                <strong>3. Fair Crypto Dice:</strong> All rolls use{' '}
                <code>crypto.getRandomValues</code> for true 1-in-6 fairness.
              </p>
              <p>
                <strong>4. Bonus Roll on 6:</strong> Rolling a 6 grants an extra turn, while three
                consecutive 6s cancel the third bonus roll.
              </p>
            </section>
          </article>
        )}
      </footer>

      {/* WIN SCREEN MODAL */}
      {screen === 'win' && winner && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl max-w-sm w-full p-5 text-center space-y-4 shadow-2xl">
            {isNewPersonalBest && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-extrabold">
                <Sparkles className="w-3.5 h-3.5" />
                New personal best!
              </div>
            )}

            <div className="flex justify-center">
              <BirdTokenSvg token={winner.token} size={64} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">{winner.name} Wins!</h2>
              <p className="text-emerald-400 font-mono text-base font-bold">
                Won in {winner.turnsTaken} {winner.turnsTaken === 1 ? 'turn' : 'turns'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-xs">
              <div>
                <p className="text-slate-400">Vines</p>
                <p className="font-mono font-bold text-emerald-400">{winner.laddersClimbed}</p>
              </div>
              <div>
                <p className="text-slate-400">Bites</p>
                <p className="font-mono font-bold text-amber-400">{winner.snakeBites}</p>
              </div>
              <div>
                <p className="text-slate-400">Best Climb</p>
                <p className="font-mono font-bold text-sky-400">+{winner.longestClimb}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Card</span>
              </button>
              <button
                type="button"
                onClick={startMatch}
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
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xs w-full p-5 text-center space-y-3">
            <h2 className="text-lg font-bold text-white">Game Paused</h2>
            <button
              type="button"
              onClick={() => setIsPaused(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Resume</span>
            </button>
            <button
              type="button"
              onClick={startMatch}
              className="w-full py-2 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs cursor-pointer"
            >
              Restart
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPaused(false);
                setScreen('menu');
              }}
              className="w-full py-2 rounded-xl bg-slate-800 text-rose-400 font-semibold text-xs cursor-pointer"
            >
              Main Menu
            </button>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-3 text-slate-100 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-base font-bold">Settings</h2>
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
              <span>Bonus Roll on 6</span>
              <button
                type="button"
                onClick={() => updateSetting('bonusRollOnSix', !settings.bonusRollOnSix)}
                className={`px-3 py-1 rounded-lg font-bold ${
                  settings.bonusRollOnSix
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {settings.bonusRollOnSix ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span>Reduced Motion</span>
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
                  Verified {selfTestStatus.testedCount} non-overlapping boards
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
              <h2 className="text-base font-bold">How to Play Snake and Ladder</h2>
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
                <strong>Click the Dice Icon:</strong> Tap the dice button (or press Spacebar) to
                roll the die directly across the board.
              </li>
              <li>
                <strong>Climbing Vines (▲):</strong> Landing at the bottom of a green vine climbs
                your bird token up to the top square.
              </li>
              <li>
                <strong>Snakes (▼):</strong> Landing on a snake head slides you down to its tail
                and reveals the real snake species name.
              </li>
              <li>
                <strong>Bonus Roll on 6:</strong> Rolling a 6 gives a bonus turn (3 sixes in a row
                cancel the 3rd bonus). Exact roll needed for 100!
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
