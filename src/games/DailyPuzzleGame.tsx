import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';
import { GameProps } from './ReflexGames';

interface DailyWordGroup {
  category: string;
  color: string;
  words: string[];
}

const DAILY_POOLS: DailyWordGroup[][] = [
  [
    { category: 'ASTRONOMY', color: 'bg-indigo-600', words: ['ORBIT', 'COMET', 'NEBULA', 'PULSAR'] },
    { category: 'TYPES OF WAVES', color: 'bg-cyan-600', words: ['OCEAN', 'SOUND', 'LIGHT', 'RADIO'] },
    { category: 'PRECIOUS GEMS', color: 'bg-emerald-600', words: ['RUBY', 'EMERALD', 'SAPPHIRE', 'TOPAZ'] },
    { category: 'CHESS PIECES', color: 'bg-amber-600', words: ['KNIGHT', 'BISHOP', 'ROOK', 'QUEEN'] },
  ],
  [
    { category: 'MUSICAL INSTRUMENTS', color: 'bg-purple-600', words: ['FLUTE', 'CELLO', 'HARP', 'OBOE'] },
    { category: 'PROGRAMMING LANGUAGES', color: 'bg-blue-600', words: ['PYTHON', 'RUST', 'SWIFT', 'KOTLIN'] },
    { category: 'SPICES', color: 'bg-rose-600', words: ['CINNAMON', 'NUTMEG', 'SAFFRON', 'CLOVE'] },
    { category: 'CARD SUITS', color: 'bg-amber-600', words: ['SPADES', 'HEARTS', 'DIAMONDS', 'CLUBS'] },
  ],
];

export function DailyPuzzleGame({ onFinish }: GameProps) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const dayIndex = Math.abs(
    todayStr.split('-').reduce((acc, part) => acc * 31 + parseInt(part, 10), 0) % DAILY_POOLS.length
  );
  const currentGroups = DAILY_POOLS[dayIndex];

  const [allWords, setAllWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [solvedGroups, setSolvedGroups] = useState<DailyWordGroup[]>([]);
  const [mistakesLeft, setMistakesLeft] = useState(4);
  const [streak, setStreak] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    // Collect words and shuffle
    const words = currentGroups.flatMap((g) => g.words).sort(() => Math.random() - 0.5);
    setAllWords(words);

    // Read streak from storage
    const storedStreak = localStorage.getItem('wanjaaro_daily_streak');
    if (storedStreak) {
      setStreak(parseInt(storedStreak, 10));
    }
  }, []);

  const handleWordClick = (word: string) => {
    if (isCompleted) return;
    sound.playTap();

    if (selectedWords.includes(word)) {
      setSelectedWords((sw) => sw.filter((w) => w !== word));
    } else if (selectedWords.length < 4) {
      setSelectedWords((sw) => [...sw, word]);
    }
  };

  const handleDeselectAll = () => {
    sound.playTap();
    setSelectedWords([]);
  };

  const handleSubmit = () => {
    if (selectedWords.length !== 4 || isCompleted) return;

    // Check if the 4 selected words belong to one category
    const matchedGroup = currentGroups.find((g) =>
      selectedWords.every((w) => g.words.includes(w))
    );

    if (matchedGroup) {
      sound.playSuccess();
      const nextSolved = [...solvedGroups, matchedGroup];
      setSolvedGroups(nextSolved);
      setAllWords((prev) => prev.filter((w) => !selectedWords.includes(w)));
      setSelectedWords([]);

      if (nextSolved.length === currentGroups.length) {
        // Daily Completed!
        setIsCompleted(true);
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem('wanjaaro_daily_streak', String(newStreak));
        onFinish(100, `Daily Puzzle Solved! Streak: ${newStreak} Days 🔥`);
      }
    } else {
      sound.playFail();
      const nextMistakes = mistakesLeft - 1;
      setMistakesLeft(nextMistakes);

      if (nextMistakes <= 0) {
        onFinish(0, `Daily Completed (${solvedGroups.length}/4 categories)`);
      }
    }
  };

  const handleShare = () => {
    const text = `Wanjaaro Daily Challenge · ${todayStr}\nStreak: ${streak} Days 🔥\n${'🟩'.repeat(
      solvedGroups.length
    )}${'⬛'.repeat(4 - solvedGroups.length)}\nhttps://wanjaaro.com/daily-puzzle`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none max-w-lg mx-auto">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono text-slate-300 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white flex items-center gap-1.5">
            📅 Daily Mind Puzzle
          </span>
          <span className="text-slate-400">· {todayStr}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-amber-400 font-bold flex items-center gap-1">
            🔥 {streak}-Day Streak
          </span>
        </div>
      </div>

      {/* Instructions */}
      <p className="text-xs text-slate-300 text-center max-w-sm">
        Find 4 groups of 4 words that share a common connecting category.
      </p>

      {/* Solved Category Banners */}
      <div className="w-full flex flex-col gap-2">
        {solvedGroups.map((g, i) => (
          <div
            key={i}
            className={`w-full p-3 rounded-xl ${g.color} text-white flex flex-col items-center justify-center shadow-lg animate-fade-in`}
          >
            <span className="text-xs font-black tracking-wider uppercase">{g.category}</span>
            <span className="text-xs opacity-90 mt-0.5">{g.words.join(' · ')}</span>
          </div>
        ))}
      </div>

      {/* Grid of Unsolved Words */}
      {!isCompleted && allWords.length > 0 && (
        <div className="grid grid-cols-4 gap-2 w-full">
          {allWords.map((word) => {
            const isSelected = selectedWords.includes(word);
            return (
              <button
                key={word}
                onClick={() => handleWordClick(word)}
                className={`h-16 rounded-xl font-bold font-mono text-xs sm:text-sm p-1 flex items-center justify-center text-center transition-all active:scale-95 shadow-md ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-400 scale-102'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700'
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>
      )}

      {/* Mistakes Indicator */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <span>Mistakes remaining:</span>
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${
                i < mistakesLeft ? 'bg-amber-400' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      {!isCompleted && (
        <div className="flex gap-3 w-full max-w-xs">
          <button
            onClick={handleDeselectAll}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs active:scale-95 transition-all"
          >
            Deselect All
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedWords.length !== 4}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md"
          >
            Submit ({selectedWords.length}/4)
          </button>
        </div>
      )}

      {/* Completed Share Panel */}
      {isCompleted && (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center gap-3 text-center shadow-xl">
          <span className="text-4xl animate-bounce">🎉</span>
          <h3 className="text-base font-extrabold text-white">Daily Puzzle Cleared!</h3>
          <p className="text-xs text-slate-300">
            Come back tomorrow for a fresh handcrafted challenge!
          </p>
          <button
            onClick={handleShare}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
          >
            {copiedShare ? 'Copied to Clipboard! ✓' : 'Share Result 📋'}
          </button>
        </div>
      )}
    </div>
  );
}
