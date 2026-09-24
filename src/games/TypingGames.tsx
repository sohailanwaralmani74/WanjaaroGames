import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';
import { GameProps } from './ReflexGames';

// 25. Speed Wordsmith (60-sec WPM Test)
export function SpeedWordsGame({ onFinish }: GameProps) {
  const wordList = [
    'swift', 'flame', 'quest', 'spark', 'frost', 'brave', 'cloud', 'prism', 'vivid', 'orbit',
    'glide', 'light', 'pulse', 'storm', 'focus', 'logic', 'trace', 'shine', 'rapid', 'climb'
  ];

  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [correctWords, setCorrectWords] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  const targetWord = wordList[currentWordIdx % wordList.length];

  const handleStart = () => {
    setIsPlaying(true);
    setCorrectWords(0);
    setTimeLeft(60);
    setCurrentWordIdx(0);
    setTyped('');
    sound.playTap();

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

  useEffect(() => {
    if (timeLeft === 0 && !isPlaying && correctWords > 0) {
      onFinish(correctWords, `${correctWords} WPM`);
    }
  }, [timeLeft, isPlaying, correctWords, onFinish]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPlaying) return;
    const val = e.target.value;
    if (val.endsWith(' ')) {
      const clean = val.trim();
      if (clean === targetWord) {
        sound.playSuccess();
        setCorrectWords((w) => w + 1);
        setCurrentWordIdx((i) => i + 1);
        setTyped('');
      } else {
        sound.playFail();
        setTyped('');
      }
    } else {
      setTyped(val);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Time Left: {timeLeft}s</span>
        <span className="text-emerald-400 font-bold">WPM: {correctWords}</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-4">
        {isPlaying ? (
          <>
            <p className="text-3xl font-mono font-bold tracking-wide text-amber-400">{targetWord}</p>
            <input
              type="text"
              value={typed}
              onChange={handleChange}
              placeholder="Type word + Space"
              autoFocus
              className="w-full text-center text-xl font-mono py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white outline-none focus:border-emerald-400"
            />
            <p className="text-xs text-neutral-400">Type the word and press Spacebar</p>
          </>
        ) : (
          <button
            onClick={handleStart}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-md text-sm"
          >
            Start Speed Wordsmith
          </button>
        )}
      </div>
    </div>
  );
}

// 26. Falling Letter Rain
export function FallingLettersGame({ onFinish }: GameProps) {
  const [letters, setLetters] = useState<{ id: number; char: string; x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animRef = useRef<number | null>(null);
  const nextId = useRef(0);

  const startRain = () => {
    setIsPlaying(true);
    setScore(0);
    setMisses(0);
    setLetters([]);
    sound.playTap();

    let lastSpawn = performance.now();

    const loop = (now: number) => {
      // Spawn
      if (now - lastSpawn > 900) {
        lastSpawn = now;
        const char = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        const x = Math.floor(Math.random() * 80) + 10;
        setLetters((prev) => [...prev, { id: nextId.current++, char, x, y: 0 }]);
      }

      // Move down
      setLetters((prev) => {
        const next: typeof prev = [];
        for (const item of prev) {
          const newY = item.y + 1.2;
          if (newY > 100) {
            // Missed letter
            sound.playFail();
            setMisses((m) => {
              const nm = m + 1;
              if (nm >= 3) {
                setIsPlaying(false);
                sound.playGameOver();
                onFinish(score, `${score} letters`);
              }
              return nm;
            });
          } else {
            next.push({ ...item, y: newY });
          }
        }
        return next;
      });

      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      const key = e.key.toUpperCase();
      setLetters((prev) => {
        const idx = prev.findIndex((l) => l.char === key);
        if (idx !== -1) {
          sound.playSuccess();
          setScore((s) => s + 1);
          return prev.filter((_, i) => i !== idx);
        }
        return prev;
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, score, onFinish]);

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Misses: {'❌'.repeat(misses)}</span>
        <span className="text-amber-400 font-bold">Popped: {score}</span>
      </div>

      <div className="relative w-full h-72 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {letters.map((l) => (
          <div
            key={l.id}
            style={{ left: `${l.x}%`, top: `${l.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center font-mono font-bold text-cyan-200"
          >
            {l.char}
          </div>
        ))}

        {!isPlaying && (
          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-4">
            <p className="text-xs text-neutral-300 mb-3">Type falling letters before they reach bottom!</p>
            <button
              onClick={startRain}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-md text-sm"
            >
              Start Letter Rain
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 27. Anagram Rush
export function AnagramRushGame({ onFinish }: GameProps) {
  const anagrams = [
    { jumbled: 'E A R T H', answer: 'HEART' },
    { jumbled: 'S M I L E', answer: 'SLIME' },
    { jumbled: 'P L A N E', answer: 'PANEL' },
    { jumbled: 'S T A R E', answer: 'TEARS' },
    { jumbled: 'B R E A D', answer: 'BEARD' },
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleStart = () => {
    setIsPlaying(true);
    setCurrentIdx(0);
    setScore(0);
    setInputVal('');
    sound.playTap();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPlaying) return;
    const current = anagrams[currentIdx];
    if (inputVal.trim().toUpperCase() === current.answer) {
      sound.playSuccess();
      const nextScore = score + 100;
      setScore(nextScore);
      setInputVal('');
      const nextIdx = currentIdx + 1;
      if (nextIdx >= anagrams.length) {
        setIsPlaying(false);
        onFinish(nextScore, `${nextScore} pts (All Solved!)`);
      } else {
        setCurrentIdx(nextIdx);
      }
    } else {
      sound.playFail();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Word: {currentIdx + 1}/{anagrams.length}</span>
        <span className="text-amber-400 font-bold">Score: {score}</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-4">
        {isPlaying ? (
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full">
            <span className="text-3xl font-mono font-bold tracking-widest text-amber-400">
              {anagrams[currentIdx].jumbled}
            </span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Unscrambled word..."
              autoFocus
              className="w-full text-center text-xl font-mono py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white outline-none focus:border-amber-400 uppercase"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs"
            >
              Submit Anagram
            </button>
          </form>
        ) : (
          <button
            onClick={handleStart}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg shadow-md text-sm"
          >
            Start Anagram Rush
          </button>
        )}
      </div>
    </div>
  );
}

// 28. Reverse Typist
export function ReverseTypistGame({ onFinish }: GameProps) {
  const words = ['SWIFT', 'RAPID', 'LOGIC', 'FOCUS', 'SPARK'];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const targetWord = words[currentIdx];
  const reversedTarget = targetWord.split('').reverse().join('');

  const handleStart = () => {
    setIsPlaying(true);
    setCurrentIdx(0);
    setScore(0);
    setTyped('');
    sound.playTap();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setTyped(val);

    if (val === reversedTarget) {
      sound.playSuccess();
      const nextScore = score + 100;
      setScore(nextScore);
      setTyped('');
      const nextIdx = currentIdx + 1;
      if (nextIdx >= words.length) {
        setIsPlaying(false);
        onFinish(nextScore, `${nextScore} pts (Perfect!)`);
      } else {
        setCurrentIdx(nextIdx);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Word: {currentIdx + 1}/{words.length}</span>
        <span className="text-emerald-400 font-bold">Score: {score}</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-4">
        {isPlaying ? (
          <>
            <span className="text-3xl font-mono font-bold text-cyan-400">{targetWord}</span>
            <input
              type="text"
              value={typed}
              onChange={handleChange}
              placeholder="Type in reverse..."
              autoFocus
              className="w-full text-center text-xl font-mono py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white outline-none focus:border-cyan-400 uppercase"
            />
            <p className="text-xs text-neutral-400">Type backwards: {targetWord} ➔ {reversedTarget}</p>
          </>
        ) : (
          <button
            onClick={handleStart}
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-md text-sm"
          >
            Start Reverse Typist
          </button>
        )}
      </div>
    </div>
  );
}

// 29. A-to-Z Alphabet Sprint
export function AlphabetSprintGame({ onFinish }: GameProps) {
  const [expectedCode, setExpectedCode] = useState(65); // 'A'
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const handleStart = () => {
    setExpectedCode(65);
    setIsPlaying(true);
    startTimeRef.current = performance.now();
    sound.playTap();

    timerRef.current = window.setInterval(() => {
      setElapsed(Number(((performance.now() - startTimeRef.current) / 1000).toFixed(2)));
    }, 50);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key.toUpperCase().charCodeAt(0) === expectedCode) {
        sound.playBeep(400 + (expectedCode - 65) * 20, 0.05);
        if (expectedCode === 90) { // 'Z'
          if (timerRef.current) clearInterval(timerRef.current);
          setIsPlaying(false);
          const finalTime = Number(((performance.now() - startTimeRef.current) / 1000).toFixed(2));
          sound.playSuccess();
          onFinish(finalTime, `${finalTime}s`);
        } else {
          setExpectedCode((c) => c + 1);
        }
      } else {
        sound.playFail();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, expectedCode, onFinish]);

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Alphabet Sprint</span>
        <span className="text-amber-400 font-bold">{elapsed}s</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-4">
        {isPlaying ? (
          <>
            <p className="text-xs text-neutral-400">Next Letter To Press:</p>
            <span className="text-6xl font-mono font-bold text-amber-400 animate-pulse">
              {String.fromCharCode(expectedCode)}
            </span>
            <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all"
                style={{ width: `${((expectedCode - 65) / 25) * 100}%` }}
              />
            </div>
          </>
        ) : (
          <button
            onClick={handleStart}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg shadow-md text-sm"
          >
            Start A-to-Z Sprint
          </button>
        )}
      </div>
    </div>
  );
}

// 30. Syntax Striker (Code Symbols)
export function SyntaxStrikerGame({ onFinish }: GameProps) {
  const symbols = ['{', '}', '[', ']', '(', ')', '<', '>', '$', '#', '%', '@'];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const targetSymbol = symbols[currentIdx];

  const handleStart = () => {
    setIsPlaying(true);
    setCurrentIdx(0);
    setScore(0);
    sound.playTap();
  };

  const handleKey = (sym: string) => {
    if (!isPlaying) return;
    if (sym === targetSymbol) {
      sound.playSuccess();
      const nextScore = score + 1;
      setScore(nextScore);
      const nextIdx = currentIdx + 1;
      if (nextIdx >= symbols.length) {
        setIsPlaying(false);
        onFinish(nextScore, `${nextScore} symbols`);
      } else {
        setCurrentIdx(nextIdx);
      }
    } else {
      sound.playFail();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Symbols: {currentIdx + 1}/{symbols.length}</span>
        <span className="text-emerald-400 font-bold">Score: {score}</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-4">
        {isPlaying ? (
          <>
            <span className="text-5xl font-mono font-bold text-cyan-400">{targetSymbol}</span>
            <div className="grid grid-cols-4 gap-2 w-full mt-2">
              {symbols.map((sym, idx) => (
                <button
                  key={idx}
                  onClick={() => handleKey(sym)}
                  className="py-2 bg-neutral-800 hover:bg-neutral-750 font-mono text-lg font-bold rounded text-neutral-200 active:scale-95"
                >
                  {sym}
                </button>
              ))}
            </div>
          </>
        ) : (
          <button
            onClick={handleStart}
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-md text-sm"
          >
            Start Syntax Striker
          </button>
        )}
      </div>
    </div>
  );
}

// 31. Word Chain Relay
export function WordChainGame({ onFinish }: GameProps) {
  const [chain, setChain] = useState<string[]>(['APPLE']);
  const [inputVal, setInputVal] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const lastWord = chain[chain.length - 1];
  const requiredLetter = lastWord[lastWord.length - 1];

  const handleStart = () => {
    setChain(['APPLE']);
    setInputVal('');
    setIsPlaying(true);
    sound.playTap();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPlaying) return;
    const clean = inputVal.trim().toUpperCase();

    if (clean.length >= 3 && clean.startsWith(requiredLetter) && !chain.includes(clean)) {
      sound.playSuccess();
      const nextChain = [...chain, clean];
      setChain(nextChain);
      setInputVal('');
      if (nextChain.length >= 6) {
        setIsPlaying(false);
        onFinish(nextChain.length, `${nextChain.length} chained`);
      }
    } else {
      sound.playFail();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Chain Length: {chain.length}</span>
        <span className="text-amber-400 font-bold">Must start with: {requiredLetter}</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-4">
        {isPlaying ? (
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 w-full">
            <p className="text-lg font-mono text-neutral-300">Previous: <strong className="text-emerald-400">{lastWord}</strong></p>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={`Word starting with ${requiredLetter}...`}
              autoFocus
              className="w-full text-center text-lg font-mono py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white outline-none focus:border-amber-400 uppercase"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs"
            >
              Add to Chain
            </button>
          </form>
        ) : (
          <button
            onClick={handleStart}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg shadow-md text-sm"
          >
            Start Word Chain
          </button>
        )}
      </div>
    </div>
  );
}

// 32. Pangram Speed Run
export function PangramSpeedGame({ onFinish }: GameProps) {
  const sentence = "The quick brown fox jumps over the lazy dog";
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleStart = () => {
    setIsPlaying(true);
    setTyped('');
    setStartTime(performance.now());
    sound.playTap();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTyped(val);

    if (val === sentence) {
      sound.playSuccess();
      setIsPlaying(false);
      const elapsed = Number(((performance.now() - startTime) / 1000).toFixed(2));
      onFinish(elapsed, `${elapsed}s`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">
      <div className="flex justify-between w-full text-sm font-mono text-neutral-300 px-2">
        <span>Pangram Sprint</span>
        <span className="text-emerald-400 font-bold">{Math.round((typed.length / sentence.length) * 100)}%</span>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center gap-4">
        {isPlaying ? (
          <>
            <p className="text-sm font-mono text-neutral-300 select-all text-center leading-relaxed">
              {sentence}
            </p>
            <input
              type="text"
              value={typed}
              onChange={handleChange}
              placeholder="Type exact sentence..."
              autoFocus
              className="w-full text-sm font-mono py-2 px-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white outline-none focus:border-emerald-400"
            />
          </>
        ) : (
          <button
            onClick={handleStart}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-md text-sm"
          >
            Start Pangram Sprint
          </button>
        )}
      </div>
    </div>
  );
}
