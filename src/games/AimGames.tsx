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

// 11. Laser Mirror Align (Optics Raycasting Simulation)
interface ChamberLevel {
  levelNumber: number;
  title: string;
  emitter: { col: number; row: number; dir: { dx: number; dy: number } };
  initialMirrors: { id: number; col: number; row: number; angle: number }[];
  obstacles: { col: number; row: number }[];
  crystals: { id: number; col: number; row: number }[];
}

const CHAMBER_LEVELS: ChamberLevel[] = [
  {
    levelNumber: 1,
    title: 'Calibration Chamber',
    emitter: { col: 0, row: 1, dir: { dx: 1, dy: 0 } },
    initialMirrors: [
      { id: 0, col: 3, row: 1, angle: 0 },
      { id: 1, col: 3, row: 3, angle: 90 },
    ],
    obstacles: [],
    crystals: [{ id: 0, col: 1, row: 3 }],
  },
  {
    levelNumber: 2,
    title: 'Obstacle Deflection',
    emitter: { col: 0, row: 3, dir: { dx: 1, dy: 0 } },
    initialMirrors: [
      { id: 0, col: 1, row: 3, angle: 0 },
      { id: 1, col: 1, row: 1, angle: 90 },
      { id: 2, col: 4, row: 1, angle: 0 },
    ],
    obstacles: [{ col: 2, row: 3 }],
    crystals: [{ id: 0, col: 4, row: 3 }],
  },
  {
    levelNumber: 3,
    title: 'Dual Crystal Resonance',
    emitter: { col: 0, row: 0, dir: { dx: 1, dy: 0 } },
    initialMirrors: [
      { id: 0, col: 2, row: 0, angle: 0 },
      { id: 1, col: 2, row: 4, angle: 45 },
      { id: 2, col: 4, row: 4, angle: 90 },
    ],
    obstacles: [{ col: 1, row: 2 }],
    crystals: [
      { id: 0, col: 2, row: 2 },
      { id: 1, col: 4, row: 1 },
    ],
  },
];

