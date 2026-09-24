import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';
import { GameProps } from './ReflexGames';

// 33. Odd Hue Spotter
export function OddColorGame({ onFinish }: GameProps) {
  const [level, setLevel] = useState(1);
  const [gridSize, setGridSize] = useState(3);
  const [outlierIdx, setOutlierIdx] = useState(0);
  const [baseColor, setBaseColor] = useState({ h: 200, s: 70, l: 50 });
  const [isPlaying, setIsPlaying] = useState(false);

  const startLevel = (lvl: number) => {
    const size = Math.min(6, 2 + Math.floor(lvl / 3));
    setGridSize(size);
    const count = size * size;
    const outlier = Math.floor(Math.random() * count);
    setOutlierIdx(outlier);

    const h = Math.floor(Math.random() * 360);
    setBaseColor({ h, s: 70, l: 50 });
  };

  const handleStart = () => {
    setLevel(1);
    setIsPlaying(true);
    sound.playTap();
    startLevel(1);
  };

  const handleTileClick = (idx: number) => {
    if (!isPlaying) return;
    if (idx === outlierIdx) {
      sound.playSuccess();
      const nextLvl = level + 1;
      setLevel(nextLvl);
      if (nextLvl > 15) {
        setIsPlaying(false);
        onFinish(nextLvl, `Max Level 15!`);
      } else {
        startLevel(nextLvl);
      }
    } else {
      sound.playFail();
      setIsPlaying(false);
      onFinish(level, `Level ${level}`);
    }
  };

  const delta = Math.max(3, 20 - level);
  const outlierL = baseColor.l + (baseColor.l > 50 ? -delta : delta);

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Odd Hue Spotter</span>
        <span className="text-amber-400 font-bold">Level {level}</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          gap: '8px',
        }}
        className="w-full max-w-[320px] aspect-square p-4 bg-neutral-900 border border-neutral-800 rounded-xl"
      >
        {isPlaying &&
          Array.from({ length: gridSize * gridSize }, (_, i) => {
            const isOutlier = i === outlierIdx;
            const bg = isOutlier
              ? `hsl(${baseColor.h}, ${baseColor.s}%, ${outlierL}%)`
              : `hsl(${baseColor.h}, ${baseColor.s}%, ${baseColor.l}%)`;
            return (
              <button
                key={i}
                onClick={() => handleTileClick(i)}
                style={{ backgroundColor: bg }}
                className="w-full h-full rounded-lg transition-transform active:scale-95"
              />
            );
          })}
      </div>

      {!isPlaying && (
        <button
          onClick={handleStart}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg shadow-md text-sm"
        >
          Start Odd Color Hunt
        </button>
      )}
    </div>
  );
}

