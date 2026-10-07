import { SnakeEscapeMode, SnakeEscapeSkinId, SPECIES_FACTS_LIST } from './engine';

export interface SnakeEscapeSkinDef {
  id: SnakeEscapeSkinId;
  species: string;
  scientificName: string;
  unlockMice: number;
  primaryColor: string;
  secondaryColor: string;
  bellyColor: string;
  eyeColor: string;
  pattern: 'patches' | 'diamonds' | 'saddles' | 'hood-bands' | 'stripes' | 'triangles';
}

export const SNAKE_ESCAPE_SKINS: SnakeEscapeSkinDef[] = [
  {
    id: 'ball-python',
    species: 'Ball Python',
    scientificName: 'Python regius',
    unlockMice: 0,
    primaryColor: '#713f12',
    secondaryColor: '#facc15',
    bellyColor: '#fef08a',
    eyeColor: '#fef9c3',
    pattern: 'patches',
  },
  {
    id: 'green-tree-python',
    species: 'Green Tree Python',
    scientificName: 'Morelia viridis',
    unlockMice: 50,
    primaryColor: '#16a34a',
    secondaryColor: '#bbf7d0',
    bellyColor: '#fde047',
    eyeColor: '#fef08a',
    pattern: 'diamonds',
  },
  {
    id: 'corn-snake',
    species: 'Corn Snake',
    scientificName: 'Pantherophis guttatus',
    unlockMice: 150,
    primaryColor: '#ea580c',
    secondaryColor: '#dc2626',
    bellyColor: '#fed7aa',
    eyeColor: '#fef08a',
    pattern: 'saddles',
  },
  {
    id: 'king-cobra',
    species: 'King Cobra',
    scientificName: 'Ophiophagus hannah',
    unlockMice: 300,
    primaryColor: '#1e293b',
    secondaryColor: '#fbbf24',
    bellyColor: '#cbd5e1',
    eyeColor: '#f87171',
    pattern: 'hood-bands',
  },
  {
    id: 'garter-snake',
    species: 'Garter Snake',
    scientificName: 'Thamnophis sirtalis',
    unlockMice: 600,
    primaryColor: '#0f172a',
    secondaryColor: '#38bdf8',
    bellyColor: '#ef4444',
    eyeColor: '#f8fafc',
    pattern: 'stripes',
  },
  {
    id: 'emerald-boa',
    species: 'Emerald Boa',
    scientificName: 'Corallus caninus',
    unlockMice: 1000,
    primaryColor: '#059669',
    secondaryColor: '#ecfdf5',
    bellyColor: '#a7f3d0',
    eyeColor: '#fde047',
    pattern: 'triangles',
  },
];

export function getVerifiedSpeciesFact(speciesName: string): {
  fact: string;
  source: string;
} | null {
  const entry = SPECIES_FACTS_LIST.find(
    (s) => s.species.toLowerCase() === speciesName.toLowerCase()
  );
  if (entry && entry.verified === true && entry.fact.trim().length > 0) {
    return { fact: entry.fact.trim(), source: entry.source.trim() };
  }
  return null;
}

export interface ModeBestRecord {
  bestScore: number;
  bestWave: number;
  longestSurvivalSec: number;
}

export interface DailyEscapeRecord {
  score: number;
  wave: number;
  miceEaten: number;
  survivalSec: number;
}

export interface SnakeEscapeRecords {
  byMode: Record<SnakeEscapeMode, ModeBestRecord>;
  dailyByDate: Record<string, DailyEscapeRecord>;
  totalMiceEaten: number;
  totalGames: number;
  dailyStreak: number;
  lastDailyCompletedDate: string | null;
  selectedSkin: SnakeEscapeSkinId;
}

export interface SnakeEscapeSettings {
  soundEnabled: boolean;
  virtualJoystick: boolean;
  screenShake: boolean;
  reducedMotion: boolean;
  highContrastWarnings: boolean;
  easyMode: boolean; // Slows attackers by 30%
  theme: 'dark' | 'light';
}

const ESCAPE_RECORDS_KEY = 'reptilebirds_snake_escape_records_v1';
const ESCAPE_SETTINGS_KEY = 'reptilebirds_snake_escape_settings_v1';

const DEFAULT_RECORDS: SnakeEscapeRecords = {
  byMode: {
    survival: { bestScore: 0, bestWave: 1, longestSurvivalSec: 0 },
    timed: { bestScore: 0, bestWave: 1, longestSurvivalSec: 0 },
    daily: { bestScore: 0, bestWave: 1, longestSurvivalSec: 0 },
  },
  dailyByDate: {},
  totalMiceEaten: 0,
  totalGames: 0,
  dailyStreak: 0,
  lastDailyCompletedDate: null,
  selectedSkin: 'ball-python',
};

export function loadSnakeEscapeRecords(): SnakeEscapeRecords {
  try {
    const raw = localStorage.getItem(ESCAPE_RECORDS_KEY);
    if (!raw) {
      return {
        ...DEFAULT_RECORDS,
        byMode: { ...DEFAULT_RECORDS.byMode },
        dailyByDate: {},
      };
    }
    const parsed = JSON.parse(raw);
    return {
      byMode: {
        survival: parsed.byMode?.survival || {
          bestScore: 0,
          bestWave: 1,
          longestSurvivalSec: 0,
        },
        timed: parsed.byMode?.timed || {
          bestScore: 0,
          bestWave: 1,
          longestSurvivalSec: 0,
        },
        daily: parsed.byMode?.daily || {
          bestScore: 0,
          bestWave: 1,
          longestSurvivalSec: 0,
        },
      },
      dailyByDate:
        parsed.dailyByDate && typeof parsed.dailyByDate === 'object'
          ? parsed.dailyByDate
          : {},
      totalMiceEaten:
        typeof parsed.totalMiceEaten === 'number' ? parsed.totalMiceEaten : 0,
      totalGames: typeof parsed.totalGames === 'number' ? parsed.totalGames : 0,
      dailyStreak: typeof parsed.dailyStreak === 'number' ? parsed.dailyStreak : 0,
      lastDailyCompletedDate:
        typeof parsed.lastDailyCompletedDate === 'string'
          ? parsed.lastDailyCompletedDate
          : null,
      selectedSkin: SNAKE_ESCAPE_SKINS.some((s) => s.id === parsed.selectedSkin)
        ? parsed.selectedSkin
        : 'ball-python',
    };
  } catch {
    return {
      ...DEFAULT_RECORDS,
      byMode: { ...DEFAULT_RECORDS.byMode },
      dailyByDate: {},
    };
  }
}

