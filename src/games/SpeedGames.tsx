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

// 69. Floating Bubble Pop (30s)
export function BubblePopGame({ onFinish }: GameProps) {
  const [score, setScore] = useState(0);

  const pop = () => {
    sound.playTap();
    const next = score + 1;
    setScore(next);
    if (next >= 15) {
      sound.playSuccess();
      onFinish(next, `${next} Bubbles Popped`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Bubble Popper</span>
        <span className="text-cyan-400 font-bold">Popped: {score}/15</span>
      </div>

      <div className="w-full max-w-sm h-48 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center p-4">
        <button
          onClick={pop}
          className="w-20 h-20 rounded-full bg-cyan-500/30 border-2 border-cyan-400 flex items-center justify-center text-3xl active:scale-75 transition-transform"
        >
          🫧
        </button>
      </div>
    </div>
  );
}

// 70. Coin Catcher Basket
export function CoinCatcherGame({ onFinish }: GameProps) {
  const [coins, setCoins] = useState(0);

  const catchCoin = () => {
    sound.playSuccess();
    const next = coins + 1;
    setCoins(next);
    if (next >= 10) {
      onFinish(next, `${next} Gold Coins`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Coin Catcher</span>
        <span className="text-amber-400 font-bold">{coins}/10</span>
      </div>

      <div className="w-full max-w-sm h-48 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col items-center justify-center gap-4">
        <span className="text-4xl animate-bounce">🪙</span>
        <button
          onClick={catchCoin}
          className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs"
        >
          CATCH WITH BASKET 🧺
        </button>
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
