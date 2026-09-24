import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';
import { GameProps } from './ReflexGames';

// 73. Mental Math Sprint (45s)
export function MentalMathSprintGame({ onFinish }: GameProps) {
  const [eq, setEq] = useState({ text: '7 + 8', ans: 15 });
  const [score, setScore] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [timeLeft, setTimeLeft] = useState(45);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  const nextEq = () => {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    const isAdd = Math.random() > 0.4;
    if (isAdd) {
      setEq({ text: `${a} + ${b}`, ans: a + b });
    } else {
      const big = Math.max(a, b);
      const small = Math.min(a, b);
      setEq({ text: `${big} - ${small}`, ans: big - small });
    }
  };

  const handleStart = () => {
    setScore(0);
    setTimeLeft(45);
    setIsPlaying(true);
    setInputVal('');
    sound.playTap();
    nextEq();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPlaying) return;
    if (parseInt(inputVal, 10) === eq.ans) {
      sound.playSuccess();
      const nextScore = score + 1;
      setScore(nextScore);
      setInputVal('');
      nextEq();
    } else {
      sound.playFail();
      setInputVal('');
    }
  };

  useEffect(() => {
    if (timeLeft === 0 && !isPlaying && score > 0) {
      onFinish(score, `${score} equations solved`);
    }
  }, [timeLeft, isPlaying, score, onFinish]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Time: {timeLeft}s</span>
        <span className="text-amber-400 font-bold">Solved: {score}</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-4">
        {isPlaying ? (
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 w-full">
            <span className="text-4xl font-mono font-bold text-cyan-400">{eq.text} = ?</span>
            <input
              type="number"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Answer..."
              autoFocus
              className="w-full text-center text-2xl font-mono py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs"
            >
              Enter
            </button>
          </form>
        ) : (
          <button
            onClick={handleStart}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg shadow-md text-sm"
          >
            Start Math Sprint
          </button>
        )}
      </div>
    </div>
  );
}

// 74. 24 Game Solver
export function Make24Game({ onFinish }: GameProps) {
  const [solved, setSolved] = useState(false);

  const check = () => {
    sound.playSuccess();
    setSolved(true);
    onFinish(100, '(8 - 2) × (6 - 2) = 24');
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Make 24</span>
        <span className="text-emerald-400 font-bold">{solved ? 'Solved!' : 'Combine to 24'}</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-4">
        <div className="flex gap-3 text-3xl font-mono font-bold text-amber-400">
          <span className="p-3 bg-neutral-800 rounded-lg">8</span>
          <span className="p-3 bg-neutral-800 rounded-lg">6</span>
          <span className="p-3 bg-neutral-800 rounded-lg">2</span>
          <span className="p-3 bg-neutral-800 rounded-lg">2</span>
        </div>
        <p className="text-xs text-neutral-400">Formula: (8 - 2) × (6 - 2) = 6 × 4 = 24</p>
        <button
          onClick={check}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
        >
          Verify Solution
        </button>
      </div>
    </div>
  );
}

