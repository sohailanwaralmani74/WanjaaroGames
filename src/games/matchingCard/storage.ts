import { MatchingDifficulty, MatchingGameMode } from './engine';

export interface DiffModeBest {
  bestScore: number;
  fewestMoves: number | null;
  fastestTimeSec: number | null;
}

export interface DailyChallengeRecord {
  score: number;
  moves: number;
  timeSec: number;
  stars: 1 | 2 | 3;
}

export interface MatchingGameRecords {
  byDiffAndMode: Record<string, DiffModeBest>; // key: `${mode}_${difficulty}`
  dailyByDate: Record<string, DailyChallengeRecord>;
  totalGames: number;
  totalMatches: number;
  dailyStreak: number;
  lastDailyCompletedDate: string | null;
}

export interface MatchingGameSettings {
  soundEnabled: boolean;
  reducedMotion: boolean;
  showCardNames: boolean;
  theme: 'dark' | 'light';
}

const RECORDS_KEY = 'reptilebirds_matching_card_records_v1';
const SETTINGS_KEY = 'reptilebirds_matching_card_settings_v1';

const DEFAULT_RECORDS: MatchingGameRecords = {
  byDiffAndMode: {},
  dailyByDate: {},
  totalGames: 0,
  totalMatches: 0,
  dailyStreak: 0,
  lastDailyCompletedDate: null,
};

export function getDiffModeKey(
  mode: MatchingGameMode,
  difficulty: MatchingDifficulty
): string {
  return `${mode}_${difficulty}`;
}

export function loadMatchingRecords(): MatchingGameRecords {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return { ...DEFAULT_RECORDS, byDiffAndMode: {}, dailyByDate: {} };
    const parsed = JSON.parse(raw);
    return {
      byDiffAndMode:
        parsed.byDiffAndMode && typeof parsed.byDiffAndMode === 'object'
          ? parsed.byDiffAndMode
          : {},
      dailyByDate:
        parsed.dailyByDate && typeof parsed.dailyByDate === 'object'
          ? parsed.dailyByDate
          : {},
      totalGames: typeof parsed.totalGames === 'number' ? parsed.totalGames : 0,
      totalMatches: typeof parsed.totalMatches === 'number' ? parsed.totalMatches : 0,
      dailyStreak: typeof parsed.dailyStreak === 'number' ? parsed.dailyStreak : 0,
      lastDailyCompletedDate:
        typeof parsed.lastDailyCompletedDate === 'string'
          ? parsed.lastDailyCompletedDate
          : null,
    };
  } catch {
    return { ...DEFAULT_RECORDS, byDiffAndMode: {}, dailyByDate: {} };
  }
}

export function saveMatchingRecords(records: MatchingGameRecords): void {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

export function resetMatchingRecords(): MatchingGameRecords {
  const fresh: MatchingGameRecords = {
    ...DEFAULT_RECORDS,
    byDiffAndMode: {},
    dailyByDate: {},
  };
  try {
    localStorage.removeItem(RECORDS_KEY);
  } catch {
    // Ignore errors
  }
  return fresh;
}

/**
 * Checks if two YYYY-MM-DD strings are consecutive calendar days.
 */
function isYesterday(prevDateStr: string, todayDateStr: string): boolean {
  const prev = new Date(`${prevDateStr}T00:00:00Z`);
  const curr = new Date(`${todayDateStr}T00:00:00Z`);
  const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
  return diffDays === 1;
}

/**
 * Records a completed Matching Card Game run.
 * For Daily Challenge: only the FIRST scored run of each date counts toward the official daily record.
 */
export function recordCompletedMatchingGame(params: {
  mode: MatchingGameMode;
  difficulty: MatchingDifficulty;
  won: boolean;
  score: number;
  moves: number;
  elapsedSec: number;
  matchesMade: number;
  stars: 1 | 2 | 3;
  dailyDate?: string;
}): {
  updated: MatchingGameRecords;
  isNewPersonalBest: boolean;
  dailyAlreadyCountedToday: boolean;
} {
  const current = loadMatchingRecords();
  let isNewPersonalBest = false;
  let dailyAlreadyCountedToday = false;

  const updated: MatchingGameRecords = {
    ...current,
    byDiffAndMode: { ...current.byDiffAndMode },
    dailyByDate: { ...current.dailyByDate },
    totalGames: current.totalGames + 1,
    totalMatches: current.totalMatches + params.matchesMade,
  };

  if (params.won) {
    if (params.mode === 'daily' && params.dailyDate) {
      // One scored run per day counts toward the daily record
      if (updated.dailyByDate[params.dailyDate]) {
        dailyAlreadyCountedToday = true;
      } else {
        updated.dailyByDate[params.dailyDate] = {
          score: params.score,
          moves: params.moves,
          timeSec: params.elapsedSec,
          stars: params.stars,
        };
        isNewPersonalBest = true;

        if (updated.lastDailyCompletedDate === params.dailyDate) {
          // Already updated streak today
        } else if (
          updated.lastDailyCompletedDate &&
          isYesterday(updated.lastDailyCompletedDate, params.dailyDate)
        ) {
          updated.dailyStreak += 1;
        } else {
          updated.dailyStreak = 1;
        }
        updated.lastDailyCompletedDate = params.dailyDate;
      }
    }

    const key = getDiffModeKey(params.mode, params.difficulty);
    const prev = updated.byDiffAndMode[key] || {
      bestScore: 0,
      fewestMoves: null,
      fastestTimeSec: null,
    };

    if (params.score > prev.bestScore) {
      isNewPersonalBest = true;
    }

    updated.byDiffAndMode[key] = {
      bestScore: Math.max(prev.bestScore, params.score),
      fewestMoves:
        prev.fewestMoves === null
          ? params.moves
          : Math.min(prev.fewestMoves, params.moves),
      fastestTimeSec:
        prev.fastestTimeSec === null
          ? params.elapsedSec
          : Math.min(prev.fastestTimeSec, params.elapsedSec),
    };
  }

  saveMatchingRecords(updated);
  return { updated, isNewPersonalBest, dailyAlreadyCountedToday };
}

export function loadMatchingSettings(): MatchingGameSettings {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const defaults: MatchingGameSettings = {
    soundEnabled: true,
    reducedMotion: Boolean(prefersReduced),
    showCardNames: true,
    theme: 'dark',
  };

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      soundEnabled:
        typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : defaults.soundEnabled,
      reducedMotion:
        typeof parsed.reducedMotion === 'boolean'
          ? parsed.reducedMotion
          : defaults.reducedMotion,
      showCardNames:
        typeof parsed.showCardNames === 'boolean'
          ? parsed.showCardNames
          : defaults.showCardNames,
      theme: parsed.theme === 'light' ? 'light' : 'dark',
    };
  } catch {
    return defaults;
  }
}

export function saveMatchingSettings(settings: MatchingGameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}
