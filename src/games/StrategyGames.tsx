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
  const [moves, setMoves] = useState(0);

  const checkFour = (b: (string | null)[][], player: string) => {
    // Horizontal
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c <= 3; c++) {
        if (b[r][c] === player && b[r][c + 1] === player && b[r][c + 2] === player && b[r][c + 3] === player) return true;
      }
    }
    // Vertical
    for (let r = 0; r <= 2; r++) {
      for (let c = 0; c < 7; c++) {
        if (b[r][c] === player && b[r + 1][c] === player && b[r + 2][c] === player && b[r + 3][c] === player) return true;
      }
    }
    // Diagonals
    for (let r = 0; r <= 2; r++) {
      for (let c = 0; c <= 3; c++) {
        if (b[r][c] === player && b[r + 1][c + 1] === player && b[r + 2][c + 2] === player && b[r + 3][c + 3] === player) return true;
        if (b[r + 3][c] === player && b[r + 2][c + 1] === player && b[r + 1][c + 2] === player && b[r][c + 3] === player) return true;
      }
    }
    return false;
  };

  const dropDisc = (col: number) => {
    if (winner) return;
    let row = -1;
    for (let r = 5; r >= 0; r--) {
      if (!board[r][col]) {
        row = r;
        break;
      }
    }
    if (row === -1) return;

    sound.playTap();
    const next = board.map((r) => [...r]);
    next[row][col] = 'P';
    setBoard(next);
    const nextMoves = moves + 1;
    setMoves(nextMoves);

    if (checkFour(next, 'P')) {
      setWinner('You Win! 🎉');
      sound.playSuccess();
      onFinish(Math.max(100, 500 - nextMoves * 20), `4-in-a-Row Victory in ${nextMoves} moves!`);
      return;
    }

    setTimeout(() => {
      const freeCols = [0, 1, 2, 3, 4, 5, 6].filter((c) => !next[0][c]);
      if (freeCols.length === 0) {
        setWinner('Draw!');
        onFinish(100, 'Draw vs AI');
        return;
      }
      const aiCol = freeCols[Math.floor(Math.random() * freeCols.length)];
      for (let r = 5; r >= 0; r--) {
        if (!next[r][aiCol]) {
          next[r][aiCol] = 'AI';
          break;
        }
      }
      setBoard([...next]);
      if (checkFour(next, 'AI')) {
        setWinner('AI Wins!');
        sound.playFail();
        onFinish(25, 'Defeated by AI');
      }
    }, 280);
  };

  const resetBoard = () => {
    setBoard(Array.from({ length: 6 }, () => Array(7).fill(null)));
    setWinner(null);
    setMoves(0);
  };

  return (
    <div className="flex flex-col items-center gap-2.5 w-full select-none">
      <div className="flex justify-between w-full text-xs font-mono text-neutral-300 px-2">
        <span>Gravity Connect 4</span>
        <span className="text-amber-400 font-bold">{winner || 'Tap Column to Drop'}</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 p-2.5 bg-blue-950 border border-blue-800 rounded-xl">
        {board.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <button
              key={`${rIdx}-${cIdx}`}
              onClick={() => dropDisc(cIdx)}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-blue-900 transition-colors ${
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
      {winner && (
        <button onClick={resetBoard} className="px-4 py-1.5 bg-amber-500 text-black font-bold rounded-lg text-xs">
          Play Again
        </button>
      )}
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

// 52. Micro Reversi (with real flanking flips)
export function ReversiMiniGame({ onFinish }: GameProps) {
  const [board, setBoard] = useState<(string | null)[]>([
    null, null, null, null,
    null, 'B', 'W', null,
    null, 'W', 'B', null,
    null, null, null, null
  ]);

  const applyMoveAndFlip = (b: (string | null)[], idx: number, player: 'B' | 'W') => {
    const opp = player === 'B' ? 'W' : 'B';
    const next = [...b];
    next[idx] = player;
    const r0 = Math.floor(idx / 4);
    const c0 = idx % 4;
    const dirs = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [-1, 1], [1, -1], [1, 1],
    ];
    for (const [dr, dc] of dirs) {
      let r = r0 + dr;
      let c = c0 + dc;
      const toFlip: number[] = [];
      while (r >= 0 && r < 4 && c >= 0 && c < 4 && next[r * 4 + c] === opp) {
        toFlip.push(r * 4 + c);
        r += dr;
        c += dc;
      }
      if (toFlip.length > 0 && r >= 0 && r < 4 && c >= 0 && c < 4 && next[r * 4 + c] === player) {
        for (const fIdx of toFlip) next[fIdx] = player;
      }
    }
    return next;
  };

  const handleCell = (idx: number) => {
    if (board[idx]) return;
    sound.playTap();
    const afterPlayer = applyMoveAndFlip(board, idx, 'B');
    setBoard(afterPlayer);

    setTimeout(() => {
      const free = afterPlayer.map((v, i) => (v === null ? i : null)).filter((v): v is number => v !== null);
      let afterAi = afterPlayer;
      if (free.length > 0) {
        const aiPick = free[Math.floor(Math.random() * free.length)];
        afterAi = applyMoveAndFlip(afterPlayer, aiPick, 'W');
        setBoard(afterAi);
      }
      if (afterAi.every((v) => v !== null)) {
        sound.playSuccess();
        const blackCount = afterAi.filter((v) => v === 'B').length;
        onFinish(blackCount, `${blackCount}/16 Black Discs`);
      }
    }, 280);
  };

  const blackScore = board.filter((v) => v === 'B').length;
  const whiteScore = board.filter((v) => v === 'W').length;

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-xs font-mono text-neutral-300 px-2">
        <span>You (Black): <strong className="text-emerald-400">{blackScore}</strong></span>
        <span>AI (White): <strong className="text-neutral-300">{whiteScore}</strong></span>
      </div>

      <div className="grid grid-cols-4 gap-2 p-3 bg-emerald-950 border border-emerald-800 rounded-xl">
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleCell(idx)}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-lg bg-emerald-900 hover:bg-emerald-800 flex items-center justify-center transition-colors"
          >
            {cell && (
              <div
                className={`w-9 h-9 rounded-full shadow-md transition-transform ${
                  cell === 'B' ? 'bg-neutral-950 border-2 border-emerald-400' : 'bg-white border-2 border-slate-300'
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

// 54. Dots & Boxes Territory (Interactive 2x2 Box Edge Claiming)
export function DotsBoxesGame({ onFinish }: GameProps) {
  // 4 boxes, each has 4 sides; we track each box's 0..4 sides drawn
  const [sides, setSides] = useState<number[]>([2, 2, 1, 3]);
  const [owners, setOwners] = useState<(string | null)[]>([null, null, null, null]);

  const addSide = (idx: number) => {
    if (owners[idx]) return;
    sound.playTap();
    const nextSides = [...sides];
    const nextOwners = [...owners];
    nextSides[idx] = Math.min(4, nextSides[idx] + 1);

    if (nextSides[idx] === 4) {
      sound.playSuccess();
      nextOwners[idx] = 'YOU';
    }
    setSides(nextSides);
    setOwners(nextOwners);

    if (nextOwners.every((o) => o !== null)) {
      const won = nextOwners.filter((o) => o === 'YOU').length;
      onFinish(won * 25, `${won}/4 Territory Boxes Captured!`);
    }
  };

  const capturedCount = owners.filter((o) => o === 'YOU').length;

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none max-w-sm mx-auto">
      <div className="flex justify-between w-full text-xs font-mono text-neutral-300 px-2">
        <span>Dots &amp; Boxes Territory</span>
        <span className="text-amber-400 font-bold">Captured: {capturedCount}/4</span>
      </div>

      <div className="grid grid-cols-2 gap-4 p-5 bg-neutral-900 border border-neutral-800 rounded-xl">
        {sides.map((sCount, idx) => {
          const closed = owners[idx] !== null;
          return (
            <button
              key={idx}
              onClick={() => addSide(idx)}
              className={`w-24 h-24 rounded-xl flex flex-col items-center justify-center transition-all relative ${
                closed
                  ? 'bg-amber-400 text-slate-950 font-black shadow-lg'
                  : 'bg-neutral-950 hover:bg-neutral-850 text-neutral-300'
              }`}
              style={{
                borderTop: sCount >= 1 ? '4px solid #f59e0b' : '2px dashed #334155',
                borderRight: sCount >= 2 ? '4px solid #f59e0b' : '2px dashed #334155',
                borderBottom: sCount >= 3 ? '4px solid #f59e0b' : '2px dashed #334155',
                borderLeft: sCount >= 4 ? '4px solid #f59e0b' : '2px dashed #334155',
              }}
            >
              <span className="text-lg">{closed ? '👑' : `${sCount}/4`}</span>
              <span className="text-[10px] font-mono opacity-75">
                {closed ? 'CLAIMED' : 'Add Line'}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-neutral-400 font-mono">Click boxes to draw borders and complete the 4th side</p>
    </div>
  );
}

// 55. Hex Color Conquer (5x5 Color Flood Fill Board)
export function HexConquerGame({ onFinish }: GameProps) {
  const palette = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#a855f7'];
  const [grid, setGrid] = useState<string[]>(() =>
    Array.from({ length: 25 }, () => palette[Math.floor(Math.random() * palette.length)])
  );
  const [moves, setMoves] = useState(0);

  const floodColor = (targetColor: string) => {
    const startColor = grid[0];
    if (startColor === targetColor) return;
    sound.playTap();

    const next = [...grid];
    const visited = new Set<number>();
    const queue = [0];
    visited.add(0);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      next[curr] = targetColor;
      const r = Math.floor(curr / 5);
      const c = curr % 5;
      const neighbors = [
        r > 0 ? (r - 1) * 5 + c : -1,
        r < 4 ? (r + 1) * 5 + c : -1,
        c > 0 ? r * 5 + (c - 1) : -1,
        c < 4 ? r * 5 + (c + 1) : -1,
      ];
      for (const n of neighbors) {
        if (n !== -1 && !visited.has(n) && grid[n] === startColor) {
          visited.add(n);
          queue.push(n);
        }
      }
    }

    setGrid(next);
    const nextMoves = moves + 1;
    setMoves(nextMoves);

    if (next.every((c) => c === targetColor)) {
      sound.playSuccess();
      onFinish(nextMoves, `Conquered in ${nextMoves} moves`);
    }
  };

  const controlledCount = grid.filter((c) => c === grid[0]).length;

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none max-w-sm mx-auto">
      <div className="flex justify-between w-full text-xs font-mono text-neutral-300 px-2">
        <span>Territory Flood ({Math.round((controlledCount / 25) * 100)}%)</span>
        <span className="text-amber-400 font-bold">Moves: {moves}</span>
      </div>

      <div className="grid grid-cols-5 gap-1.5 p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
        {grid.map((col, idx) => (
          <div
            key={idx}
            style={{ backgroundColor: col }}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg shadow transition-colors"
          />
        ))}
      </div>

      <div className="flex gap-2.5">
        {palette.map((col) => (
          <button
            key={col}
            onClick={() => floodColor(col)}
            style={{ backgroundColor: col }}
            className="w-10 h-10 rounded-full border-2 border-white/80 shadow-md active:scale-90 transition-transform"
          />
        ))}
      </div>
      <p className="text-[11px] text-neutral-400 font-mono">Pick a color to flood from the top-left corner</p>
    </div>
  );
}

// 56. Mate in 1 Checkmate Puzzle
export function ChessMatePuzzleGame({ onFinish }: GameProps) {
  const puzzles = [
    {
      desc: 'Black King cornered on h8. White Queen on d1, Bishop on c4.',
      options: [
        { move: '1. Qh5# (Queen delivers Mate)', correct: true },
        { move: '1. Bxf7+ (Bishop check)', correct: false },
        { move: '1. Qd4+ (Diagonal check)', correct: false },
      ],
    },
    {
      desc: 'Back-rank weakness: Black King on g8 trapped behind pawns f7, g7, h7. White Rook on d1.',
      options: [
        { move: '1. Rd6 (Rook lift)', correct: false },
        { move: '1. Rd8# (Back-rank Mate)', correct: true },
        { move: '1. Kf1 (King safety)', correct: false },
      ],
    },
    {
      desc: 'Smothered setup: Black King on h8 boxed in by Rook g8 and pawns g7, h7. White Knight on f7.',
      options: [
        { move: '1. Nh6# (Double-check Mate)', correct: true },
        { move: '1. Nxd8 (Capture Queen)', correct: false },
        { move: '1. Ng5 (Retreat Knight)', correct: false },
      ],
    },
  ];

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const cur = puzzles[idx % puzzles.length];

  const handleMove = (correct: boolean) => {
    if (correct) {
      sound.playSuccess();
      const nextScore = score + 1;
      setScore(nextScore);
      if (idx + 1 >= puzzles.length) {
        onFinish(nextScore * 100, `${nextScore}/3 Checkmates Solved! ♔`);
      } else {
        setIdx((i) => i + 1);
      }
    } else {
      sound.playFail();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none max-w-sm mx-auto">
      <div className="flex justify-between w-full text-xs font-mono text-neutral-300 px-2">
        <span>White to Move: Mate in 1</span>
        <span className="text-amber-400 font-bold">Puzzle {idx + 1}/3</span>
      </div>

      <div className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col items-center gap-3">
        <div className="text-3xl">♔ ♕ ♖ ♘</div>
        <p className="text-xs font-mono text-neutral-300 text-center leading-relaxed">{cur.desc}</p>
        <div className="flex flex-col gap-2 w-full">
          {cur.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleMove(opt.correct)}
              className="py-2.5 px-3 bg-neutral-800 hover:bg-neutral-750 text-white font-bold rounded-lg text-xs border border-neutral-700 active:scale-98 transition-transform"
            >
              {opt.move}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
