import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';

export interface GameProps {
  onFinish: (score: number, formatted: string) => void;
}

// 1. Reaction Time Test (Red to Green)
export function ReactionTimeGame({ onFinish }: GameProps) {
  const [state, setState] = useState<'idle' | 'waiting' | 'ready' | 'result' | 'early'>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const startTest = () => {
    setState('waiting');
    sound.playTap();
    const delay = Math.floor(Math.random() * 2500) + 1500; // 1.5s - 4s
    timerRef.current = window.setTimeout(() => {
      setState('ready');
      startTimeRef.current = performance.now();
      sound.playBeep(880, 0.05);
    }, delay);
  };

  const handleClick = () => {
    if (state === 'idle') {
      startTest();
    } else if (state === 'waiting') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setState('early');
      sound.playFail();
    } else if (state === 'ready') {
      const delta = Math.round(performance.now() - startTimeRef.current);
      setReactionTime(delta);
      setState('result');
      sound.playSuccess();
      onFinish(delta, `${delta} ms`);
    } else if (state === 'result' || state === 'early') {
      startTest();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.code === 'Space') handleClick();
      }}
      className={`w-full h-80 rounded-xl flex flex-col items-center justify-center cursor-pointer select-none transition-colors p-6 text-center ${
        state === 'idle'
          ? 'bg-neutral-800 hover:bg-neutral-750 text-white'
          : state === 'waiting'
          ? 'bg-rose-950 text-rose-200 border-2 border-rose-600'
          : state === 'ready'
          ? 'bg-emerald-600 text-white font-bold animate-pulse'
          : state === 'early'
          ? 'bg-amber-900 text-amber-200 border-2 border-amber-600'
          : 'bg-neutral-800 text-white border-2 border-emerald-500'
      }`}
    >
      {state === 'idle' && (
        <div className="space-y-2">
          <p className="text-xl font-bold">Click or Tap to Start</p>
          <p className="text-sm text-neutral-400">Wait for the screen to turn bright green, then click instantly!</p>
        </div>
      )}
      {state === 'waiting' && (
        <div className="space-y-2">
          <p className="text-2xl font-bold uppercase tracking-wider">Wait for Green...</p>
          <p className="text-xs opacity-75">Do not click yet or you will get a false start!</p>
        </div>
      )}
      {state === 'ready' && (
        <div className="space-y-2">
          <p className="text-4xl font-extrabold uppercase tracking-widest">TAP NOW!</p>
        </div>
      )}
      {state === 'early' && (
        <div className="space-y-2">
          <p className="text-2xl font-bold text-amber-300">Too Early!</p>
          <p className="text-sm">You clicked before it turned green. Click anywhere to retry.</p>
        </div>
      )}
      {state === 'result' && (
        <div className="space-y-3">
          <p className="text-5xl font-mono font-bold text-emerald-400">{reactionTime} ms</p>
          <p className="text-sm text-neutral-300">
            {reactionTime! < 200
              ? '⚡ Superhuman reflexes!'
              : reactionTime! < 250
              ? '🎯 Excellent reaction time!'
              : reactionTime! < 320
              ? '👍 Average human benchmark (250-300ms).'
              : '🐢 Slightly delayed. Try again!'}
          </p>
          <p className="text-xs text-neutral-400">Click anywhere to test again</p>
        </div>
      )}
    </div>
  );
}

