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

// 74. 24 Game Solver (Interactive Expression Builder)
export function Make24Game({ onFinish }: GameProps) {
  const puzzles = [
    [6, 4, 3, 2],
    [8, 6, 2, 2],
    [4, 1, 8, 7],
    [9, 5, 3, 1],
    [7, 5, 3, 2],
  ];

  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [tokens, setTokens] = useState<string[]>([]);
  const [usedCardIndices, setUsedCardIndices] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [evalResult, setEvalResult] = useState<string>('');

  const currentNumbers = puzzles[puzzleIdx % puzzles.length];

  const handleAddNumber = (num: number, idx: number) => {
    if (usedCardIndices.includes(idx)) return;
    sound.playTap();
    setTokens((t) => [...t, String(num)]);
    setUsedCardIndices((u) => [...u, idx]);
  };

  const handleAddOp = (op: string) => {
    sound.playTap();
    setTokens((t) => [...t, op]);
  };

  const handleBackspace = () => {
    if (tokens.length === 0) return;
    sound.playTap();
    const last = tokens[tokens.length - 1];
    setTokens((t) => t.slice(0, -1));

    // If last token was a number, free up the card index
    const num = parseInt(last, 10);
    if (!isNaN(num)) {
      const matchIdx = usedCardIndices.find((ci) => currentNumbers[ci] === num);
      if (matchIdx !== undefined) {
        setUsedCardIndices((u) => {
          const arr = [...u];
          const pos = arr.lastIndexOf(matchIdx);
          if (pos !== -1) arr.splice(pos, 1);
          return arr;
        });
      }
    }
  };

  const handleClear = () => {
    sound.playTap();
    setTokens([]);
    setUsedCardIndices([]);
    setEvalResult('');
  };

  const evaluateExpression = () => {
    if (usedCardIndices.length !== 4) {
      sound.playFail();
      setEvalResult('Must use all 4 cards!');
      return;
    }

    try {
      // Convert × and ÷ to * and /
      const expr = tokens.join(' ').replace(/×/g, '*').replace(/÷/g, '/');
      // eslint-disable-next-line no-eval
      const res = Function(`"use strict"; return (${expr})`)();

      if (Math.abs(res - 24) < 0.001) {
        sound.playSuccess();
        const nextScore = score + 1;
        setScore(nextScore);
        setEvalResult(`= 24! CORRECT! 🎉`);

        if (nextScore >= 2) {
          setTimeout(() => {
            onFinish(nextScore, `${nextScore} Puzzles Solved (Make 24)`);
          }, 800);
        } else {
          setTimeout(() => {
            setPuzzleIdx((i) => i + 1);
            setTokens([]);
            setUsedCardIndices([]);
            setEvalResult('');
          }, 1200);
        }
      } else {
        sound.playFail();
        setEvalResult(`= ${Number(res.toFixed(1))} (Need 24)`);
      }
    } catch {
      sound.playFail();
      setEvalResult('Invalid expression!');
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none max-w-sm mx-auto">
      <div className="flex justify-between w-full text-xs font-mono text-neutral-300 px-2">
        <span className="text-amber-400 font-bold">Make 24 (Combine All 4 Cards)</span>
        <span className="text-cyan-400 font-bold">Solved: {score}/2</span>
      </div>

      <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col items-center gap-4 shadow-2xl">
        {/* 4 Number Cards */}
        <div className="grid grid-cols-4 gap-2.5 w-full">
          {currentNumbers.map((num, idx) => (
            <button
              key={idx}
              onClick={() => handleAddNumber(num, idx)}
              disabled={usedCardIndices.includes(idx)}
              className="h-16 rounded-xl bg-slate-900 border-2 border-amber-500/60 disabled:border-slate-800 disabled:opacity-25 disabled:bg-slate-950 text-white font-mono font-bold text-2xl shadow-md active:scale-95 transition-all"
            >
              {num}
            </button>
          ))}
        </div>

        {/* Expression Display */}
        <div className="w-full min-h-12 bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 flex items-center justify-between font-mono text-lg text-cyan-300">
          <span className="truncate">{tokens.join(' ') || 'Build expression...'}</span>
          <span className="text-xs font-bold text-amber-400 ml-2 whitespace-nowrap">{evalResult}</span>
        </div>

        {/* Operator Controls */}
        <div className="grid grid-cols-6 gap-2 w-full">
          {['+', '-', '×', '÷', '(', ')'].map((op) => (
            <button
              key={op}
              onClick={() => handleAddOp(op)}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold rounded-lg text-lg active:scale-95 transition-all"
            >
              {op}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-3 gap-2 w-full">
          <button
            onClick={handleClear}
            className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs"
          >
            CLEAR
          </button>
          <button
            onClick={handleBackspace}
            className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs"
          >
            ⌫ BACK
          </button>
          <button
            onClick={evaluateExpression}
            className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg text-xs shadow-md shadow-emerald-600/30"
          >
            = 24 ?
          </button>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 font-mono">Use all 4 numbers with + - × ÷ ( ) to total 24</p>
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

// 77. Missing Operator (Dynamic Arithmetic Fill)
export function MissingOperatorGame({ onFinish }: GameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [problem, setProblem] = useState({ a: 12, b: 4, target: 3, correctOp: '÷' });

  const generateProblem = () => {
    const ops = ['+', '-', '×', '÷'] as const;
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = 0;
    let b = 0;
    let target = 0;

    if (op === '+') {
      a = Math.floor(Math.random() * 25) + 5;
      b = Math.floor(Math.random() * 25) + 5;
      target = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * 40) + 15;
      b = Math.floor(Math.random() * 14) + 1;
      target = a - b;
    } else if (op === '×') {
      a = Math.floor(Math.random() * 9) + 2;
      b = Math.floor(Math.random() * 9) + 2;
      target = a * b;
    } else if (op === '÷') {
      b = Math.floor(Math.random() * 8) + 2;
      target = Math.floor(Math.random() * 9) + 2;
      a = b * target;
    }

    setProblem({ a, b, target, correctOp: op });
  };

  useEffect(() => {
    generateProblem();
  }, []);

  const handleOp = (op: string) => {
    if (op === problem.correctOp) {
      sound.playSuccess();
      const nextScore = score + 1;
      setScore(nextScore);
      const nextRound = round + 1;
      setRound(nextRound);

      if (nextRound >= 5) {
        onFinish(nextScore, `${nextScore}/5 Equations Balanced`);
      } else {
        generateProblem();
      }
    } else {
      sound.playFail();
      const nextRound = round + 1;
      setRound(nextRound);
      if (nextRound >= 5) {
        onFinish(score, `${score}/5 Equations Balanced`);
      } else {
        generateProblem();
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none max-w-sm mx-auto">
      <div className="flex justify-between w-full text-xs font-mono text-neutral-300 px-2">
        <span>Missing Operator</span>
        <span className="text-amber-400 font-bold">Round {round + 1}/5</span>
      </div>

      <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center gap-6 shadow-2xl">
        <div className="flex items-center gap-3 text-3xl font-mono font-bold text-white bg-slate-900 border border-slate-700 px-6 py-4 rounded-xl shadow-inner">
          <span>{problem.a}</span>
          <span className="text-amber-400 font-bold px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded-lg">?</span>
          <span>{problem.b}</span>
          <span>=</span>
          <span className="text-cyan-400">{problem.target}</span>
        </div>

        <div className="grid grid-cols-4 gap-3 w-full">
          {['+', '-', '×', '÷'].map((op) => (
            <button
              key={op}
              onClick={() => handleOp(op)}
              className="py-3 bg-slate-800 hover:bg-slate-700 text-2xl font-bold font-mono rounded-xl text-white shadow-md active:scale-95 transition-all"
            >
              {op}
            </button>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-slate-400 font-mono">Select the operator that balances the equation</p>
    </div>
  );
}

// 78. Fraction Visualizer (Interactive Pie Benchmark)
export function FractionPieGame({ onFinish }: GameProps) {
  const fractionList = [
    { num: 1, den: 2, label: '1/2', angle: 180 },
    { num: 3, den: 4, label: '3/4', angle: 270 },
    { num: 2, den: 3, label: '2/3', angle: 240 },
    { num: 1, den: 4, label: '1/4', angle: 90 },
    { num: 5, den: 8, label: '5/8', angle: 225 },
    { num: 3, den: 8, label: '3/8', angle: 135 },
  ];

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);

  const cur = fractionList[round % fractionList.length];
  // Generate 4 multiple choices including the correct one
  const choices = [cur.label, ...fractionList.filter((f) => f.label !== cur.label).slice(0, 3).map((f) => f.label)].sort(
    () => 0.5 - Math.random()
  );

  const choose = (frac: string) => {
    if (frac === cur.label) {
      sound.playSuccess();
      const nextScore = score + 1;
      setScore(nextScore);
    } else {
      sound.playFail();
    }

    const nextRound = round + 1;
    setRound(nextRound);
    if (nextRound >= 5) {
      onFinish(score + (frac === cur.label ? 1 : 0), `${score + (frac === cur.label ? 1 : 0)}/5 Fractions Identified`);
    }
  };

  // SVG Pie Wedge
  const rad = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const startX = 60 + 50 * Math.cos(rad(0));
  const startY = 60 + 50 * Math.sin(rad(0));
  const endX = 60 + 50 * Math.cos(rad(cur.angle));
  const endY = 60 + 50 * Math.sin(rad(cur.angle));
  const largeArc = cur.angle > 180 ? 1 : 0;
  const pathD = `M 60 60 L ${startX} ${startY} A 50 50 0 ${largeArc} 1 ${endX} ${endY} Z`;

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none max-w-sm mx-auto">
      <div className="flex justify-between w-full text-xs font-mono text-neutral-300 px-2">
        <span>Fraction Visualizer</span>
        <span className="text-cyan-400 font-bold">Round {round + 1}/5</span>
      </div>

      <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center gap-6 shadow-2xl">
        {/* Pie SVG */}
        <div className="w-32 h-32 rounded-full border-4 border-slate-700 bg-slate-900 p-1 flex items-center justify-center shadow-lg">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="#1e293b" />
            <path d={pathD} fill="#10b981" />
          </svg>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          {choices.map((f) => (
            <button
              key={f}
              onClick={() => choose(f)}
              className="py-3 bg-slate-800 hover:bg-slate-700 font-mono font-bold rounded-xl text-white text-base shadow-md active:scale-95 transition-all"
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-slate-400 font-mono">Identify the highlighted green sector value</p>
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
