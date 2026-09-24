import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';
import { GameProps } from './ReflexGames';

// 89. Classic Snake (Canvas 2D)
export function RetroSnakeGame({ onFinish }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animRef = useRef<number | null>(null);

  const state = useRef({
    snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
    dir: { x: 0, y: -1 },
    food: { x: 5, y: 5 },
    running: false,
    score: 0,
    lastTick: 0,
  });

  const startSnake = () => {
    state.current = {
      snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
      dir: { x: 0, y: -1 },
      food: { x: Math.floor(Math.random() * 18) + 1, y: Math.floor(Math.random() * 18) + 1 },
      running: true,
      score: 0,
      lastTick: performance.now(),
    };
    setIsPlaying(true);
    setScore(0);
    sound.playTap();

    const loop = (now: number) => {
      const s = state.current;
      if (!s.running) return;

      if (now - s.lastTick > 120) {
        s.lastTick = now;
        const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };

        // Wall collision (20x20 grid)
        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
          s.running = false;
          setIsPlaying(false);
          sound.playFail();
          onFinish(s.score, `${s.score} apples`);
          return;
        }

        // Self collision
        if (s.snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
          s.running = false;
          setIsPlaying(false);
          sound.playFail();
          onFinish(s.score, `${s.score} apples`);
          return;
        }

        s.snake.unshift(head);

        // Food eating
        if (head.x === s.food.x && head.y === s.food.y) {
          sound.playSuccess();
          s.score += 1;
          setScore(s.score);
          s.food = { x: Math.floor(Math.random() * 18) + 1, y: Math.floor(Math.random() * 18) + 1 };
        } else {
          s.snake.pop();
        }

        // Render
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, 240, 240);

            // Food
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(s.food.x * 12, s.food.y * 12, 11, 11);

            // Snake
            ctx.fillStyle = '#10b981';
            for (let i = 0; i < s.snake.length; i++) {
              ctx.fillStyle = i === 0 ? '#34d399' : '#10b981';
              ctx.fillRect(s.snake[i].x * 12, s.snake[i].y * 12, 11, 11);
            }
          }
        }
      }

      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
  };

  const changeDir = (dx: number, dy: number) => {
    const s = state.current;
    if (s.dir.x + dx !== 0 || s.dir.y + dy !== 0) {
      s.dir = { x: dx, y: dy };
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!state.current.running) return;
      if (e.key === 'ArrowUp') changeDir(0, -1);
      if (e.key === 'ArrowDown') changeDir(0, 1);
      if (e.key === 'ArrowLeft') changeDir(-1, 0);
      if (e.key === 'ArrowRight') changeDir(1, 0);
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      state.current.running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Retro Snake</span>
        <span className="text-emerald-400 font-bold">Apples: {score}</span>
      </div>

      <div className="relative border border-neutral-800 rounded-xl overflow-hidden">
        <canvas ref={canvasRef} width={240} height={240} className="block w-[240px] h-[240px] bg-slate-900" />
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-4">
            <button
              onClick={startSnake}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-md text-sm"
            >
              Start Snake
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5 w-36">
        <div />
        <button onClick={() => changeDir(0, -1)} className="p-2 bg-neutral-800 text-white rounded">▲</button>
        <div />
        <button onClick={() => changeDir(-1, 0)} className="p-2 bg-neutral-800 text-white rounded">◀</button>
        <button onClick={() => changeDir(0, 1)} className="p-2 bg-neutral-800 text-white rounded">▼</button>
        <button onClick={() => changeDir(1, 0)} className="p-2 bg-neutral-800 text-white rounded">▶</button>
      </div>
    </div>
  );
}

// 90. Brick Breaker
export function BrickBreakerGame({ onFinish }: GameProps) {
  const [score, setScore] = useState(0);

  const smash = () => {
    sound.playSuccess();
    const next = score + 100;
    setScore(next);
    if (next >= 500) {
      onFinish(next, 'Bricks Cleared! (500 pts)');
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Brick Breaker</span>
        <span className="text-amber-400 font-bold">Score: {score}</span>
      </div>

      <div className="w-full max-w-sm h-48 bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center justify-between">
        <div className="grid grid-cols-6 gap-2 w-full">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="h-4 bg-rose-500 rounded shadow-md" />
          ))}
        </div>
        <button
          onClick={smash}
          className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs"
        >
          DEFLECT BALL 🏓
        </button>
      </div>
    </div>
  );
}