// 2. Speed Flash Reflex (Go / No-Go)
export function SpeedFlashGame({ onFinish }: GameProps) {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [activeSignal, setActiveSignal] = useState<'white' | 'red' | null>(null);
  const [statusText, setStatusText] = useState('Tap Start to begin. Tap when WHITE, do NOT tap when RED!');
  const [isPlaying, setIsPlaying] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const signalStartRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const roundRef = useRef<number>(0);
  const lastPrematureTapRef = useRef<number>(0);

  const scheduleNextStimulus = () => {
    if (roundRef.current >= 10) {
      setIsPlaying(false);
      setActiveSignal(null);
      sound.playSuccess();
      const finalScore = scoreRef.current;
      setStatusText(`Test complete! Final Score: ${finalScore} pts`);
      onFinish(finalScore, `${finalScore} pts`);
      return;
    }

    setActiveSignal(null);
    const delay = Math.floor(Math.random() * 1200) + 800; // 0.8s - 2.0s
    timeoutRef.current = window.setTimeout(() => {
      const isTarget = Math.random() > 0.35; // 65% target white, 35% decoy red
      const type = isTarget ? 'white' : 'red';
      setActiveSignal(type);
      signalStartRef.current = performance.now();
      sound.playBeep(type === 'white' ? 660 : 330, 0.05);

      // Stimulus window: 950ms to react or hold fire
      timeoutRef.current = window.setTimeout(() => {
        if (type === 'white') {
          // Missed white target
          sound.playFail();
          const newScore = Math.max(0, scoreRef.current - 50);
          scoreRef.current = newScore;
          setScore(newScore);
          setStatusText('Missed target! (-50 pts)');
        } else {
          // Successfully avoided red decoy!
          sound.playSuccess();
          const newScore = scoreRef.current + 50;
          scoreRef.current = newScore;
          setScore(newScore);
          setStatusText('Good discipline! Held fire on RED (+50 pts)');
        }

        const nextRound = roundRef.current + 1;
        roundRef.current = nextRound;
        setRound(nextRound);
        setActiveSignal(null);
        scheduleNextStimulus();
      }, 950);
    }, delay);
  };

  const handleStart = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    scoreRef.current = 0;
    roundRef.current = 0;
    setScore(0);
    setRound(0);
    setIsPlaying(true);
    setStatusText('Eyes on the beacon! Tap WHITE, hold fire on RED.');
    scheduleNextStimulus();
  };

  const handleTap = () => {
    if (!isPlaying) return;

    if (activeSignal === 'white') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const latency = Math.round(performance.now() - signalStartRef.current);
      const points = Math.max(50, 400 - latency);
      sound.playSuccess();
      const nextScore = scoreRef.current + points;
      scoreRef.current = nextScore;
      setScore(nextScore);
      setStatusText(`+${points} pts (${latency}ms)`);
      setActiveSignal(null);
      const nextRound = roundRef.current + 1;
      roundRef.current = nextRound;
      setRound(nextRound);
      scheduleNextStimulus();
    } else if (activeSignal === 'red') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      sound.playFail();
      const nextScore = Math.max(0, scoreRef.current - 150);
      scoreRef.current = nextScore;
      setScore(nextScore);
      setStatusText('False Alarm! Tapped on RED decoy (-150 pts)');
      setActiveSignal(null);
      const nextRound = roundRef.current + 1;
      roundRef.current = nextRound;
      setRound(nextRound);
      scheduleNextStimulus();
    } else {
      // activeSignal === null ('Watch...' state)
      // DO NOT cancel timeoutRef.current so the scheduled beacon still appears!
      const now = performance.now();
      if (now - lastPrematureTapRef.current > 350) {
        lastPrematureTapRef.current = now;
        sound.playFail();
        const nextScore = Math.max(0, scoreRef.current - 50);
        scoreRef.current = nextScore;
        setScore(nextScore);
        setStatusText('Premature tap! Wait for the beacon! (-50 pts)');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Round: {round}/10</span>
        <span className="text-emerald-400 font-bold">Score: {score} pts</span>
      </div>

      <div
        onClick={isPlaying ? handleTap : undefined}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            if (!isPlaying) {
              handleStart();
            } else {
              handleTap();
            }
          }
        }}
        className={`w-full h-64 rounded-xl flex flex-col items-center justify-center cursor-pointer border-2 transition-all ${
          activeSignal === 'white'
            ? 'bg-white border-amber-300 shadow-lg shadow-white/30'
            : activeSignal === 'red'
            ? 'bg-rose-600 border-rose-400 shadow-lg shadow-rose-600/30'
            : 'bg-neutral-900 border-neutral-800'
        }`}
      >
        {!isPlaying ? (
          <button
            onClick={handleStart}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-md transition-transform active:scale-95"
          >
            {round > 0 ? 'Play Again' : 'Start Speed Flash'}
          </button>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span
              className={`text-2xl font-extrabold uppercase tracking-wider ${
                activeSignal === 'white'
                  ? 'text-black'
                  : activeSignal === 'red'
                  ? 'text-white'
                  : 'text-neutral-400 animate-pulse'
              }`}
            >
              {activeSignal === 'white' ? 'HIT ME!' : activeSignal === 'red' ? 'HOLD FIRE!' : 'Watch...'}
            </span>
            {activeSignal === null && (
              <span className="text-xs text-neutral-500 font-medium">
                Wait for WHITE • Avoid RED
              </span>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-400 text-center">{statusText}</p>
    </div>
  );
}

// 3. Hex Whack Reflex
export function HexWhackGame({ onFinish }: GameProps) {
  const [activeHex, setActiveHex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);
  const hexTimeoutRef = useRef<number | null>(null);

  const hexes = Array.from({ length: 9 }, (_, i) => i);

  const spawnNext = () => {
    const next = Math.floor(Math.random() * 9);
    setActiveHex(next);
    sound.playBeep(700, 0.04);

    if (hexTimeoutRef.current) clearTimeout(hexTimeoutRef.current);
    hexTimeoutRef.current = window.setTimeout(() => {
      spawnNext();
    }, 750);
  };

  const handleStart = () => {
    setScore(0);
    setTimeLeft(25);
    setIsPlaying(true);
    spawnNext();

    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          if (hexTimeoutRef.current) clearTimeout(hexTimeoutRef.current);
          setIsPlaying(false);
          setActiveHex(null);
          sound.playSuccess();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleHexClick = (index: number) => {
    if (!isPlaying) return;
    if (index === activeHex) {
      sound.playTap();
      setScore((s) => {
        const next = s + 1;
        return next;
      });
      spawnNext();
    } else {
      sound.playFail();
      setScore((s) => Math.max(0, s - 1));
    }
  };

  useEffect(() => {
    if (timeLeft === 0 && !isPlaying && score > 0) {
      onFinish(score, `${score} hexes`);
    }
  }, [timeLeft, isPlaying, score, onFinish]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (hexTimeoutRef.current) clearTimeout(hexTimeoutRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Time: {timeLeft}s</span>
        <span className="text-amber-400 font-bold">Whacks: {score}</span>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
        {hexes.map((idx) => {
          const isActive = activeHex === idx;
          return (
            <button
              key={idx}
              onClick={() => handleHexClick(idx)}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-xl font-bold transition-all active:scale-95 ${
                isActive
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/40 scale-105 ring-4 ring-amber-300'
                  : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-600'
              }`}
            >
              {isActive ? '⚡' : '•'}
            </button>
          );
        })}
      </div>

      {!isPlaying && (
        <button
          onClick={handleStart}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg shadow-md transition-transform active:scale-95 text-sm"
        >
          {timeLeft === 0 ? 'Play Again' : 'Start Hex Whack'}
        </button>
      )}
    </div>
  );
}

// 4. Dodge Vector (Survival on Canvas)
export function DodgeVectorGame({ onFinish }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [survivalTime, setSurvivalTime] = useState(0);
  const animRef = useRef<number | null>(null);

  const gameState = useRef({
    player: { x: 175, y: 150, r: 9 },
    darts: [] as { x: number; y: number; vx: number; vy: number; r: number }[],
    startTime: 0,
    running: false,
  });

  const startDodge = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    gameState.current.player = { x: w / 2, y: h / 2, r: 9 };
    gameState.current.darts = [];
    gameState.current.startTime = performance.now();
    gameState.current.running = true;
    setIsPlaying(true);
    sound.playTap();

    let lastSpawn = performance.now();

    const loop = (now: number) => {
      if (!gameState.current.running) return;

      const elapsed = (now - gameState.current.startTime) / 1000;
      setSurvivalTime(Number(elapsed.toFixed(1)));

      // Spawn darts
      if (now - lastSpawn > Math.max(250, 800 - elapsed * 20)) {
        lastSpawn = now;
        const side = Math.floor(Math.random() * 4);
        let x = 0, y = 0;
        if (side === 0) { x = Math.random() * w; y = -10; }
        else if (side === 1) { x = w + 10; y = Math.random() * h; }
        else if (side === 2) { x = Math.random() * w; y = h + 10; }
        else { x = -10; y = Math.random() * h; }

        const angle = Math.atan2(gameState.current.player.y - y, gameState.current.player.x - x);
        const speed = 2 + Math.random() * 2 + elapsed * 0.1;
        gameState.current.darts.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 5,
        });
      }

      // Update darts
      for (const d of gameState.current.darts) {
        d.x += d.vx;
        d.y += d.vy;

        // Collision
        const dx = d.x - gameState.current.player.x;
        const dy = d.y - gameState.current.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < d.r + gameState.current.player.r) {
          // Game Over
          gameState.current.running = false;
          setIsPlaying(false);
          sound.playFail();
          const finalScore = Number(elapsed.toFixed(1));
          onFinish(finalScore, `${finalScore}s`);
          return;
        }
      }

      // Draw
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);

        // Player
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(gameState.current.player.x, gameState.current.player.y, gameState.current.player.r, 0, Math.PI * 2);
        ctx.fill();

        // Darts
        ctx.fillStyle = '#38bdf8';
        for (const d of gameState.current.darts) {
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!gameState.current.running) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = e.currentTarget.width / rect.width;
    const scaleY = e.currentTarget.height / rect.height;
    gameState.current.player.x = (e.clientX - rect.left) * scaleX;
    gameState.current.player.y = (e.clientY - rect.top) * scaleY;
  };

  useEffect(() => {
    return () => {
      gameState.current.running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Dodge Vector</span>
        <span className="text-cyan-400 font-bold">{survivalTime}s</span>
      </div>

      <div className="relative border border-neutral-700 rounded-xl overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          width={360}
          height={280}
          onPointerMove={handlePointerMove}
          className="bg-slate-900 cursor-crosshair block w-full max-w-[360px] h-[280px]"
        />
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-4 text-center">
            <p className="text-sm text-neutral-300 mb-3">Drag to pilot the golden spark. Dodge incoming cyan darts!</p>
            <button
              onClick={startDodge}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg shadow-md transition-transform active:scale-95 text-sm"
            >
              Start Dodge Vector
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 5. Sound Reflex Cue (Blind Audio)
export function SoundReflexGame({ onFinish }: GameProps) {
  const [status, setStatus] = useState<'idle' | 'waiting' | 'ready' | 'result'>('idle');
  const [latency, setLatency] = useState<number | null>(null);
  const startTimeRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const startTest = () => {
    setStatus('waiting');
    sound.playTap();
    const delay = Math.floor(Math.random() * 2500) + 1200;
    timerRef.current = window.setTimeout(() => {
      setStatus('ready');
      startTimeRef.current = performance.now();
      sound.playBeep(920, 0.12);
    }, delay);
  };

  const handleTap = () => {
    if (status === 'idle') {
      startTest();
    } else if (status === 'waiting') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setStatus('idle');
      sound.playFail();
    } else if (status === 'ready') {
      const delta = Math.round(performance.now() - startTimeRef.current);
      setLatency(delta);
      setStatus('result');
      sound.playSuccess();
      onFinish(delta, `${delta} ms`);
    } else if (status === 'result') {
      startTest();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      onClick={handleTap}
      role="button"
      tabIndex={0}
      className={`w-full h-72 rounded-xl flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer border-2 transition-colors ${
        status === 'waiting'
          ? 'bg-neutral-900 border-indigo-700 text-indigo-300'
          : status === 'ready'
          ? 'bg-indigo-600 border-indigo-400 text-white font-extrabold animate-pulse'
          : 'bg-neutral-850 border-neutral-750 text-white'
      }`}
    >
      {status === 'idle' && (
        <div className="space-y-2">
          <p className="text-xl font-bold">Sound Reflex Cue</p>
          <p className="text-sm text-neutral-400">Click to listen. Tap immediately when you hear the high chime!</p>
        </div>
      )}
      {status === 'waiting' && (
        <div className="space-y-2">
          <p className="text-2xl font-bold">Listening...</p>
          <p className="text-xs text-neutral-400">Close your eyes for maximum acoustic reflex.</p>
        </div>
      )}
      {status === 'ready' && (
        <div className="space-y-2">
          <p className="text-4xl font-extrabold">CHIME! TAP NOW!</p>
        </div>
      )}
      {status === 'result' && (
        <div className="space-y-2">
          <p className="text-5xl font-mono font-bold text-indigo-300">{latency} ms</p>
          <p className="text-sm text-neutral-300">Auditory Reaction Time</p>
          <p className="text-xs text-neutral-400">Click to test again</p>
        </div>
      )}
    </div>
  );
}

// 6. Chroma Snap (Color Switch)
export function ChromaSnapGame({ onFinish }: GameProps) {
  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
  const colorNames = ['Red', 'Blue', 'Green', 'Yellow', 'Purple'];

  const [targetIdx, setTargetIdx] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(1);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [round, setRound] = useState(0);
  const timerRef = useRef<number | null>(null);

  const nextCycle = (r: number, s: number) => {
    if (r >= 12) {
      setIsPlaying(false);
      sound.playSuccess();
      onFinish(s, `${s} pts`);
      return;
    }
    const nextColor = Math.floor(Math.random() * colors.length);
    setCurrentIdx(nextColor);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setRound((prev) => prev + 1);
      nextCycle(r + 1, s);
    }, 1100);
  };

  const handleStart = () => {
    const t = Math.floor(Math.random() * colors.length);
    setTargetIdx(t);
    setScore(0);
    setRound(0);
    setIsPlaying(true);
    sound.playTap();
    nextCycle(0, 0);
  };

  const handleSnap = () => {
    if (!isPlaying) return;
    if (currentIdx === targetIdx) {
      sound.playSuccess();
      const nextScore = score + 100;
      setScore(nextScore);
      setRound((r) => r + 1);
      nextCycle(round + 1, nextScore);
    } else {
      sound.playFail();
      setScore((s) => Math.max(0, s - 50));
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Round: {round}/12</span>
        <span className="text-emerald-400 font-bold">Score: {score} pts</span>
      </div>

      <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-center w-full">
        <span className="text-xs text-neutral-400 uppercase tracking-wider block mb-1">Target Color</span>
        <span className="text-lg font-bold" style={{ color: colors[targetIdx] }}>
          {colorNames[targetIdx]}
        </span>
      </div>

      <div
        onClick={handleSnap}
        className="w-full h-52 rounded-xl flex items-center justify-center cursor-pointer border-2 transition-all active:scale-98"
        style={{
          backgroundColor: isPlaying ? colors[currentIdx] : '#1e293b',
          borderColor: isPlaying ? colors[currentIdx] : '#334155',
        }}
      >
        {!isPlaying ? (
          <button
            onClick={handleStart}
            className="px-6 py-2.5 bg-white text-black font-bold rounded-lg shadow-md transition-transform active:scale-95 text-sm"
          >
            Start Chroma Snap
          </button>
        ) : (
          <span className="text-white font-extrabold text-2xl drop-shadow-md">
            {currentIdx === targetIdx ? 'SNAP!' : '...'}
          </span>
        )}
      </div>

      <p className="text-xs text-neutral-400 text-center">Tap the box ONLY when the color matches the target color!</p>
    </div>
  );
}

// 7. Stoplight Precision
export function StoplightPrecisionGame({ onFinish }: GameProps) {
  const [needle, setNeedle] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const animRef = useRef<number | null>(null);
  const speedRef = useRef(1.2);

  const startGauge = () => {
    setIsPlaying(true);
    setNeedle(0);
    speedRef.current = 1.2 + round * 0.2;
    sound.playTap();

    let val = 0;
    const tick = () => {
      val += speedRef.current;
      if (val >= 100) {
        // Overrun penalty
        setNeedle(100);
        setIsPlaying(false);
        sound.playFail();
        setRound((r) => r + 1);
        if (round >= 4) {
          onFinish(score, `${score} pts`);
        }
        return;
      }
      setNeedle(val);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  };

  const handleBrake = () => {
    if (!isPlaying) return;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsPlaying(false);

    const val = Math.round(needle);
    let pts = 0;
    if (val >= 95 && val <= 99) {
      pts = 200;
      sound.playSuccess();
    } else if (val >= 90) {
      pts = 100;
      sound.playSuccess();
    } else if (val >= 80) {
      pts = 50;
      sound.playTap();
    } else {
      pts = 10;
      sound.playTap();
    }

    const nextScore = score + pts;
    setScore(nextScore);
    const nextRound = round + 1;
    setRound(nextRound);

    if (nextRound >= 5) {
      sound.playSuccess();
      onFinish(nextScore, `${nextScore} pts`);
    }
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Trial: {round}/5</span>
        <span className="text-amber-400 font-bold">Score: {score} pts</span>
      </div>

      <div className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-4">
        <div className="w-full h-8 bg-neutral-800 rounded-full overflow-hidden relative border border-neutral-700">
          <div
            className="h-full transition-none rounded-full"
            style={{
              width: `${needle}%`,
              backgroundColor: needle > 95 ? '#ef4444' : needle > 85 ? '#f59e0b' : '#10b981',
            }}
          />
          <div className="absolute top-0 bottom-0 right-[5%] w-1 bg-red-500 opacity-75" />
        </div>

        <p className="text-3xl font-mono font-bold text-white">{Math.round(needle)}%</p>

        {!isPlaying ? (
          <button
            onClick={startGauge}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-md transition-transform active:scale-95 text-sm"
          >
            {round >= 5 ? 'Play Again' : 'Charge Meter'}
          </button>
        ) : (
          <button
            onClick={handleBrake}
            className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl shadow-lg shadow-rose-600/30 transition-transform active:scale-95 text-lg uppercase tracking-wider"
          >
            BRAKE NOW!
          </button>
        )}
      </div>

      <p className="text-xs text-neutral-400 text-center">Stop the needle as close to 100% as possible without crossing it!</p>
    </div>
  );
}

// 8. Trigger Tap Sprint (Popup Firing)
export function TriggerTapGame({ onFinish }: GameProps) {
  const [targetPos, setTargetPos] = useState<{ x: number; y: number } | null>(null);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  const spawnTarget = (currentScore: number, currentMisses: number) => {
    if (currentMisses >= 3) {
      setIsPlaying(false);
      sound.playGameOver();
      onFinish(currentScore, `${currentScore} targets`);
      return;
    }

    const x = Math.floor(Math.random() * 70) + 15;
    const y = Math.floor(Math.random() * 65) + 15;
    setTargetPos({ x, y });
    sound.playBeep(600, 0.03);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      // Missed
      sound.playFail();
      setMisses((m) => {
        const nextM = m + 1;
        spawnTarget(currentScore, nextM);
        return nextM;
      });
    }, 650);
  };

  const handleStart = () => {
    setScore(0);
    setMisses(0);
    setIsPlaying(true);
    sound.playTap();
    spawnTarget(0, 0);
  };

  const handleHit = () => {
    if (!isPlaying) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    sound.playSuccess();
    const nextScore = score + 1;
    setScore(nextScore);
    spawnTarget(nextScore, misses);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Misses: {'❌'.repeat(misses)}</span>
        <span className="text-emerald-400 font-bold">Hits: {score}</span>
      </div>

      <div className="relative w-full h-72 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {isPlaying && targetPos && (
          <button
            onClick={handleHit}
            style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-rose-500 hover:bg-rose-400 border-2 border-white shadow-lg shadow-rose-500/50 flex items-center justify-center text-white font-bold active:scale-90 transition-transform"
          >
            🎯
          </button>
        )}

        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <button
              onClick={handleStart}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-md transition-transform active:scale-95 text-sm"
            >
              Start Trigger Tap
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-400 text-center">Tap popup targets before they vanish. 3 misses and game over!</p>
    </div>
  );
}
