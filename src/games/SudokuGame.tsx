import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';
import { GameProps } from './ReflexGames';

type Difficulty = 'easy' | 'medium' | 'hard';

// High quality verified Sudoku puzzle templates with complete solutions
const PUZZLE_TEMPLATES: Record<Difficulty, { puzzle: number[]; solution: number[] }[]> = {
  easy: [
    {
      puzzle: [
        5, 3, 0, 0, 7, 0, 0, 0, 0,
        6, 0, 0, 1, 9, 5, 0, 0, 0,
        0, 9, 8, 0, 0, 0, 0, 6, 0,
        8, 0, 0, 0, 6, 0, 0, 0, 3,
        4, 0, 0, 8, 0, 3, 0, 0, 1,
        7, 0, 0, 0, 2, 0, 0, 0, 6,
        0, 6, 0, 0, 0, 0, 2, 8, 0,
        0, 0, 0, 4, 1, 9, 0, 0, 5,
        0, 0, 0, 0, 8, 0, 0, 7, 9,
      ],
      solution: [
        5, 3, 4, 6, 7, 8, 9, 1, 2,
        6, 7, 2, 1, 9, 5, 3, 4, 8,
        1, 9, 8, 3, 4, 2, 5, 6, 7,
        8, 5, 9, 7, 6, 1, 4, 2, 3,
        4, 2, 6, 8, 5, 3, 7, 9, 1,
        7, 1, 3, 9, 2, 4, 8, 5, 6,
        9, 6, 1, 5, 3, 7, 2, 8, 4,
        2, 8, 7, 4, 1, 9, 6, 3, 5,
        3, 4, 5, 2, 8, 6, 1, 7, 9,
      ],
    },
  ],
  medium: [
    {
      puzzle: [
        0, 2, 0, 6, 0, 8, 0, 0, 0,
        5, 8, 0, 0, 0, 9, 7, 0, 0,
        0, 0, 0, 0, 4, 0, 0, 0, 0,
        3, 7, 0, 0, 0, 0, 5, 0, 0,
        6, 0, 0, 0, 0, 0, 0, 0, 4,
        0, 0, 8, 0, 0, 0, 0, 1, 3,
        0, 0, 0, 0, 2, 0, 0, 0, 0,
        0, 0, 9, 8, 0, 0, 0, 3, 6,
        0, 0, 0, 3, 0, 6, 0, 9, 0,
      ],
      solution: [
        1, 2, 3, 6, 7, 8, 9, 4, 5,
        5, 8, 4, 2, 3, 9, 7, 6, 1,
        9, 6, 7, 1, 4, 5, 3, 2, 8,
        3, 7, 2, 4, 6, 1, 5, 8, 9,
        6, 9, 1, 5, 8, 3, 2, 7, 4,
        4, 5, 8, 7, 9, 2, 6, 1, 3,
        8, 3, 6, 9, 2, 4, 1, 5, 7,
        2, 1, 9, 8, 5, 7, 4, 3, 6,
        7, 4, 5, 3, 1, 6, 8, 9, 2,
      ],
    },
  ],
  hard: [
    {
      puzzle: [
        0, 0, 0, 6, 0, 0, 4, 0, 0,
        7, 0, 0, 0, 0, 3, 6, 0, 0,
        0, 0, 0, 0, 9, 1, 0, 8, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 5, 0, 1, 8, 0, 0, 0, 3,
        0, 0, 0, 3, 0, 6, 0, 4, 5,
        0, 4, 0, 2, 0, 0, 0, 6, 0,
        9, 0, 3, 0, 0, 0, 0, 0, 0,
        0, 2, 0, 0, 0, 0, 1, 0, 0,
      ],
      solution: [
        5, 8, 1, 6, 7, 2, 4, 3, 9,
        7, 9, 2, 8, 4, 3, 6, 5, 1,
        3, 6, 4, 5, 9, 1, 7, 8, 2,
        4, 3, 8, 9, 5, 7, 2, 1, 6,
        2, 5, 6, 1, 8, 4, 9, 7, 3,
        1, 7, 9, 3, 2, 6, 8, 4, 5,
        8, 4, 5, 2, 1, 9, 3, 6, 7,
        9, 1, 3, 7, 6, 8, 5, 2, 4,
        6, 2, 7, 4, 3, 5, 1, 9, 8,
      ],
    },
  ],
};

