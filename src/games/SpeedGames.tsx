import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';
import { GameProps } from './ReflexGames';

// 65. Schulte 1-25 Grid
export function Schulte25Game({ onFinish }: GameProps) {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [expected, setExpected] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const handleStart = () => {
    const shuffled = Array.from({ length: 25 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    setNumbers(shuffled);
    setExpected(1);
    setIsPlaying(true);
    startTimeRef.current = performance.now();
    sound.playTap();

    timerRef.current = window.setInterval(() => {
      setElapsed(Number(((performance.now() - startTimeRef.current) / 1000).toFixed(1)));
    }, 100);
  };

  const handleClick = (num: number) => {
    if (!isPlaying) return;
    if (num === expected) {
      sound.playBeep(400 + num * 20, 0.04);
      if (expected === 25) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsPlaying(false);
        const finalTime = Number(((performance.now() - startTimeRef.current) / 1000).toFixed(2));
        sound.playSuccess();
        onFinish(finalTime, `${finalTime}s (Schulte 25)`);
      } else {
        setExpected((e) => e + 1);
      }
    } else {
      sound.playFail();
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
        <span>Find: <strong className="text-amber-400">{expected}</strong></span>
        <span className="text-cyan-400 font-bold">{elapsed}s</span>
      </div>

      <div className="grid grid-cols-5 gap-1.5 p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
        {numbers.length > 0 ? (
          numbers.map((n) => (
            <button
              key={n}
              onClick={() => handleClick(n)}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-neutral-800 hover:bg-neutral-750 font-mono font-bold text-lg text-white rounded-lg active:scale-95 transition-transform"
            >
              {n}
            </button>
          ))
        ) : (
          <div className="col-span-5 h-64 flex items-center justify-center">
            <button
              onClick={handleStart}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg shadow-md text-sm"
            >
              Start Schulte Table
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 66. CPS Clicker (10 Seconds)
export function CPSClickerGame({ onFinish }: GameProps) {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  const startClicker = () => {
    setClicks(0);
    setTimeLeft(10);
    setIsPlaying(true);
    sound.playTap();

    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setIsPlaying(false);
          sound.playSuccess();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleClick = () => {
    if (!isPlaying) {
      startClicker();
      return;
    }
    sound.playTap();
    setClicks((c) => c + 1);
  };

  useEffect(() => {
    if (timeLeft === 0 && !isPlaying && clicks > 0) {
      const cps = Number((clicks / 10).toFixed(1));
      onFinish(cps, `${cps} CPS (${clicks} clicks)`);
    }
  }, [timeLeft, isPlaying, clicks, onFinish]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Time: {timeLeft}s</span>
        <span className="text-emerald-400 font-bold">Clicks: {clicks}</span>
      </div>

      <button
        onClick={handleClick}
        className="w-full max-w-sm h-56 bg-neutral-900 border-2 border-emerald-500 rounded-xl flex flex-col items-center justify-center p-6 active:scale-98 transition-transform cursor-pointer shadow-lg shadow-emerald-500/10"
      >
        <span className="text-4xl font-extrabold text-emerald-400">
          {isPlaying ? 'CLICK RAPIDLY!' : 'CLICK TO START'}
        </span>
        <span className="text-xs text-neutral-400 mt-2">
          {isPlaying ? `${(clicks / Math.max(1, 10 - timeLeft)).toFixed(1)} CPS current pace` : '10-Second Speed Test'}
        </span>
      </button>
    </div>
  );
}

// 67. Directional Arrow Blitz
export function ArrowRushGame({ onFinish }: GameProps) {
  const arrows = ['▲', '▼', '◀', '▶'];
  const [currentArrow, setCurrentArrow] = useState('▲');
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const nextArrow = () => {
    setCurrentArrow(arrows[Math.floor(Math.random() * arrows.length)]);
  };

  const handleStart = () => {
    setScore(0);
    setIsPlaying(true);
    sound.playTap();
    nextArrow();
  };

  const handlePress = (arrow: string) => {
    if (!isPlaying) return;
    if (arrow === currentArrow) {
      sound.playSuccess();
      const nextScore = score + 1;
      setScore(nextScore);
      if (nextScore >= 15) {
        setIsPlaying(false);
        onFinish(nextScore, `${nextScore} Arrows`);
      } else {
        nextArrow();
      }
    } else {
      sound.playFail();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Arrow Rush</span>
        <span className="text-amber-400 font-bold">{score}/15</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-6">
        {isPlaying ? (
          <>
            <span className="text-6xl font-bold text-amber-400">{currentArrow}</span>
            <div className="grid grid-cols-4 gap-2 w-full">
              {arrows.map((arr, i) => (
                <button
                  key={i}
                  onClick={() => handlePress(arr)}
                  className="py-3 bg-neutral-800 hover:bg-neutral-750 text-2xl font-bold rounded-lg text-white"
                >
                  {arr}
                </button>
              ))}
            </div>
          </>
        ) : (
          <button
            onClick={handleStart}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg shadow-md text-sm"
          >
            Start Arrow Rush
          </button>
        )}
      </div>
    </div>
  );
}

// 68. Color Sorting Bins
export function BinSortGame({ onFinish }: GameProps) {
  const [currentColor, setCurrentColor] = useState<'red' | 'blue' | 'green'>('red');
  const [score, setScore] = useState(0);

  const colors = ['red', 'blue', 'green'] as const;

  const nextItem = () => {
    setCurrentColor(colors[Math.floor(Math.random() * colors.length)]);
  };

  const handleSort = (color: typeof currentColor) => {
    if (color === currentColor) {
      sound.playSuccess();
      const next = score + 1;
      setScore(next);
      if (next >= 12) {
        onFinish(next, `${next} Sorted Items`);
      } else {
        nextItem();
      }
    } else {
      sound.playFail();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Color Bins</span>
        <span className="text-cyan-400 font-bold">Sorted: {score}/12</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-6">
        <div
          className={`w-16 h-16 rounded-2xl shadow-lg ${
            currentColor === 'red' ? 'bg-rose-500' : currentColor === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'
          }`}
        />
        <div className="grid grid-cols-3 gap-3 w-full">
          <button onClick={() => handleSort('red')} className="py-2.5 bg-rose-600 text-white font-bold rounded-lg text-xs">
            Red Bin
          </button>
          <button onClick={() => handleSort('blue')} className="py-2.5 bg-blue-600 text-white font-bold rounded-lg text-xs">
            Blue Bin
          </button>
          <button onClick={() => handleSort('green')} className="py-2.5 bg-emerald-600 text-white font-bold rounded-lg text-xs">
            Green Bin
          </button>
        </div>
      </div>
    </div>
  );
}

// 69. Floating Bubble Pop (Rapid Tap Rush)
export function BubblePopGame({ onFinish }: GameProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bubbles, setBubbles] = useState<
    { id: number; x: number; y: number; size: number; color: string; speed: number; symbol: string }[]
  >([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<number | null>(null);
  const nextIdRef = useRef(1);

  const bubbleColors = [
    { bg: 'bg-cyan-500/30 border-cyan-400 text-cyan-300', sym: '🫧' },
    { bg: 'bg-pink-500/30 border-pink-400 text-pink-300', sym: '🌸' },
    { bg: 'bg-amber-500/30 border-amber-400 text-amber-300', sym: '⭐' },
    { bg: 'bg-emerald-500/30 border-emerald-400 text-emerald-300', sym: '🍀' },
    { bg: 'bg-purple-500/30 border-purple-400 text-purple-300', sym: '🔮' },
  ];

  const startGame = () => {
    setScore(0);
    setTimeLeft(20);
    setIsPlaying(true);
    setBubbles([]);
    sound.playTap();

    // Initial batch of bubbles
    const initial = Array.from({ length: 6 }, () => createBubble());
    setBubbles(initial);
  };

  const createBubble = () => {
    const col = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
    return {
      id: nextIdRef.current++,
      x: Math.random() * 80 + 10,
      y: 100 + Math.random() * 20,
      size: Math.floor(Math.random() * 20) + 48,
      color: col.bg,
      speed: Math.random() * 0.4 + 0.35,
      symbol: col.sym,
    };
  };

  // Rising loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setIsPlaying(false);
          sound.playSuccess();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    const step = () => {
      setBubbles((prev) => {
        const next = prev
          .map((b) => ({ ...b, y: b.y - b.speed }))
          .filter((b) => b.y > -20);

        // Replenish bubbles
        while (next.length < 7) {
          next.push(createBubble());
        }
        return next;
      });
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);

    return () => {
      clearInterval(interval);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying]);

  const handlePop = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPlaying) return;
    sound.playTap();
    setScore((s) => s + 1);
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  };

  useEffect(() => {
    if (timeLeft === 0 && !isPlaying && score > 0) {
      onFinish(score, `${score} Bubbles Popped`);
    }
  }, [timeLeft, isPlaying, score, onFinish]);

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none max-w-sm mx-auto">
      <div className="flex justify-between w-full text-xs font-mono text-neutral-300 px-2">
        <span className="text-amber-400 font-bold">Time: {timeLeft}s</span>
        <span className="text-cyan-400 font-bold">Popped: {score}</span>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-72 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Floating bubbles */}
        {isPlaying &&
          bubbles.map((b) => (
            <button
              key={b.id}
              onClick={(e) => handlePop(b.id, e)}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: `${b.size}px`,
                height: `${b.size}px`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 flex items-center justify-center text-xl shadow-lg transition-transform active:scale-125 cursor-pointer backdrop-blur-xs animate-pulse ${b.color}`}
            >
              {b.symbol}
            </button>
          ))}

        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-6 text-center">
            <span className="text-5xl mb-3 animate-bounce">🫧</span>
            <h3 className="text-sm font-bold text-white mb-1">Floating Bubble Rush</h3>
            <p className="text-xs text-slate-400 mb-4 max-w-xs">
              Bubbles float upward at different speeds. Tap as many as you can before the 20-second timer expires!
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-cyan-500/20 text-xs transition-transform active:scale-95"
            >
              {timeLeft === 0 ? 'Play Again' : 'Start Bubble Popper'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 70. Coin Catcher Basket (Arcade Physics Catch & Dodge)
interface FallingEntity {
  id: number;
  type: 'coin' | 'gem' | 'bomb';
  x: number;
  y: number;
  speed: number;
  size: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface FloatingScore {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export function CoinCatcherGame({ onFinish }: GameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(35);
  const [coinsCaught, setCoinsCaught] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const stateRef = useRef({
    basketX: 160,
    basketTargetX: 160,
    basketWidth: 54,
    basketHeight: 20,
    entities: [] as FallingEntity[],
    particles: [] as Particle[],
    floatingScores: [] as FloatingScore[],
    nextId: 1,
    score: 0,
    lives: 3,
    coinsCaught: 0,
    running: false,
    flashRed: 0,
  });

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setLives(3);
    setTimeLeft(35);
    setCoinsCaught(0);

    stateRef.current = {
      basketX: 160,
      basketTargetX: 160,
      basketWidth: 54,
      basketHeight: 20,
      entities: [],
      particles: [],
      floatingScores: [],
      nextId: 1,
      score: 0,
      lives: 3,
      coinsCaught: 0,
      running: true,
      flashRed: 0,
    };

    sound.playTap();

    // Countdown Timer
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          endGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastSpawn = performance.now();

    const loop = (now: number) => {
      const s = stateRef.current;
      if (!s.running) return;

      const w = canvas.width;
      const h = canvas.height;

      // Smooth basket movement towards target
      s.basketX += (s.basketTargetX - s.basketX) * 0.25;
      // Clamp basket inside arena
      s.basketX = Math.max(s.basketWidth / 2, Math.min(w - s.basketWidth / 2, s.basketX));

      // Spawning entities
      if (now - lastSpawn > 550) {
        lastSpawn = now;
        const rand = Math.random();
        let type: 'coin' | 'gem' | 'bomb' = 'coin';
        if (rand < 0.22) type = 'bomb';
        else if (rand < 0.35) type = 'gem';

        s.entities.push({
          id: s.nextId++,
          type,
          x: Math.random() * (w - 40) + 20,
          y: -15,
          speed: type === 'gem' ? 3.6 : type === 'bomb' ? 3.2 : 2.7 + Math.random() * 0.8,
          size: type === 'gem' ? 12 : type === 'bomb' ? 14 : 11,
        });
      }

      // Update falling entities & basket collision
      const basketTop = h - 35;
      const basketLeft = s.basketX - s.basketWidth / 2;
      const basketRight = s.basketX + s.basketWidth / 2;

      for (let i = s.entities.length - 1; i >= 0; i--) {
        const ent = s.entities[i];
        ent.y += ent.speed;

        // Check collision with basket
        if (
          ent.y >= basketTop - 8 &&
          ent.y <= basketTop + s.basketHeight &&
          ent.x >= basketLeft - 4 &&
          ent.x <= basketRight + 4
        ) {
          if (ent.type === 'coin') {
            sound.playSuccess();
            s.score += 10;
            s.coinsCaught += 1;
            setScore(s.score);
            setCoinsCaught(s.coinsCaught);
            spawnBurst(ent.x, ent.y, '#fbbf24', 8);
            s.floatingScores.push({ id: s.nextId++, x: ent.x, y: ent.y - 10, text: '+10', color: '#facc15', life: 25 });
          } else if (ent.type === 'gem') {
            sound.playSuccess();
            s.score += 25;
            s.coinsCaught += 1;
            setScore(s.score);
            setCoinsCaught(s.coinsCaught);
            spawnBurst(ent.x, ent.y, '#38bdf8', 12);
            s.floatingScores.push({ id: s.nextId++, x: ent.x, y: ent.y - 10, text: '+25 💎', color: '#38bdf8', life: 30 });
          } else if (ent.type === 'bomb') {
            sound.playFail();
            s.lives -= 1;
            s.flashRed = 8;
            setLives(s.lives);
            spawnBurst(ent.x, ent.y, '#f43f5e', 14);
            s.floatingScores.push({ id: s.nextId++, x: ent.x, y: ent.y - 10, text: '-1 ❤️', color: '#f43f5e', life: 30 });

            if (s.lives <= 0) {
              endGame();
              return;
            }
          }
          s.entities.splice(i, 1);
          continue;
        }

        // Remove if off-screen bottom
        if (ent.y > h + 20) {
          s.entities.splice(i, 1);
        }
      }

      // Update particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        if (p.life <= 0) s.particles.splice(i, 1);
      }

      // Update floating scores
      for (let i = s.floatingScores.length - 1; i >= 0; i--) {
        const fs = s.floatingScores[i];
        fs.y -= 0.8;
        fs.life -= 1;
        if (fs.life <= 0) s.floatingScores.splice(i, 1);
      }

      // RENDER
      ctx.fillStyle = s.flashRed > 0 ? '#450a0a' : '#090d16';
      if (s.flashRed > 0) s.flashRed -= 1;
      ctx.fillRect(0, 0, w, h);

      // Floor grid line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, basketTop + s.basketHeight + 4);
      ctx.lineTo(w, basketTop + s.basketHeight + 4);
      ctx.stroke();

      // Draw Basket
      const bX = s.basketX;
      const bY = basketTop;

      // Basket rim glow
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(bX - s.basketWidth / 2, bY, s.basketWidth, 4);

      // Basket body
      const basketGrad = ctx.createLinearGradient(bX, bY, bX, bY + s.basketHeight);
      basketGrad.addColorStop(0, '#d97706');
      basketGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = basketGrad;
      ctx.beginPath();
      ctx.roundRect(bX - s.basketWidth / 2 + 2, bY + 3, s.basketWidth - 4, s.basketHeight - 4, [0, 0, 8, 8]);
      ctx.fill();

      // Basket weave pattern
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(bX - 16, bY + 3);
      ctx.lineTo(bX - 8, bY + s.basketHeight - 2);
      ctx.moveTo(bX + 8, bY + 3);
      ctx.lineTo(bX + 16, bY + s.basketHeight - 2);
      ctx.stroke();

      // Draw Falling Entities
      for (const ent of s.entities) {
        if (ent.type === 'coin') {
          // Gold Coin
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(ent.x, ent.y, ent.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#854d0e';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('$', ent.x, ent.y);
        } else if (ent.type === 'gem') {
          // Blue Diamond Gem
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(ent.x, ent.y - ent.size);
          ctx.lineTo(ent.x + ent.size, ent.y);
          ctx.lineTo(ent.x, ent.y + ent.size);
          ctx.lineTo(ent.x - ent.size, ent.y);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (ent.type === 'bomb') {
          // Black Hazard Bomb
          ctx.fillStyle = '#1e1e24';
          ctx.beginPath();
          ctx.arc(ent.x, ent.y, ent.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#e11d48';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Fuse & Spark
          ctx.strokeStyle = '#f97316';
          ctx.beginPath();
          ctx.moveTo(ent.x, ent.y - ent.size);
          ctx.lineTo(ent.x + 4, ent.y - ent.size - 4);
          ctx.stroke();
          ctx.fillStyle = '#facc15';
          ctx.fillRect(ent.x + 3, ent.y - ent.size - 6, 2, 2);
        }
      }

      // Draw Particles
      for (const p of s.particles) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.life * 0.15), 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Floating Scores
      for (const fs of s.floatingScores) {
        ctx.fillStyle = fs.color;
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(fs.text, fs.x, fs.y);
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
  };

  const spawnBurst = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = Math.random() * 3 + 1;
      stateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 1,
        life: 18 + Math.floor(Math.random() * 8),
        color,
      });
    }
  };

  const endGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    stateRef.current.running = false;
    setIsPlaying(false);
    setIsGameOver(true);
    sound.playSuccess();
    onFinish(stateRef.current.score, `${stateRef.current.score} pts (${stateRef.current.coinsCaught} coins)`);
  };

  // Pointer & Drag Controls
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!stateRef.current.running) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 320;
    stateRef.current.basketTargetX = x;
  };

  // Keyboard Left / Right controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!stateRef.current.running) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        stateRef.current.basketTargetX = Math.max(28, stateRef.current.basketTargetX - 32);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        stateRef.current.basketTargetX = Math.min(292, stateRef.current.basketTargetX + 32);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const nudgeBasket = (delta: number) => {
    if (!stateRef.current.running) return;
    stateRef.current.basketTargetX = Math.max(28, Math.min(292, stateRef.current.basketTargetX + delta));
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      stateRef.current.running = false;
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none max-w-sm mx-auto">
      {/* Top HUD */}
      <div className="flex justify-between items-center w-full text-xs font-mono text-neutral-300 px-2">
        <div className="flex items-center gap-2">
          <span>Lives:</span>
          <span className="text-rose-500 font-bold tracking-widest">
            {'❤️'.repeat(Math.max(0, lives))}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-bold">Time: {timeLeft}s</span>
          <span className="text-amber-400 font-bold">Score: {score}</span>
        </div>
      </div>

      {/* Main Interactive Arcade Canvas */}
      <div className="relative p-2 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col items-center">
        <canvas
          ref={canvasRef}
          width={320}
          height={280}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          className="rounded-xl border border-slate-800/90 bg-slate-900 block touch-none cursor-ew-resize"
        />

        {/* Overlay when Idle or Game Over */}
        {!isPlaying && (
          <div className="absolute inset-2 rounded-xl bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-5 text-center gap-3">
            <span className="text-4xl animate-bounce">🪙</span>
            <h3 className="text-base font-extrabold text-white">
              {isGameOver ? 'Session Complete!' : 'Falling Coin Basket'}
            </h3>
            <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
              {isGameOver
                ? `You caught ${coinsCaught} coins for a total score of ${score} pts!`
                : 'Slide the basket left and right with your mouse, finger, or arrow keys. Catch gold coins (+10) and gems (+25) while dodging black bombs!'}
            </p>

            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 text-xs transition-transform active:scale-95 uppercase tracking-wider"
            >
              {isGameOver ? 'Play Again' : 'Start Coin Catcher'}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Touch & Keyboard Guidance */}
      <div className="flex justify-between items-center w-full px-2 text-xs">
        <div className="flex gap-2">
          <button
            onPointerDown={() => nudgeBasket(-40)}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 font-bold active:scale-95"
          >
            ◀ LEFT
          </button>
          <button
            onPointerDown={() => nudgeBasket(40)}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 font-bold active:scale-95"
          >
            RIGHT ▶
          </button>
        </div>
        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
          Drag mouse or use [A] / [D] keys
        </span>
      </div>
    </div>
  );
}

// 71. Alternating Key Masher (A / B)
export function ButtonMashGame({ onFinish }: GameProps) {
  const [expected, setExpected] = useState<'A' | 'B'>('A');
  const [count, setCount] = useState(0);

  const mash = (key: 'A' | 'B') => {
    if (key === expected) {
      sound.playTap();
      const next = count + 1;
      setCount(next);
      setExpected(key === 'A' ? 'B' : 'A');
      if (next >= 20) {
        sound.playSuccess();
        onFinish(next, `${next} Alternating Mashes`);
      }
    } else {
      sound.playFail();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Next: <strong className="text-cyan-400">{expected}</strong></span>
        <span className="text-amber-400 font-bold">{count}/20</span>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => mash('A')}
          className="w-24 h-24 bg-neutral-800 hover:bg-neutral-750 text-2xl font-mono font-bold text-white rounded-xl shadow-md active:scale-95"
        >
          A
        </button>
        <button
          onClick={() => mash('B')}
          className="w-24 h-24 bg-neutral-800 hover:bg-neutral-750 text-2xl font-mono font-bold text-white rounded-xl shadow-md active:scale-95"
        >
          B
        </button>
      </div>
    </div>
  );
}

// 72. Identical Symbol Speed Match
export function SameCheckGame({ onFinish }: GameProps) {
  const [syms, setSyms] = useState<[string, string]>(['★', '★']);
  const [score, setScore] = useState(0);

  const all = ['★', '◆', '▲', '●'];

  const nextPair = () => {
    const isSame = Math.random() > 0.5;
    const a = all[Math.floor(Math.random() * all.length)];
    const b = isSame ? a : all.find((x) => x !== a)!;
    setSyms([a, b]);
  };

  const handleDecision = (isSame: boolean) => {
    const actual = syms[0] === syms[1];
    if (isSame === actual) {
      sound.playSuccess();
      const next = score + 1;
      setScore(next);
      if (next >= 10) {
        onFinish(next, `${next} Fast Matches`);
      } else {
        nextPair();
      }
    } else {
      sound.playFail();
      nextPair();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Same or Different?</span>
        <span className="text-emerald-400 font-bold">{score}/10</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-6">
        <div className="flex gap-8 text-4xl text-amber-400">
          <span>{syms[0]}</span>
          <span>{syms[1]}</span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => handleDecision(true)}
            className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs"
          >
            SAME
          </button>
          <button
            onClick={() => handleDecision(false)}
            className="px-6 py-2 bg-neutral-800 text-white font-bold rounded-lg text-xs"
          >
            DIFFERENT
          </button>
        </div>
      </div>
    </div>
  );
}
