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

// 90. Brick Breaker (2D Canvas Arcade)
export function BrickBreakerGame({ onFinish }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const animRef = useRef<number | null>(null);

  const state = useRef({
    paddleX: 160,
    paddleW: 64,
    paddleH: 10,
    ballX: 160,
    ballY: 190,
    ballVx: 3,
    ballVy: -3.5,
    ballR: 5,
    bricks: [] as { x: number; y: number; w: number; h: number; alive: boolean; color: string }[],
    score: 0,
    lives: 3,
    running: false,
  });

  const initGame = () => {
    const bricks = [];
    const colors = ['#f43f5e', '#fbbf24', '#38bdf8'];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 6; c++) {
        bricks.push({
          x: 18 + c * 48,
          y: 20 + r * 18,
          w: 42,
          h: 12,
          alive: true,
          color: colors[r],
        });
      }
    }

    state.current = {
      paddleX: 160,
      paddleW: 64,
      paddleH: 10,
      ballX: 160,
      ballY: 180,
      ballVx: (Math.random() > 0.5 ? 1 : -1) * (2.5 + Math.random()),
      ballVy: -3.5,
      ballR: 5,
      bricks,
      score: 0,
      lives: 3,
      running: true,
    };

    setScore(0);
    setLives(3);
    setIsPlaying(true);
    setIsGameOver(false);
    sound.playTap();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const s = state.current;
      if (!s.running) return;

      const w = canvas.width;
      const h = canvas.height;

      // Move ball
      s.ballX += s.ballVx;
      s.ballY += s.ballVy;

      // Wall bounce
      if (s.ballX - s.ballR <= 0) {
        s.ballX = s.ballR;
        s.ballVx = Math.abs(s.ballVx);
        sound.playBeep(450, 0.02);
      } else if (s.ballX + s.ballR >= w) {
        s.ballX = w - s.ballR;
        s.ballVx = -Math.abs(s.ballVx);
        sound.playBeep(450, 0.02);
      }

      if (s.ballY - s.ballR <= 0) {
        s.ballY = s.ballR;
        s.ballVy = Math.abs(s.ballVy);
        sound.playBeep(450, 0.02);
      }

      // Paddle collision
      const padY = h - 25;
      const padLeft = s.paddleX - s.paddleW / 2;
      const padRight = s.paddleX + s.paddleW / 2;

      if (
        s.ballY + s.ballR >= padY &&
        s.ballY - s.ballR <= padY + s.paddleH &&
        s.ballX >= padLeft &&
        s.ballX <= padRight &&
        s.ballVy > 0
      ) {
        sound.playTap();
        s.ballVy = -Math.abs(s.ballVy);
        // Angle deflection based on hit position
        const hitOffset = (s.ballX - s.paddleX) / (s.paddleW / 2);
        s.ballVx = hitOffset * 4.5;
      }

      // Brick collision
      for (const b of s.bricks) {
        if (!b.alive) continue;
        if (
          s.ballX + s.ballR >= b.x &&
          s.ballX - s.ballR <= b.x + b.w &&
          s.ballY + s.ballR >= b.y &&
          s.ballY - s.ballR <= b.y + b.h
        ) {
          b.alive = false;
          s.ballVy = -s.ballVy;
          sound.playSuccess();
          s.score += 50;
          setScore(s.score);

          // Check if all bricks cleared
          if (s.bricks.every((br) => !br.alive)) {
            s.running = false;
            setIsPlaying(false);
            setIsGameOver(true);
            sound.playSuccess();
            onFinish(s.score + 200, `${s.score + 200} pts (Cleared!)`);
            return;
          }
          break;
        }
      }

      // Ball missed bottom
      if (s.ballY > h) {
        sound.playFail();
        s.lives -= 1;
        setLives(s.lives);

        if (s.lives <= 0) {
          s.running = false;
          setIsPlaying(false);
          setIsGameOver(true);
          onFinish(s.score, `${s.score} pts`);
          return;
        } else {
          // Reset ball to paddle
          s.ballX = s.paddleX;
          s.ballY = padY - 15;
          s.ballVx = (Math.random() > 0.5 ? 1 : -1) * 3;
          s.ballVy = -3.5;
        }
      }

      // RENDER
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(0, 0, w, h);

      // Draw Bricks
      for (const b of s.bricks) {
        if (!b.alive) continue;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 3);
        ctx.fill();
      }

      // Draw Paddle
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(padLeft, padY, s.paddleW, s.paddleH, 4);
      ctx.fill();

      // Draw Ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, s.ballR, 0, Math.PI * 2);
      ctx.fill();

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!state.current.running) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 320;
    state.current.paddleX = Math.max(state.current.paddleW / 2, Math.min(320 - state.current.paddleW / 2, x));
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
        <div className="flex items-center gap-1.5">
          <span>Lives:</span>
          <span className="text-rose-500 font-bold tracking-widest">
            {'❤️'.repeat(Math.max(0, lives))}
          </span>
        </div>
        <span className="text-amber-400 font-bold">Score: {score}</span>
      </div>

      <div className="relative border border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-950 p-2">
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          className="rounded-xl block bg-slate-900 touch-none cursor-ew-resize"
        />

        {!isPlaying && (
          <div className="absolute inset-2 rounded-xl bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center gap-2.5">
            <span className="text-4xl animate-bounce">🧱</span>
            <h3 className="text-base font-extrabold text-white">
              {isGameOver ? 'Game Over!' : 'Arcade Brick Breaker'}
            </h3>
            <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
              Drag mouse or finger horizontally to slide the paddle. Smash all 18 bricks without dropping the ball!
            </p>
            <button
              onClick={initGame}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 text-xs transition-transform active:scale-95 uppercase tracking-wider"
            >
              {isGameOver ? 'Play Again' : 'Start Brick Breaker'}
            </button>
          </div>
        )}
      </div>
      <p className="text-[11px] text-slate-400 font-mono">Move mouse/finger to control paddle</p>
    </div>
  );
}

