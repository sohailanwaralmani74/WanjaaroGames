import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';
import { GameProps } from './ReflexGames';

// 41. Lights Out 3x3
export function LightsOutGame({ onFinish }: GameProps) {
  const [grid, setGrid] = useState<boolean[]>([
    false, true, false,
    true, true, true,
    false, true, false
  ]);
  const [moves, setMoves] = useState(0);

  const toggleCell = (i: number) => {
    sound.playTap();
    const next = [...grid];
    const row = Math.floor(i / 3);
    const col = i % 3;

    const flip = (r: number, c: number) => {
      if (r >= 0 && r < 3 && c >= 0 && c < 3) {
        const idx = r * 3 + c;
        next[idx] = !next[idx];
      }
    };

    flip(row, col);
    flip(row - 1, col);
    flip(row + 1, col);
    flip(row, col - 1);
    flip(row, col + 1);

    setGrid(next);
    const nextMoves = moves + 1;
    setMoves(nextMoves);

    // If all false -> victory
    if (next.every((v) => !v)) {
      sound.playSuccess();
      onFinish(nextMoves, `${nextMoves} moves`);
    }
  };

  const handleReset = () => {
    setGrid([false, true, false, true, true, true, false, true, false]);
    setMoves(0);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Lights Out (3x3)</span>
        <span className="text-amber-400 font-bold">Moves: {moves}</span>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
        {grid.map((isOn, idx) => (
          <button
            key={idx}
            onClick={() => toggleCell(idx)}
            className={`w-18 h-18 sm:w-20 sm:h-20 rounded-xl transition-all active:scale-95 ${
              isOn
                ? 'bg-amber-400 shadow-lg shadow-amber-400/50'
                : 'bg-neutral-800 hover:bg-neutral-750'
            }`}
          />
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleReset}
          className="text-xs px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700"
        >
          Reset Lights
        </button>
      </div>
    </div>
  );
}

// 42. Sliding 8 Tile Puzzle
export function Sliding8Game({ onFinish }: GameProps) {
  const [board, setBoard] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 0, 8]); // 0 is empty
  const [moves, setMoves] = useState(0);

  const moveTile = (idx: number) => {
    const emptyIdx = board.indexOf(0);
    const r1 = Math.floor(idx / 3);
    const c1 = idx % 3;
    const r2 = Math.floor(emptyIdx / 3);
    const c2 = emptyIdx % 3;

    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1) {
      sound.playTap();
      const next = [...board];
      next[emptyIdx] = next[idx];
      next[idx] = 0;
      setBoard(next);
      const nextMoves = moves + 1;
      setMoves(nextMoves);

      // Check victory
      const win = next.slice(0, 8).every((v, i) => v === i + 1) && next[8] === 0;
      if (win) {
        sound.playSuccess();
        onFinish(nextMoves, `${nextMoves} moves`);
      }
    }
  };

  const handleShuffle = () => {
    setBoard([1, 2, 3, 4, 0, 5, 7, 8, 6]);
    setMoves(0);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Sliding 8 Puzzle</span>
        <span className="text-cyan-400 font-bold">Moves: {moves}</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
        {board.map((num, idx) => (
          <button
            key={idx}
            onClick={() => moveTile(idx)}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg text-2xl font-mono font-bold flex items-center justify-center transition-all ${
              num === 0
                ? 'bg-neutral-950 border border-dashed border-neutral-800 cursor-default'
                : 'bg-neutral-800 hover:bg-neutral-750 text-white shadow-md active:scale-95'
            }`}
          >
            {num !== 0 ? num : ''}
          </button>
        ))}
      </div>

      <button
        onClick={handleShuffle}
        className="text-xs px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700"
      >
        Shuffle
      </button>
    </div>
  );
}

// 43. Tower of Hanoi (3 Disks)
export function TowerHanoiGame({ onFinish }: GameProps) {
  const [pegs, setPegs] = useState<number[][]>([[3, 2, 1], [], []]);
  const [selectedPeg, setSelectedPeg] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);

  const handlePegClick = (pegIdx: number) => {
    sound.playTap();
    if (selectedPeg === null) {
      if (pegs[pegIdx].length > 0) {
        setSelectedPeg(pegIdx);
      }
    } else {
      if (selectedPeg === pegIdx) {
        setSelectedPeg(null);
      } else {
        const fromPeg = [...pegs[selectedPeg]];
        const toPeg = [...pegs[pegIdx]];
        const disk = fromPeg[fromPeg.length - 1];
        const topOfTo = toPeg[toPeg.length - 1];

        if (topOfTo === undefined || disk < topOfTo) {
          // Valid move
          fromPeg.pop();
          toPeg.push(disk);
          const nextPegs = [...pegs];
          nextPegs[selectedPeg] = fromPeg;
          nextPegs[pegIdx] = toPeg;
          setPegs(nextPegs);
          setSelectedPeg(null);
          const nextMoves = moves + 1;
          setMoves(nextMoves);

          // Victory if peg 2 has [3,2,1]
          if (nextPegs[2].length === 3) {
            sound.playSuccess();
            onFinish(nextMoves, `${nextMoves} moves (Optimal: 7)`);
          }
        } else {
          sound.playFail();
          setSelectedPeg(null);
        }
      }
    }
  };

  const handleReset = () => {
    setPegs([[3, 2, 1], [], []]);
    setSelectedPeg(null);
    setMoves(0);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Tower of Hanoi</span>
        <span className="text-amber-400 font-bold">Moves: {moves}</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex justify-around items-end h-48">
        {pegs.map((peg, idx) => (
          <div
            key={idx}
            onClick={() => handlePegClick(idx)}
            className={`w-24 h-40 flex flex-col-reverse items-center cursor-pointer relative rounded-lg border-2 ${
              selectedPeg === idx ? 'border-amber-400 bg-neutral-850' : 'border-transparent hover:bg-neutral-850'
            }`}
          >
            {/* Peg Rod */}
            <div className="absolute bottom-0 w-2 h-36 bg-neutral-700 rounded-t pointer-events-none" />

            {/* Disks */}
            {peg.map((disk, dIdx) => (
              <div
                key={dIdx}
                style={{ width: `${disk * 24 + 20}px` }}
                className="h-6 bg-amber-500 rounded-md z-10 border border-amber-300 mb-1 flex items-center justify-center text-[10px] font-bold text-black"
              >
                {disk}
              </div>
            ))}
          </div>
        ))}
      </div>

      <button
        onClick={handleReset}
        className="text-xs px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700"
      >
        Reset Hanoi
      </button>
    </div>
  );
}

// 44. Water Jug Decanter (3L and 5L measuring 4L)
export function WaterJugGame({ onFinish }: GameProps) {
  const [jugA, setJugA] = useState(0); // Max 3L
  const [jugB, setJugB] = useState(0); // Max 5L
  const [steps, setSteps] = useState(0);

  const checkGoal = (a: number, b: number, s: number) => {
    if (b === 4) {
      sound.playSuccess();
      onFinish(s, `${s} steps (Target 4L reached!)`);
    }
  };

  const fillA = () => {
    sound.playTap();
    setJugA(3);
    setSteps((s) => {
      const ns = s + 1;
      checkGoal(3, jugB, ns);
      return ns;
    });
  };

  const fillB = () => {
    sound.playTap();
    setJugB(5);
    setSteps((s) => {
      const ns = s + 1;
      checkGoal(jugA, 5, ns);
      return ns;
    });
  };

  const emptyA = () => {
    sound.playTap();
    setJugA(0);
    setSteps((s) => s + 1);
  };

  const emptyB = () => {
    sound.playTap();
    setJugB(0);
    setSteps((s) => s + 1);
  };

  const pourAtoB = () => {
    sound.playTap();
    const spaceInB = 5 - jugB;
    const transfer = Math.min(jugA, spaceInB);
    const newA = jugA - transfer;
    const newB = jugB + transfer;
    setJugA(newA);
    setJugB(newB);
    setSteps((s) => {
      const ns = s + 1;
      checkGoal(newA, newB, ns);
      return ns;
    });
  };

  const pourBtoA = () => {
    sound.playTap();
    const spaceInA = 3 - jugA;
    const transfer = Math.min(jugB, spaceInA);
    const newA = jugA + transfer;
    const newB = jugB - transfer;
    setJugA(newA);
    setJugB(newB);
    setSteps((s) => {
      const ns = s + 1;
      checkGoal(newA, newB, ns);
      return ns;
    });
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Measure EXACTLY 4 Liters</span>
        <span className="text-cyan-400 font-bold">Steps: {steps}</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center gap-4">
        <div className="flex justify-around items-end w-full h-36">
          {/* Jug A (3L) */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-28 border-2 border-cyan-400 rounded-b-xl relative overflow-hidden flex flex-col justify-end">
              <div
                style={{ height: `${(jugA / 3) * 100}%` }}
                className="bg-cyan-500/60 w-full transition-all"
              />
            </div>
            <span className="text-xs font-mono text-neutral-300">Jug A (3L): {jugA}L</span>
            <div className="flex gap-1">
              <button onClick={fillA} className="px-2 py-1 bg-neutral-800 text-[10px] rounded hover:bg-neutral-700">Fill</button>
              <button onClick={emptyA} className="px-2 py-1 bg-neutral-800 text-[10px] rounded hover:bg-neutral-700">Empty</button>
            </div>
          </div>

          {/* Jug B (5L) */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-36 border-2 border-emerald-400 rounded-b-xl relative overflow-hidden flex flex-col justify-end">
              <div
                style={{ height: `${(jugB / 5) * 100}%` }}
                className="bg-emerald-500/60 w-full transition-all"
              />
            </div>
            <span className="text-xs font-mono text-neutral-300">Jug B (5L): {jugB}L</span>
            <div className="flex gap-1">
              <button onClick={fillB} className="px-2 py-1 bg-neutral-800 text-[10px] rounded hover:bg-neutral-700">Fill</button>
              <button onClick={emptyB} className="px-2 py-1 bg-neutral-800 text-[10px] rounded hover:bg-neutral-700">Empty</button>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={pourAtoB}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs rounded text-neutral-200 border border-neutral-700"
          >
            Pour A ➔ B
          </button>
          <button
            onClick={pourBtoA}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs rounded text-neutral-200 border border-neutral-700"
          >
            Pour B ➔ A
          </button>
        </div>
      </div>
    </div>
  );
}

// 45. Binary Switch Byte Match
export function BinaryByteGame({ onFinish }: GameProps) {
  const [bits, setBits] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const [targetVal, setTargetVal] = useState(42);

  const currentVal = bits.reduce((acc, bit, idx) => acc + bit * Math.pow(2, 7 - idx), 0);

  const toggleBit = (idx: number) => {
    sound.playTap();
    const next = [...bits];
    next[idx] = next[idx] === 1 ? 0 : 1;
    setBits(next);

    const val = next.reduce((acc, bit, i) => acc + bit * Math.pow(2, 7 - i), 0);
    if (val === targetVal) {
      sound.playSuccess();
      onFinish(targetVal, `Target ${targetVal} encoded!`);
    }
  };

  const handleNewTarget = () => {
    setTargetVal(Math.floor(Math.random() * 200) + 15);
    setBits([0, 0, 0, 0, 0, 0, 0, 0]);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Target: <strong className="text-amber-400">{targetVal}</strong></span>
        <span className="text-emerald-400 font-bold">Current: {currentVal}</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center gap-4">
        <div className="grid grid-cols-8 gap-1.5 w-full">
          {bits.map((bit, idx) => (
            <button
              key={idx}
              onClick={() => toggleBit(idx)}
              className={`h-14 rounded-lg flex flex-col items-center justify-center font-mono font-bold transition-all active:scale-95 ${
                bit === 1
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-750'
              }`}
            >
              <span className="text-lg">{bit}</span>
              <span className="text-[9px] opacity-60">{Math.pow(2, 7 - idx)}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleNewTarget}
          className="text-xs px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700"
        >
          New Number
        </button>
      </div>
    </div>
  );
}

// 46. Pipes Circuit Flow
export function PipesFlowGame({ onFinish }: GameProps) {
  const [pipes, setPipes] = useState<number[]>([90, 0, 270, 90]); // angles
  const [solved, setSolved] = useState(false);

  const rotatePipe = (idx: number) => {
    if (solved) return;
    sound.playTap();
    const next = [...pipes];
    next[idx] = (next[idx] + 90) % 360;
    setPipes(next);

    if (next[0] === 0 && next[1] === 90 && next[2] === 270 && next[3] === 180) {
      setSolved(true);
      sound.playSuccess();
      onFinish(100, 'Pipe Flow Connected!');
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Pipe Flow</span>
        <span className="text-cyan-400 font-bold">{solved ? 'Flowing!' : 'Turn to Connect'}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
        {pipes.map((angle, idx) => (
          <button
            key={idx}
            onClick={() => rotatePipe(idx)}
            style={{ transform: `rotate(${angle}deg)` }}
            className="w-20 h-20 bg-neutral-800 hover:bg-neutral-750 rounded-xl border border-neutral-700 flex items-center justify-center transition-transform"
          >
            <div className="w-12 h-3 bg-cyan-400 rounded-full" />
          </button>
        ))}
      </div>
    </div>
  );
}

// 47. Sokoban Box Pusher (Mini 5x5)
export function MiniSokobanGame({ onFinish }: GameProps) {
  const [player, setPlayer] = useState({ r: 2, c: 2 });
  const [box, setBox] = useState({ r: 2, c: 3 });
  const goal = { r: 2, c: 4 };

  const move = (dr: number, dc: number) => {
    const nr = player.r + dr;
    const nc = player.c + dc;
    if (nr < 0 || nr > 4 || nc < 0 || nc > 4) return;

    if (nr === box.r && nc === box.c) {
      const bnr = box.r + dr;
      const bnc = box.c + dc;
      if (bnr < 0 || bnr > 4 || bnc < 0 || bnc > 4) return;
      sound.playTap();
      setBox({ r: bnr, c: bnc });
      setPlayer({ r: nr, c: nc });

      if (bnr === goal.r && bnc === goal.c) {
        sound.playSuccess();
        onFinish(100, 'Box placed on Goal!');
      }
    } else {
      sound.playTap();
      setPlayer({ r: nr, c: nc });
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Mini Sokoban</span>
        <span className="text-amber-400 font-bold">Push box to ⭐</span>
      </div>

      <div className="grid grid-cols-5 gap-1.5 p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
        {Array.from({ length: 25 }, (_, i) => {
          const r = Math.floor(i / 5);
          const c = i % 5;
          const isP = player.r === r && player.c === c;
          const isB = box.r === r && box.c === c;
          const isG = goal.r === r && goal.c === c;

          return (
            <div
              key={i}
              className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center text-xl"
            >
              {isP ? '🤠' : isB ? '📦' : isG ? '⭐' : ''}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2 w-36">
        <div />
        <button onClick={() => move(-1, 0)} className="p-2 bg-neutral-800 text-white rounded">▲</button>
        <div />
        <button onClick={() => move(0, -1)} className="p-2 bg-neutral-800 text-white rounded">◀</button>
        <button onClick={() => move(1, 0)} className="p-2 bg-neutral-800 text-white rounded">▼</button>
        <button onClick={() => move(0, 1)} className="p-2 bg-neutral-800 text-white rounded">▶</button>
      </div>
    </div>
  );
}

// 48. Knight's Tour (5x5)
export function KnightsTourGame({ onFinish }: GameProps) {
  const [visited, setVisited] = useState<number[]>([12]); // start center
  const current = visited[visited.length - 1];

  const handleMove = (idx: number) => {
    const r1 = Math.floor(current / 5);
    const c1 = current % 5;
    const r2 = Math.floor(idx / 5);
    const c2 = idx % 5;

    const dr = Math.abs(r1 - r2);
    const dc = Math.abs(c1 - c2);

    if ((dr === 1 && dc === 2) || (dr === 2 && dc === 1)) {
      if (!visited.includes(idx)) {
        sound.playTap();
        const next = [...visited, idx];
        setVisited(next);

        if (next.length >= 10) {
          sound.playSuccess();
          onFinish(next.length, `${next.length} Knight Leaps`);
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Knight's Tour</span>
        <span className="text-emerald-400 font-bold">Visited: {visited.length}/25</span>
      </div>

      <div className="grid grid-cols-5 gap-1.5 p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
        {Array.from({ length: 25 }, (_, i) => {
          const isCur = i === current;
          const isVis = visited.includes(i);
          return (
            <button
              key={i}
              onClick={() => handleMove(i)}
              className={`w-12 h-12 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                isCur
                  ? 'bg-amber-400 text-black text-lg'
                  : isVis
                  ? 'bg-emerald-900 text-emerald-300'
                  : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-500'
              }`}
            >
              {isCur ? '♞' : isVis ? '•' : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