export function LaserMirrorGame({ onFinish }: GameProps) {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const chamber = CHAMBER_LEVELS[currentLevelIdx];
  const [mirrors, setMirrors] = useState(chamber.initialMirrors);
  const [moves, setMoves] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [levelSolved, setLevelSolved] = useState(false);
  const [isCompletedAll, setIsCompletedAll] = useState(false);

  // Sync mirrors when changing level
  useEffect(() => {
    setMirrors(CHAMBER_LEVELS[currentLevelIdx].initialMirrors);
    setLevelSolved(false);
  }, [currentLevelIdx]);

  // Optical Raytracer
  const { steps, poweredCrystals, hitNodes } = React.useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const hits = new Set<number>();
    const nodes: { x: number; y: number }[] = [];

    const toPx = (c: number, r: number) => ({ x: c * 56 + 28, y: r * 56 + 28 });

    let col = chamber.emitter.col;
    let row = chamber.emitter.row;
    let dx = chamber.emitter.dir.dx;
    let dy = chamber.emitter.dir.dy;

    pts.push(toPx(col, row));

    let maxSteps = 24;
    while (maxSteps-- > 0) {
      col += dx;
      row += dy;

      if (col < 0 || col > 4 || row < 0 || row > 4) {
        // Exited chamber boundaries
        const exitPx = toPx(col - dx * 0.45, row - dy * 0.45);
        pts.push(exitPx);
        break;
      }

      const currentPx = toPx(col, row);
      pts.push(currentPx);

      // Check obstacle barrier
      if (chamber.obstacles.some((o) => o.col === col && o.row === row)) {
        nodes.push(currentPx);
        break; // Absorbed by barrier
      }

      // Check target crystals
      chamber.crystals.forEach((c) => {
        if (c.col === col && c.row === row) {
          hits.add(c.id);
          nodes.push(currentPx);
        }
      });

      // Check mirror reflection
      const m = mirrors.find((item) => item.col === col && item.row === row);
      if (m) {
        nodes.push(currentPx);
        const ang = m.angle;

        if (ang === 45) {
          // Slash /: 45°
          // East (1, 0) -> North (0, -1)
          // South (0, 1) -> West (-1, 0)
          // West (-1, 0) -> South (0, 1)
          // North (0, -1) -> East (1, 0)
          const oldDx = dx;
          const oldDy = dy;
          dx = -oldDy;
          dy = -oldDx;
        } else if (ang === 135) {
          // Backslash \: 135°
          // East (1, 0) -> South (0, 1)
          // North (0, -1) -> West (-1, 0)
          // West (-1, 0) -> North (0, -1)
          // South (0, 1) -> East (1, 0)
          const oldDx = dx;
          const oldDy = dy;
          dx = oldDy;
          dy = oldDx;
        } else if (ang === 90) {
          // Vertical |: 90°
          if (dx !== 0) dx = -dx;
          else break;
        } else if (ang === 0) {
          // Horizontal —: 0°
          if (dy !== 0) dy = -dy;
          else break;
        }
      }
    }

    return { steps: pts, poweredCrystals: hits, hitNodes: nodes };
  }, [chamber, mirrors]);

  // Check victory condition
  useEffect(() => {
    if (levelSolved || isCompletedAll) return;
    const allPowered = chamber.crystals.every((c) => poweredCrystals.has(c.id));
    if (allPowered && chamber.crystals.length > 0) {
      setLevelSolved(true);
      sound.playSuccess();
      if (currentLevelIdx === CHAMBER_LEVELS.length - 1) {
        setIsCompletedAll(true);
        const finalMoves = totalMoves + moves;
        onFinish(finalMoves, `${finalMoves} moves`);
      }
    }
  }, [poweredCrystals, chamber, levelSolved, currentLevelIdx, isCompletedAll, totalMoves, moves, onFinish]);

  const rotateMirror = (id: number) => {
    if (levelSolved) return;
    sound.playTap();
    setMirrors((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        return { ...m, angle: (m.angle + 45) % 180 };
      })
    );
    setMoves((m) => m + 1);
  };

  const handleNextChamber = () => {
    if (currentLevelIdx < CHAMBER_LEVELS.length - 1) {
      setTotalMoves((tm) => tm + moves);
      setMoves(0);
      setCurrentLevelIdx((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setMirrors(chamber.initialMirrors);
    setLevelSolved(false);
  };

  const pointsString = steps.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none max-w-md mx-auto">
      {/* Top HUD */}
      <div className="flex justify-between items-center w-full text-xs font-mono text-neutral-300 px-2">
        <span className="text-cyan-400 font-bold">
          Chamber {currentLevelIdx + 1}/{CHAMBER_LEVELS.length}: {chamber.title}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-neutral-400">
            Crystals: <strong className="text-emerald-400">{poweredCrystals.size}/{chamber.crystals.length}</strong>
          </span>
          <span className="text-amber-400 font-bold">Moves: {totalMoves + moves}</span>
        </div>
      </div>

      {/* Optical Matrix Chamber */}
      <div className="relative p-2 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col items-center">
        <svg
          width={280}
          height={280}
          viewBox="0 0 280 280"
          className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden"
        >
          {/* Subtle Gridlines */}
          <defs>
            <pattern id="grid-pattern" width="56" height="56" patternUnits="userSpaceOnUse">
              <path d="M 56 0 L 0 0 0 56" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
            </pattern>
            <filter id="laser-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <radialGradient id="crystal-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#059669" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="280" height="280" fill="url(#grid-pattern)" />

          {/* Obstacle Blocks */}
          {chamber.obstacles.map((obs, i) => (
            <g key={`obs-${i}`} transform={`translate(${obs.col * 56 + 6}, ${obs.row * 56 + 6})`}>
              <rect
                width="44"
                height="44"
                rx="6"
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="1.5"
              />
              <path
                d="M 6 38 L 38 6 M 16 38 L 38 16 M 6 28 L 28 6"
                stroke="#64748b"
                strokeWidth="1.5"
                opacity="0.6"
              />
            </g>
          ))}

          {/* Laser Emitter Cannon */}
          <g transform={`translate(${chamber.emitter.col * 56 + 28}, ${chamber.emitter.row * 56 + 28})`}>
            <circle r="14" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2" />
            <circle r="8" fill="#38bdf8" className="animate-pulse" />
            <line x1="0" y1="0" x2="16" y2="0" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            <circle cx="16" cy="0" r="3" fill="#ffffff" />
          </g>

          {/* Target Crystals */}
          {chamber.crystals.map((c) => {
            const isPowered = poweredCrystals.has(c.id);
            const cx = c.col * 56 + 28;
            const cy = c.row * 56 + 28;
            return (
              <g key={`c-${c.id}`} transform={`translate(${cx}, ${cy})`}>
                {isPowered && (
                  <circle r="22" fill="url(#crystal-glow)" className="animate-pulse" />
                )}
                {/* Crystal Diamond */}
                <polygon
                  points="0,-14 14,0 0,14 -14,0"
                  fill={isPowered ? '#10b981' : '#6b21a8'}
                  stroke={isPowered ? '#a7f3d0' : '#c084fc'}
                  strokeWidth="2"
                  filter={isPowered ? 'url(#laser-glow)' : undefined}
                />
                <circle
                  r="3.5"
                  fill={isPowered ? '#ffffff' : '#e9d5ff'}
                  className={isPowered ? 'animate-ping' : undefined}
                />
              </g>
            );
          })}

          {/* Active Laser Beam Polyline */}
          {steps.length > 1 && (
            <g>
              {/* Outer Cyan Glow */}
              <polyline
                points={pointsString}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="8"
                strokeOpacity="0.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#laser-glow)"
              />
              {/* Mid Beam */}
              <polyline
                points={pointsString}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Sharp Hot White Core */}
              <polyline
                points={pointsString}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Node Spark Impacts */}
              {hitNodes.map((n, i) => (
                <circle
                  key={`node-${i}`}
                  cx={n.x}
                  cy={n.y}
                  r="5"
                  fill="#ffffff"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  className="animate-ping"
                />
              ))}
            </g>
          )}

          {/* Rotatable Optical Mirrors */}
          {mirrors.map((m) => {
            const mx = m.col * 56 + 28;
            const my = m.row * 56 + 28;
            return (
              <g
                key={`m-${m.id}`}
                transform={`translate(${mx}, ${my})`}
                onClick={() => rotateMirror(m.id)}
                className="cursor-pointer group"
              >
                {/* Mirror Mount Base */}
                <circle
                  r="18"
                  fill="#1e293b"
                  stroke="#475569"
                  strokeWidth="1.5"
                  className="group-hover:stroke-cyan-400 transition-colors"
                />
                {/* Angle Tick Marks */}
                <circle r="13" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2 6" />

                {/* Rotating Reflector Blade */}
                <g transform={`rotate(${m.angle})`}>
                  {/* Mirror Backing */}
                  <line x1="-16" y1="0" x2="16" y2="0" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
                  {/* Mirrored Glass Front */}
                  <line
                    x1="-16"
                    y1="-1.5"
                    x2="16"
                    y2="-1.5"
                    stroke="#e0f2fe"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1="-16"
                    y1="1.5"
                    x2="16"
                    y2="1.5"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </g>

                {/* Angle Badge */}
                <text
                  x="0"
                  y="12"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="7.5"
                  fontFamily="monospace"
                  className="pointer-events-none"
                >
                  {m.angle}°
                </text>
              </g>
            );
          })}
        </svg>

        {/* Level Solved / Complete Overlay Banner */}
        {levelSolved && (
          <div className="mt-3 w-full bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-3 flex flex-col items-center gap-2 text-center animate-fade-in">
            <span className="text-emerald-300 font-bold text-xs flex items-center gap-1.5">
              ✨ All Target Crystals Energized!
            </span>
            {currentLevelIdx < CHAMBER_LEVELS.length - 1 ? (
              <button
                onClick={handleNextChamber}
                className="px-5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-lg text-xs shadow-lg transition-transform active:scale-95"
              >
                Next Chamber →
              </button>
            ) : (
              <span className="text-emerald-400 font-extrabold text-xs">
                🏆 Optical Chambers Mastered in {totalMoves + moves} Moves!
              </span>
            )}
          </div>
        )}
      </div>

      {/* Controls & Help */}
      <div className="flex justify-between items-center w-full px-2">
        <p className="text-[11px] text-slate-400">
          Tap any mirror to rotate 45°. Direct the laser through all crystals!
        </p>
        <button
          onClick={handleReset}
          className="text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
        >
          Reset
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

// 16. Gravity Slingshot (Orbital Physics Simulation)
export function GravitySlingGame({ onFinish }: GameProps) {
  const [launches, setLaunches] = useState(0);
  const [success, setSuccess] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Aim angle & thrust to sling around the planet into the portal!');
  const [angle, setAngle] = useState(48);
  const [thrust, setThrust] = useState(6.8);
  const [isSimulating, setIsSimulating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  const startPos = { x: 45, y: 150 };
  const planet = { x: 155, y: 105, r: 24, mass: 650 };
  const portal = { x: 265, y: 65, r: 18 };

  const drawScene = (probePos?: { x: number; y: number }, trail: { x: number; y: number }[] = []) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Starfield dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    [[20, 30], [80, 80], [140, 20], [220, 140], [290, 40], [200, 180]].forEach(([sx, sy]) => {
      ctx.fillRect(sx, sy, 1.5, 1.5);
    });

    // Gravity field rings around Planet
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.lineWidth = 1;
    [40, 65, 90].forEach((gr) => {
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, gr, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Massive Planet
    const planetGrad = ctx.createRadialGradient(planet.x - 6, planet.y - 6, 4, planet.x, planet.y, planet.r);
    planetGrad.addColorStop(0, '#818cf8');
    planetGrad.addColorStop(0.7, '#3730a3');
    planetGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = planetGrad;
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, planet.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a5b4fc';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Portal (Wormhole Target)
    const portalGrad = ctx.createRadialGradient(portal.x, portal.y, 2, portal.x, portal.y, portal.r);
    portalGrad.addColorStop(0, '#ffffff');
    portalGrad.addColorStop(0.5, '#06b6d4');
    portalGrad.addColorStop(1, 'rgba(6, 182, 212, 0.1)');
    ctx.fillStyle = portalGrad;
    ctx.beginPath();
    ctx.arc(portal.x, portal.y, portal.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Launchpad
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(startPos.x - 12, startPos.y + 4, 24, 6);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(startPos.x - 2, startPos.y + 10, 4, 15);

    // Trajectory Aim Guide (when idle)
    if (!isSimulating && !probePos) {
      const rad = (angle * Math.PI) / 180;
      const aimLen = thrust * 5;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(startPos.x + Math.cos(rad) * aimLen, startPos.y - Math.sin(rad) * aimLen);
      ctx.stroke();
    }

    // Flight Trail
    if (trail.length > 1) {
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y);
      }
      ctx.stroke();
    }

    // Space Probe
    const p = probePos || startPos;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  useEffect(() => {
    drawScene();
  }, [angle, thrust, isSimulating]);

  const launch = () => {
    if (isSimulating || success) return;
    setIsSimulating(true);
    sound.playTap();
    const nextLaunches = launches + 1;
    setLaunches(nextLaunches);

    let px = startPos.x;
    let py = startPos.y;
    const rad = (angle * Math.PI) / 180;
    let vx = Math.cos(rad) * (thrust * 0.7);
    let vy = -Math.sin(rad) * (thrust * 0.7);

    const trail: { x: number; y: number }[] = [];
    trail.push({ x: px, y: py });

    const step = () => {
      // Gravitational acceleration from planet
      const dx = planet.x - px;
      const dy = planet.y - py;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);

      // Check collision with planet
      if (dist < planet.r + 3) {
        setIsSimulating(false);
        sound.playFail();
        setStatusMsg('💥 Sucked into gravitational singularity! Adjust angle/thrust.');
        return;
      }

      // Check entry into portal
      const pDx = portal.x - px;
      const pDy = portal.y - py;
      const pDist = Math.sqrt(pDx * pDx + pDy * pDy);
      if (pDist < portal.r + 2) {
        setIsSimulating(false);
        setSuccess(true);
        sound.playSuccess();
        setStatusMsg('✨ Gravitational Slingshot Successful! Portal Entered!');
        onFinish(nextLaunches, `${nextLaunches} launches`);
        return;
      }

      // Gravitational force: F = G * M / r^2
      const force = planet.mass / Math.max(distSq, 100);
      const ax = (dx / dist) * force;
      const ay = (dy / dist) * force;

      vx += ax * 0.12;
      vy += ay * 0.12;
      px += vx;
      py += vy;

      trail.push({ x: px, y: py });
      if (trail.length > 80) trail.shift();

      drawScene({ x: px, y: py }, trail);

      // Boundary check
      if (px < -20 || px > 330 || py < -20 || py > 230) {
        setIsSimulating(false);
        sound.playFail();
        setStatusMsg('🚀 Escaped orbit into deep space! Increase gravity curve.');
        return;
      }

      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none max-w-sm mx-auto">
      <div className="flex justify-between w-full text-xs font-mono text-neutral-300 px-2">
        <span className="text-cyan-400 font-bold">Orbital Slingshot</span>
        <span className="text-amber-400 font-bold">Launches: {launches}</span>
      </div>

      <div className="w-full p-2 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center gap-3 shadow-xl">
        <canvas
          ref={canvasRef}
          width={310}
          height={200}
          className="rounded-xl border border-slate-800 bg-slate-900 block"
        />

        <p className={`text-xs text-center font-medium ${success ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
          {statusMsg}
        </p>

        {/* Slingshot Controls */}
        <div className="grid grid-cols-2 gap-3 w-full px-2 text-xs">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-slate-400 font-mono">
              <span>Angle</span>
              <span className="text-amber-400">{angle}°</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={angle}
              disabled={isSimulating || success}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="accent-amber-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-slate-400 font-mono">
              <span>Thrust</span>
              <span className="text-cyan-400">{thrust} km/s</span>
            </div>
            <input
              type="range"
              min="3"
              max="11"
              step="0.2"
              value={thrust}
              disabled={isSimulating || success}
              onChange={(e) => setThrust(Number(e.target.value))}
              className="accent-cyan-400"
            />
          </div>
        </div>

        <button
          onClick={launch}
          disabled={isSimulating || success}
          className="w-full py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-transform active:scale-95"
        >
          {isSimulating ? 'Orbital Probe In Flight...' : success ? 'Mission Completed!' : 'Launch Probe'}
        </button>
      </div>
    </div>
  );
}
