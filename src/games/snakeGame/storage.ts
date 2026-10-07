import { BoardSizeOption, SnakeGameMode, SnakeSkinId } from './engine';

export interface ModeSizeRecord {
  bestScore: number;
  longestLength: number;
}

export interface SnakeGameRecords {
  byModeAndSize: Record<string, ModeSizeRecord>; // key: `${mode}_${size}`
  dailyBestByDate: Record<string, { score: number; length: number }>;
  totalGamesPlayed: number;
  totalMiceEaten: number;
  unlockedSkins: SnakeSkinId[];
  selectedSkin: SnakeSkinId;
}

export interface SnakeGameSettings {
  soundEnabled: boolean;
  moveTickSound: boolean;
  showDpad: boolean;
  showGridLines: boolean;
  reducedMotion: boolean;
  theme: 'dark' | 'light';
}

const RECORDS_STORAGE_KEY = 'reptilebirds_snake_game_records_v1';
const SETTINGS_STORAGE_KEY = 'reptilebirds_snake_game_settings_v1';

export const SKIN_UNLOCK_THRESHOLDS: { id: SnakeSkinId; requiredMice: number }[] = [
  { id: 'ball-python', requiredMice: 0 },
  { id: 'green-tree-python', requiredMice: 50 },
  { id: 'corn-snake', requiredMice: 150 },
  { id: 'king-cobra', requiredMice: 300 },
  { id: 'garter-snake', requiredMice: 600 },
  { id: 'emerald-boa', requiredMice: 1000 },
];

export function computeUnlockedSkins(totalMiceEaten: number): SnakeSkinId[] {
  return SKIN_UNLOCK_THRESHOLDS.filter((s) => totalMiceEaten >= s.requiredMice).map(
    (s) => s.id
  );
}

const DEFAULT_RECORDS: SnakeGameRecords = {
  byModeAndSize: {},
  dailyBestByDate: {},
  totalGamesPlayed: 0,
  totalMiceEaten: 0,
  unlockedSkins: ['ball-python'],
  selectedSkin: 'ball-python',
};

export function getModeSizeKey(mode: SnakeGameMode, size: BoardSizeOption): string {
  return `${mode}_${size}`;
}

export function loadSnakeRecords(): SnakeGameRecords {
  try {
    const raw = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_RECORDS, byModeAndSize: {}, dailyBestByDate: {} };
    const parsed = JSON.parse(raw);
    const totalMice = typeof parsed.totalMiceEaten === 'number' ? parsed.totalMiceEaten : 0;
    const unlocked = computeUnlockedSkins(totalMice);
    const savedSkin = parsed.selectedSkin as SnakeSkinId;
    return {
      byModeAndSize:
        parsed.byModeAndSize && typeof parsed.byModeAndSize === 'object'
          ? parsed.byModeAndSize
          : {},
      dailyBestByDate:
        parsed.dailyBestByDate && typeof parsed.dailyBestByDate === 'object'
          ? parsed.dailyBestByDate
          : {},
      totalGamesPlayed:
        typeof parsed.totalGamesPlayed === 'number' ? parsed.totalGamesPlayed : 0,
      totalMiceEaten: totalMice,
      unlockedSkins: unlocked,
      selectedSkin: unlocked.includes(savedSkin) ? savedSkin : 'ball-python',
    };
  } catch {
    return { ...DEFAULT_RECORDS, byModeAndSize: {}, dailyBestByDate: {} };
  }
}

export function saveSnakeRecords(records: SnakeGameRecords): void {
  try {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

export function resetSnakeRecords(): SnakeGameRecords {
  const fresh: SnakeGameRecords = {
    ...DEFAULT_RECORDS,
    byModeAndSize: {},
    dailyBestByDate: {},
    unlockedSkins: ['ball-python'],
  };
  try {
    localStorage.removeItem(RECORDS_STORAGE_KEY);
  } catch {
    // Ignore errors
  }
  return fresh;
}

export function recordFinishedSnakeRun(params: {
  mode: SnakeGameMode;
  boardSize: BoardSizeOption;
  score: number;
  length: number;
  miceEatenInRun: number;
  dailyDate?: string;
}): {
  updated: SnakeGameRecords;
  isNewPersonalBest: boolean;
  newlyUnlockedSkins: SnakeSkinId[];
} {
  const current = loadSnakeRecords();
  const key = getModeSizeKey(params.mode, params.boardSize);
  const prevEntry = current.byModeAndSize[key] || { bestScore: 0, longestLength: 3 };

  let isNewPersonalBest = false;
  if (params.score > prevEntry.bestScore && params.score > 0) {
    isNewPersonalBest = true;
  }

  const nextBestScore = Math.max(prevEntry.bestScore, params.score);
  const nextLongest = Math.max(prevEntry.longestLength, params.length);

  const nextTotalMice = current.totalMiceEaten + params.miceEatenInRun;
  const nextUnlocked = computeUnlockedSkins(nextTotalMice);
  const newlyUnlockedSkins = nextUnlocked.filter(
    (id) => !current.unlockedSkins.includes(id)
  );

  const updatedDaily = { ...current.dailyBestByDate };
  if (params.mode === 'daily' && params.dailyDate) {
    const prevDaily = updatedDaily[params.dailyDate];
    if (!prevDaily || params.score > prevDaily.score) {
      if (params.score > 0) isNewPersonalBest = true;
      updatedDaily[params.dailyDate] = {
        score: params.score,
        length: Math.max(prevDaily?.length || 3, params.length),
      };
    }
  }

  const updated: SnakeGameRecords = {
    ...current,
    byModeAndSize: {
      ...current.byModeAndSize,
      [key]: {
        bestScore: nextBestScore,
        longestLength: nextLongest,
      },
    },
    dailyBestByDate: updatedDaily,
    totalGamesPlayed: current.totalGamesPlayed + 1,
    totalMiceEaten: nextTotalMice,
    unlockedSkins: nextUnlocked,
  };

  saveSnakeRecords(updated);
  return { updated, isNewPersonalBest, newlyUnlockedSkins };
}

export function loadSnakeSettings(): SnakeGameSettings {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const defaults: SnakeGameSettings = {
    soundEnabled: true,
    moveTickSound: false,
    showDpad: Boolean(isTouchDevice),
    showGridLines: true,
    reducedMotion: Boolean(prefersReduced),
    theme: 'dark',
  };

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      soundEnabled:
        typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : defaults.soundEnabled,
      moveTickSound:
        typeof parsed.moveTickSound === 'boolean'
          ? parsed.moveTickSound
          : defaults.moveTickSound,
      showDpad: typeof parsed.showDpad === 'boolean' ? parsed.showDpad : defaults.showDpad,
      showGridLines:
        typeof parsed.showGridLines === 'boolean'
          ? parsed.showGridLines
          : defaults.showGridLines,
      reducedMotion:
        typeof parsed.reducedMotion === 'boolean'
          ? parsed.reducedMotion
          : defaults.reducedMotion,
      theme: parsed.theme === 'light' ? 'light' : 'dark',
    };
  } catch {
    return defaults;
  }
}

export function saveSnakeSettings(settings: SnakeGameSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore errors
  }
}