export function saveSnakeEscapeRecords(records: SnakeEscapeRecords): void {
  try {
    localStorage.setItem(ESCAPE_RECORDS_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

export function resetSnakeEscapeRecords(): SnakeEscapeRecords {
  const fresh: SnakeEscapeRecords = {
    ...DEFAULT_RECORDS,
    byMode: {
      survival: { bestScore: 0, bestWave: 1, longestSurvivalSec: 0 },
      timed: { bestScore: 0, bestWave: 1, longestSurvivalSec: 0 },
      daily: { bestScore: 0, bestWave: 1, longestSurvivalSec: 0 },
    },
    dailyByDate: {},
  };
  try {
    localStorage.removeItem(ESCAPE_RECORDS_KEY);
  } catch {
    // Ignore errors
  }
  return fresh;
}

function isYesterday(prevDateStr: string, todayDateStr: string): boolean {
  const prev = new Date(`${prevDateStr}T00:00:00Z`);
  const curr = new Date(`${todayDateStr}T00:00:00Z`);
  const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
  return diffDays === 1;
}

export function recordCompletedSnakeEscapeRun(params: {
  mode: SnakeEscapeMode;
  score: number;
  wave: number;
  miceEaten: number;
  survivalSec: number;
  dailyDate?: string;
}): {
  updated: SnakeEscapeRecords;
  isNewPersonalBest: boolean;
  newlyUnlockedSkins: SnakeEscapeSkinDef[];
} {
  const current = loadSnakeEscapeRecords();
  const prevTotalMice = current.totalMiceEaten;
  const nextTotalMice = prevTotalMice + params.miceEaten;

  const newlyUnlockedSkins = SNAKE_ESCAPE_SKINS.filter(
    (sk) => sk.unlockMice > prevTotalMice && sk.unlockMice <= nextTotalMice
  );

  const prevModeBest = current.byMode[params.mode] || {
    bestScore: 0,
    bestWave: 1,
    longestSurvivalSec: 0,
  };
  const isNewPersonalBest = params.score > prevModeBest.bestScore;

  const updated: SnakeEscapeRecords = {
    ...current,
    byMode: {
      ...current.byMode,
      [params.mode]: {
        bestScore: Math.max(prevModeBest.bestScore, params.score),
        bestWave: Math.max(prevModeBest.bestWave, params.wave),
        longestSurvivalSec: Math.max(
          prevModeBest.longestSurvivalSec,
          Math.floor(params.survivalSec)
        ),
      },
    },
    dailyByDate: { ...current.dailyByDate },
    totalMiceEaten: nextTotalMice,
    totalGames: current.totalGames + 1,
  };

  if (params.mode === 'daily' && params.dailyDate) {
    const prevDaily = updated.dailyByDate[params.dailyDate];
    if (!prevDaily || params.score > prevDaily.score) {
      updated.dailyByDate[params.dailyDate] = {
        score: params.score,
        wave: params.wave,
        miceEaten: params.miceEaten,
        survivalSec: Math.floor(params.survivalSec),
      };
    }

    if (updated.lastDailyCompletedDate === params.dailyDate) {
      // Already counted streak today
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

  saveSnakeEscapeRecords(updated);
  return { updated, isNewPersonalBest, newlyUnlockedSkins };
}

export function loadSnakeEscapeSettings(): SnakeEscapeSettings {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const defaults: SnakeEscapeSettings = {
    soundEnabled: true,
    virtualJoystick: Boolean(isTouchDevice),
    screenShake: !prefersReduced,
    reducedMotion: Boolean(prefersReduced),
    highContrastWarnings: false,
    easyMode: false,
    theme: 'dark',
  };

  try {
    const raw = localStorage.getItem(ESCAPE_SETTINGS_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      soundEnabled:
        typeof parsed.soundEnabled === 'boolean'
          ? parsed.soundEnabled
          : defaults.soundEnabled,
      virtualJoystick:
        typeof parsed.virtualJoystick === 'boolean'
          ? parsed.virtualJoystick
          : defaults.virtualJoystick,
      screenShake:
        typeof parsed.screenShake === 'boolean'
          ? parsed.screenShake
          : defaults.screenShake,
      reducedMotion:
        typeof parsed.reducedMotion === 'boolean'
          ? parsed.reducedMotion
          : defaults.reducedMotion,
      highContrastWarnings:
        typeof parsed.highContrastWarnings === 'boolean'
          ? parsed.highContrastWarnings
          : defaults.highContrastWarnings,
      easyMode:
        typeof parsed.easyMode === 'boolean' ? parsed.easyMode : defaults.easyMode,
      theme: parsed.theme === 'light' ? 'light' : 'dark',
    };
  } catch {
    return defaults;
  }
}

export function saveSnakeEscapeSettings(settings: SnakeEscapeSettings): void {
  try {
    localStorage.setItem(ESCAPE_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}