// 34. Subitizing Flash (Dot Counter)
export function DotCounterGame({ onFinish }: GameProps) {
  const [dotCount, setDotCount] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const startRound = (r: number, s: number) => {
    if (r >= 5) {
      setIsPlaying(false);
      sound.playSuccess();
      onFinish(s, `${s} pts`);
      return;
    }

    const count = Math.floor(Math.random() * 7) + 4; // 4 to 10 dots
    setDotCount(count);
    setIsFlashing(true);
    sound.playTap();

    const opts = [count, count - 1, count + 1, count + 2].sort(() => Math.random() - 0.5);
    setOptions(opts);

    setTimeout(() => {
      setIsFlashing(false);
    }, 550);
  };

  const handleStart = () => {
    setScore(0);
    setRound(0);
    setIsPlaying(true);
    startRound(0, 0);
  };

  const handleAnswer = (choice: number) => {
    if (choice === dotCount) {
      sound.playSuccess();
      const nextScore = score + 20;
      setScore(nextScore);
      const nextRound = round + 1;
      setRound(nextRound);
      startRound(nextRound, nextScore);
    } else {
      sound.playFail();
      const nextRound = round + 1;
      setRound(nextRound);
      startRound(nextRound, score);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Trial: {round}/5</span>
        <span className="text-cyan-400 font-bold">Score: {score} pts</span>
      </div>

      <div className="w-full max-w-sm h-60 bg-neutral-900 border border-neutral-800 rounded-xl relative flex flex-col items-center justify-center p-4">
        {isFlashing ? (
          <div className="relative w-full h-full">
            {Array.from({ length: dotCount }, (_, i) => (
              <div
                key={i}
                style={{
                  left: `${(i * 23 + 15) % 80 + 10}%`,
                  top: `${(i * 37 + 20) % 70 + 15}%`,
                }}
                className="absolute w-5 h-5 rounded-full bg-cyan-400 shadow-md"
              />
            ))}
          </div>
        ) : isPlaying ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-neutral-400">How many dots appeared?</p>
            <div className="grid grid-cols-4 gap-2">
              {options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-lg font-mono font-bold rounded-lg text-white"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            onClick={handleStart}
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-md text-sm"
          >
            Start Subitizing Flash
          </button>
        )}
      </div>
    </div>
  );
}

// 35. Stroop Color Conflict
export function StroopTestGame({ onFinish }: GameProps) {
  const colorItems = [
    { name: 'RED', hex: '#ef4444' },
    { name: 'BLUE', hex: '#3b82f6' },
    { name: 'GREEN', hex: '#10b981' },
    { name: 'YELLOW', hex: '#f59e0b' },
  ];

  const [currentWord, setCurrentWord] = useState('BLUE');
  const [currentInk, setCurrentInk] = useState('#ef4444');
  const [score, setScore] = useState(0);
  const [trials, setTrials] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const nextTrial = (curScore: number, curTrials: number) => {
    if (curTrials >= 10) {
      setIsPlaying(false);
      sound.playSuccess();
      onFinish(curScore, `${curScore}/10 Stroop`);
      return;
    }

    const wordIdx = Math.floor(Math.random() * colorItems.length);
    const inkIdx = Math.floor(Math.random() * colorItems.length);
    setCurrentWord(colorItems[wordIdx].name);
    setCurrentInk(colorItems[inkIdx].hex);
  };

  const handleStart = () => {
    setScore(0);
    setTrials(0);
    setIsPlaying(true);
    sound.playTap();
    nextTrial(0, 0);
  };

  const handleChoice = (colorHex: string) => {
    if (!isPlaying) return;
    if (colorHex === currentInk) {
      sound.playSuccess();
      const nextScore = score + 1;
      setScore(nextScore);
      const nextTrials = trials + 1;
      setTrials(nextTrials);
      nextTrial(nextScore, nextTrials);
    } else {
      sound.playFail();
      const nextTrials = trials + 1;
      setTrials(nextTrials);
      nextTrial(score, nextTrials);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Trial: {trials}/10</span>
        <span className="text-rose-400 font-bold">Score: {score}</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-6">
        {isPlaying ? (
          <>
            <span style={{ color: currentInk }} className="text-4xl font-extrabold tracking-wider">
              {currentWord}
            </span>
            <p className="text-xs text-neutral-400">Select the INK COLOR (ignore the written word):</p>
            <div className="grid grid-cols-2 gap-3 w-full">
              {colorItems.map((c, i) => (
                <button
                  key={i}
                  onClick={() => handleChoice(c.hex)}
                  className="py-2.5 bg-neutral-800 hover:bg-neutral-750 font-bold rounded-lg text-sm text-white"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </>
        ) : (
          <button
            onClick={handleStart}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-md text-sm"
          >
            Start Stroop Test
          </button>
        )}
      </div>
    </div>
  );
}

// 36. Camouflage Glyph
export function CamouflageGlyphGame({ onFinish }: GameProps) {
  const [targetPos, setTargetPos] = useState(12);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const startRound = () => {
    setTargetPos(Math.floor(Math.random() * 25));
  };

  const handleStart = () => {
    setIsPlaying(true);
    setScore(0);
    sound.playTap();
    startRound();
  };

  const handleClick = (idx: number) => {
    if (!isPlaying) return;
    if (idx === targetPos) {
      sound.playSuccess();
      const nextScore = score + 1;
      setScore(nextScore);
      if (nextScore >= 5) {
        setIsPlaying(false);
        onFinish(nextScore, `${nextScore} glyphs`);
      } else {
        startRound();
      }
    } else {
      sound.playFail();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Find the Target Glyph: <strong className="text-amber-400">Ω</strong></span>
        <span className="text-amber-400 font-bold">Found: {score}/5</span>
      </div>

      <div className="grid grid-cols-5 gap-2 p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
        {Array.from({ length: 25 }, (_, i) => {
          const isTarget = i === targetPos;
          return (
            <button
              key={i}
              onClick={() => handleClick(i)}
              className="w-12 h-12 rounded bg-neutral-800 hover:bg-neutral-750 flex items-center justify-center text-lg font-mono text-neutral-400"
            >
              {isTarget ? 'Ω' : 'O'}
            </button>
          );
        })}
      </div>

      {!isPlaying && (
        <button
          onClick={handleStart}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg shadow-md text-sm"
        >
          Start Camouflage Search
        </button>
      )}
    </div>
  );
}

// 37. Ebbinghaus Size Match (Size Illusion)
export function SizeIllusionGame({ onFinish }: GameProps) {
  const [sliderVal, setSliderVal] = useState(50);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    const trueSize = 50;
    const error = Math.abs(sliderVal - trueSize);
    const accuracy = Math.max(0, 100 - error * 2);
    sound.playSuccess();
    onFinish(accuracy, `${accuracy}% Accuracy`);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Ebbinghaus Illusion Match</span>
        <span className="text-cyan-400 font-bold">{sliderVal} px</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-6">
        <div className="flex items-center justify-around w-full">
          {/* Reference Circle with large rings */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-amber-400 z-10" />
            <div className="absolute w-28 h-28 rounded-full border-2 border-neutral-700 pointer-events-none" />
          </div>

          {/* User Adjustable Circle */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <div
              style={{ width: `${sliderVal}px`, height: `${sliderVal}px` }}
              className="rounded-full bg-cyan-400 transition-all z-10"
            />
          </div>
        </div>

        <input
          type="range"
          min="20"
          max="80"
          value={sliderVal}
          onChange={(e) => setSliderVal(Number(e.target.value))}
          className="w-full"
        />

        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs"
        >
          Submit Diameter Match
        </button>
      </div>
    </div>
  );
}

// 38. Angle Estimator
export function AngleEstimatorGame({ onFinish }: GameProps) {
  const [targetAngle, setTargetAngle] = useState(65);
  const [guessAngle, setGuessAngle] = useState(45);
  const [score, setScore] = useState(0);

  const startNew = () => {
    setTargetAngle(Math.floor(Math.random() * 150) + 15);
  };

  const handleCheck = () => {
    const diff = Math.abs(guessAngle - targetAngle);
    let pts = 0;
    if (diff <= 5) pts = 100;
    else if (diff <= 15) pts = 60;
    else if (diff <= 30) pts = 30;

    const nextScore = score + pts;
    setScore(nextScore);
    sound.playSuccess();
    onFinish(nextScore, `${nextScore} pts (Diff: ${diff}°)`);
    startNew();
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Angle Estimator</span>
        <span className="text-amber-400 font-bold">Guess: {guessAngle}°</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-4">
        {/* SVG Drawing of Angle */}
        <svg width="180" height="120" className="overflow-visible">
          <line x1="90" y1="100" x2="170" y2="100" stroke="#94a3b8" strokeWidth="3" />
          <line
            x1="90"
            y1="100"
            x2={90 + 80 * Math.cos((-targetAngle * Math.PI) / 180)}
            y2={100 + 80 * Math.sin((-targetAngle * Math.PI) / 180)}
            stroke="#f59e0b"
            strokeWidth="3"
          />
          <circle cx="90" cy="100" r="4" fill="#fbbf24" />
        </svg>

        <input
          type="range"
          min="10"
          max="170"
          value={guessAngle}
          onChange={(e) => setGuessAngle(Number(e.target.value))}
          className="w-full"
        />

        <button
          onClick={handleCheck}
          className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs"
        >
          Check Estimate
        </button>
      </div>
    </div>
  );
}

// 39. Shadow Silhouette Match
export function ShadowMatchGame({ onFinish }: GameProps) {
  const [correctOption, setCorrectOption] = useState(2);
  const [score, setScore] = useState(0);

  const handleSelect = (idx: number) => {
    if (idx === correctOption) {
      sound.playSuccess();
      const nextScore = score + 100;
      setScore(nextScore);
      onFinish(nextScore, `${nextScore} pts (Matched!)`);
      setCorrectOption(Math.floor(Math.random() * 3));
    } else {
      sound.playFail();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Shadow Projection</span>
        <span className="text-emerald-400 font-bold">Score: {score}</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-6">
        <div className="text-5xl p-4 bg-neutral-800 rounded-2xl shadow-inner">
          🔺
        </div>
        <p className="text-xs text-neutral-400">Match the cast shadow silhouette:</p>
        <div className="flex gap-4">
          {['▲', '◼', '●'].map((sym, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i === 0 ? correctOption : (correctOption + 1) % 3)}
              className="w-14 h-14 bg-neutral-800 hover:bg-neutral-750 text-2xl flex items-center justify-center rounded-lg border border-neutral-700"
            >
              {sym}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 40. Coherent Motion Spotter
export function CoherentMotionGame({ onFinish }: GameProps) {
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [score, setScore] = useState(0);

  const startTrial = () => {
    setDirection(Math.random() > 0.5 ? 'left' : 'right');
  };

  const handleGuess = (d: 'left' | 'right') => {
    if (d === direction) {
      sound.playSuccess();
      const nextScore = score + 1;
      setScore(nextScore);
      if (nextScore >= 5) {
        onFinish(nextScore, `${nextScore} coherent drift detections`);
      } else {
        startTrial();
      }
    } else {
      sound.playFail();
      startTrial();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Motion Drift</span>
        <span className="text-cyan-400 font-bold">Detected: {score}/5</span>
      </div>

      <div className="w-full max-w-sm h-48 bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center justify-between">
        <p className="text-xs text-neutral-400 text-center">
          Which horizontal direction is the subtle particle drift moving?
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => handleGuess('left')}
            className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-lg text-sm"
          >
            ◀ LEFT DRIFT
          </button>
          <button
            onClick={() => handleGuess('right')}
            className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-lg text-sm"
          >
            RIGHT DRIFT ▶
          </button>
        </div>
      </div>
    </div>
  );
}
