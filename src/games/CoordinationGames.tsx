import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';
import { GameProps } from './ReflexGames';

// 57. Metronome Beat Sync (120 BPM Tap)
export function MetronomeTapGame({ onFinish }: GameProps) {
  const [taps, setTaps] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const startMetronome = () => {
    setIsPlaying(true);
    setTaps([]);
    setAccuracy(null);
    let count = 0;

    timerRef.current = window.setInterval(() => {
      sound.playBeep(800, 0.04);
      count++;
      if (count > 8) {
        clearInterval(timerRef.current!);
        setIsPlaying(false);
      }
    }, 500); // 120 BPM = 500ms
  };

  const handleTap = () => {
    if (!isPlaying) return;
    sound.playTap();
    const now = performance.now();
    const next = [...taps, now];
    setTaps(next);

    if (next.length >= 6) {
      // Calculate variance
      const intervals = [];
      for (let i = 1; i < next.length; i++) {
        intervals.push(next[i] - next[i - 1]);
      }
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const error = Math.abs(avg - 500);
      const acc = Math.max(0, Math.round(100 - error / 2));
      setAccuracy(acc);
      sound.playSuccess();
      onFinish(acc, `${acc}% Rhythm Accuracy`);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Metronome 120 BPM</span>
        <span className="text-amber-400 font-bold">{accuracy ? `${accuracy}%` : `Taps: ${taps.length}/6`}</span>
      </div>

      <div
        onClick={handleTap}
        className="w-full max-w-sm h-52 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer active:bg-neutral-850"
      >
        {!isPlaying ? (
          <button
            onClick={startMetronome}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg shadow-md text-sm"
          >
            Start Metronome
          </button>
        ) : (
          <div className="text-center space-y-2">
            <span className="text-3xl font-extrabold text-amber-400 animate-pulse">TAP THE BEAT</span>
            <p className="text-xs text-neutral-400">Keep exact pace with the ticking clock!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 58. Dual Track Sync
export function DualHandSyncGame({ onFinish }: GameProps) {
  const [laneL, setLaneL] = useState(0); // 0: left, 1: right
  const [laneR, setLaneR] = useState(0);
  const [score, setScore] = useState(0);

  const switchL = () => {
    sound.playTap();
    setLaneL((l) => (l === 0 ? 1 : 0));
    setScore((s) => s + 1);
  };

  const switchR = () => {
    sound.playTap();
    setLaneR((r) => (r === 0 ? 1 : 0));
    setScore((s) => {
      const next = s + 1;
      if (next >= 12) {
        sound.playSuccess();
        onFinish(next, `${next} Dual Lane Shifts`);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Dual Track Navigator</span>
        <span className="text-cyan-400 font-bold">Shifts: {score}</span>
      </div>

      <div className="flex gap-4 w-full max-w-sm">
        {/* Left Track */}
        <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center gap-4">
          <span className="text-xs text-neutral-400">Track A</span>
          <div className="w-16 h-24 bg-neutral-800 rounded-lg relative flex items-center p-2">
            <div
              style={{ left: laneL === 0 ? '8px' : '36px' }}
              className="w-6 h-6 rounded-full bg-cyan-400 absolute transition-all"
            />
          </div>
          <button onClick={switchL} className="px-4 py-1.5 bg-cyan-600 text-white rounded text-xs font-bold">
            Shift A
          </button>
        </div>

        {/* Right Track */}
        <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center gap-4">
          <span className="text-xs text-neutral-400">Track B</span>
          <div className="w-16 h-24 bg-neutral-800 rounded-lg relative flex items-center p-2">
            <div
              style={{ left: laneR === 0 ? '8px' : '36px' }}
              className="w-6 h-6 rounded-full bg-rose-400 absolute transition-all"
            />
          </div>
          <button onClick={switchR} className="px-4 py-1.5 bg-rose-600 text-white rounded text-xs font-bold">
            Shift B
          </button>
        </div>
      </div>
    </div>
  );
}

// 59. Gyro Seesaw Balance
export function GyroBalanceGame({ onFinish }: GameProps) {
  const [angle, setAngle] = useState(0);
  const [ballX, setBallX] = useState(0); // -100 to 100
  const [survival, setSurvival] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animRef = useRef<number | null>(null);

  const startBalance = () => {
    setIsPlaying(true);
    setBallX(0);
    setAngle(0);
    setSurvival(0);
    sound.playTap();

    let curBall = 0;
    let curAngle = 0;
    let startTime = performance.now();

    const loop = () => {
      curBall += curAngle * 0.08;
      setBallX(curBall);
      setSurvival(Number(((performance.now() - startTime) / 1000).toFixed(1)));

      if (Math.abs(curBall) > 90) {
        setIsPlaying(false);
        sound.playFail();
        const score = Number(((performance.now() - startTime) / 1000).toFixed(1));
        onFinish(score, `${score}s Balanced`);
        return;
      }

      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
  };

  const tilt = (dir: number) => {
    if (!isPlaying) return;
    sound.playTap();
    setAngle((a) => Math.max(-15, Math.min(15, a + dir * 4)));
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Gyro Platform</span>
        <span className="text-amber-400 font-bold">{survival}s</span>
      </div>

      <div className="w-full max-w-sm h-52 bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center justify-between">
        {/* Seesaw Bar */}
        <div className="w-full h-20 flex items-center justify-center relative">
          <div
            style={{ transform: `rotate(${angle}deg)` }}
            className="w-48 h-3 bg-neutral-700 rounded-full relative transition-transform"
          >
            <div
              style={{ left: `calc(50% + ${ballX}px)` }}
              className="w-6 h-6 rounded-full bg-amber-400 absolute -top-5 -translate-x-1/2 shadow-md"
            />
          </div>
        </div>

        {isPlaying ? (
          <div className="flex gap-4">
            <button onClick={() => tilt(-1)} className="px-5 py-2 bg-neutral-800 rounded text-sm font-bold text-white">
              Tilt Left ◀
            </button>
            <button onClick={() => tilt(1)} className="px-5 py-2 bg-neutral-800 rounded text-sm font-bold text-white">
              Tilt Right ▶
            </button>
          </div>
        ) : (
          <button
            onClick={startBalance}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg shadow-md text-sm"
          >
            Start Gyro Balance
          </button>
        )}
      </div>
    </div>
  );
}

// 60. Ring Hopper (Orbital Alignment Timing)
export function OrbitHopperGame({ onFinish }: GameProps) {
  const [hops, setHops] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState('Wait for the green portal arc!');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  const state = useRef({
    satelliteAngle: 0,
    portalAngle: Math.PI * 0.75,
    portalWidth: Math.PI * 0.35,
    barrierAngle: Math.PI * 1.75,
    barrierWidth: Math.PI * 0.35,
    hops: 0,
    running: false,
  });

  const startHopper = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setHops(0);
    setFeedback('Time your hop as the satellite enters the green portal!');
    sound.playTap();

    state.current = {
      satelliteAngle: 0,
      portalAngle: Math.random() * Math.PI * 2,
      portalWidth: Math.PI * 0.35,
      barrierAngle: Math.random() * Math.PI * 2,
      barrierWidth: Math.PI * 0.35,
      hops: 0,
      running: true,
    };

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const s = state.current;
      if (!s.running) return;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const r = 70;

      // Orbit speed
      s.satelliteAngle = (s.satelliteAngle + 0.045) % (Math.PI * 2);

      // RENDER
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(0, 0, w, h);

      // Central core planet
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Core glow
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fill();

      // Orbit track
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Green Portal Arc
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, r, s.portalAngle, s.portalAngle + s.portalWidth);
      ctx.stroke();

      // Red Barrier Arc
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, r, s.barrierAngle, s.barrierAngle + s.barrierWidth);
      ctx.stroke();

      // Orbiting Satellite
      const satX = cx + Math.cos(s.satelliteAngle) * r;
      const satY = cy + Math.sin(s.satelliteAngle) * r;

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(satX, satY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
  };

  const handleHop = () => {
    if (!state.current.running) return;
    const s = state.current;

    // Normalize angles
    const norm = (a: number) => ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const sat = norm(s.satelliteAngle);
    const portalStart = norm(s.portalAngle);
    const portalEnd = norm(s.portalAngle + s.portalWidth);

    const isInPortal =
      portalStart < portalEnd
        ? sat >= portalStart && sat <= portalEnd
        : sat >= portalStart || sat <= portalEnd;

    const barrierStart = norm(s.barrierAngle);
    const barrierEnd = norm(s.barrierAngle + s.barrierWidth);
    const isInBarrier =
      barrierStart < barrierEnd
        ? sat >= barrierStart && sat <= barrierEnd
        : sat >= barrierStart || sat <= barrierEnd;

    if (isInPortal) {
      sound.playSuccess();
      s.hops += 1;
      setHops(s.hops);
      setFeedback('PERFECT TIMING! Portal Traversed!');

      // Randomize portal and barrier positions
      s.portalAngle = Math.random() * Math.PI * 2;
      s.barrierAngle = (s.portalAngle + Math.PI + (Math.random() - 0.5)) % (Math.PI * 2);

      if (s.hops >= 6) {
        s.running = false;
        setIsPlaying(false);
        setIsGameOver(true);
        onFinish(6, '6 Flawless Orbital Hops! 🚀');
      }
    } else if (isInBarrier) {
      sound.playFail();
      setFeedback('COLLISION! Hit the red hazard barrier!');
      s.hops = Math.max(0, s.hops - 1);
      setHops(s.hops);
    } else {
      sound.playFail();
      setFeedback('MISSED! Hopped into empty void!');
    }
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      state.current.running = false;
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none max-w-sm mx-auto">
      <div className="flex justify-between items-center w-full text-xs font-mono text-neutral-300 px-2">
        <span>Orbit Hopper</span>
        <span className="text-emerald-400 font-bold">Hops: {hops}/6</span>
      </div>

      <div className="relative border border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-950 p-2">
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          className="rounded-xl block bg-slate-900"
        />

        {!isPlaying && (
          <div className="absolute inset-2 rounded-xl bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center gap-2.5">
            <span className="text-4xl animate-bounce">🪐</span>
            <h3 className="text-base font-extrabold text-white">
              {isGameOver ? 'Orbit Cleared!' : 'Ring Orbit Hopper'}
            </h3>
            <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
              Tap the HOP button at the exact instant the yellow satellite travels inside the green portal arc! Avoid red barriers.
            </p>
            <button
              onClick={startHopper}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 text-xs transition-transform active:scale-95 uppercase tracking-wider"
            >
              {isGameOver ? 'Play Again' : 'Start Orbit Hopper'}
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-amber-400 font-mono text-center min-h-5">{feedback}</p>

      {isPlaying && (
        <button
          onClick={handleHop}
          className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 transition-all"
        >
          HOP NOW! ⚡
        </button>
      )}
    </div>
  );
}

// 61. Polar Spiral Tracer
export function SpiralTracerGame({ onFinish }: GameProps) {
  const [progress, setProgress] = useState(0);

  const handleTrace = () => {
    sound.playTap();
    const next = Math.min(100, progress + 15);
    setProgress(next);
    if (next >= 100) {
      sound.playSuccess();
      onFinish(100, 'Spiral 100% Complete');
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Polar Spiral</span>
        <span className="text-cyan-400 font-bold">{progress}%</span>
      </div>

      <div className="w-full max-w-sm h-48 bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center justify-center gap-4">
        <div className="w-full bg-neutral-800 h-4 rounded-full overflow-hidden">
          <div style={{ width: `${progress}%` }} className="bg-cyan-400 h-full transition-all" />
        </div>
        <button
          onClick={handleTrace}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs"
        >
          TRACE SPIRAL
        </button>
      </div>
    </div>
  );
}

// 62. Waveform Matcher
export function WaveSyncGame({ onFinish }: GameProps) {
  const [amp, setAmp] = useState(30);
  const targetAmp = 50;

  const handleTune = (val: number) => {
    sound.playTap();
    setAmp(val);
    if (Math.abs(val - targetAmp) < 3) {
      sound.playSuccess();
      onFinish(100, 'Harmonic Resonance Locked!');
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Waveform Tuning</span>
        <span className="text-emerald-400 font-bold">Amp: {amp}</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center gap-4">
        <svg width="220" height="80" className="overflow-visible">
          {/* Target wave */}
          <path
            d={`M 10 40 Q 60 ${40 - targetAmp} 110 40 T 210 40`}
            fill="none"
            stroke="#475569"
            strokeWidth="3"
            strokeDasharray="4"
          />
          {/* User wave */}
          <path
            d={`M 10 40 Q 60 ${40 - amp} 110 40 T 210 40`}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
          />
        </svg>

        <input
          type="range"
          min="10"
          max="70"
          value={amp}
          onChange={(e) => handleTune(Number(e.target.value))}
          className="w-full"
        />
        <p className="text-xs text-neutral-400">Match the solid green wave with the dashed target wave!</p>
      </div>
    </div>
  );
}

// 63. Aero Flap Obstacle (Flappy Aero Pulse)
export function AeroPulseGame({ onFinish }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const animRef = useRef<number | null>(null);

  const state = useRef({
    birdY: 120,
    birdVy: 0,
    birdR: 10,
    gravity: 0.28,
    flapStrength: -5.2,
    pipes: [] as { x: number; topH: number; gap: number; passed: boolean }[],
    score: 0,
    running: false,
    frame: 0,
  });

  const startFlight = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    sound.playTap();

    state.current = {
      birdY: 120,
      birdVy: -3,
      birdR: 10,
      gravity: 0.28,
      flapStrength: -5.2,
      pipes: [
        { x: 300, topH: 60, gap: 85, passed: false },
        { x: 480, topH: 90, gap: 85, passed: false },
      ],
      score: 0,
      running: true,
      frame: 0,
    };

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const s = state.current;
      if (!s.running) return;

      const w = canvas.width;
      const h = canvas.height;
      s.frame++;

      // Bird physics
      s.birdVy += s.gravity;
      s.birdY += s.birdVy;

      // Floor & ceiling crash
      if (s.birdY - s.birdR <= 0 || s.birdY + s.birdR >= h) {
        sound.playFail();
        s.running = false;
        setIsPlaying(false);
        setIsGameOver(true);
        onFinish(s.score, `${s.score} Gates Cleared`);
        return;
      }

      // Pipe movement & collision
      for (const p of s.pipes) {
        p.x -= 2.2;

        const birdX = 60;
        const pipeW = 34;

        // Collision check
        if (birdX + s.birdR > p.x && birdX - s.birdR < p.x + pipeW) {
          if (s.birdY - s.birdR < p.topH || s.birdY + s.birdR > p.topH + p.gap) {
            sound.playFail();
            s.running = false;
            setIsPlaying(false);
            setIsGameOver(true);
            onFinish(s.score, `${s.score} Gates Cleared`);
            return;
          }
        }

        // Passed gate
        if (!p.passed && p.x + pipeW < birdX) {
          p.passed = true;
          s.score += 1;
          setScore(s.score);
          sound.playSuccess();

          if (s.score >= 8) {
            s.running = false;
            setIsPlaying(false);
            setIsGameOver(true);
            onFinish(8, '8 Gates Cleared! (Flight Master)');
            return;
          }
        }
      }

      // Recycle pipes
      if (s.pipes.length > 0 && s.pipes[0].x < -40) {
        s.pipes.shift();
        const lastX = s.pipes[s.pipes.length - 1].x;
        s.pipes.push({
          x: lastX + 180,
          topH: Math.floor(Math.random() * 80) + 40,
          gap: 85,
          passed: false,
        });
      }

      // RENDER
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      // Draw Pipes
      for (const p of s.pipes) {
        // Top pipe
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.roundRect(p.x, 0, 34, p.topH, [0, 0, 6, 6]);
        ctx.fill();

        // Bottom pipe
        const botY = p.topH + p.gap;
        ctx.beginPath();
        ctx.roundRect(p.x, botY, 34, h - botY, [6, 6, 0, 0]);
        ctx.fill();
      }

      // Draw Bird
      const birdX = 60;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(birdX, s.birdY, s.birdR, 0, Math.PI * 2);
      ctx.fill();

      // Wing
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(birdX - 3, s.birdY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(birdX + 4, s.birdY - 3, 2, 0, Math.PI * 2);
      ctx.fill();

      // Beak
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(birdX + 8, s.birdY);
      ctx.lineTo(birdX + 14, s.birdY + 2);
      ctx.lineTo(birdX + 8, s.birdY + 5);
      ctx.fill();

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
  };

  const handleFlap = () => {
    if (!state.current.running) return;
    sound.playTap();
    state.current.birdVy = state.current.flapStrength;
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      state.current.running = false;
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none max-w-sm mx-auto">
      <div className="flex justify-between items-center w-full text-xs font-mono text-neutral-300 px-2">
        <span>Aero Pulse Flight</span>
        <span className="text-amber-400 font-bold">Gates: {score}/8</span>
      </div>

      <div
        onClick={handleFlap}
        className="relative border border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-950 p-2 cursor-pointer"
      >
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          className="rounded-xl block bg-slate-900 touch-none"
        />

        {!isPlaying && (
          <div className="absolute inset-2 rounded-xl bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center gap-2.5">
            <span className="text-4xl animate-bounce">🕊️</span>
            <h3 className="text-base font-extrabold text-white">
              {isGameOver ? 'Flight Concluded!' : 'Aero Pulse Gates'}
            </h3>
            <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
              Tap anywhere or press the FLAP button to pulse upward against gravity. Navigate safely between moving pillar gates!
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startFlight();
              }}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 text-xs transition-transform active:scale-95 uppercase tracking-wider"
            >
              {isGameOver ? 'Fly Again' : 'Start Flight'}
            </button>
          </div>
        )}
      </div>

      {isPlaying && (
        <button
          onClick={handleFlap}
          className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-rose-600/20 transition-all"
        >
          FLAP WINGS 🪽
        </button>
      )}
    </div>
  );
}

// 64. Twin Gate Crosser
export function TwoFingerCrossGame({ onFinish }: GameProps) {
  const [crossCount, setCrossCount] = useState(0);

  const cross = () => {
    sound.playSuccess();
    const next = crossCount + 1;
    setCrossCount(next);
    if (next >= 6) {
      onFinish(next, `${next} Synchronous Crossings`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Twin Gate Crosser</span>
        <span className="text-cyan-400 font-bold">Crosses: {crossCount}/6</span>
      </div>

      <div className="w-full max-w-sm h-48 bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center justify-center gap-4">
        <button
          onClick={cross}
          className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-md text-sm"
        >
          CROSS TWIN GATES
        </button>
      </div>
    </div>
  );
}
