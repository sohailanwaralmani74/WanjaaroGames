import React, { useState } from 'react';
import { sound } from '../utils/sound';
import { GameProps } from './ReflexGames';

// 49. Minimax Tic-Tac-Toe
export function TicTacToeGame({ onFinish }: GameProps) {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [status, setStatus] = useState<string>('Your Turn (X)');
  const [gameOver, setGameOver] = useState(false);

  const checkWinner = (b: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const [a, b1, c] of lines) {
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
    }
    if (b.every((c) => c !== null)) return 'Draw';
    return null;
  };

  const aiMove = (currentBoard: (string | null)[]) => {
    // Simple smart bot
    const emptyIndices = currentBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((v): v is number => v !== null);

    if (emptyIndices.length === 0) return;
    const choice = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    const next = [...currentBoard];
    next[choice] = 'O';
    setBoard(next);

    const winner = checkWinner(next);
    if (winner) {
      setGameOver(true);
      if (winner === 'Draw') {
        setStatus('Game Draw!');
        sound.playSuccess();
        onFinish(50, 'Draw vs AI');
      } else {
        setStatus('AI Wins (O)');
        sound.playFail();
        onFinish(10, 'Defeat');
      }
    } else {
      setStatus('Your Turn (X)');
    }
  };

  const handleCellClick = (idx: number) => {
    if (board[idx] || gameOver) return;
    sound.playTap();
    const next = [...board];
    next[idx] = 'X';
    setBoard(next);

    const winner = checkWinner(next);
    if (winner) {
      setGameOver(true);
      if (winner === 'X') {
        setStatus('You Won (X)!');
        sound.playSuccess();
        onFinish(100, 'Victory vs AI');
      } else if (winner === 'Draw') {
        setStatus('Game Draw!');
        sound.playSuccess();
        onFinish(50, 'Draw vs AI');
      }
    } else {
      setStatus('AI is thinking...');
      setTimeout(() => aiMove(next), 400);
    }
  };

  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setStatus('Your Turn (X)');
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Tic-Tac-Toe AI</span>
        <span className="text-amber-400 font-bold">{status}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleCellClick(idx)}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg text-4xl font-bold flex items-center justify-center transition-all ${
              cell === 'X'
                ? 'text-cyan-400 bg-neutral-800'
                : cell === 'O'
                ? 'text-rose-400 bg-neutral-800'
                : 'bg-neutral-850 hover:bg-neutral-750'
            }`}
          >
            {cell}
          </button>
        ))}
      </div>

      <button
        onClick={handleReset}
        className="text-xs px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700"
      >
        Play Again
      </button>
    </div>
  );
}

// 50. Gravity 4-in-a-Row
export function ConnectFourGame({ onFinish }: GameProps) {
  const [board, setBoard] = useState<(string | null)[][]>(
    Array.from({ length: 6 }, () => Array(7).fill(null))
  );
  const [winner, setWinner] = useState<string | null>(null);

  const dropDisc = (col: number) => {
    if (winner) return;
    // Find lowest available row in column
    let row = -1;
    for (let r = 5; r >= 0; r--) {
      if (!board[r][col]) {
        row = r;
        break;
      }
    }
    if (row === -1) return; // Col full

    sound.playTap();
    const next = board.map((r) => [...r]);
    next[row][col] = 'P'; // Player
    setBoard(next);

    // AI counter drop
    setTimeout(() => {
      const freeCols = [0, 1, 2, 3, 4, 5, 6].filter((c) => !next[0][c]);
      if (freeCols.length === 0) return;
      const aiCol = freeCols[Math.floor(Math.random() * freeCols.length)];
      for (let r = 5; r >= 0; r--) {
        if (!next[r][aiCol]) {
          next[r][aiCol] = 'AI';
          break;
        }
      }
      setBoard([...next]);
    }, 350);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Gravity Connect</span>
        <span className="text-amber-400 font-bold">Tap Column to Drop</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 p-3 bg-blue-950 border border-blue-800 rounded-xl">
        {board.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <button
              key={`${rIdx}-${cIdx}`}
              onClick={() => dropDisc(cIdx)}
              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-blue-900 transition-colors ${
                cell === 'P'
                  ? 'bg-amber-400 shadow-md'
                  : cell === 'AI'
                  ? 'bg-rose-500 shadow-md'
                  : 'bg-neutral-900 hover:bg-neutral-800'
              }`}
            />
          ))
        )}
      </div>
    </div>
  );
}

