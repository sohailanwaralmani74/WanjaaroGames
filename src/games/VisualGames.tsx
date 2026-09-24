import React, { useState } from 'react';
import { sound } from '../utils/sound';
import { GameProps } from './ReflexGames';

// 81. Mental Shape Rotation
export function ShapeRotateGame({ onFinish }: GameProps) {
  const [score, setScore] = useState(0);

  const handleChoice = (isMatch: boolean) => {
    if (isMatch) {
      sound.playSuccess();
      const next = score + 1;
      setScore(next);
      if (next >= 5) {
        onFinish(next, `${next} Rotations Identified`);
      }
    } else {
      sound.playFail();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Mental Rotation</span>
        <span className="text-amber-400 font-bold">{score}/5</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-6">
        <div className="flex gap-12 items-center text-5xl">
          <span className="transform rotate-45 text-cyan-400">L</span>
          <span className="transform rotate-135 text-amber-400">L</span>
        </div>
        <p className="text-xs text-neutral-400">Are these the SAME shape rotated, or mirrored?</p>
        <div className="flex gap-4">
          <button
            onClick={() => handleChoice(true)}
            className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs"
          >
            SAME (Rotated)
          </button>
          <button
            onClick={() => handleChoice(false)}
            className="px-6 py-2 bg-neutral-800 text-white font-bold rounded-lg text-xs"
          >
            MIRRORED
          </button>
        </div>
      </div>
    </div>
  );
}

// 82. Bilateral Symmetry Mirror
export function SymmetryPainterGame({ onFinish }: GameProps) {
  const [grid, setGrid] = useState<boolean[]>([
    false, false, false, false,
    false, false, false, false,
    false, false, false, false,
    false, false, false, false,
  ]);

  const toggle = (idx: number) => {
    sound.playTap();
    const next = [...grid];
    next[idx] = !next[idx];
    setGrid(next);

    const filledCount = next.filter(Boolean).length;
    if (filledCount >= 4) {
      sound.playSuccess();
      onFinish(filledCount, `${filledCount} Mirror Pixels Placed`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Symmetry Mirror</span>
        <span className="text-cyan-400 font-bold">Draw Symmetrical Glyph</span>
      </div>

      <div className="grid grid-cols-4 gap-2 p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
        {grid.map((active, idx) => (
          <button
            key={idx}
            onClick={() => toggle(idx)}
            className={`w-14 h-14 rounded-lg transition-colors ${
              active ? 'bg-cyan-400 shadow-md' : 'bg-neutral-800 hover:bg-neutral-750'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// 83. Planar Graph Untangle
export function TangledLinesGame({ onFinish }: GameProps) {
  const [untangled, setUntangled] = useState(false);

  const untangle = () => {
    sound.playSuccess();
    setUntangled(true);
    onFinish(100, '0 Intersecting Edges! (Planar)');
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Planar Untangle</span>
        <span className="text-emerald-400 font-bold">{untangled ? 'Untangled!' : 'Shift Nodes'}</span>
      </div>

      <div className="w-full max-w-sm h-48 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col items-center justify-center p-4 gap-4">
        <div className="text-4xl">🕸️</div>
        <button
          onClick={untangle}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
        >
          RESOLVE INTERSECTIONS
        </button>
      </div>
    </div>
  );
}

// 84. Labyrinth Navigation
export function MazePathfinderGame({ onFinish }: GameProps) {
  const [pos, setPos] = useState({ r: 0, c: 0 });

  const move = (dr: number, dc: number) => {
    const nr = Math.max(0, Math.min(3, pos.r + dr));
    const nc = Math.max(0, Math.min(3, pos.c + dc));
    sound.playTap();
    setPos({ r: nr, c: nc });

    if (nr === 3 && nc === 3) {
      sound.playSuccess();
      onFinish(100, 'Maze Goal Reached!');
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Labyrinth Path</span>
        <span className="text-amber-400 font-bold">Goal at (3, 3)</span>
      </div>

      <div className="grid grid-cols-4 gap-2 p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
        {Array.from({ length: 16 }, (_, i) => {
          const r = Math.floor(i / 4);
          const c = i % 4;
          const isPlayer = pos.r === r && pos.c === c;
          const isGoal = r === 3 && c === 3;
          return (
            <div
              key={i}
              className="w-14 h-14 bg-neutral-800 rounded-lg flex items-center justify-center text-xl font-bold"
            >
              {isPlayer ? '🏃' : isGoal ? '🏁' : ''}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button onClick={() => move(-1, 0)} className="px-3 py-1 bg-neutral-800 rounded text-white">▲</button>
        <button onClick={() => move(0, -1)} className="px-3 py-1 bg-neutral-800 rounded text-white">◀</button>
        <button onClick={() => move(1, 0)} className="px-3 py-1 bg-neutral-800 rounded text-white">▼</button>
        <button onClick={() => move(0, 1)} className="px-3 py-1 bg-neutral-800 rounded text-white">▶</button>
      </div>
    </div>
  );
}

// 85. Rainbow Gradient Arranger
export function SpectrumSorterGame({ onFinish }: GameProps) {
  const [swapped, setSwapped] = useState(false);

  const swap = () => {
    sound.playSuccess();
    setSwapped(true);
    onFinish(100, 'Perfect Chromatic Spectrum');
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Spectrum Sorter</span>
        <span className="text-cyan-400 font-bold">{swapped ? 'Sorted!' : 'Arrange Gradient'}</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-6">
        <div className="flex gap-2">
          {['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#6366f1'].map((c, i) => (
            <div key={i} style={{ backgroundColor: c }} className="w-10 h-16 rounded-md shadow-md" />
          ))}
        </div>
        <button
          onClick={swap}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs"
        >
          ALIGN SPECTRUM
        </button>
      </div>
    </div>
  );
}

// 86. Tangram Geometric Silhouette
export function TangramFitGame({ onFinish }: GameProps) {
  const [fitted, setFitted] = useState(false);

  const fit = () => {
    sound.playSuccess();
    setFitted(true);
    onFinish(100, 'Silhouette Fully Packed');
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Tangram Silhouette</span>
        <span className="text-amber-400 font-bold">{fitted ? 'Solved!' : 'Pack Shapes'}</span>
      </div>

      <div className="w-full max-w-sm h-48 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col items-center justify-center p-4 gap-4">
        <div className="text-4xl">📐</div>
        <button
          onClick={fit}
          className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs"
        >
          SNAP PIECES INTO FRAME
        </button>
      </div>
    </div>
  );
}

// 87. Perimeter Comparison
export function PerimeterGuessGame({ onFinish }: GameProps) {
  const handleSelect = (correct: boolean) => {
    if (correct) {
      sound.playSuccess();
      onFinish(100, 'Larger Perimeter Identified');
    } else {
      sound.playFail();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Perimeter Estimation</span>
        <span className="text-cyan-400 font-bold">Select Larger Boundary</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-6">
        <div className="flex gap-8">
          <button
            onClick={() => handleSelect(false)}
            className="w-20 h-20 border-2 border-neutral-600 rounded-lg flex items-center justify-center hover:border-white"
          >
            Shape A
          </button>
          <button
            onClick={() => handleSelect(true)}
            className="w-20 h-20 border-2 border-dashed border-cyan-400 rounded-lg flex items-center justify-center hover:border-white"
          >
            Shape B
          </button>
        </div>
      </div>
    </div>
  );
}

// 88. Cartesian Reflection
export function MirrorCoordGame({ onFinish }: GameProps) {
  const handleAnswer = (ans: string) => {
    if (ans === '(3, -4)') {
      sound.playSuccess();
      onFinish(100, 'Coordinate (3, -4) Reflected');
    } else {
      sound.playFail();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Cartesian Reflection</span>
        <span className="text-amber-400 font-bold">Point: (3, 4) across X-axis</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-4">
        <p className="text-xs text-neutral-400">Reflected coordinate across X-axis:</p>
        <div className="grid grid-cols-2 gap-3 w-full">
          {['(-3, 4)', '(3, -4)', '(-3, -4)', '(4, 3)'].map((c) => (
            <button
              key={c}
              onClick={() => handleAnswer(c)}
              className="py-2 bg-neutral-800 hover:bg-neutral-750 font-mono text-sm text-white rounded-lg"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
