import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';
import { GameProps } from './ReflexGames';

// 9. Precision Sniper
export function PrecisionSniperGame({ onFinish }: GameProps) {
  const [target, setTarget] = useState<{ x: number; y: number; r: number } | null>(null);
  const [score, setScore] = useState(0);
  const [targetsLeft, setTargetsLeft] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);

  const spawnTarget = (currentLeft: number, currentScore: number) => {
    if (currentLeft <= 0) {
      setIsPlaying(false);
      sound.playSuccess();
      onFinish(currentScore, `${currentScore} pts`);
      return;
    }

    const x = Math.floor(Math.random() * 70) + 15;
    const y = Math.floor(Math.random() * 65) + 15;
    startTimeRef.current = performance.now();
    setTarget({ x, y, r: 40 });

    const shrink = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const newR = Math.max(0, 40 - elapsed * 0.035);
      if (newR <= 0) {
        // Missed target
        sound.playFail();
        setTargetsLeft((tl) => tl - 1);
        spawnTarget(currentLeft - 1, currentScore);
        return;
      }
      setTarget({ x, y, r: newR });
      animRef.current = requestAnimationFrame(shrink);
    };
    animRef.current = requestAnimationFrame(shrink);
  };

  const handleStart = () => {
    setScore(0);
    setTargetsLeft(10);
    setIsPlaying(true);
    sound.playTap();
    spawnTarget(10, 0);
  };

  const handleHit = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlaying || !target) return;
    if (animRef.current) cancelAnimationFrame(animRef.current);

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const targetPxX = (target.x / 100) * rect.width;
    const targetPxY = (target.y / 100) * rect.height;

    const dist = Math.sqrt((clickX - targetPxX) ** 2 + (clickY - targetPxY) ** 2);
    const accuracy = Math.max(0, Math.round(100 - dist * 2.5));

    if (accuracy > 30) {
      sound.playSuccess();
      const nextScore = score + accuracy;
      setScore(nextScore);
      setTargetsLeft((tl) => tl - 1);
      spawnTarget(targetsLeft - 1, nextScore);
    } else {
      sound.playFail();
      setTargetsLeft((tl) => tl - 1);
      spawnTarget(targetsLeft - 1, score);
    }
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Targets Remaining: {targetsLeft}</span>
        <span className="text-amber-400 font-bold">Score: {score} pts</span>
      </div>

      <div
        onClick={handleHit}
        className="relative w-full h-72 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden cursor-crosshair"
      >
        {isPlaying && target && (
          <div
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              width: `${target.r * 2}px`,
              height: `${target.r * 2}px`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-400 bg-amber-400/20 flex items-center justify-center pointer-events-none"
          >
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          </div>
        )}

        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/60">
            <p className="text-xs text-neutral-300 mb-3">Click dead center before the circle collapses to zero!</p>
            <button
              onClick={handleStart}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg shadow-md transition-transform active:scale-95 text-sm"
            >
              Start Precision Sniper
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 10. Orbit Synchronizer
export function OrbitSyncGame({ onFinish }: GameProps) {
  const [streak, setStreak] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const angleRef = useRef(0);
  const animRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startOrbit = () => {
    setIsPlaying(true);
    setStreak(0);
    sound.playTap();

    const loop = () => {
      angleRef.current = (angleRef.current + 0.05 + streak * 0.005) % (Math.PI * 2);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          const cx = w / 2;
          const cy = h / 2;
          const r = 70;

          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, w, h);

          // Orbit Track
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();

          // Target Gate (top, angle ~ -PI/2)
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(cx, cy, r, -Math.PI / 2 - 0.25, -Math.PI / 2 + 0.25);
          ctx.stroke();

          // Satellite
          const sx = cx + Math.cos(angleRef.current) * r;
          const sy = cy + Math.sin(angleRef.current) * r;
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(sx, sy, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
  };

  const handleTap = () => {
    if (!isPlaying) return;
    const targetAngle = -Math.PI / 2;
    // Normalize angles
    let diff = Math.abs(angleRef.current - (targetAngle + Math.PI * 2));
    if (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2);

    if (diff < 0.28) {
      sound.playSuccess();
      const nextStreak = streak + 1;
      setStreak(nextStreak);
    } else {
      sound.playFail();
      setIsPlaying(false);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      onFinish(streak, `${streak} streak`);
    }
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Orbit Gate</span>
        <span className="text-emerald-400 font-bold">Streak: {streak}</span>
      </div>

      <div className="relative border border-neutral-800 rounded-xl overflow-hidden cursor-pointer" onClick={handleTap}>
        <canvas ref={canvasRef} width={300} height={240} className="block w-full max-w-[300px] h-[240px]" />
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-4">
            <p className="text-xs text-neutral-300 mb-3 text-center">Tap when the gold satellite enters the green gate!</p>
            <button
              onClick={startOrbit}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-md text-sm"
            >
              Start Orbit Sync
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-neutral-400">Click anywhere to align when satellite enters the gate.</p>
    </div>
  );
}

// 11. Laser Mirror Align
export function LaserMirrorGame({ onFinish }: GameProps) {
  const [mirrors, setMirrors] = useState([45, 90, 135]);
  const [solved, setSolved] = useState(false);
  const [moves, setMoves] = useState(0);

  const rotateMirror = (idx: number) => {
    if (solved) return;
    sound.playTap();
    const next = [...mirrors];
    next[idx] = (next[idx] + 45) % 180;
    setMirrors(next);
    const nextMoves = moves + 1;
    setMoves(nextMoves);

    // Winning orientation: 45, 135, 45
    if (next[0] === 45 && next[1] === 135 && next[2] === 45) {
      setSolved(true);
      sound.playSuccess();
      onFinish(nextMoves, `${nextMoves} moves`);
    }
  };

  const handleReset = () => {
    setMirrors([90, 45, 135]);
    setSolved(false);
    setMoves(0);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Laser Reflection</span>
        <span className="text-cyan-400 font-bold">Moves: {moves}</span>
      </div>

      <div className="w-full max-w-sm p-6 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col items-center gap-6">
        <div className="flex justify-around items-center w-full">
          {mirrors.map((angle, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <button
                onClick={() => rotateMirror(idx)}
                style={{ transform: `rotate(${angle}deg)` }}
                className="w-16 h-16 rounded-xl bg-neutral-800 hover:bg-neutral-750 border-2 border-cyan-400 flex items-center justify-center transition-transform shadow-md"
              >
                <div className="w-12 h-1 bg-cyan-300 rounded-full" />
              </button>
              <span className="text-xs font-mono text-neutral-400">{angle}°</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          {solved ? (
            <p className="text-emerald-400 font-bold text-sm">✨ Crystal Activated! Beam Connected!</p>
          ) : (
            <p className="text-xs text-neutral-400">Tap mirrors to rotate them so the beam reflects through the crystals.</p>
          )}
        </div>

        <button
          onClick={handleReset}
          className="text-xs px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700"
        >
          Reset Puzzle
        </button>
      </div>
    </div>
  );
}

// 12. Bullseye Drop (Gravity drop into moving basket)
export function BullseyeDropGame({ onFinish }: GameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  const stateRef = useRef({
    basketX: 150,
    basketDir: 1,
    ballY: 30,
    isDropping: false,
    round: 0,
    score: 0,
  });

  const startDropGame = () => {
    setIsPlaying(true);
    setScore(0);
    setRound(0);
    stateRef.current = {
      basketX: 150,
      basketDir: 1,
      ballY: 30,
      isDropping: false,
      round: 0,
      score: 0,
    };
    sound.playTap();

    const loop = () => {
      const s = stateRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = canvas.width;
      const h = canvas.height;

      // Basket oscillation
      s.basketX += s.basketDir * 2.8;
      if (s.basketX > w - 40) s.basketDir = -1;
      if (s.basketX < 40) s.basketDir = 1;

      // Ball drop physics
      if (s.isDropping) {
        s.ballY += 6;
        if (s.ballY >= h - 35) {
          // Check landing
          const diff = Math.abs(w / 2 - s.basketX);
          if (diff < 28) {
            sound.playSuccess();
            s.score += 100;
          } else {
            sound.playFail();
          }
          s.isDropping = false;
          s.ballY = 30;
          s.round += 1;
          setScore(s.score);
          setRound(s.round);

          if (s.round >= 5) {
            setIsPlaying(false);
            if (animRef.current) cancelAnimationFrame(animRef.current);
            onFinish(s.score, `${s.score} pts`);
            return;
          }
        }
      }

      // Draw
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);

        // Ball at top center
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(w / 2, s.ballY, 9, 0, Math.PI * 2);
        ctx.fill();

        // Moving Basket at bottom
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(s.basketX - 25, h - 30, 50, 15);
      }

      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
  };

  const handleDrop = () => {
    if (!isPlaying || stateRef.current.isDropping) return;
    sound.playTap();
    stateRef.current.isDropping = true;
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Trial: {round}/5</span>
        <span className="text-amber-400 font-bold">Score: {score} pts</span>
      </div>

      <div className="relative border border-neutral-800 rounded-xl overflow-hidden">
        <canvas ref={canvasRef} width={320} height={240} className="block w-full max-w-[320px] h-[240px]" />
        {!isPlaying ? (
          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-4">
            <button
              onClick={startDropGame}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg shadow-md text-sm"
            >
              Start Bullseye Drop
            </button>
          </div>
        ) : (
          <button
            onClick={handleDrop}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
          >
            RELEASE BALL
          </button>
        )}
      </div>
    </div>
  );
}

// 13. Micro Steady Hand (wire buzzer)
export function SteadyHandGame({ onFinish }: GameProps) {
  const [status, setStatus] = useState<'idle' | 'playing' | 'buzzed' | 'success'>('idle');
  const [startTime, setStartTime] = useState(0);

  const handleStart = () => {
    setStatus('playing');
    setStartTime(performance.now());
    sound.playTap();
  };

  const handleBuzz = () => {
    if (status !== 'playing') return;
    setStatus('buzzed');
    sound.playFail();
  };

  const handleFinish = () => {
    if (status !== 'playing') return;
    const elapsed = Number(((performance.now() - startTime) / 1000).toFixed(2));
    setStatus('success');
    sound.playSuccess();
    onFinish(elapsed, `${elapsed}s`);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Micro Steady Hand</span>
        <span className="text-emerald-400 font-bold">{status === 'success' ? 'Passed!' : status}</span>
      </div>

      <div
        onMouseLeave={handleBuzz}
        className="w-full max-w-sm h-64 bg-neutral-900 border border-neutral-800 rounded-xl relative p-4 flex flex-col justify-between"
      >
        <div className="flex justify-between items-center text-xs font-mono">
          <span
            onMouseEnter={handleStart}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded cursor-pointer font-bold"
          >
            START
          </span>
          <span
            onMouseEnter={handleFinish}
            className="px-3 py-1.5 bg-amber-500 text-black rounded cursor-pointer font-bold"
          >
            GOAL
          </span>
        </div>

        {/* Winding wire corridor */}
        <div className="w-full h-28 relative my-auto">
          {/* Wall triggers that buzz */}
          <div onMouseEnter={handleBuzz} className="absolute top-0 left-0 right-0 h-8 bg-neutral-800 rounded-t" />
          <div onMouseEnter={handleBuzz} className="absolute bottom-0 left-0 right-0 h-8 bg-neutral-800 rounded-b" />
          {/* Safe middle wire corridor */}
          <div className="absolute top-8 left-0 right-0 h-12 flex items-center justify-center">
            <div className="w-full h-1.5 bg-cyan-400/50 rounded-full" />
          </div>
        </div>

        <p className="text-xs text-neutral-400 text-center">
          Hover mouse over START, guide through the narrow channel without touching the gray walls to GOAL!
        </p>
      </div>
    </div>
  );
}

// 14. Dart Flick
export function DartFlickGame({ onFinish }: GameProps) {
  const [score, setScore] = useState(0);
  const [dartsLeft, setDartsLeft] = useState(3);
  const [lastThrow, setLastThrow] = useState<string | null>(null);

  const throwDart = (pts: number, label: string) => {
    if (dartsLeft <= 0) return;
    sound.playTap();
    const nextScore = score + pts;
    const nextLeft = dartsLeft - 1;
    setScore(nextScore);
    setDartsLeft(nextLeft);
    setLastThrow(label);

    if (nextLeft === 0) {
      sound.playSuccess();
      onFinish(nextScore, `${nextScore} pts`);
    }
  };

  const handleReset = () => {
    setScore(0);
    setDartsLeft(3);
    setLastThrow(null);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Darts Left: {dartsLeft}</span>
        <span className="text-amber-400 font-bold">Score: {score}</span>
      </div>

      <div className="w-64 h-64 rounded-full bg-neutral-900 border-4 border-amber-600 flex items-center justify-center relative shadow-xl">
        {/* Outer Ring */}
        <button
          onClick={() => throwDart(10, 'Outer 10')}
          className="w-56 h-56 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center hover:bg-emerald-900 transition-colors"
        >
          {/* Middle Ring */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              throwDart(25, 'Triple 25');
            }}
            className="w-36 h-36 rounded-full bg-rose-950 border border-rose-800 flex items-center justify-center hover:bg-rose-900 transition-colors"
          >
            {/* Bullseye */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                throwDart(50, 'BULLSEYE 50');
              }}
              className="w-14 h-14 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-xs font-bold text-black hover:bg-amber-300 shadow-md"
            >
              50
            </button>
          </button>
        </button>
      </div>

      {lastThrow && <p className="text-xs font-mono text-cyan-400">Hit: {lastThrow}</p>}

      {dartsLeft === 0 && (
        <button
          onClick={handleReset}
          className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded border border-neutral-700"
        >
          Throw Again
        </button>
      )}
    </div>
  );
}

// 15. Needle Threader
export function NeedleThreaderGame({ onFinish }: GameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  const stateRef = useRef({
    threadY: 100,
    vy: 0,
    needles: [] as { x: number; gapY: number }[],
    score: 0,
    running: false,
  });

  const startThreader = () => {
    setIsPlaying(true);
    setScore(0);
    stateRef.current = {
      threadY: 100,
      vy: 0,
      needles: [{ x: 300, gapY: 100 }, { x: 450, gapY: 120 }],
      score: 0,
      running: true,
    };
    sound.playTap();

    const loop = () => {
      const s = stateRef.current;
      if (!s.running) return;

      s.threadY += s.vy;
      s.vy *= 0.95; // damping

      for (const n of s.needles) {
        n.x -= 2.2;
        // Check passage
        if (Math.abs(n.x - 60) < 10) {
          if (Math.abs(s.threadY - n.gapY) > 25) {
            // Snagged
            s.running = false;
            setIsPlaying(false);
            sound.playFail();
            onFinish(s.score, `${s.score} needles`);
            return;
          } else {
            sound.playSuccess();
            s.score += 1;
            setScore(s.score);
          }
        }
      }

      // Recycle needles
      if (s.needles[0] && s.needles[0].x < -20) {
        s.needles.shift();
        s.needles.push({ x: 300, gapY: Math.random() * 120 + 40 });
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Needles
          ctx.fillStyle = '#64748b';
          for (const n of s.needles) {
            ctx.fillRect(n.x - 3, 0, 6, n.gapY - 20);
            ctx.fillRect(n.x - 3, n.gapY + 20, 6, canvas.height);
          }

          // Thread
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(60, s.threadY, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
  };

  const nudge = (dir: number) => {
    if (!stateRef.current.running) return;
    stateRef.current.vy += dir * 2.5;
  };

  useEffect(() => {
    return () => {
      stateRef.current.running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Needle Threader</span>
        <span className="text-rose-400 font-bold">Threaded: {score}</span>
      </div>

      <div className="relative border border-neutral-800 rounded-xl overflow-hidden">
        <canvas ref={canvasRef} width={320} height={200} className="block w-full max-w-[320px] h-[200px]" />
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-4">
            <button
              onClick={startThreader}
              className="px-6 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-lg shadow-md text-sm"
            >
              Start Threading
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => nudge(-1)}
          className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded font-bold text-sm"
        >
          ▲ UP
        </button>
        <button
          onClick={() => nudge(1)}
          className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded font-bold text-sm"
        >
          ▼ DOWN
        </button>
      </div>
    </div>
  );
}

// 16. Gravity Slingshot
export function GravitySlingGame({ onFinish }: GameProps) {
  const [launches, setLaunches] = useState(0);
  const [success, setSuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const launch = (power: number, angleDeg: number) => {
    if (success) return;
    sound.playTap();
    const nextLaunches = launches + 1;
    setLaunches(nextLaunches);

    // If power ~ 7 and angle ~ 45, lands in gravity portal
    if (Math.abs(power - 7) <= 1 && Math.abs(angleDeg - 45) <= 10) {
      setSuccess(true);
      sound.playSuccess();
      onFinish(nextLaunches, `${nextLaunches} launches`);
    } else {
      sound.playFail();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Gravity Slingshot</span>
        <span className="text-cyan-400 font-bold">Launches: {launches}</span>
      </div>

      <div className="w-full max-w-sm p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col items-center gap-4">
        <div className="flex items-center justify-between w-full px-4">
          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-black font-bold text-xs">
            Start
          </div>
          <div className="w-16 h-16 rounded-full bg-indigo-900 border-2 border-indigo-400 flex items-center justify-center text-[10px] text-indigo-200">
            Planet
          </div>
          <div className="w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center text-black font-bold text-xs animate-pulse">
            Portal
          </div>
        </div>

        {success ? (
          <p className="text-emerald-400 font-bold text-sm">Orbital insertion successful!</p>
        ) : (
          <p className="text-xs text-neutral-400">Choose launch trajectory to sling around the planet into the portal:</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => launch(5, 30)}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs rounded text-neutral-200 border border-neutral-700"
          >
            Low & Fast
          </button>
          <button
            onClick={() => launch(7, 45)}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs rounded text-neutral-200 border border-neutral-700"
          >
            Slingshot Arc
          </button>
          <button
            onClick={() => launch(9, 60)}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs rounded text-neutral-200 border border-neutral-700"
          >
            High Orbit
          </button>
        </div>
      </div>
    </div>
  );
}
