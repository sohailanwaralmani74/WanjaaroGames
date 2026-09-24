import React from 'react';
import { getStats, resetAllScores } from '../utils/storage';
import { ALL_GAMES } from '../data/gamesCatalog';
import { Trophy, X, Trash2, ArrowRight } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (gameId: string) => void;
}

export function LeaderboardModal({ isOpen, onClose, onSelectGame }: LeaderboardModalProps) {
  if (!isOpen) return null;

  const stats = getStats();
  const playedEntries = Object.entries(stats.highScores);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all your local high scores and stats? This cannot be undone.')) {
      resetAllScores();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Local Trophy Room</h2>
              <p className="text-xs text-neutral-400">
                {playedEntries.length} of {ALL_GAMES.length} games played • Saved locally in browser
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {playedEntries.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 space-y-2">
              <p className="text-sm">No game scores recorded yet!</p>
              <p className="text-xs text-neutral-500">
                Play any game to begin tracking your personal bests on this device.
              </p>
            </div>
          ) : (
            playedEntries.map(([gameId, stat]) => {
              const game = ALL_GAMES.find((g) => g.id === gameId);
              if (!game) return null;
              return (
                <div
                  key={gameId}
                  onClick={() => {
                    onClose();
                    onSelectGame(gameId);
                  }}
                  className="p-3.5 bg-neutral-950 border border-neutral-850 hover:border-neutral-700 rounded-xl flex items-center justify-between cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{game.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                        {game.title}
                      </h4>
                      <p className="text-xs text-neutral-400">
                        {stat.playCount} {stat.playCount === 1 ? 'play' : 'plays'} • Last:{' '}
                        {new Date(stat.lastPlayed).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                      {stat.formattedScore || stat.formattedBest}
                    </span>
                    <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 transition-colors" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/50 flex items-center justify-between text-xs text-neutral-400">
          <span>Private: Scores never leave your device</span>
          {playedEntries.length > 0 && (
            <button
              onClick={handleReset}
              className="text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All Scores
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
