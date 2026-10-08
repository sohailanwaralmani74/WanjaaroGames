import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BoardSizeOption,
  BonusEggState,
  Direction,
  GridPoint,
  ObstacleCell,
  SnakeGameMode,
  SnakeSkinId,
  advanceSnakeStep,
  createInitialSnake,
  createSeededRng,
  enqueueDirection,
  generateObstacles,
  getFactForSpecies,
  getSpeedAndLevelMetrics,
  getTodayDateIso,
  runSnakeEngineSelfTest,
  spawnCollectibleCell,
} from './engine';
import {
  SnakeGameRecords,
  SnakeGameSettings,
  getModeSizeKey,
  loadSnakeRecords,
  loadSnakeSettings,
  recordFinishedSnakeRun,
  resetSnakeRecords,
  saveSnakeRecords,
  saveSnakeSettings,
} from './storage';
import { snakeAudio } from './audio';
import { SNAKE_SKINS, SNAKE_SKIN_LIST, SnakeSkinPreviewSvg } from './SnakeSkins';
import { SnakeShareModal } from './SnakeShareModal';
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
  Lock,
  CheckCircle2,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Palette,
  Home,
} from 'lucide-react';

interface SnakeGameProps {
  onNavigateHome?: () => void;
}

export const SnakeGame: React.FC<SnakeGameProps> = ({ onNavigateHome }) => {
  const [settings, setSettings] = useState<SnakeGameSettings>(() => loadSnakeSettings());
  const [records, setRecords] = useState<SnakeGameRecords>(() => loadSnakeRecords());
  const [isMuted, setIsMuted] = useState<boolean>(() => snakeAudio.isMuted());

  // Screens: 'menu' | 'setup' | 'skins' | 'playing' | 'gameover' | 'records'
  const [screen, setScreen] = useState<
    'menu' | 'setup' | 'skins' | 'playing' | 'gameover' | 'records'
  >('menu');

  const [mode, setMode] = useState<SnakeGameMode>('classic');
  const [boardSize, setBoardSize] = useState<BoardSizeOption>(20);
  const [selectedSkin, setSelectedSkin] = useState<SnakeSkinId>(() => records.selectedSkin);

  // Modals
  const [isPaused, setIsPaused] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showFaqDrawer, setShowFaqDrawer] = useState(false);

  const todayDate = getTodayDateIso();

  // Active Gameplay State
  const [snake, setSnake] = useState<GridPoint[]>(() => createInitialSnake(20));
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [mouse, setMouse] = useState<GridPoint>({ x: 14, y: 10 });
  const [bonusEgg, setBonusEgg] = useState<BonusEggState | null>(null);
  const [bonusEggRemainingRatio, setBonusEggRemainingRatio] = useState<number>(0);
  const [obstacles, setObstacles] = useState<ObstacleCell[]>([]);
  const [score, setScore] = useState<number>(0);
  const [miceEaten, setMiceEaten] = useState<number>(0);
  const [isNewPersonalBest, setIsNewPersonalBest] = useState<boolean>(false);
  const [newlyUnlockedSkins, setNewlyUnlockedSkins] = useState<SnakeSkinId[]>([]);
  const [deathReason, setDeathReason] = useState<'wall' | 'self' | 'obstacle' | null>(null);
  const [eatEffectCell, setEatEffectCell] = useState<GridPoint | null>(null);
  const [deathFlash, setDeathFlash] = useState<boolean>(false);
  const [srAnnouncement, setSrAnnouncement] = useState<string>(
    'Welcome to Snake Game on ReptileBirds.'
  );
  const [selfTestStatus, setSelfTestStatus] = useState<{
    passed: boolean;
    testedCount: number;
  } | null>(null);

  // Mutable refs for fixed-timestep requestAnimationFrame loop
  const snakeRef = useRef<GridPoint[]>(snake);
  const dirRef = useRef<Direction>('RIGHT');
  const dirQueueRef = useRef<Direction[]>([]);
  const mouseRef = useRef<GridPoint>(mouse);
  const bonusEggRef = useRef<BonusEggState | null>(null);
  const obstaclesRef = useRef<ObstacleCell[]>([]);
  const scoreRef = useRef<number>(0);
  const miceEatenRef = useRef<number>(0);
  const rngRef = useRef<() => number>(() => Math.random());
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Run engine validation self-test once on mount
  useEffect(() => {
    const res = runSnakeEngineSelfTest(20);
    setSelfTestStatus({ passed: res.passed, testedCount: res.testedCount });
  }, []);

  const updateSetting = <K extends keyof SnakeGameSettings>(
    key: K,
    val: SnakeGameSettings[K]
  ) => {
    const next = { ...settings, [key]: val };
    setSettings(next);
    saveSnakeSettings(next);
  };

  const handleToggleMute = () => {
    const next = snakeAudio.toggleMute();
    setIsMuted(next);
  };

  const handleSelectSkin = (skinId: SnakeSkinId) => {
    if (!records.unlockedSkins.includes(skinId)) return;
    setSelectedSkin(skinId);
    const nextRec = { ...records, selectedSkin: skinId };
    setRecords(nextRec);
    saveSnakeRecords(nextRec);
  };

  // Start a new Snake Game run
  const startNewRun = useCallback(
    (overrideMode?: SnakeGameMode, overrideSize?: BoardSizeOption) => {
      const activeMode = overrideMode ?? mode;
      const activeSize: BoardSizeOption =
        activeMode === 'daily' ? 20 : overrideSize ?? boardSize;

      if (activeMode === 'daily') {
        setBoardSize(20);
      }

      const rng =
        activeMode === 'daily'
          ? createSeededRng(`daily-snake-${todayDate}`)
          : () => {
              const arr = new Uint32Array(1);
              window.crypto.getRandomValues(arr);
              return arr[0] / 4294967296;
            };
      rngRef.current = rng;

      const initialSnake = createInitialSnake(activeSize);
      const initialObstacles =
        activeMode === 'jungle' || activeMode === 'daily'
          ? generateObstacles(activeSize, 1, initialSnake, rng)
          : [];
      const firstMouse = spawnCollectibleCell(
        activeSize,
        initialSnake,
        initialObstacles,
        rng,
        [],
        activeMode === 'wrap'
      );

      snakeRef.current = initialSnake;
      dirRef.current = 'RIGHT';
      dirQueueRef.current = [];
      obstaclesRef.current = initialObstacles;
      mouseRef.current = firstMouse;
      bonusEggRef.current = null;
      scoreRef.current = 0;
      miceEatenRef.current = 0;

      setSnake(initialSnake);
      setDirection('RIGHT');
      setObstacles(initialObstacles);
      setMouse(firstMouse);
      setBonusEgg(null);
      setBonusEggRemainingRatio(0);
      setScore(0);
      setMiceEaten(0);
      setIsNewPersonalBest(false);
      setNewlyUnlockedSkins([]);
      setDeathReason(null);
      setDeathFlash(false);
      setEatEffectCell(null);
      setIsPaused(false);
      setScreen('playing');
      setSrAnnouncement(
        `Snake Game started in ${activeMode} mode on a ${activeSize} by ${activeSize} grid.`
      );
    },
    [mode, boardSize, todayDate]
  );

  // Queue a direction change (up to 2 inputs buffered)
  const handleDirectionInput = useCallback((nextDir: Direction) => {
    dirQueueRef.current = enqueueDirection(
      dirRef.current,
      dirQueueRef.current,
      nextDir
    );
  }, []);

  // Keyboard controls (Arrow keys, WASD, Space/P to pause)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'playing') return;
      if (isHowToPlayOpen || isSettingsOpen || isShareOpen) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          if (isPaused) setIsPaused(false);
          handleDirectionInput('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          if (isPaused) setIsPaused(false);
          handleDirectionInput('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          if (isPaused) setIsPaused(false);
          handleDirectionInput('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          if (isPaused) setIsPaused(false);
          handleDirectionInput('RIGHT');
          break;
        case 'p':
        case 'P':
        case 'Escape':
          e.preventDefault();
          setIsPaused((prev) => !prev);
          break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, isPaused, isHowToPlayOpen, isSettingsOpen, isShareOpen, handleDirectionInput]);

  // Automatically pause when browser tab loses focus or visibility
  useEffect(() => {
    const handleBlurOrHide = () => {
      if (screen === 'playing') {
        setIsPaused(true);
      }
    };
    const handleVisibility = () => {
      if (document.hidden && screen === 'playing') {
        setIsPaused(true);
      }
    };
    window.addEventListener('blur', handleBlurOrHide);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('blur', handleBlurOrHide);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [screen]);

  // Fixed-timestep requestAnimationFrame game loop
  useEffect(() => {
    if (screen !== 'playing' || isPaused) return;

    let animationFrameId: number;
    let lastTimestamp = performance.now();
    let accumulator = 0;

    const loop = (now: number) => {
      const dt = Math.min(100, now - lastTimestamp);
      lastTimestamp = now;
      accumulator += dt;

      // Update bonus egg countdown ring
      if (bonusEggRef.current) {
        const elapsed = now - bonusEggRef.current.spawnTimeMs;
        if (elapsed >= bonusEggRef.current.durationMs) {
          bonusEggRef.current = null;
          setBonusEgg(null);
          setBonusEggRemainingRatio(0);
        } else {
          setBonusEggRemainingRatio(
            Math.max(0, 1 - elapsed / bonusEggRef.current.durationMs)
          );
        }
      }

      const { tickMs } = getSpeedAndLevelMetrics(miceEatenRef.current);

      if (accumulator >= tickMs) {
        accumulator -= tickMs;

        const activeSize: BoardSizeOption = mode === 'daily' ? 20 : boardSize;
        const stepOut = advanceSnakeStep({
          gridSize: activeSize,
          snake: snakeRef.current,
          currentDir: dirRef.current,
          dirQueue: dirQueueRef.current,
          mode,
          obstacles: obstaclesRef.current,
          mouse: mouseRef.current,
          bonusEgg: bonusEggRef.current,
        });

        dirQueueRef.current = stepOut.remainingQueue;
        dirRef.current = stepOut.result.direction;
        setDirection(stepOut.result.direction);

        if (stepOut.result.gameOver) {
          snakeAudio.playGameOver();
          setDeathReason(stepOut.result.deathReason || 'wall');
          setDeathFlash(true);

          const finalScore = scoreRef.current;
          const finalLength = snakeRef.current.length;
          const finalMice = miceEatenRef.current;

          const recOut = recordFinishedSnakeRun({
            mode,
            boardSize: activeSize,
            score: finalScore,
            length: finalLength,
            miceEatenInRun: finalMice,
            dailyDate: mode === 'daily' ? todayDate : undefined,
          });
          setRecords(recOut.updated);
          setIsNewPersonalBest(recOut.isNewPersonalBest);
          setNewlyUnlockedSkins(recOut.newlyUnlockedSkins);
          setSrAnnouncement(
            `Game over! Final score ${finalScore}, snake length ${finalLength}.`
          );

          window.setTimeout(() => {
            setScreen('gameover');
          }, settings.reducedMotion ? 80 : 420);
          return;
        }

        snakeRef.current = stepOut.result.snake;
        setSnake(stepOut.result.snake);

        if (
          settings.moveTickSound &&
          !stepOut.result.ateMouse &&
          !stepOut.result.ateBonusEgg
        ) {
          snakeAudio.playMoveTick();
        }

        // Check if mouse eaten
        if (stepOut.result.ateMouse) {
          snakeAudio.playEatMouse();
          const nextMice = miceEatenRef.current + 1;
          miceEatenRef.current = nextMice;
          setMiceEaten(nextMice);

          const metrics = getSpeedAndLevelMetrics(nextMice);
          const pointsEarned = 10 * metrics.multiplier;
          const nextScore = scoreRef.current + pointsEarned;
          scoreRef.current = nextScore;
          setScore(nextScore);

          setEatEffectCell(mouseRef.current);
          window.setTimeout(() => setEatEffectCell(null), 220);

          // In Jungle mode, add obstacles safely when advancing level
          let currentObstacles = obstaclesRef.current;
          if (mode === 'jungle' && nextMice % 5 === 0) {
            currentObstacles = generateObstacles(
              activeSize,
              metrics.level,
              stepOut.result.snake,
              rngRef.current,
              currentObstacles
            );
            obstaclesRef.current = currentObstacles;
            setObstacles(currentObstacles);
          }

          // Spawn next mouse
          const avoid = bonusEggRef.current ? [bonusEggRef.current] : [];
          const nextMouse = spawnCollectibleCell(
            activeSize,
            stepOut.result.snake,
            currentObstacles,
            rngRef.current,
            avoid,
            mode === 'wrap'
          );
          mouseRef.current = nextMouse;
          setMouse(nextMouse);

          // Every 5 mice eaten, spawn a bonus egg for 6 seconds (50 points)
          if (nextMice % 5 === 0 && !bonusEggRef.current) {
            const eggPos = spawnCollectibleCell(
              activeSize,
              stepOut.result.snake,
              currentObstacles,
              rngRef.current,
              [nextMouse],
              mode === 'wrap'
            );
            const newEgg: BonusEggState = {
              x: eggPos.x,
              y: eggPos.y,
              spawnTimeMs: performance.now(),
              durationMs: 6000,
            };
            bonusEggRef.current = newEgg;
            setBonusEgg(newEgg);
            setBonusEggRemainingRatio(1);
          }

          setSrAnnouncement(`Score ${nextScore}, length ${stepOut.result.snake.length}`);
        }

        // Check if bonus egg eaten
        if (stepOut.result.ateBonusEgg) {
          snakeAudio.playEatBonusEgg();
          const nextScore = scoreRef.current + 50;
          scoreRef.current = nextScore;
          setScore(nextScore);
          bonusEggRef.current = null;
          setBonusEgg(null);
          setBonusEggRemainingRatio(0);
          setSrAnnouncement(`Bonus egg collected! +50 points. Score ${nextScore}.`);
        }
      }

      animationFrameId = window.requestAnimationFrame(loop);
    };

    animationFrameId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [screen, isPaused, mode, boardSize, todayDate, settings.moveTickSound, settings.reducedMotion]);

  // Touch swipe handlers with short 18px threshold
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.touches.length === 0) return;
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = e.touches[0].clientY - touchStartRef.current.y;
    const threshold = 18;

    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      handleDirectionInput(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      handleDirectionInput(dy > 0 ? 'DOWN' : 'UP');
    }

    // Reset origin so continuous finger movement can chain turns smoothly
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const isLight = settings.theme === 'light';
  const activeGridSize: BoardSizeOption = mode === 'daily' ? 20 : boardSize;
  const { level, multiplier } = getSpeedAndLevelMetrics(miceEaten);
  const currentSkin = SNAKE_SKINS[selectedSkin] || SNAKE_SKINS['ball-python'];
  const currentSkinFact = getFactForSpecies(currentSkin.speciesName);

  const modeSizeRecord =
    mode === 'daily'
      ? {
          bestScore: records.dailyBestByDate[todayDate]?.score || 0,
          longestLength: records.dailyBestByDate[todayDate]?.length || 3,
        }
      : records.byModeAndSize[getModeSizeKey(mode, activeGridSize)] || {
          bestScore: 0,
          longestLength: 3,
        };

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
        {srAnnouncement}
      </div>

      {/* Top Ad Slot (Strictly Outside Game Board Area) */}
      <div id="ad-slot-top" className="w-full h-0 overflow-hidden" aria-label="Top sponsor slot" />

      {/* MAIN GAME STAGE */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-2 sm:px-4 py-1.5">
        {/* SCREEN 1: START MENU */}
        {screen === 'menu' && (
          <div
            className={`w-full max-w-2xl rounded-3xl border-2 p-5 sm:p-7 space-y-5 shadow-2xl ${
              isLight
                ? 'bg-white/95 border-emerald-400'
                : 'bg-slate-900/95 border-emerald-500/40'
            }`}
          >
            {/* Compact Utility Header Inside Menu */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/50">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                Snake Game • 6 Species Skins
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setScreen('skins')}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border bg-slate-800 border-slate-700 text-slate-200 cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Skins</span>
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
            <div className="flex flex-col items-center text-center space-y-2">
              <SnakeSkinPreviewSvg skinId={selectedSkin} size={68} />
              <div className="space-y-0.5">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Snake Game
                </h2>
                <p className="text-xs text-emerald-400 font-semibold">
                  Active Species: {currentSkin.speciesName}{' '}
                  <span className="italic opacity-80">({currentSkin.scientificName})</span>
                </p>
                {currentSkinFact.verified === true &&
                  currentSkinFact.fact.trim().length > 0 && (
                    <p className="text-xs opacity-85 max-w-md">{currentSkinFact.fact}</p>
                  )}
              </div>
            </div>

            {/* 4 Game Modes */}
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
                    Walls are deadly · Pure reflex hunt
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">PLAY →</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('wrap');
                  setScreen('setup');
                }}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  isLight
                    ? 'bg-sky-50 hover:bg-sky-100 border-sky-300'
                    : 'bg-sky-950/30 hover:bg-sky-900/40 border-sky-500/40'
                }`}
              >
                <div>
                  <p className="font-extrabold text-sm sm:text-base">Wrap-Around</p>
                  <p className="text-[11px] opacity-75">
                    Pass through walls to opposite side
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-sky-400">PLAY →</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('jungle');
                  setScreen('setup');
                }}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  isLight
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-300'
                    : 'bg-amber-950/30 hover:bg-amber-900/40 border-amber-500/40'
                }`}
              >
                <div>
                  <p className="font-extrabold text-sm sm:text-base">Jungle Obstacles</p>
                  <p className="text-[11px] opacity-75">
                    Dodge rocks &amp; logs that scale with level
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">PLAY →</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('daily');
                  startNewRun('daily', 20);
                }}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  isLight
                    ? 'bg-violet-50 hover:bg-violet-100 border-violet-300'
                    : 'bg-violet-950/30 hover:bg-violet-900/40 border-violet-500/40'
                }`}
              >
                <div>
                  <p className="font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-violet-400" />
                    <span>Daily Challenge</span>
                  </p>
                  <p className="text-[11px] opacity-75">
                    Seeded run for {todayDate}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-violet-400">
                  {records.dailyBestByDate[todayDate]
                    ? `${records.dailyBestByDate[todayDate].score} pts`
                    : 'PLAY →'}
                </span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/40 text-xs">
              <button
                type="button"
                onClick={() => setScreen('skins')}
                className="text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                🐍 Unlock Snake Skins ({records.unlockedSkins.length}/6 unlocked ·{' '}
                {records.totalMiceEaten} mice eaten)
              </button>
              <span className="text-[11px] opacity-70">
                Scores are saved on this device only.
              </span>
            </div>
          </div>
        )}

        {/* SCREEN 2: MODE & BOARD-SIZE SELECT */}
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
                    : mode === 'wrap'
                    ? 'Wrap-Around Mode'
                    : 'Jungle Mode'}
                </p>
                <h2 className="text-xl font-extrabold">Choose Grid Size</h2>
              </div>
              <button
                type="button"
                onClick={() => setScreen('menu')}
                className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                ← Back
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  { size: 15 as BoardSizeOption, label: 'Small', sub: '15×15 Grid' },
                  { size: 20 as BoardSizeOption, label: 'Normal', sub: '20×20 Grid' },
                  { size: 25 as BoardSizeOption, label: 'Large', sub: '25×25 Grid' },
                ] as const
              ).map((opt) => {
                const active = boardSize === opt.size;
                const rec = records.byModeAndSize[getModeSizeKey(mode, opt.size)];
                return (
                  <button
                    key={opt.size}
                    type="button"
                    onClick={() => setBoardSize(opt.size)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      active
                        ? 'bg-emerald-600/20 border-emerald-400'
                        : isLight
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <p className="font-extrabold text-sm sm:text-base">{opt.label}</p>
                    <p className="text-xs font-mono opacity-80">{opt.sub}</p>
                    <p className="text-[10px] font-mono text-emerald-400 mt-1.5">
                      Best: {rec ? rec.bestScore : 0}
                    </p>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => startNewRun(mode, boardSize)}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg transition-all cursor-pointer"
            >
              Start Hunting →
            </button>
          </div>
        )}

        {/* SCREEN 3: UNLOCKABLE SNAKE SKINS GALLERY */}
        {screen === 'skins' && (
          <div
            className={`w-full rounded-3xl border-2 p-5 sm:p-6 space-y-4 shadow-2xl ${
              isLight ? 'bg-white border-emerald-400' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
              <div>
                <h2 className="text-xl font-extrabold">Snake Species Skins</h2>
                <p className="text-xs text-emerald-400 font-mono">
                  Cumulative Mice Eaten: {records.totalMiceEaten}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {SNAKE_SKIN_LIST.map((skin) => {
                const isUnlocked = records.unlockedSkins.includes(skin.id);
                const isSelected = selectedSkin === skin.id;
                const factEntry = getFactForSpecies(skin.speciesName);

                return (
                  <button
                    key={skin.id}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => handleSelectSkin(skin.id)}
                    className={`p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/15'
                        : isUnlocked
                        ? isLight
                          ? 'border-slate-200 bg-slate-50 hover:border-emerald-300 cursor-pointer'
                          : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 cursor-pointer'
                        : 'border-slate-800/60 bg-slate-950/40 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <SnakeSkinPreviewSvg skinId={skin.id} size={52} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-bold text-sm truncate">{skin.speciesName}</p>
                        {isSelected ? (
                          <span className="text-[10px] font-bold text-emerald-400">
                            ACTIVE
                          </span>
                        ) : !isUnlocked ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400">
                            <Lock className="w-3 h-3" />
                            {skin.requiredMice} mice
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Unlocked</span>
                        )}
                      </div>
                      <p className="text-[11px] italic opacity-75">{skin.scientificName}</p>
                      {factEntry.verified === true && factEntry.fact.trim().length > 0 && (
                        <p className="text-[10px] mt-1 opacity-90">{factEntry.fact}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SCREEN 4: ACTIVE GAME BOARD (DESKTOP: STACKED LEFT STATS | MOBILE: TOP STATS + BOARD) */}
        {(screen === 'playing' || screen === 'gameover') && (
          <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-3 lg:gap-6">
            {/* BIG SCREEN (lg+): STACKED LEFT SCORE, BEST, LENGTH, LEVEL & CONTROLS */}
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
                      : `${mode.toUpperCase()} (${activeGridSize}×${activeGridSize})`}
                  </span>
                  <span className="text-[10px] font-mono text-amber-300">
                    x{multiplier} Mult
                  </span>
                </div>

                {/* Stacked Score & Best Cards */}
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
                      {Math.max(modeSizeRecord.bestScore, score)}
                    </span>
                  </div>
                </div>

                {/* Length & Level */}
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-1.5">
                    <span className="text-[9px] uppercase text-slate-400 font-bold block">
                      Length
                    </span>
                    <span className="font-mono font-extrabold text-xs text-white tabular-nums">
                      {snake.length} segs
                    </span>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-1.5">
                    <span className="text-[9px] uppercase text-slate-400 font-bold block">
                      Level
                    </span>
                    <span className="font-mono font-extrabold text-xs text-amber-400 tabular-nums">
                      Lv.{level}
                    </span>
                  </div>
                </div>

                {/* Active Snake Skin */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2 flex items-center gap-2">
                  <SnakeSkinPreviewSvg skinId={selectedSkin} size={32} />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-white truncate">
                      {currentSkin.speciesName}
                    </p>
                    <p className="text-[9px] italic text-slate-400 truncate">
                      {currentSkin.scientificName}
                    </p>
                  </div>
                </div>
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
                    onClick={() => startNewRun()}
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
                  Change Mode / Skin
                </button>
              </div>
            </aside>

            {/* CENTER COLUMN: MOBILE TOP STATS + RESPONSIVE SNAKE BOARD */}
            <div className="flex flex-col items-center gap-2">
              {/* MOBILE (< lg): COMPACT TOP SCORE, BEST, LENGTH & LEVEL BAR */}
              <div className="lg:hidden w-[94vw] max-w-[70dvh] grid grid-cols-5 gap-1 text-center">
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
                  <span className="font-mono font-extrabold text-xs text-sky-400 tabular-nums">
                    {Math.max(modeSizeRecord.bestScore, score)}
                  </span>
                </div>
                <div
                  className={`px-1.5 py-1 rounded-xl border ${
                    isLight ? 'bg-white border-emerald-200' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <span className="text-[9px] opacity-70 block">LENGTH</span>
                  <span className="font-mono font-extrabold text-xs tabular-nums">
                    {snake.length}
                  </span>
                </div>
                <div
                  className={`px-1.5 py-1 rounded-xl border ${
                    isLight ? 'bg-white border-emerald-200' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <span className="text-[9px] opacity-70 block">LEVEL</span>
                  <span className="font-mono font-extrabold text-xs text-amber-400 tabular-nums">
                    {level}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => startNewRun()}
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

              {/* SVG GAME BOARD (touch-action: none so swiping never scrolls page) */}
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                style={{ touchAction: 'none' }}
                className={`relative w-[94vw] h-[94vw] max-w-[70dvh] max-h-[70dvh] lg:w-[min(58vw,80dvh)] lg:h-[min(58vw,80dvh)] lg:max-w-none lg:max-h-none rounded-2xl border-4 overflow-hidden shadow-2xl transition-transform ${
                  deathFlash && !settings.reducedMotion ? 'scale-95 border-rose-500' : ''
                } ${
                  mode === 'wrap'
                    ? 'border-dashed border-sky-500/80'
                    : isLight
                    ? 'border-emerald-700 bg-amber-50'
                    : 'border-emerald-600/80 bg-slate-950'
                }`}
                role="application"
                aria-label={`Snake Game ${activeGridSize} by ${activeGridSize} grid board. Use arrow keys, WASD, or swipe to steer.`}
              >
              <svg
                viewBox={`0 0 ${activeGridSize} ${activeGridSize}`}
                className="w-full h-full block"
              >
                {/* Optional Grid Lines */}
                {settings.showGridLines &&
                  Array.from({ length: activeGridSize }).map((_, idx) => (
                    <g
                      key={`grid-${idx}`}
                      stroke={isLight ? 'rgba(15,23,42,0.06)' : 'rgba(148,163,184,0.07)'}
                      strokeWidth="0.04"
                    >
                      <line x1={idx} y1={0} x2={idx} y2={activeGridSize} />
                      <line x1={0} y1={idx} x2={activeGridSize} y2={idx} />
                    </g>
                  ))}

                {/* Obstacles (Rocks = Octagon, Logs = Striped Wood Cylinder for color-blind accessibility) */}
                {obstacles.map((obs, idx) =>
                  obs.kind === 'rock' ? (
                    <g key={`obs-${idx}`}>
                      <polygon
                        points={`${obs.x + 0.2},${obs.y + 0.1} ${obs.x + 0.8},${obs.y + 0.1} ${
                          obs.x + 0.92
                        },${obs.y + 0.5} ${obs.x + 0.8},${obs.y + 0.9} ${obs.x + 0.2},${
                          obs.y + 0.9
                        } ${obs.x + 0.08},${obs.y + 0.5}`}
                        fill="#64748b"
                        stroke="#cbd5e1"
                        strokeWidth="0.06"
                      />
                    </g>
                  ) : (
                    <g key={`obs-${idx}`}>
                      <rect
                        x={obs.x + 0.08}
                        y={obs.y + 0.2}
                        width={0.84}
                        height={0.6}
                        rx={0.18}
                        fill="#78350f"
                        stroke="#f59e0b"
                        strokeWidth="0.05"
                      />
                      <line
                        x1={obs.x + 0.22}
                        y1={obs.y + 0.5}
                        x2={obs.x + 0.78}
                        y2={obs.y + 0.5}
                        stroke="#fde68a"
                        strokeWidth="0.05"
                      />
                    </g>
                  )
                )}

                {/* Eating Burst Ring Effect */}
                {eatEffectCell && !settings.reducedMotion && (
                  <circle
                    cx={eatEffectCell.x + 0.5}
                    cy={eatEffectCell.y + 0.5}
                    r={0.65}
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="0.09"
                  />
                )}

                {/* Mouse Collectible (Distinct silhouette with round ears, whiskers, and tail) */}
                <g aria-label="Mouse target">
                  {/* Tail */}
                  <path
                    d={`M ${mouse.x + 0.15} ${mouse.y + 0.75} Q ${mouse.x - 0.05} ${
                      mouse.y + 0.9
                    }, ${mouse.x + 0.08} ${mouse.y + 0.95}`}
                    fill="none"
                    stroke="#f472b6"
                    strokeWidth="0.07"
                    strokeLinecap="round"
                  />
                  {/* Ears */}
                  <circle cx={mouse.x + 0.3} cy={mouse.y + 0.26} r={0.16} fill="#cbd5e1" />
                  <circle cx={mouse.x + 0.7} cy={mouse.y + 0.26} r={0.16} fill="#cbd5e1" />
                  <circle cx={mouse.x + 0.3} cy={mouse.y + 0.26} r={0.09} fill="#f472b6" />
                  <circle cx={mouse.x + 0.7} cy={mouse.y + 0.26} r={0.09} fill="#f472b6" />
                  {/* Body */}
                  <ellipse
                    cx={mouse.x + 0.5}
                    cy={mouse.y + 0.56}
                    rx={0.34}
                    ry={0.28}
                    fill="#e2e8f0"
                    stroke="#475569"
                    strokeWidth="0.05"
                  />
                  {/* Eyes & pink nose */}
                  <circle cx={mouse.x + 0.4} cy={mouse.y + 0.48} r={0.05} fill="#0f172a" />
                  <circle cx={mouse.x + 0.6} cy={mouse.y + 0.48} r={0.05} fill="#0f172a" />
                  <circle cx={mouse.x + 0.5} cy={mouse.y + 0.62} r={0.06} fill="#ec4899" />
                </g>

                {/* Bonus Golden Egg with Shrinking Timer Ring (Every 5 Mice for 6s = 50 pts) */}
                {bonusEgg && (
                  <g aria-label="Bonus golden egg">
                    <circle
                      cx={bonusEgg.x + 0.5}
                      cy={bonusEgg.y + 0.5}
                      r={0.46}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="0.08"
                      strokeDasharray={`${bonusEggRemainingRatio * 2.89} 2.89`}
                      transform={`rotate(-90 ${bonusEgg.x + 0.5} ${bonusEgg.y + 0.5})`}
                    />
                    <ellipse
                      cx={bonusEgg.x + 0.5}
                      cy={bonusEgg.y + 0.52}
                      rx={0.26}
                      ry={0.34}
                      fill="#facc15"
                      stroke="#ffffff"
                      strokeWidth="0.05"
                    />
                  </g>
                )}

                {/* Snake Body Segments & Species Markings */}
                {snake
                  .slice(1)
                  .reverse()
                  .map((seg, revIdx) => {
                    const idx = snake.length - 1 - revIdx;
                    const isTail = idx === snake.length - 1;
                    const radius = isTail ? 0.34 : 0.43;

                    return (
                      <g key={`seg-${idx}`}>
                        <circle
                          cx={seg.x + 0.5}
                          cy={seg.y + 0.5}
                          r={radius}
                          fill={currentSkin.bodyPrimary}
                        />
                        {/* Species-specific dorsal pattern on segments */}
                        {idx % 2 === 0 && (
                          <circle
                            cx={seg.x + 0.5}
                            cy={seg.y + 0.5}
                            r={radius * 0.52}
                            fill={currentSkin.bodySecondary}
                          />
                        )}
                      </g>
                    );
                  })}

                {/* Snake Head with Directional Orientation & Forked Tongue */}
                {snake[0] && (
                  <g
                    transform={`translate(${snake[0].x + 0.5}, ${snake[0].y + 0.5}) rotate(${
                      direction === 'RIGHT'
                        ? 0
                        : direction === 'DOWN'
                        ? 90
                        : direction === 'LEFT'
                        ? 180
                        : -90
                    })`}
                  >
                    {/* King Cobra Hood Flare */}
                    {currentSkin.patternType === 'hood' && (
                      <ellipse
                        cx={-0.08}
                        cy={0}
                        rx={0.32}
                        ry={0.52}
                        fill={currentSkin.bodyPrimary}
                        stroke={currentSkin.bodySecondary}
                        strokeWidth="0.05"
                      />
                    )}
                    {/* Forked Tongue */}
                    <path
                      d="M 0.38 0 L 0.62 0 M 0.54 0 L 0.66 -0.1 M 0.54 0 L 0.66 0.1"
                      stroke="#ef4444"
                      strokeWidth="0.06"
                      strokeLinecap="round"
                    />
                    {/* Head Oval */}
                    <ellipse
                      cx={0}
                      cy={0}
                      rx={0.46}
                      ry={0.4}
                      fill={currentSkin.headColor}
                      stroke="#ffffff"
                      strokeWidth="0.04"
                    />
                    {/* Eyes */}
                    <circle cx={0.14} cy={-0.18} r={0.09} fill={currentSkin.eyeColor} />
                    <circle cx={0.14} cy={0.18} r={0.09} fill={currentSkin.eyeColor} />
                    <circle cx={0.16} cy={-0.18} r={0.045} fill="#0f172a" />
                    <circle cx={0.16} cy={0.18} r={0.045} fill="#0f172a" />
                  </g>
                )}
              </svg>

              {/* Pause Overlay on Board */}
              {isPaused && screen === 'playing' && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center gap-3 p-4">
                  <p className="text-lg font-extrabold text-white">Game Paused</p>
                  <button
                    type="button"
                    onClick={() => setIsPaused(false)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>Resume Hunt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreen('menu')}
                    className="text-xs text-slate-300 hover:text-white underline cursor-pointer"
                  >
                    Quit to Menu
                  </button>
                </div>
              )}
            </div>

            {/* OPTIONAL ON-SCREEN D-PAD (Toggleable in Settings) */}
            {settings.showDpad && (
              <div
                className="grid grid-cols-3 gap-1.5 w-36 pt-1"
                role="group"
                aria-label="Directional D-pad controls"
              >
                <div />
                <button
                  type="button"
                  onClick={() => handleDirectionInput('UP')}
                  aria-label="Move Up"
                  className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-white flex items-center justify-center border border-slate-700 shadow cursor-pointer"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <div />
                <button
                  type="button"
                  onClick={() => handleDirectionInput('LEFT')}
                  aria-label="Move Left"
                  className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-white flex items-center justify-center border border-slate-700 shadow cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectionInput('DOWN')}
                  aria-label="Move Down"
                  className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-white flex items-center justify-center border border-slate-700 shadow cursor-pointer"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectionInput('RIGHT')}
                  aria-label="Move Right"
                  className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-white flex items-center justify-center border border-slate-700 shadow cursor-pointer"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
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

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl border bg-slate-950/60 border-slate-800">
                <p className="text-slate-400">Total Mice Eaten</p>
                <p className="text-lg font-mono font-extrabold text-emerald-400">
                  {records.totalMiceEaten}
                </p>
              </div>
              <div className="p-3 rounded-2xl border bg-slate-950/60 border-slate-800">
                <p className="text-slate-400">Total Games</p>
                <p className="text-lg font-mono font-extrabold text-sky-400">
                  {records.totalGamesPlayed}
                </p>
              </div>
              <div className="p-3 rounded-2xl border bg-slate-950/60 border-slate-800">
                <p className="text-slate-400">Today&apos;s Daily Best</p>
                <p className="text-lg font-mono font-extrabold text-amber-400">
                  {records.dailyBestByDate[todayDate]
                    ? `${records.dailyBestByDate[todayDate].score} pts`
                    : '—'}
                </p>
              </div>
            </div>

            {/* Best Score & Longest Length Per Mode & Size */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              <h3 className="text-xs font-bold uppercase text-slate-400">
                Best Score &amp; Length by Mode &amp; Grid Size
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                {(['classic', 'wrap', 'jungle'] as const).map((m) =>
                  ([15, 20, 25] as const).map((sz) => {
                    const r = records.byModeAndSize[getModeSizeKey(m, sz)];
                    return (
                      <div
                        key={`${m}-${sz}`}
                        className="p-2 rounded-xl border bg-slate-950/50 border-slate-800 flex items-center justify-between"
                      >
                        <span className="capitalize">
                          {m} ({sz}×{sz})
                        </span>
                        <span className="text-emerald-400 font-bold">
                          {r ? `${r.bestScore} pts · len ${r.longestLength}` : '0 pts'}
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
                      const reset = resetSnakeRecords();
                      setRecords(reset);
                      setSelectedSkin('ball-python');
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

      {/* Bottom Ad Slot (Strictly Outside Game Board Area) */}
      <div id="ad-slot-bottom" className="w-full h-0 overflow-hidden" aria-label="Bottom sponsor slot" />

      {/* FOOTER WITH COLLAPSIBLE HOW TO PLAY & 5 FAQ ITEMS */}
      <footer className="w-full max-w-2xl mx-auto px-3 pb-3 pt-1 text-[11px] text-slate-400">
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
              <h2 className="font-bold text-white text-sm">How to Play Snake Game</h2>
              <p>
                Guide your python across the grid using Arrow keys, WASD, touch swipes, or the
                on-screen D-pad. Each mouse you eat grows your snake by 1 cell and awards 10
                points multiplied by your current speed tier (x1 to x3). Every 5 mice, a golden
                bonus egg spawns for 6 seconds worth 50 bonus points! Avoid hitting walls (in
                Classic mode), jungle rocks/logs, or your own tail.
              </p>
            </section>
            <section className="space-y-2">
              <h3 className="font-bold text-white">Frequently Asked Questions</h3>
              <p>
                <strong>1. What are the 4 modes in Snake Game?</strong> Classic (deadly walls),
                Wrap-Around (pass through borders to the opposite side), Jungle (rocks and logs
                that increase with level), and Daily Challenge (seeded from today&apos;s date{' '}
                {todayDate}).
              </p>
              <p>
                <strong>2. How do I unlock the 6 snake species skins?</strong> Skins unlock
                automatically as your cumulative mice eaten increases: Ball Python (0), Green
                Tree Python (50), Corn Snake (150), King Cobra (300), Garter Snake (600), and
                Emerald Boa (1,000).
              </p>
              <p>
                <strong>3. Can Jungle obstacles trap my snake?</strong> No. Every obstacle layout
                is verified with a Breadth-First Search flood-fill algorithm so food is always
                reachable and no dead-end pockets are created.
              </p>
              <p>
                <strong>4. Why does the game feel equally smooth on mobile and desktop?</strong>{' '}
                The engine uses a fixed-timestep <code>requestAnimationFrame</code> loop and
                buffers up to 2 rapid direction turns so fast double-taps never get dropped.
              </p>
              <p>
                <strong>5. Where are my high scores saved?</strong> All high scores, longest
                snake records, and skin unlocks are saved locally in your browser on this device.
              </p>
            </section>
          </article>
        )}
      </footer>

      {/* GAME OVER MODAL WITH SHAREABLE SCORE CARD */}
      {screen === 'gameover' && (
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
              <SnakeSkinPreviewSvg skinId={selectedSkin} size={64} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">Game Over</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {deathReason === 'self'
                  ? 'Ran into your own body!'
                  : deathReason === 'obstacle'
                  ? 'Hit a jungle obstacle!'
                  : 'Hit the perimeter wall!'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-xs">
              <div>
                <p className="text-slate-400">Score</p>
                <p className="font-mono font-bold text-emerald-400 text-base">{score}</p>
              </div>
              <div>
                <p className="text-slate-400">Length</p>
                <p className="font-mono font-bold text-amber-400 text-base">{snake.length}</p>
              </div>
              <div>
                <p className="text-slate-400">Level</p>
                <p className="font-mono font-bold text-sky-400 text-base">{level}</p>
              </div>
            </div>

            {newlyUnlockedSkins.length > 0 && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-300 font-bold">
                🎉 Unlocked new skin:{' '}
                {newlyUnlockedSkins.map((id) => SNAKE_SKINS[id].speciesName).join(', ')}!
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Result</span>
              </button>
              <button
                type="button"
                onClick={() => startNewRun()}
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
      <SnakeShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        score={score}
        length={snake.length}
        level={level}
        mode={mode}
        boardSize={activeGridSize}
        skinId={selectedSkin}
        personalBest={modeSizeRecord.bestScore}
        dateStr={todayDate}
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
              <h2 className="text-base font-bold">Snake Game Settings</h2>
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
              <span>Move Step Tick Sound</span>
              <button
                type="button"
                onClick={() => updateSetting('moveTickSound', !settings.moveTickSound)}
                className={`px-3 py-1 rounded-lg font-bold ${
                  settings.moveTickSound
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {settings.moveTickSound ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span>On-Screen D-Pad</span>
              <button
                type="button"
                onClick={() => updateSetting('showDpad', !settings.showDpad)}
                className={`px-3 py-1 rounded-lg font-bold ${
                  settings.showDpad
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {settings.showDpad ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span>Show Grid Lines</span>
              <button
                type="button"
                onClick={() => updateSetting('showGridLines', !settings.showGridLines)}
                className={`px-3 py-1 rounded-lg font-bold ${
                  settings.showGridLines
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {settings.showGridLines ? 'ON' : 'OFF'}
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
                  Verified {selfTestStatus.testedCount} reachable obstacle &amp; spawn layouts
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
              <h2 className="text-base font-bold">How to Play Snake Game</h2>
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
                <strong>Controls:</strong> Steer with Arrow Keys, WASD, touch swipes on the
                board, or the optional on-screen D-pad.
              </li>
              <li>
                <strong>Mice &amp; Speed Multiplier:</strong> Each mouse adds +1 length and{' '}
                <code>10 × Multiplier</code> points (x1 to x3 as speed increases every 5 mice).
              </li>
              <li>
                <strong>Bonus Golden Egg:</strong> Spawns every 5 mice for 6 seconds with a
                shrinking ring — eat it before time expires for +50 points!
              </li>
              <li>
                <strong>Unlock Skins:</strong> Eat mice across any mode to unlock 6 real snake
                species skins.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