// 91. Solo Pong Rally
export function SoloPongGame({ onFinish }: GameProps) {
  const [rally, setRally] = useState(0);

  const hit = () => {
    sound.playTap();
    const next = rally + 1;
    setRally(next);
    if (next >= 12) {
      sound.playSuccess();
      onFinish(next, `${next} Rally Volleys`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Solo Pong Rally</span>
        <span className="text-cyan-400 font-bold">Rally: {rally}/12</span>
      </div>

      <div className="w-full max-w-sm h-48 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col items-center justify-center p-4 gap-4">
        <div className="text-4xl animate-bounce">⚪</div>
        <button
          onClick={hit}
          className="px-8 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs"
        >
          RETURN VOLLEY
        </button>
      </div>
    </div>
  );
}

// 92. Starship Asteroid Dodger
export function SpaceAsteroidsGame({ onFinish }: GameProps) {
  const [score, setScore] = useState(0);

  const dodge = () => {
    sound.playSuccess();
    const next = score + 1;
    setScore(next);
    if (next >= 10) {
      onFinish(next, `${next} Asteroids Dodged`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Asteroid Dodger</span>
        <span className="text-cyan-400 font-bold">Cleared: {score}/10</span>
      </div>

      <div className="w-full max-w-sm h-48 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col items-center justify-center p-4 gap-4">
        <span className="text-4xl">🚀</span>
        <button
          onClick={dodge}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs"
        >
          THRUST BURST
        </button>
      </div>
    </div>
  );
}

// 93. Vertical Bouncer Platformer
export function VerticalBouncerGame({ onFinish }: GameProps) {
  const [height, setHeight] = useState(0);

  const bounce = () => {
    sound.playTap();
    const next = height + 50;
    setHeight(next);
    if (next >= 500) {
      sound.playSuccess();
      onFinish(next, `${next}m Altitude Climbed`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Vertical Bouncer</span>
        <span className="text-emerald-400 font-bold">{height}m</span>
      </div>

      <div className="w-full max-w-sm h-48 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col items-center justify-center p-4 gap-4">
        <div className="text-4xl animate-bounce">🦘</div>
        <button
          onClick={bounce}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
        >
          BOUNCE HIGHER
        </button>
      </div>
    </div>
  );
}

// 94. Mini Pinball Bumpers
export function MiniPinballGame({ onFinish }: GameProps) {
  const [points, setPoints] = useState(0);

  const flip = () => {
    sound.playSuccess();
    const next = points + 250;
    setPoints(next);
    if (next >= 1500) {
      onFinish(next, `${next} Pinball Score`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Pinball Bumpers</span>
        <span className="text-amber-400 font-bold">Score: {points}</span>
      </div>

      <div className="w-full max-w-sm h-48 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col items-center justify-center p-4 gap-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center font-bold text-white text-xs">
            100
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center font-bold text-black text-xs">
            250
          </div>
        </div>
        <button
          onClick={flip}
          className="px-8 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs"
        >
          TRIGGER FLIPPERS
        </button>
      </div>
    </div>
  );
}

// 95. Pachinko Steel Ball Peg Maze
export function PachinkoDropGame({ onFinish }: GameProps) {
  const [drops, setDrops] = useState(0);

  const dropBall = () => {
    sound.playTap();
    const next = drops + 1;
    setDrops(next);
    if (next >= 5) {
      sound.playSuccess();
      onFinish(next * 100, `${next * 100} Pachinko Credits`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Pachinko Pegs</span>
        <span className="text-cyan-400 font-bold">Drops: {drops}/5</span>
      </div>

      <div className="w-full max-w-sm h-48 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col items-center justify-center p-4 gap-4">
        <span className="text-4xl animate-bounce">⚪</span>
        <button
          onClick={dropBall}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs"
        >
          LAUNCH STEEL BALL
        </button>
      </div>
    </div>
  );
}

// 96. Motorized Coin Pusher Shelf
export function CoinPusherGame({ onFinish }: GameProps) {
  const [pushed, setPushed] = useState(0);

  const push = () => {
    sound.playSuccess();
    const next = pushed + 3;
    setPushed(next);
    if (next >= 15) {
      onFinish(next, `${next} Coins Over Edge!`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Coin Pusher</span>
        <span className="text-amber-400 font-bold">Cascaded: {pushed}/15</span>
      </div>

      <div className="w-full max-w-sm h-48 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col items-center justify-center p-4 gap-4">
        <div className="flex gap-1 text-2xl">🪙🪙🪙</div>
        <button
          onClick={push}
          className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs"
        >
          CYCLE PUSHER BLADE
        </button>
      </div>
    </div>
  );
}

// 97. 3-Reel Fruit Machine Skill Stop
export function SlotReelsGame({ onFinish }: GameProps) {
  const symbols = ['🍒', '🍋', '🍇', '💎', '7️⃣'];
  const [reels, setReels] = useState(['🍒', '🍋', '🍇']);

  const spin = () => {
    sound.playTap();
    const r1 = symbols[Math.floor(Math.random() * symbols.length)];
    const r2 = symbols[Math.floor(Math.random() * symbols.length)];
    const r3 = symbols[Math.floor(Math.random() * symbols.length)];
    setReels([r1, r2, r3]);

    if (r1 === r2 && r2 === r3) {
      sound.playSuccess();
      onFinish(500, `JACKPOT! 3x ${r1}`);
    } else {
      onFinish(50, `Spun: ${r1} ${r2} ${r3}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Slot Machine</span>
        <span className="text-amber-400 font-bold">Skill Stop</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-6">
        <div className="flex gap-4 p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-4xl">
          <span>{reels[0]}</span>
          <span>{reels[1]}</span>
          <span>{reels[2]}</span>
        </div>
        <button
          onClick={spin}
          className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm"
        >
          PULL LEVER 🎰
        </button>
      </div>
    </div>
  );
}

// 98. Bubble Cluster Cannon
export function BubbleCannonGame({ onFinish }: GameProps) {
  const [cleared, setCleared] = useState(0);

  const fire = () => {
    sound.playSuccess();
    const next = cleared + 3;
    setCleared(next);
    if (next >= 12) {
      onFinish(next, `${next} Bubbles Cleared`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Bubble Cannon</span>
        <span className="text-cyan-400 font-bold">Cleared: {cleared}/12</span>
      </div>

      <div className="w-full max-w-sm h-48 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col items-center justify-center p-4 gap-4">
        <div className="flex gap-2 text-3xl">🔵🔴🟢</div>
        <button
          onClick={fire}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs"
        >
          AIM & FIRE BUBBLE
        </button>
      </div>
    </div>
  );
}

// 99. Match-3 Gem Blitz
export function JewelBlitzGame({ onFinish }: GameProps) {
  const [combos, setCombos] = useState(0);

  const swap = () => {
    sound.playSuccess();
    const next = combos + 1;
    setCombos(next);
    if (next >= 5) {
      onFinish(next * 200, `${next * 200} Gem Cascade Points`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Jewel Blitz</span>
        <span className="text-amber-400 font-bold">Combos: {combos}/5</span>
      </div>

      <div className="w-full max-w-sm h-48 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col items-center justify-center p-4 gap-4">
        <div className="flex gap-2 text-3xl">💎✨💍💎</div>
        <button
          onClick={swap}
          className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs"
        >
          SWAP ADJACENT GEMS
        </button>
      </div>
    </div>
  );
}

// 100. Putting Precision Mini-Golf
export function MiniGolfGame({ onFinish }: GameProps) {
  const [strokes, setStrokes] = useState(0);

  const putt = () => {
    sound.playSuccess();
    const next = strokes + 1;
    setStrokes(next);
    onFinish(next, `Hole in ${next}! ⛳`);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Putting Precision</span>
        <span className="text-emerald-400 font-bold">Par 2</span>
      </div>

      <div className="w-full max-w-sm h-48 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col items-center justify-center p-4 gap-4">
        <div className="flex items-center gap-12 text-3xl">
          <span>⛳</span>
          <span className="animate-pulse">⚪</span>
        </div>
        <button
          onClick={putt}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
        >
          PUTT TOWARDS CUP
        </button>
      </div>
    </div>
  );
}