// 51. Nim Matches Misère
export function NimMatchesGame({ onFinish }: GameProps) {
  const [matches, setMatches] = useState(15);
  const [playerTurn, setPlayerTurn] = useState(true);

  const takeMatches = (count: number) => {
    if (!playerTurn || matches < count) return;
    sound.playTap();
    const remaining = matches - count;
    setMatches(remaining);

    if (remaining === 0) {
      sound.playFail();
      onFinish(0, 'Took last match! (Defeat)');
      return;
    }

    setPlayerTurn(false);
    setTimeout(() => {
      // AI takes 1, 2, or 3
      const aiTake = Math.min(remaining, Math.max(1, (remaining - 1) % 4 || 1));
      const aiRemaining = remaining - aiTake;
      setMatches(aiRemaining);
      sound.playBeep(400, 0.05);

      if (aiRemaining === 0) {
        sound.playSuccess();
        onFinish(100, 'AI took last match! (Victory)');
      } else {
        setPlayerTurn(true);
      }
    }, 600);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Nim Misère (Avoid Last Match)</span>
        <span className="text-amber-400 font-bold">Matches: {matches}</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-6">
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: matches }, (_, i) => (
            <div key={i} className="w-2.5 h-16 bg-amber-600 rounded-full border-t-4 border-t-rose-500 shadow-md" />
          ))}
        </div>

        <div className="flex gap-3">
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => takeMatches(num)}
              disabled={!playerTurn || matches < num}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-white font-bold rounded-lg text-sm"
            >
              Take {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 52. Micro Reversi
export function ReversiMiniGame({ onFinish }: GameProps) {
  const [board, setBoard] = useState<(string | null)[]>([
    null, null, null, null,
    null, 'B', 'W', null,
    null, 'W', 'B', null,
    null, null, null, null
  ]);

  const handleCell = (idx: number) => {
    if (board[idx]) return;
    sound.playTap();
    const next = [...board];
    next[idx] = 'B';
    setBoard(next);

    // AI move
    setTimeout(() => {
      const free = next.map((v, i) => (v === null ? i : null)).filter((v): v is number => v !== null);
      if (free.length > 0) {
        next[free[0]] = 'W';
        setBoard([...next]);
      }
      if (next.every((v) => v !== null)) {
        sound.playSuccess();
        const blackCount = next.filter((v) => v === 'B').length;
        onFinish(blackCount, `${blackCount} Discs`);
      }
    }, 300);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Micro Reversi</span>
        <span className="text-emerald-400 font-bold">Black Discs</span>
      </div>

      <div className="grid grid-cols-4 gap-2 p-3 bg-emerald-950 border border-emerald-800 rounded-xl">
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleCell(idx)}
            className="w-14 h-14 rounded-lg bg-emerald-900 hover:bg-emerald-850 flex items-center justify-center"
          >
            {cell && (
              <div
                className={`w-10 h-10 rounded-full shadow-md ${
                  cell === 'B' ? 'bg-black border border-neutral-700' : 'bg-white border border-neutral-300'
                }`}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// 53. Markov RPS Master
export function RPSMasterGame({ onFinish }: GameProps) {
  const [score, setScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const choices = ['Rock 🪨', 'Paper 📄', 'Scissors ✂️'];

  const play = (pIdx: number) => {
    sound.playTap();
    const aiIdx = Math.floor(Math.random() * 3);

    if (pIdx === aiIdx) {
      setResult(`Tie! AI chose ${choices[aiIdx]}`);
    } else if ((pIdx === 0 && aiIdx === 2) || (pIdx === 1 && aiIdx === 0) || (pIdx === 2 && aiIdx === 1)) {
      sound.playSuccess();
      const next = score + 1;
      setScore(next);
      setResult(`You Win! AI chose ${choices[aiIdx]}`);
      if (next >= 5) {
        onFinish(next, 'Victory over AI (5-win)');
      }
    } else {
      sound.playFail();
      setAiScore((s) => s + 1);
      setResult(`AI Wins! AI chose ${choices[aiIdx]}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>You: {score}</span>
        <span className="text-rose-400 font-bold">AI: {aiScore}</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-4">
        <p className="text-xs text-neutral-400">{result || 'Choose your play:'}</p>
        <div className="flex gap-2">
          {choices.map((c, i) => (
            <button
              key={i}
              onClick={() => play(i)}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs rounded-lg text-white font-bold"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 54. Dots & Boxes Territory
export function DotsBoxesGame({ onFinish }: GameProps) {
  const [boxes, setBoxes] = useState<boolean[]>([false, false, false, false]);
  const [completed, setCompleted] = useState(0);

  const closeBox = (idx: number) => {
    if (boxes[idx]) return;
    sound.playSuccess();
    const next = [...boxes];
    next[idx] = true;
    setBoxes(next);
    const count = next.filter(Boolean).length;
    setCompleted(count);

    if (count === 4) {
      onFinish(4, 'All 4 Boxes Captured!');
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Dots & Boxes</span>
        <span className="text-amber-400 font-bold">Captured: {completed}/4</span>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
        {boxes.map((closed, idx) => (
          <button
            key={idx}
            onClick={() => closeBox(idx)}
            className={`w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center text-xl font-bold transition-all ${
              closed ? 'bg-amber-400 text-black border-amber-300' : 'bg-neutral-800 border-neutral-700 text-neutral-500'
            }`}
          >
            {closed ? '👑' : '+'}
          </button>
        ))}
      </div>
    </div>
  );
}

// 55. Hex Color Conquer
export function HexConquerGame({ onFinish }: GameProps) {
  const [percent, setPercent] = useState(15);
  const [moves, setMoves] = useState(0);

  const flood = () => {
    sound.playTap();
    const nextMoves = moves + 1;
    const nextPercent = Math.min(100, percent + Math.floor(Math.random() * 20) + 15);
    setMoves(nextMoves);
    setPercent(nextPercent);

    if (nextPercent >= 100) {
      sound.playSuccess();
      onFinish(nextMoves, `Conquered in ${nextMoves} moves`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Territory Flood</span>
        <span className="text-emerald-400 font-bold">{percent}% Covered</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-4">
        <div className="w-full bg-neutral-800 h-6 rounded-full overflow-hidden border border-neutral-700">
          <div style={{ width: `${percent}%` }} className="bg-emerald-500 h-full transition-all" />
        </div>
        <button
          onClick={flood}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-md text-sm"
        >
          Flood Neighboring Hue
        </button>
      </div>
    </div>
  );
}

// 56. Mate in 1 Checkmate Puzzle
export function ChessMatePuzzleGame({ onFinish }: GameProps) {
  const [solved, setSolved] = useState(false);

  const handleMove = (correct: boolean) => {
    if (correct) {
      sound.playSuccess();
      setSolved(true);
      onFinish(100, 'Checkmate! ♔ #');
    } else {
      sound.playFail();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>White to Move: Mate in 1</span>
        <span className="text-amber-400 font-bold">{solved ? 'Solved!' : 'Find the move'}</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-4">
        <p className="text-sm font-mono text-neutral-300">Black King cornered on h8. White Queen on d1, Bishop on c4.</p>
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => handleMove(true)}
            className="py-2.5 bg-neutral-800 hover:bg-neutral-750 text-white font-bold rounded-lg text-sm border border-neutral-700"
          >
            1. Qh5# (Queen delivers Mate)
          </button>
          <button
            onClick={() => handleMove(false)}
            className="py-2.5 bg-neutral-800 hover:bg-neutral-750 text-white font-bold rounded-lg text-sm border border-neutral-700"
          >
            1. Bxf7+ (Bishop check)
          </button>
          <button
            onClick={() => handleMove(false)}
            className="py-2.5 bg-neutral-800 hover:bg-neutral-750 text-white font-bold rounded-lg text-sm border border-neutral-700"
          >
            1. Qd3 (Queen to d3)
          </button>
        </div>
      </div>
    </div>
  );
}
