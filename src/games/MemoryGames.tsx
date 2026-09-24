import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';
import { GameProps } from './ReflexGames';

// 17. Chime Sequence Recall (Simon)
export function SimonChimeGame({ onFinish }: GameProps) {
  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];
  const notes = [261.63, 329.63, 392.0, 523.25]; // C, E, G, C

  const [sequence, setSequence] = useState<number[]>([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);

  const playSequence = (seq: number[]) => {
    setIsShowingSequence(true);
    let step = 0;
    const interval = setInterval(() => {
      if (step >= seq.length) {
        clearInterval(interval);
        setActivePad(null);
        setIsShowingSequence(false);
        setPlayerStep(0);
        return;
      }
      const pad = seq[step];
      setActivePad(pad);
      sound.playBeep(notes[pad], 0.15);
      setTimeout(() => setActivePad(null), 250);
      step++;
    }, 450);
  };

  const handleStart = () => {
    const first = [Math.floor(Math.random() * 4)];
    setSequence(first);
    setIsPlaying(true);
    playSequence(first);
  };

  const handlePadClick = (idx: number) => {
    if (!isPlaying || isShowingSequence) return;
    sound.playBeep(notes[idx], 0.12);
    setActivePad(idx);
    setTimeout(() => setActivePad(null), 150);

    if (idx === sequence[playerStep]) {
      const nextStep = playerStep + 1;
      if (nextStep === sequence.length) {
        // Round cleared!
        sound.playSuccess();
        const nextSeq = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(nextSeq);
        setTimeout(() => playSequence(nextSeq), 800);
      } else {
        setPlayerStep(nextStep);
      }
    } else {
      // Wrong note
      sound.playFail();
      setIsPlaying(false);
      const score = sequence.length - 1;
      onFinish(score, `${score} sequence`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Simon Chime</span>
        <span className="text-amber-400 font-bold">Length: {sequence.length}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
        {colors.map((c, idx) => (
          <button
            key={idx}
            onClick={() => handlePadClick(idx)}
            disabled={isShowingSequence}
            style={{
              backgroundColor: activePad === idx ? '#ffffff' : c,
              opacity: activePad === idx ? 1 : 0.8,
            }}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl shadow-lg transition-all active:scale-95 disabled:cursor-not-allowed"
          />
        ))}
      </div>

      {!isPlaying ? (
        <button
          onClick={handleStart}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg shadow-md text-sm"
        >
          Start Simon Sequence
        </button>
      ) : (
        <p className="text-xs text-neutral-400">
          {isShowingSequence ? 'Watch and listen to the sequence...' : 'Repeat the sequence!'}
        </p>
      )}
    </div>
  );
}

// 18. Card Matrix Pairs (Memory Match)
export function CardPairsGame({ onFinish }: GameProps) {
  const symbols = ['⭐', '💎', '🔥', '⚡', '🌙', '🍀', '🍎', '🎯'];
  const [deck, setDeck] = useState<{ id: number; symbol: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const initDeck = () => {
    const doubled = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((sym, idx) => ({ id: idx, symbol: sym, flipped: false, matched: false }));
    setDeck(doubled);
    setFlippedIndices([]);
    setMoves(0);
  };

  useEffect(() => {
    initDeck();
  }, []);

  const handleCardClick = (idx: number) => {
    if (flippedIndices.length >= 2 || deck[idx].flipped || deck[idx].matched) return;

    sound.playTap();
    const newDeck = [...deck];
    newDeck[idx].flipped = true;
    setDeck(newDeck);

    const newFlipped = [...flippedIndices, idx];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;
      if (deck[first].symbol === deck[second].symbol) {
        sound.playSuccess();
        newDeck[first].matched = true;
        newDeck[second].matched = true;
        setDeck(newDeck);
        setFlippedIndices([]);

        // Check victory
        if (newDeck.every((c) => c.matched)) {
          onFinish(moves + 1, `${moves + 1} moves`);
        }
      } else {
        sound.playFail();
        setTimeout(() => {
          newDeck[first].flipped = false;
          newDeck[second].flipped = false;
          setDeck([...newDeck]);
          setFlippedIndices([]);
        }, 800);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Flips: {moves}</span>
        <button onClick={initDeck} className="text-xs text-neutral-400 hover:text-white underline">
          Shuffle
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2.5 p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
        {deck.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(idx)}
            className={`w-14 h-16 sm:w-16 sm:h-20 rounded-lg flex items-center justify-center text-2xl font-bold transition-all ${
              card.flipped || card.matched
                ? 'bg-neutral-800 border-2 border-amber-400 text-white shadow-md'
                : 'bg-neutral-950 border border-neutral-800 text-neutral-600 hover:border-neutral-700'
            }`}
          >
            {card.flipped || card.matched ? card.symbol : '?'}
          </button>
        ))}
      </div>
    </div>
  );
}

// 19. Spatial Span Matrix (Corsi block pattern recall)
export function SpatialSpanGame({ onFinish }: GameProps) {
  const [level, setLevel] = useState(3);
  const [activePattern, setActivePattern] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [isShowing, setIsShowing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const startLevel = (len: number) => {
    setIsShowing(true);
    setPlayerInput([]);
    const pattern: number[] = [];
    while (pattern.length < len) {
      const r = Math.floor(Math.random() * 16);
      if (!pattern.includes(r)) pattern.push(r);
    }
    setActivePattern(pattern);

    let step = 0;
    const interval = setInterval(() => {
      if (step >= pattern.length) {
        clearInterval(interval);
        setIsShowing(false);
        return;
      }
      sound.playBeep(520 + step * 40, 0.12);
      step++;
    }, 600);
  };

  const handleTileClick = (idx: number) => {
    if (!isPlaying || isShowing) return;
    sound.playTap();
    const nextInput = [...playerInput, idx];
    setPlayerInput(nextInput);

    if (activePattern[nextInput.length - 1] !== idx) {
      sound.playFail();
      setIsPlaying(false);
      onFinish(level, `Level ${level}`);
      return;
    }

    if (nextInput.length === activePattern.length) {
      sound.playSuccess();
      const nextLevel = level + 1;
      setLevel(nextLevel);
      setTimeout(() => startLevel(nextLevel), 800);
    }
  };

  const handleStart = () => {
    setLevel(3);
    setIsPlaying(true);
    startLevel(3);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Spatial Span</span>
        <span className="text-emerald-400 font-bold">Span: {level}</span>
      </div>

      <div className="grid grid-cols-4 gap-2.5 p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
        {Array.from({ length: 16 }, (_, i) => i).map((idx) => {
          const isHighlight = isShowing && activePattern.includes(idx);
          const isSelected = playerInput.includes(idx);
          return (
            <button
              key={idx}
              onClick={() => handleTileClick(idx)}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg transition-all ${
                isHighlight
                  ? 'bg-amber-400 shadow-md shadow-amber-400/50 scale-105'
                  : isSelected
                  ? 'bg-emerald-600 shadow-md'
                  : 'bg-neutral-800 hover:bg-neutral-750'
              }`}
            />
          );
        })}
      </div>

      {!isPlaying && (
        <button
          onClick={handleStart}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-md text-sm"
        >
          Start Spatial Span
        </button>
      )}
    </div>
  );
}

// 20. Digit Span Challenge
export function DigitSpanGame({ onFinish }: GameProps) {
  const [digits, setDigits] = useState<string>('');
  const [inputVal, setInputVal] = useState('');
  const [length, setLength] = useState(4);
  const [state, setState] = useState<'idle' | 'showing' | 'answering'>('idle');

  const startRound = (len: number) => {
    let str = '';
    for (let i = 0; i < len; i++) {
      str += Math.floor(Math.random() * 10);
    }
    setDigits(str);
    setInputVal('');
    setState('showing');
    sound.playTap();

    setTimeout(() => {
      setState('answering');
    }, len * 700 + 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal === digits) {
      sound.playSuccess();
      const nextLen = length + 1;
      setLength(nextLen);
      startRound(nextLen);
    } else {
      sound.playFail();
      setState('idle');
      onFinish(length - 1, `${length - 1} digits`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Digit Span Capacity</span>
        <span className="text-cyan-400 font-bold">{length} Digits</span>
      </div>

      <div className="w-full max-w-sm h-48 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col items-center justify-center p-6 text-center">
        {state === 'idle' && (
          <button
            onClick={() => startRound(4)}
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-md text-sm"
          >
            Start Digit Span
          </button>
        )}

        {state === 'showing' && (
          <div className="space-y-2">
            <span className="text-4xl sm:text-5xl font-mono font-bold tracking-widest text-amber-400">
              {digits}
            </span>
            <p className="text-xs text-neutral-400">Memorize this sequence...</p>
          </div>
        )}

        {state === 'answering' && (
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 w-full">
            <input
              type="text"
              pattern="[0-9]*"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter digits..."
              autoFocus
              className="w-full max-w-[200px] text-center text-2xl font-mono py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs"
            >
              Verify
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// 21. Palette Spectrum Recall
export function PaletteRecallGame({ onFinish }: GameProps) {
  const paletteSet = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6'];
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [userOrder, setUserOrder] = useState<string[]>([]);
  const [state, setState] = useState<'idle' | 'memorize' | 'order'>('idle');

  const handleStart = () => {
    setState('memorize');
    sound.playTap();
    setUserOrder([]);
    setTimeout(() => {
      setShuffled([...paletteSet].sort(() => Math.random() - 0.5));
      setState('order');
    }, 2500);
  };

  const handleColorClick = (color: string) => {
    if (state !== 'order' || userOrder.includes(color)) return;
    sound.playTap();
    const nextOrder = [...userOrder, color];
    setUserOrder(nextOrder);

    if (nextOrder.length === paletteSet.length) {
      const isCorrect = nextOrder.every((c, i) => c === paletteSet[i]);
      if (isCorrect) {
        sound.playSuccess();
        onFinish(100, '100% Perfect Order');
      } else {
        sound.playFail();
        onFinish(40, 'Incorrect Order');
      }
      setState('idle');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Palette Order</span>
        <span className="text-amber-400 font-bold">{state}</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-6">
        {state === 'memorize' && (
          <div className="flex gap-2">
            {paletteSet.map((c, i) => (
              <div key={i} style={{ backgroundColor: c }} className="w-12 h-16 rounded-md shadow-md" />
            ))}
          </div>
        )}

        {state === 'order' && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2 min-h-16">
              {userOrder.map((c, i) => (
                <div key={i} style={{ backgroundColor: c }} className="w-10 h-14 rounded-md shadow-md" />
              ))}
            </div>
            <p className="text-xs text-neutral-400">Click colors in original order:</p>
            <div className="flex gap-2">
              {shuffled.map((c, i) => (
                <button
                  key={i}
                  onClick={() => handleColorClick(c)}
                  disabled={userOrder.includes(c)}
                  style={{ backgroundColor: c }}
                  className="w-12 h-16 rounded-md shadow-md disabled:opacity-20 active:scale-95 transition-transform"
                />
              ))}
            </div>
          </div>
        )}

        {state === 'idle' && (
          <button
            onClick={handleStart}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg shadow-md text-sm"
          >
            Start Palette Recall
          </button>
        )}
      </div>
    </div>
  );
}

// 22. Labyrinth Path Echo
export function PathEchoGame({ onFinish }: GameProps) {
  const [path, setPath] = useState<number[]>([]);
  const [playerPath, setPlayerPath] = useState<number[]>([]);
  const [isEchoing, setIsEchoing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const startLabyrinth = () => {
    setIsEchoing(true);
    setIsPlaying(true);
    setPlayerPath([]);
    const generated = [0, 1, 4, 7, 8]; // path on 3x3
    setPath(generated);

    let step = 0;
    const interval = setInterval(() => {
      if (step >= generated.length) {
        clearInterval(interval);
        setIsEchoing(false);
        return;
      }
      sound.playBeep(440 + step * 50, 0.1);
      step++;
    }, 450);
  };

  const handleCellClick = (idx: number) => {
    if (!isPlaying || isEchoing) return;
    sound.playTap();
    const next = [...playerPath, idx];
    setPlayerPath(next);

    if (path[next.length - 1] !== idx) {
      sound.playFail();
      setIsPlaying(false);
      onFinish(next.length - 1, `${next.length - 1} steps`);
      return;
    }

    if (next.length === path.length) {
      sound.playSuccess();
      setIsPlaying(false);
      onFinish(path.length, `${path.length} steps (Flawless)`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Path Echo</span>
        <span className="text-cyan-400 font-bold">{isEchoing ? 'Observing...' : 'Trace Path'}</span>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
        {Array.from({ length: 9 }, (_, i) => i).map((idx) => {
          const isLit = isEchoing && path.includes(idx);
          const isUser = playerPath.includes(idx);
          return (
            <button
              key={idx}
              onClick={() => handleCellClick(idx)}
              className={`w-18 h-18 sm:w-20 sm:h-20 rounded-xl transition-all ${
                isLit
                  ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50'
                  : isUser
                  ? 'bg-emerald-500'
                  : 'bg-neutral-800 hover:bg-neutral-750'
              }`}
            />
          );
        })}
      </div>

      {!isPlaying && (
        <button
          onClick={startLabyrinth}
          className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-md text-sm"
        >
          Start Path Echo
        </button>
      )}
    </div>
  );
}

// 23. Missing Object Spotter
export function MissingObjectGame({ onFinish }: GameProps) {
  const allIcons = ['⚓', '🔑', '☀️', '☕', '🚀', '🎸', '⚽', '👑', '🔔'];
  const [displayed, setDisplayed] = useState<string[]>([]);
  const [missing, setMissing] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'study' | 'guess'>('idle');

  const handleStart = () => {
    setState('study');
    sound.playTap();
    const shuffled = [...allIcons].sort(() => Math.random() - 0.5).slice(0, 7);
    setDisplayed(shuffled);

    setTimeout(() => {
      const removedIdx = Math.floor(Math.random() * shuffled.length);
      const target = shuffled[removedIdx];
      setMissing(target);
      const remaining = shuffled.filter((_, i) => i !== removedIdx);
      setDisplayed(remaining);
      setState('guess');
    }, 2800);
  };

  const handleGuess = (icon: string) => {
    if (state !== 'guess') return;
    if (icon === missing) {
      sound.playSuccess();
      onFinish(100, 'Found in 1 guess!');
    } else {
      sound.playFail();
      onFinish(0, 'Incorrect Icon');
    }
    setState('idle');
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Missing Object</span>
        <span className="text-amber-400 font-bold">{state}</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-6">
        {state === 'study' && (
          <div className="flex flex-wrap justify-center gap-3">
            {displayed.map((icon, i) => (
              <span key={i} className="text-4xl p-2 bg-neutral-800 rounded-lg">
                {icon}
              </span>
            ))}
          </div>
        )}

        {state === 'guess' && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-xs text-neutral-300">Which symbol vanished?</p>
            <div className="flex flex-wrap justify-center gap-3">
              {allIcons.map((icon, i) => (
                <button
                  key={i}
                  onClick={() => handleGuess(icon)}
                  className="text-3xl p-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg active:scale-95"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        )}

        {state === 'idle' && (
          <button
            onClick={handleStart}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg shadow-md text-sm"
          >
            Start Spotter
          </button>
        )}
      </div>
    </div>
  );
}

// 24. Mini 1-Back Matrix Match
export function NBackGame({ onFinish }: GameProps) {
  const [currentPos, setCurrentPos] = useState<number | null>(null);
  const [prevPos, setPrevPos] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [trials, setTrials] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const nextStep = (curScore: number, curTrials: number) => {
    if (curTrials >= 10) {
      setIsPlaying(false);
      sound.playSuccess();
      onFinish(curScore, `${curScore}/10 correct`);
      return;
    }

    const next = Math.random() < 0.4 ? currentPos : Math.floor(Math.random() * 9);
    setPrevPos(currentPos);
    setCurrentPos(next);
    sound.playBeep(600, 0.05);
  };

  const handleStart = () => {
    setScore(0);
    setTrials(0);
    setIsPlaying(true);
    const first = Math.floor(Math.random() * 9);
    setCurrentPos(first);
    setPrevPos(null);
  };

  const handleDecision = (isMatch: boolean) => {
    if (!isPlaying) return;
    const actualMatch = prevPos !== null && currentPos === prevPos;
    if (isMatch === actualMatch) {
      sound.playSuccess();
      setScore((s) => s + 1);
    } else {
      sound.playFail();
    }
    const nextTrials = trials + 1;
    setTrials(nextTrials);
    nextStep(score + (isMatch === actualMatch ? 1 : 0), nextTrials);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Trial: {trials}/10</span>
        <span className="text-emerald-400 font-bold">Score: {score}</span>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
        {Array.from({ length: 9 }, (_, i) => i).map((idx) => (
          <div
            key={idx}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-neutral-800 transition-colors ${
              currentPos === idx ? 'bg-amber-400 shadow-md' : 'bg-neutral-800'
            }`}
          />
        ))}
      </div>

      {isPlaying ? (
        <div className="flex gap-4">
          <button
            onClick={() => handleDecision(true)}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-sm"
          >
            MATCH (Same)
          </button>
          <button
            onClick={() => handleDecision(false)}
            className="px-6 py-2 bg-neutral-750 hover:bg-neutral-700 text-white font-bold rounded-lg text-sm"
          >
            DIFFERENT
          </button>
        </div>
      ) : (
        <button
          onClick={handleStart}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg shadow-md text-sm"
        >
          Start 1-Back Match
        </button>
      )}
    </div>
  );
}