export function SudokuGame({ onFinish }: GameProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [initialBoard, setInitialBoard] = useState<number[]>([]);
  const [currentBoard, setCurrentBoard] = useState<number[]>([]);
  const [solutionBoard, setSolutionBoard] = useState<number[]>([]);
  const [notes, setNotes] = useState<Record<number, number[]>>({});
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [time, setTime] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const timerRef = useRef<number | null>(null);

  const startNewGame = (diff: Difficulty) => {
    setDifficulty(diff);
    const template = PUZZLE_TEMPLATES[diff][0];
    const initial = [...template.puzzle];
    setInitialBoard(initial);
    setCurrentBoard([...initial]);
    setSolutionBoard([...template.solution]);
    setNotes({});
    setSelectedCell(null);
    setMistakes(0);
    setTime(0);
    setIsWon(false);
    sound.playTap();
  };

  useEffect(() => {
    startNewGame('easy');
    timerRef.current = window.setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Check victory condition
  useEffect(() => {
    if (currentBoard.length === 81 && !currentBoard.includes(0) && !isWon) {
      const allCorrect = currentBoard.every((val, idx) => val === solutionBoard[idx]);
      if (allCorrect) {
        setIsWon(true);
        sound.playSuccess();
        const score = Math.max(100, 2000 - time * 3 - mistakes * 50);
        onFinish(score, `Sudoku Solved! Time: ${Math.floor(time / 60)}m ${time % 60}s`);
      }
    }
  }, [currentBoard, solutionBoard, isWon, time, mistakes, onFinish]);

  const handleCellClick = (idx: number) => {
    sound.playTap();
    setSelectedCell(idx);
  };

  const handleNumberInput = (num: number) => {
    if (selectedCell === null) return;
    if (initialBoard[selectedCell] !== 0) return; // Cannot edit original clues

    if (isNoteMode) {
      sound.playTap();
      setNotes((prev) => {
        const cellNotes = prev[selectedCell] || [];
        const nextCellNotes = cellNotes.includes(num)
          ? cellNotes.filter((n) => n !== num)
          : [...cellNotes, num].sort();
        return { ...prev, [selectedCell]: nextCellNotes };
      });
      return;
    }

    // Place number
    const isCorrect = num === solutionBoard[selectedCell];
    if (isCorrect) {
      sound.playSuccess();
    } else {
      sound.playFail();
      setMistakes((m) => m + 1);
    }

    setCurrentBoard((prev) => {
      const next = [...prev];
      next[selectedCell] = num;
      return next;
    });

    // Clear notes in this cell
    setNotes((prev) => {
      const next = { ...prev };
      delete next[selectedCell];
      return next;
    });
  };

  const handleErase = () => {
    if (selectedCell === null || initialBoard[selectedCell] !== 0) return;
    sound.playTap();
    setCurrentBoard((prev) => {
      const next = [...prev];
      next[selectedCell] = 0;
      return next;
    });
    setNotes((prev) => {
      const next = { ...prev };
      delete next[selectedCell];
      return next;
    });
  };

  const handleHint = () => {
    if (selectedCell === null || initialBoard[selectedCell] !== 0) return;
    sound.playSuccess();
    const correctVal = solutionBoard[selectedCell];
    setCurrentBoard((prev) => {
      const next = [...prev];
      next[selectedCell] = correctVal;
      return next;
    });
  };

  // Keyboard navigation & digit input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedCell === null) return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 9) {
        handleNumberInput(num);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleErase();
      } else if (e.key === 'ArrowUp') {
        setSelectedCell((c) => (c !== null ? Math.max(0, c - 9) : null));
      } else if (e.key === 'ArrowDown') {
        setSelectedCell((c) => (c !== null ? Math.min(80, c + 9) : null));
      } else if (e.key === 'ArrowLeft') {
        setSelectedCell((c) => (c !== null && c % 9 > 0 ? c - 1 : c));
      } else if (e.key === 'ArrowRight') {
        setSelectedCell((c) => (c !== null && c % 9 < 8 ? c + 1 : c));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const selectedValue = selectedCell !== null ? currentBoard[selectedCell] : null;
  const selectedRow = selectedCell !== null ? Math.floor(selectedCell / 9) : null;
  const selectedCol = selectedCell !== null ? selectedCell % 9 : null;
  const selectedBoxRow = selectedRow !== null ? Math.floor(selectedRow / 3) : null;
  const selectedBoxCol = selectedCol !== null ? Math.floor(selectedCol / 3) : null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Count remaining placements for each number (1-9)
  const numberCounts = Array.from({ length: 9 }, (_, i) => {
    const d = i + 1;
    const placed = currentBoard.filter((v, idx) => v === d && v === solutionBoard[idx]).length;
    return 9 - placed;
  });

  return (
    <div className="flex flex-col items-center gap-2.5 w-full select-none max-w-md mx-auto">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 shadow">
        <div className="flex items-center gap-1.5">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => startNewGame(diff)}
              className={`px-2.5 py-0.5 rounded-lg capitalize font-sans transition-all active:scale-95 ${
                difficulty === diff
                  ? 'bg-amber-400 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-rose-400">Mistakes: {mistakes}</span>
          <span className="text-cyan-400 font-bold">⏱ {formatTime(time)}</span>
        </div>
      </div>

      {/* 9x9 Grid */}
      <div className="p-1.5 sm:p-2 bg-slate-950 border-2 border-slate-700 rounded-xl shadow-xl">
        <div className="grid grid-cols-9 gap-[1px] bg-slate-700 border-2 border-slate-600 rounded-lg overflow-hidden">
          {currentBoard.map((val, idx) => {
            const r = Math.floor(idx / 9);
            const c = idx % 9;
            const bR = Math.floor(r / 3);
            const bC = Math.floor(c / 3);

            const isOriginal = initialBoard[idx] !== 0;
            const isSelected = selectedCell === idx;
            const isPeer =
              selectedCell !== null &&
              (r === selectedRow || c === selectedCol || (bR === selectedBoxRow && bC === selectedBoxCol));
            const isSameNumber = selectedValue !== null && selectedValue > 0 && val === selectedValue;
            const isError = val > 0 && val !== solutionBoard[idx];

            const borderRight = c % 3 === 2 && c !== 8 ? 'border-r-2 border-r-slate-500' : '';
            const borderBottom = r % 3 === 2 && r !== 8 ? 'border-b-2 border-b-slate-500' : '';

            return (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center font-mono text-sm sm:text-base font-bold transition-colors relative ${borderRight} ${borderBottom} ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-400 z-10'
                    : isError
                    ? 'bg-rose-950/70 text-rose-300'
                    : isSameNumber
                    ? 'bg-cyan-900/60 text-cyan-200'
                    : isPeer
                    ? 'bg-slate-850 text-slate-200'
                    : (bR + bC) % 2 === 0
                    ? 'bg-slate-900 text-slate-300'
                    : 'bg-slate-925 text-slate-300'
                } ${isOriginal ? 'font-black' : 'font-medium text-cyan-400'}`}
              >
                {val > 0 ? (
                  val
                ) : notes[idx] && notes[idx].length > 0 ? (
                  <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5 text-[7px] text-slate-400 leading-none">
                    {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                      <span key={n} className="flex items-center justify-center">
                        {notes[idx].includes(n) ? n : ''}
                      </span>
                    ))}
                  </div>
                ) : (
                  ''
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Controls: Erase, Notes, Hint */}
      <div className="flex justify-between w-full px-1">
        <button
          onClick={handleErase}
          className="flex-1 py-1.5 mx-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all active:scale-95"
        >
          ⌫ Erase
        </button>
        <button
          onClick={() => setIsNoteMode((n) => !n)}
          className={`flex-1 py-1.5 mx-1 rounded-lg text-xs font-bold transition-all active:scale-95 ${
            isNoteMode
              ? 'bg-amber-400 text-slate-950 font-black shadow'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
        >
          ✎ Notes: {isNoteMode ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={handleHint}
          className="flex-1 py-1.5 mx-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all active:scale-95"
        >
          💡 Hint
        </button>
      </div>

      {/* Number Pad (1-9) */}
      <div className="grid grid-cols-9 gap-1 w-full">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((digit) => {
          const remaining = numberCounts[digit - 1];
          return (
            <button
              key={digit}
              onClick={() => handleNumberInput(digit)}
              disabled={remaining <= 0}
              className="py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-white font-mono font-bold text-base rounded-lg shadow active:scale-95 transition-all flex flex-col items-center justify-center leading-none"
            >
              <span>{digit}</span>
              <span className="text-[8px] text-slate-400 mt-0.5">{remaining}</span>
            </button>
          );
        })}
      </div>

      {/* Victory Celebration Overlay */}
      {isWon && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center">
          <span className="text-6xl mb-3 animate-bounce">🌟</span>
          <h2 className="text-3xl font-black text-amber-400 mb-2">SUDOKU MASTER!</h2>
          <p className="text-sm text-slate-300 mb-6">
            Difficulty: {difficulty} · Time: {formatTime(time)} · Mistakes: {mistakes}
          </p>
          <button
            onClick={() => startNewGame(difficulty)}
            className="px-8 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-sm shadow-xl active:scale-95 transition-transform uppercase tracking-wider"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