// 91. Solo Pong Rally (Wall Volley Challenge)
export function SoloPongGame({ onFinish }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rally, setRally] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const animRef = useRef<number | null>(null);

  const state = useRef({
    paddleY: 120,
    paddleH: 52,
    paddleW: 8,
    ballX: 60,
    ballY: 120,
    ballVx: 3.5,
    ballVy: 2.2,
    ballR: 5,
    rally: 0,
    running: false,
  });

  const startPong = () => {
    state.current = {
      paddleY: 120,
      paddleH: 52,
      paddleW: 8,
      ballX: 60,
      ballY: 120,
      ballVx: 3.5,
      ballVy: (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random()),
      ballR: 5,
      rally: 0,
      running: true,
    };

    setRally(0);
    setIsPlaying(true);
    setIsGameOver(false);
    sound.playTap();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const s = state.current;
      if (!s.running) return;

      const w = canvas.width;
      const h = canvas.height;

      // Ball movement
      s.ballX += s.ballVx;
      s.ballY += s.ballVy;

      // Bounce top & bottom
      if (s.ballY - s.ballR <= 0) {
        s.ballY = s.ballR;
        s.ballVy = Math.abs(s.ballVy);
        sound.playBeep(550, 0.02);
      } else if (s.ballY + s.ballR >= h) {
        s.ballY = h - s.ballR;
        s.ballVy = -Math.abs(s.ballVy);
        sound.playBeep(550, 0.02);
      }

      // Bounce right wall
      if (s.ballX + s.ballR >= w) {
        s.ballX = w - s.ballR;
        s.ballVx = -Math.abs(s.ballVx);
        sound.playBeep(600, 0.02);
      }

      // Paddle collision (Left side at x = 16)
      const padX = 16;
      const padTop = s.paddleY - s.paddleH / 2;
      const padBottom = s.paddleY + s.paddleH / 2;

      if (
        s.ballX - s.ballR <= padX + s.paddleW &&
        s.ballX + s.ballR >= padX &&
        s.ballY >= padTop &&
        s.ballY <= padBottom &&
        s.ballVx < 0
      ) {
        sound.playSuccess();
        s.ballVx = Math.abs(s.ballVx) * 1.05; // Slightly speed up
        const hitOffset = (s.ballY - s.paddleY) / (s.paddleH / 2);
        s.ballVy = hitOffset * 4.2;

        s.rally += 1;
        setRally(s.rally);

        if (s.rally >= 15) {
          s.running = false;
          setIsPlaying(false);
          setIsGameOver(true);
          sound.playSuccess();
          onFinish(15, 'Master Rally 15! 🏓');
          return;
        }
      }

      // Missed left side
      if (s.ballX < 0) {
        s.running = false;
        setIsPlaying(false);
        setIsGameOver(true);
        sound.playFail();
        onFinish(s.rally, `${s.rally} Volleys`);
        return;
      }

      // RENDER
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      // Center dashed net
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Paddle
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(padX, padTop, s.paddleW, s.paddleH, 4);
      ctx.fill();

      // Draw Ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, s.ballR, 0, Math.PI * 2);
      ctx.fill();

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!state.current.running) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = ((e.clientY - rect.top) / rect.height) * 240;
    state.current.paddleY = Math.max(state.current.paddleH / 2, Math.min(240 - state.current.paddleH / 2, y));
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
        <span>Solo Wall Pong</span>
        <span className="text-cyan-400 font-bold">Rally Volleys: {rally}/15</span>
      </div>

      <div className="relative border border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-950 p-2">
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          className="rounded-xl block bg-slate-900 touch-none cursor-ns-resize"
        />

        {!isPlaying && (
          <div className="absolute inset-2 rounded-xl bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center gap-2.5">
            <span className="text-4xl animate-bounce">🏓</span>
            <h3 className="text-base font-extrabold text-white">
              {isGameOver ? 'Rally Over!' : 'Solo Pong Wall Rally'}
            </h3>
            <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
              Slide your paddle vertically with mouse or finger. Rebound the ball off the right wall and sustain the longest rally!
            </p>
            <button
              onClick={startPong}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl shadow-lg shadow-cyan-500/20 text-xs transition-transform active:scale-95 uppercase tracking-wider"
            >
              {isGameOver ? 'Play Again' : 'Start Pong Rally'}
            </button>
          </div>
        )}
      </div>
      <p className="text-[11px] text-slate-400 font-mono">Move mouse/finger up & down to deflect</p>
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
  const symbols = ['🍒', '🍋', '🍇', '💎', '7️⃣', '🔔'];
  const [reels, setReels] = useState(['🍒', '🍋', '🍇']);
  const [isSpinning, setIsSpinning] = useState([false, false, false]);
  const [hasStarted, setHasStarted] = useState(false);
  const animRefs = useRef<(number | null)[]>([null, null, null]);

  const spinReel = (idx: number) => {
    let count = 0;
    const interval = window.setInterval(() => {
      setReels((prev) => {
        const next = [...prev];
        next[idx] = symbols[Math.floor(Math.random() * symbols.length)];
        return next;
      });
      count++;
    }, 80);
    return interval;
  };

  const intervalsRef = useRef<number[]>([]);

  const startSpinAll = () => {
    sound.playTap();
    setHasStarted(true);
    setIsSpinning([true, true, true]);
    intervalsRef.current = [spinReel(0), spinReel(1), spinReel(2)];
  };

  const stopReel = (idx: number) => {
    if (!isSpinning[idx]) return;
    sound.playBeep(440 + idx * 80, 0.08);
    clearInterval(intervalsRef.current[idx]);

    setIsSpinning((prev) => {
      const next = [...prev];
      next[idx] = false;

      // If all stopped
      if (next.every((s) => !s)) {
        setTimeout(() => {
          checkResults();
        }, 300);
      }
      return next;
    });
  };

  const checkResults = () => {
    const [r1, r2, r3] = reels;
    if (r1 === r2 && r2 === r3) {
      sound.playSuccess();
      onFinish(777, `JACKPOT! 3x ${r1} (777 pts)`);
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      sound.playSuccess();
      onFinish(150, `Pair Match! (150 pts)`);
    } else {
      sound.playFail();
      onFinish(50, `Spin completed: ${r1} ${r2} ${r3}`);
    }
  };

  useEffect(() => {
    return () => {
      intervalsRef.current.forEach(clearInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none max-w-sm mx-auto">
      <div className="flex justify-between w-full text-xs font-mono text-neutral-300 px-2">
        <span>Fruit Slot Machine</span>
        <span className="text-amber-400 font-bold">Skill Stop Action</span>
      </div>

      <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center gap-6 shadow-2xl">
        {/* Slot Window */}
        <div className="grid grid-cols-3 gap-3 w-full p-4 bg-slate-900 border-2 border-amber-500/50 rounded-xl shadow-inner">
          {reels.map((sym, i) => (
            <div
              key={i}
              className={`h-24 bg-slate-950 border border-slate-700 rounded-lg flex items-center justify-center text-4xl shadow-md ${
                isSpinning[i] ? 'animate-pulse blur-xs' : ''
              }`}
            >
              {sym}
            </div>
          ))}
        </div>

        {/* Skill Stop Buttons */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => stopReel(idx)}
              disabled={!isSpinning[idx]}
              className="py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-extrabold rounded-xl text-xs shadow-md active:scale-95 transition-all"
            >
              STOP {idx + 1}
            </button>
          ))}
        </div>

        {/* Master Spin Lever */}
        <button
          onClick={startSpinAll}
          disabled={isSpinning.some(Boolean)}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
        >
          {hasStarted && !isSpinning.some(Boolean) ? 'SPIN AGAIN 🎰' : 'PULL LEVER TO SPIN 🎰'}
        </button>
      </div>
      <p className="text-[11px] text-slate-400 font-mono">Use STOP 1, 2, 3 buttons to time your stops</p>
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

// 100. Putting Precision Mini-Golf (2D Turf Physics & Drag Aim)
export function MiniGolfGame({ onFinish }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = useState(0);
  const [isHoleIn, setIsHoleIn] = useState(false);
  const animRef = useRef<number | null>(null);

  const state = useRef({
    ballX: 60,
    ballY: 120,
    ballVx: 0,
    ballVy: 0,
    ballR: 6,
    holeX: 260,
    holeY: 120,
    holeR: 12,
    isAiming: false,
    dragStartX: 0,
    dragStartY: 0,
    currentDragX: 0,
    currentDragY: 0,
    strokes: 0,
    inHole: false,
  });

  const resetHole = () => {
    state.current = {
      ballX: 60,
      ballY: 120,
      ballVx: 0,
      ballVy: 0,
      ballR: 6,
      holeX: 260,
      holeY: 120,
      holeR: 12,
      isAiming: false,
      dragStartX: 0,
      dragStartY: 0,
      currentDragX: 0,
      currentDragY: 0,
      strokes: 0,
      inHole: false,
    };
    setStrokes(0);
    setIsHoleIn(false);
    startLoop();
  };

  const startLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const s = state.current;
      const w = canvas.width;
      const h = canvas.height;

      // Ball physics
      if (!s.inHole && (Math.abs(s.ballVx) > 0.05 || Math.abs(s.ballVy) > 0.05)) {
        s.ballX += s.ballVx;
        s.ballY += s.ballVy;

        // Sand bunker friction (Sand rectangle between x: 140-180, y: 70-170)
        const inSand = s.ballX > 140 && s.ballX < 180 && s.ballY > 70 && s.ballY < 170;
        const friction = inSand ? 0.92 : 0.982;
        s.ballVx *= friction;
        s.ballVy *= friction;

        // Wall collisions
        if (s.ballX - s.ballR <= 12) {
          s.ballX = 12 + s.ballR;
          s.ballVx = -s.ballVx * 0.8;
          sound.playBeep(300, 0.02);
        } else if (s.ballX + s.ballR >= w - 12) {
          s.ballX = w - 12 - s.ballR;
          s.ballVx = -s.ballVx * 0.8;
          sound.playBeep(300, 0.02);
        }

        if (s.ballY - s.ballR <= 12) {
          s.ballY = 12 + s.ballR;
          s.ballVy = -s.ballVy * 0.8;
          sound.playBeep(300, 0.02);
        } else if (s.ballY + s.ballR >= h - 12) {
          s.ballY = h - 12 - s.ballR;
          s.ballVy = -s.ballVy * 0.8;
          sound.playBeep(300, 0.02);
        }

        // Cup collision check
        const distToHole = Math.hypot(s.ballX - s.holeX, s.ballY - s.holeY);
        const speed = Math.hypot(s.ballVx, s.ballVy);

        if (distToHole < s.holeR && speed < 3.8) {
          s.inHole = true;
          s.ballX = s.holeX;
          s.ballY = s.holeY;
          s.ballVx = 0;
          s.ballVy = 0;
          setIsHoleIn(true);
          sound.playSuccess();
          onFinish(s.strokes, `Hole in ${s.strokes}! ⛳`);
        }
      } else {
        s.ballVx = 0;
        s.ballVy = 0;
      }

      // RENDER
      // Fairway Grass
      ctx.fillStyle = '#14532d';
      ctx.fillRect(0, 0, w, h);

      // Wood Borders
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, w - 12, h - 12);

      // Sand Bunker
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.roundRect(140, 70, 40, 100, 12);
      ctx.fill();

      // Putting Green area around cup
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(s.holeX, s.holeY, 32, 0, Math.PI * 2);
      ctx.fill();

      // Cup
      ctx.fillStyle = '#052e16';
      ctx.beginPath();
      ctx.arc(s.holeX, s.holeY, s.holeR, 0, Math.PI * 2);
      ctx.fill();

      // Pin Flag
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.holeX, s.holeY);
      ctx.lineTo(s.holeX, s.holeY - 26);
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(s.holeX, s.holeY - 26);
      ctx.lineTo(s.holeX + 14, s.holeY - 20);
      ctx.lineTo(s.holeX, s.holeY - 14);
      ctx.closePath();
      ctx.fill();

      // Aiming Sling Guide
      if (s.isAiming) {
        const dx = s.dragStartX - s.currentDragX;
        const dy = s.dragStartY - s.currentDragY;
        const power = Math.min(100, Math.hypot(dx, dy));

        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(s.ballX, s.ballY);
        ctx.lineTo(s.ballX + (dx / Math.max(1, Math.hypot(dx, dy))) * power * 0.8, s.ballY + (dy / Math.max(1, Math.hypot(dx, dy))) * power * 0.8);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Golf Ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, s.ballR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.stroke();

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    startLoop();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = state.current;
    if (s.inHole || Math.hypot(s.ballVx, s.ballVy) > 0.1) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 320;
    const y = ((e.clientY - rect.top) / rect.height) * 240;

    s.isAiming = true;
    s.dragStartX = x;
    s.dragStartY = y;
    s.currentDragX = x;
    s.currentDragY = y;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = state.current;
    if (!s.isAiming) return;
    const rect = e.currentTarget.getBoundingClientRect();
    s.currentDragX = ((e.clientX - rect.left) / rect.width) * 320;
    s.currentDragY = ((e.clientY - rect.top) / rect.height) * 240;
  };

  const handlePointerUp = () => {
    const s = state.current;
    if (!s.isAiming) return;
    s.isAiming = false;

    const dx = s.dragStartX - s.currentDragX;
    const dy = s.dragStartY - s.currentDragY;
    const dist = Math.hypot(dx, dy);

    if (dist > 8) {
      sound.playTap();
      const power = Math.min(12, dist * 0.14);
      const angle = Math.atan2(dy, dx);
      s.ballVx = Math.cos(angle) * power;
      s.ballVy = Math.sin(angle) * power;
      s.strokes += 1;
      setStrokes(s.strokes);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none max-w-sm mx-auto">
      <div className="flex justify-between items-center w-full text-xs font-mono text-neutral-300 px-2">
        <span className="text-emerald-400 font-bold">Putting Green (Par 2)</span>
        <span className="text-amber-400 font-bold">Strokes: {strokes}</span>
      </div>

      <div className="relative border border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-950 p-2">
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="rounded-xl block bg-emerald-950 touch-none cursor-crosshair"
        />

        {isHoleIn && (
          <div className="absolute inset-2 rounded-xl bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center gap-2.5">
            <span className="text-5xl animate-bounce">⛳</span>
            <h3 className="text-base font-extrabold text-white">Sunk in the Cup!</h3>
            <p className="text-xs text-slate-300">
              {strokes === 1 ? 'HOLE IN ONE! Incredible putt!' : `Completed in ${strokes} strokes!`}
            </p>
            <button
              onClick={resetHole}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 text-xs transition-transform active:scale-95 uppercase tracking-wider"
            >
              Putt Again
            </button>
          </div>
        )}
      </div>
      <p className="text-[11px] text-slate-400 font-mono">Drag backward from ball to aim & adjust power</p>
    </div>
  );
}
