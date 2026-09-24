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

// 60. Ring Hopper
export function OrbitHopperGame({ onFinish }: GameProps) {
  const [hops, setHops] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleHop = () => {
    sound.playTap();
    const next = hops + 1;
    setHops(next);
    if (next >= 10) {
      sound.playSuccess();
      onFinish(next, `${next} Ring Hops`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Orbit Hopper</span>
        <span className="text-emerald-400 font-bold">Hops: {hops}/10</span>
      </div>

      <div className="w-full max-w-sm h-48 bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center justify-center gap-4">
        <div className="w-32 h-32 rounded-full border-4 border-dashed border-cyan-400 animate-spin flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-amber-400 shadow-md" />
        </div>
        <button
          onClick={handleHop}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs"
        >
          HOP RING
        </button>
      </div>
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

// 63. Aero Flap Obstacle
export function AeroPulseGame({ onFinish }: GameProps) {
  const [score, setScore] = useState(0);

  const flap = () => {
    sound.playTap();
    const next = score + 1;
    setScore(next);
    if (next >= 10) {
      sound.playSuccess();
      onFinish(next, `${next} Gates Cleared`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Aero Pulse</span>
        <span className="text-rose-400 font-bold">Gates: {score}</span>
      </div>

      <div className="w-full max-w-sm h-48 bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center justify-center gap-4">
        <div className="text-4xl animate-bounce">🕊️</div>
        <button
          onClick={flap}
          className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md text-sm"
        >
          FLAP WINGS
        </button>
      </div>
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
