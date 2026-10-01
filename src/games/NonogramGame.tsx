import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';
import { GameProps } from './ReflexGames';

export interface NonogramPuzzle {
  id: string;
  title: string;
  size: number;
  // 2D grid representation: 1 = filled, 0 = empty
  grid: number[][];
  color: string;
  icon: string;
}

const PUZZLES: NonogramPuzzle[] = [
  {
    id: 'heart',
    title: 'Pixel Heart',
    size: 5,
    grid: [
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ],
    color: '#ef4444',
    icon: '❤️',
  },
  {
    id: 'sword',
    title: 'Knight Sword',
    size: 5,
    grid: [
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 0, 1, 0],
    ],
    color: '#38bdf8',
    icon: '🗡️',
  },
  {
    id: 'coffee',
    title: 'Morning Cup',
    size: 5,
    grid: [
      [1, 1, 1, 1, 0],
      [1, 0, 0, 1, 1],
      [1, 0, 0, 1, 1],
      [1, 1, 1, 1, 0],
      [0, 1, 1, 0, 0],
    ],
    color: '#f59e0b',
    icon: '☕',
  },
  {
    id: 'crown',
    title: 'Royal Crown',
    size: 5,
    grid: [
      [1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1],
      [1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
    ],
    color: '#eab308',
    icon: '👑',
  },
];

// Helper to compute line clues (row or column)
function computeClues(line: number[]): number[] {
  const clues: number[] = [];
  let currentRun = 0;
  for (const cell of line) {
    if (cell === 1) {
      currentRun++;
    } else if (currentRun > 0) {
      clues.push(currentRun);
      currentRun = 0;
    }
  }
  if (currentRun > 0) clues.push(currentRun);
  return clues.length > 0 ? clues : [0];
}

export function NonogramGame({ onFinish }: GameProps) {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [userGrid, setUserGrid] = useState<number[][]>([]); // 0: empty, 1: filled, 2: crossed
  const [mode, setMode] = useState<'fill' | 'cross'>('fill');
  const [isWon, setIsWon] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  const curPuzzle = PUZZLES[puzzleIdx % PUZZLES.length];
  const size = curPuzzle.size;

  // Compute row & column clues for the current puzzle
  const rowClues = curPuzzle.grid.map((row) => computeClues(row));
  const colClues = Array.from({ length: size }, (_, c) => {
    const col = curPuzzle.grid.map((row) => row[c]);
    return computeClues(col);
  });

  const startPuzzle = (idx: number) => {
    setPuzzleIdx(idx);
    const p = PUZZLES[idx % PUZZLES.length];
    const initial = Array.from({ length: p.size }, () => Array(p.size).fill(0));
    setUserGrid(initial);
    setIsWon(false);
    setMistakes(0);
    sound.playTap();
  };

  useEffect(() => {
    startPuzzle(0);
  }, []);

  const handleCellClick = (r: number, c: number, rightClick = false) => {
    if (isWon) return;

    const currentVal = userGrid[r][c];
    const nextVal = rightClick
      ? currentVal === 2
        ? 0
        : 2
      : mode === 'fill'
      ? currentVal === 1
        ? 0
        : 1
      : currentVal === 2
      ? 0
      : 2;

    sound.playTap();

    const newGrid = userGrid.map((rowArr, rIdx) =>
      rowArr.map((cellVal, cIdx) => (rIdx === r && cIdx === c ? nextVal : cellVal))
    );
    setUserGrid(newGrid);

    // Check if the solution is satisfied
    let matched = true;
    for (let rI = 0; rI < size; rI++) {
      for (let cI = 0; cI < size; cI++) {
        const expected = curPuzzle.grid[rI][cI] === 1;
        const actual = newGrid[rI][cI] === 1;
        if (expected !== actual) {
          matched = false;
          break;
        }
      }
      if (!matched) break;
    }

    if (matched) {
      setIsWon(true);
      sound.playSuccess();
      onFinish(100, `Picross Solved: ${curPuzzle.title}!`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none max-w-lg mx-auto">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono text-slate-300 shadow-lg">
        <div className="flex items-center gap-2">
          {PUZZLES.map((p, i) => (
            <button
              key={p.id}
              onClick={() => startPuzzle(i)}
              className={`px-3 py-1 rounded-lg font-sans transition-all active:scale-95 ${
                puzzleIdx === i
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {p.icon} {p.title}
            </button>
          ))}
        </div>
        <span className="text-amber-400 font-bold">{isWon ? 'COMPLETED!' : 'Picross Logic'}</span>
      </div>

      {/* Main Picross Grid Area */}
      <div className="p-4 sm:p-6 bg-slate-950 border-2 border-slate-800 rounded-3xl shadow-2xl flex flex-col items-center">
        {/* Column clues header */}
        <div className="flex pl-16 sm:pl-20 mb-2">
          {colClues.map((clues, c) => (
            <div
              key={c}
              className="w-10 sm:w-12 flex flex-col items-center justify-end font-mono text-xs font-bold text-cyan-400 leading-tight gap-0.5"
            >
              {clues.map((num, i) => (
                <span key={i}>{num}</span>
              ))}
            </div>
          ))}
        </div>

        {/* Rows with row clues and grid cells */}
        <div className="flex flex-col gap-[2px]">
          {userGrid.map((row, r) => (
            <div key={r} className="flex items-center">
              {/* Row clues */}
              <div className="w-16 sm:w-20 pr-3 flex items-center justify-end font-mono text-xs font-bold text-amber-400 gap-1.5">
                {rowClues[r].map((num, i) => (
                  <span key={i}>{num}</span>
                ))}
              </div>

              {/* Row Cells */}
              <div className="flex gap-[2px]">
                {row.map((val, c) => {
                  return (
                    <button
                      key={c}
                      onClick={() => handleCellClick(r, c, false)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        handleCellClick(r, c, true);
                      }}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border flex items-center justify-center font-bold text-lg transition-all active:scale-95 ${
                        val === 1
                          ? isWon
                            ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg'
                            : 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-md'
                          : val === 2
                          ? 'bg-slate-900 border-slate-800 text-rose-500'
                          : 'bg-slate-900 hover:bg-slate-850 border-slate-800'
                      }`}
                    >
                      {val === 2 ? '✕' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mode Toggle Controls */}
      <div className="flex gap-3 w-full max-w-xs">
        <button
          onClick={() => setMode('fill')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
            mode === 'fill'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <span>⬛</span> Fill Mode
        </button>
        <button
          onClick={() => setMode('cross')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
            mode === 'cross'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <span>✕</span> Cross Mode
        </button>
      </div>

      {/* Victory Celebration */}
      {isWon && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl flex items-center justify-between w-full max-w-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{curPuzzle.icon}</span>
            <div>
              <p className="text-xs font-bold text-white">{curPuzzle.title} Discovered!</p>
              <p className="text-[10px] text-emerald-400">All clues verified correctly</p>
            </div>
          </div>
          <button
            onClick={() => startPuzzle(puzzleIdx + 1)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs"
          >
            Next Puzzle ▶
          </button>
        </div>
      )}

      <p className="text-[11px] text-slate-400 font-mono text-center">
        Numbers indicate blocks of consecutive filled cells. Left click to fill, right-click to cross.
      </p>
    </div>
  );
}
