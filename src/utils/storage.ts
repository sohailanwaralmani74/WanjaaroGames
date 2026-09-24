import { GameScoreEntry, UserGameStat } from '../types/game';

const STATS_KEY = 'wanjaaro_game_stats_v1';
const LEGACY_STATS_KEY = 'centum_game_stats_v1';
const RECENT_KEY = 'wanjaaro_recent_games';
const LEGACY_RECENT_KEY = 'centum_recent_games';
const THEME_KEY = 'wanjaaro_theme';

export function getAllStats(): Record<string, UserGameStat> {
  try {
    const raw = localStorage.getItem(STATS_KEY) || localStorage.getItem(LEGACY_STATS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getGameStat(gameId: string): UserGameStat | null {
  const all = getAllStats();
  return all[gameId] || null;
}

export function recordScore(
  gameId: string,
  score: number,
  formattedScore: string,
  criterion: 'higher' | 'lower' = 'higher'
): { isNewBest: boolean; isNewHighScore: boolean; stat: UserGameStat; userStat: UserGameStat } {
  const all = getAllStats();
  const current = all[gameId];

  const hasPreviousScore =
    current &&
    current.playCount > 0 &&
    typeof current.bestScore === 'number' &&
    !Number.isNaN(current.bestScore) &&
    current.bestScore !== null;

  const isBetter = !hasPreviousScore
    ? true
    : criterion === 'lower'
      ? score < current.bestScore
      : score > current.bestScore;

  const newBestScore = isBetter ? score : current.bestScore;
  const newFormattedBest = isBetter ? formattedScore : (current.formattedBest || current.formattedScore || formattedScore);

  const updatedStat: UserGameStat = {
    gameId,
    bestScore: newBestScore,
    formattedBest: newFormattedBest,
    formattedScore: newFormattedBest,
    playCount: (current?.playCount || 0) + 1,
    lastPlayed: Date.now(),
    history: [
      { score, timestamp: Date.now() },
      ...(current?.history || []).slice(0, 9),
    ],
  };

  all[gameId] = updatedStat;

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save score to localStorage', e);
  }

  // Update recent games list
  updateRecentGame(gameId);

  return { isNewBest: isBetter, isNewHighScore: isBetter, stat: updatedStat, userStat: updatedStat };
}

export function getRecentGameIds(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY) || localStorage.getItem(LEGACY_RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function updateRecentGame(gameId: string) {
  try {
    const current = getRecentGameIds().filter((id) => id !== gameId);
    current.unshift(gameId);
    localStorage.setItem(RECENT_KEY, JSON.stringify(current.slice(0, 12)));
  } catch {}
}

export function clearPlatformData() {
  try {
    localStorage.removeItem(STATS_KEY);
    localStorage.removeItem(RECENT_KEY);
  } catch {}
}

export function getStoredTheme(): 'dark' | 'light' {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

export function setStoredTheme(theme: 'dark' | 'light') {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

export const getScore = getGameStat;
export const getRecentGames = getRecentGameIds;
export function getStats() {
  return { highScores: getAllStats() };
}
export const resetAllScores = clearPlatformData;