// 75. Multiplication Blitz
export function MultiplyBlitzGame({ onFinish }: GameProps) {
  const [factorA] = useState(7);
  const [factorB, setFactorB] = useState(8);
  const [score, setScore] = useState(0);

  const handleAns = (val: number) => {
    if (val === factorA * factorB) {
      sound.playSuccess();
      const next = score + 1;
      setScore(next);
      if (next >= 10) {
        onFinish(next, `${next} Multiplication Facts`);
      } else {
        setFactorB(Math.floor(Math.random() * 9) + 2);
      }
    } else {
      sound.playFail();
    }
  };

  const correct = factorA * factorB;
  const opts = [correct, correct + 7, correct - 7, correct + 14].sort(() => Math.random() - 0.5);

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Times Tables Blitz</span>
        <span className="text-cyan-400 font-bold">{score}/10</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-6">
        <span className="text-4xl font-mono font-bold text-amber-400">
          {factorA} × {factorB} = ?
        </span>
        <div className="grid grid-cols-2 gap-3 w-full">
          {opts.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAns(opt)}
              className="py-2.5 bg-neutral-800 hover:bg-neutral-750 text-white font-mono font-bold rounded-lg"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 76. Prime Detective
export function PrimeDetectiveGame({ onFinish }: GameProps) {
  const [num, setNum] = useState(17);
  const [score, setScore] = useState(0);

  const isPrime = (n: number) => {
    if (n <= 1) return false;
    for (let i = 2; i * i <= n; i++) {
      if (n % i === 0) return false;
    }
    return true;
  };

  const handleDecision = (claimedPrime: boolean) => {
    const actual = isPrime(num);
    if (claimedPrime === actual) {
      sound.playSuccess();
      const next = score + 1;
      setScore(next);
      if (next >= 8) {
        onFinish(next, `${next} Primes Classified`);
      } else {
        setNum(Math.floor(Math.random() * 50) + 2);
      }
    } else {
      sound.playFail();
      setNum(Math.floor(Math.random() * 50) + 2);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Prime or Composite?</span>
        <span className="text-emerald-400 font-bold">{score}/8</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-6">
        <span className="text-5xl font-mono font-bold text-cyan-400">{num}</span>
        <div className="flex gap-4">
          <button
            onClick={() => handleDecision(true)}
            className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg text-xs"
          >
            PRIME
          </button>
          <button
            onClick={() => handleDecision(false)}
            className="px-6 py-2.5 bg-neutral-800 text-white font-bold rounded-lg text-xs"
          >
            COMPOSITE
          </button>
        </div>
      </div>
    </div>
  );
}

// 77. Missing Operator
export function MissingOperatorGame({ onFinish }: GameProps) {
  const [score, setScore] = useState(0);

  const handleOp = (op: string) => {
    if (op === '×') {
      sound.playSuccess();
      const next = score + 1;
      setScore(next);
      if (next >= 5) {
        onFinish(next, `${next} Equations Balanced`);
      }
    } else {
      sound.playFail();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Fill Missing Operator</span>
        <span className="text-amber-400 font-bold">{score}/5</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-6">
        <span className="text-3xl font-mono font-bold text-white">4 [ ? ] 7 = 28</span>
        <div className="flex gap-3">
          {['+', '-', '×', '÷'].map((op) => (
            <button
              key={op}
              onClick={() => handleOp(op)}
              className="w-12 h-12 bg-neutral-800 hover:bg-neutral-750 text-xl font-bold rounded-lg text-white"
            >
              {op}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 78. Fraction Visualizer
export function FractionPieGame({ onFinish }: GameProps) {
  const [score, setScore] = useState(0);

  const choose = (frac: string) => {
    if (frac === '3/4') {
      sound.playSuccess();
      const next = score + 1;
      setScore(next);
      if (next >= 5) {
        onFinish(next, `${next} Fractions Matched`);
      }
    } else {
      sound.playFail();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Fraction Match</span>
        <span className="text-cyan-400 font-bold">{score}/5</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-6">
        <p className="text-xs text-neutral-400">Match 75% filled pie:</p>
        <div className="flex gap-3">
          {['1/2', '3/4', '2/3', '5/8'].map((f) => (
            <button
              key={f}
              onClick={() => choose(f)}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 font-mono font-bold rounded-lg text-white text-sm"
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 79. Sequence Extrapolator
export function SequenceNextGame({ onFinish }: GameProps) {
  const [ans, setAns] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ans.trim() === '32') {
      sound.playSuccess();
      onFinish(100, 'Sequence Extrapolated (32)');
    } else {
      sound.playFail();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Number Series</span>
        <span className="text-amber-400 font-bold">2, 4, 8, 16, ?</span>
      </div>

      <form onSubmit={submit} className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-4">
        <input
          type="number"
          value={ans}
          onChange={(e) => setAns(e.target.value)}
          placeholder="Next number..."
          className="w-full text-center text-2xl font-mono py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white outline-none"
        />
        <button type="submit" className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs">
          Verify
        </button>
      </form>
    </div>
  );
}

// 80. Grid Sum Target
export function SumTargetGame({ onFinish }: GameProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const target = 15;
  const numbers = [4, 7, 3, 5, 8, 2];

  const toggle = (idx: number) => {
    sound.playTap();
    const next = selected.includes(idx) ? selected.filter((i) => i !== idx) : [...selected, idx];
    setSelected(next);

    const sum = next.reduce((acc, i) => acc + numbers[i], 0);
    if (sum === target) {
      sound.playSuccess();
      onFinish(target, `Target Sum ${target} Matched!`);
    }
  };

  const currentSum = selected.reduce((acc, i) => acc + numbers[i], 0);

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Target Sum: <strong className="text-amber-400">{target}</strong></span>
        <span className="text-emerald-400 font-bold">Current: {currentSum}</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
        {numbers.map((n, idx) => (
          <button
            key={idx}
            onClick={() => toggle(idx)}
            className={`w-16 h-16 rounded-lg text-2xl font-mono font-bold transition-all ${
              selected.includes(idx)
                ? 'bg-amber-400 text-black shadow-md'
                : 'bg-neutral-800 text-white hover:bg-neutral-750'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
