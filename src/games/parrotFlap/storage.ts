import {
  ParrotFlapMode,
  ParrotMedal,
  ParrotSkinId,
  SPECIES_FACTS_DB,
  getMedalForScore,
} from './engine';

export interface ParrotSkinDefinition {
  id: ParrotSkinId;
  species: string;
  scientificName: string;
  unlockFeathers: number;
  bodyColor: string;
  wingColor: string;
  bellyColor: string;
  beakColor: string;
  accentColor: string;
  cosmeticScale: number; // Cosmetic sprite scale only; physics hitbox is identical
}

export const PARROT_SKINS: ParrotSkinDefinition[] = [
  {
    id: 'scarlet-macaw',
    species: 'Scarlet Macaw',
    scientificName: 'Ara macao',
    unlockFeathers: 0,
    bodyColor: '#ef4444',
    wingColor: '#2563eb',
    bellyColor: '#facc15',
    beakColor: '#fef08a',
    accentColor: '#38bdf8',
    cosmeticScale: 1.0,
  },
  {
    id: 'common-kingfisher',
    species: 'Common Kingfisher',
    scientificName: 'Alcedo atthis',
    unlockFeathers: 20,
    bodyColor: '#0284c7',
    wingColor: '#0dd3ff',
    bellyColor: '#ea580c',
    beakColor: '#1e293b',
    accentColor: '#38bdf8',
    cosmeticScale: 0.94,
  },
  {
    id: 'barn-owl',
    species: 'Barn Owl',
    scientificName: 'Tyto alba',
    unlockFeathers: 60,
    bodyColor: '#d97706',
    wingColor: '#b45309',
    bellyColor: '#fef3c7',
    beakColor: '#f59e0b',
    accentColor: '#fde68a',
    cosmeticScale: 1.06,
  },
  {
    id: 'ruby-hummingbird',
    species: 'Ruby-throated Hummingbird',
    scientificName: 'Archilochus colubris',
    unlockFeathers: 120,
    bodyColor: '#10b981',
    wingColor: '#047857',
    bellyColor: '#f8fafc',
    beakColor: '#0f172a',
    accentColor: '#f43f5e',
    cosmeticScale: 0.9,
  },
  {
    id: 'indian-peafowl',
    species: 'Indian Peafowl',
    scientificName: 'Pavo cristatus',
    unlockFeathers: 250,
    bodyColor: '#1d4ed8',
    wingColor: '#059669',
    bellyColor: '#14b8a6',
    beakColor: '#fbbf24',
    accentColor: '#facc15',
    cosmeticScale: 1.08,
  },
];

export function getVerifiedBirdFact(speciesName: string): {
  fact: string;
  source: string;
} | null {
  const found = SPECIES_FACTS_DB.find(
    (s) => s.species.toLowerCase() === speciesName.toLowerCase()
  );
  if (found && found.verified === true && found.fact.trim().length > 0) {
    return { fact: found.fact.trim(), source: found.source.trim() };
  }
  return null;
}

export interface DailyParrotRecord {
  score: number;
  feathers: number;
  pillarsPassed: number;
  medal: ParrotMedal;
}

export interface ParrotFlapRecords {
  bestByMode: Record<ParrotFlapMode, number>;
  dailyByDate: Record<string, DailyParrotRecord>;
  totalFeathers: number;
  totalGames: number;
  totalPillarsPassed: number;
  dailyStreak: number;
  lastDailyDate: string | null;
  selectedSkin: ParrotSkinId;
}

export interface ParrotFlapSettings {
  soundEnabled: boolean;
  reducedMotion: boolean;
  highContrastPillars: boolean;
  assistMode: boolean; // Widens gap by 20%
  theme: 'dark' | 'light';
}

const RECORDS_STORAGE_KEY = 'reptilebirds_parrot_flap_records_v1';
const SETTINGS_STORAGE_KEY = 'reptilebirds_parrot_flap_settings_v1';

const DEFAULT_RECORDS: ParrotFlapRecords = {
  bestByMode: {
    classic: 0,
    chill: 0,
    daily: 0,
  },
  dailyByDate: {},
  totalFeathers: 0,
  totalGames: 0,
  totalPillarsPassed: 0,
  dailyStreak: 0,
  lastDailyDate: null,
  selectedSkin: 'scarlet-macaw',
};

export function loadParrotFlapRecords(): ParrotFlapRecords {
  try {
    const raw = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (!raw) {
      return {
        ...DEFAULT_RECORDS,
        bestByMode: { ...DEFAULT_RECORDS.bestByMode },
        dailyByDate: {},
      };
    }
    const parsed = JSON.parse(raw);
    return {
      bestByMode: {
        classic:
          typeof parsed.bestByMode?.classic === 'number'
            ? parsed.bestByMode.classic
            : 0,
        chill:
          typeof parsed.bestByMode?.chill === 'number'
            ? parsed.bestByMode.chill
            : 0,
        daily:
          typeof parsed.bestByMode?.daily === 'number'
            ? parsed.bestByMode.daily
            : 0,
      },
      dailyByDate:
        parsed.dailyByDate && typeof parsed.dailyByDate === 'object'
          ? parsed.dailyByDate
          : {},
      totalFeathers:
        typeof parsed.totalFeathers === 'number' ? parsed.totalFeathers : 0,
      totalGames: typeof parsed.totalGames === 'number' ? parsed.totalGames : 0,
      totalPillarsPassed:
        typeof parsed.totalPillarsPassed === 'number'
          ? parsed.totalPillarsPassed
          : 0,
      dailyStreak:
        typeof parsed.dailyStreak === 'number' ? parsed.dailyStreak : 0,
      lastDailyDate:
        typeof parsed.lastDailyDate === 'string' ? parsed.lastDailyDate : null,
      selectedSkin: PARROT_SKINS.some((s) => s.id === parsed.selectedSkin)
        ? parsed.selectedSkin
        : 'scarlet-macaw',
    };
  } catch {
    return {
      ...DEFAULT_RECORDS,
      bestByMode: { ...DEFAULT_RECORDS.bestByMode },
      dailyByDate: {},
    };
  }
}

export function saveParrotFlapRecords(records: ParrotFlapRecords): void {
  try {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage errors
  }
}

export function resetParrotFlapRecords(): ParrotFlapRecords {
  const fresh: ParrotFlapRecords = {
    ...DEFAULT_RECORDS,
    bestByMode: { classic: 0, chill: 0, daily: 0 },
    dailyByDate: {},
  };
  try {
    localStorage.removeItem(RECORDS_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
  return fresh;
}

function isYesterdayDate(prevDateStr: string, todayDateStr: string): boolean {
  const prev = new Date(`${prevDateStr}T00:00:00Z`);
  const curr = new Date(`${todayDateStr}T00:00:00Z`);
  const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
  return diffDays === 1;
}

/**
 * Records a completed Parrot Flap run.
 * In Daily Challenge mode, only the FIRST run of the day counts toward the official daily record
 * (extra attempts are allowed for practice and still award feathers, but don't overwrite the daily record).
 */
export function recordParrotFlapRun(params: {
  mode: ParrotFlapMode;
  score: number;
  feathersCollected: number;
  pillarsPassed: number;
  dailyDate?: string;
}): {
  updated: ParrotFlapRecords;
  isNewPersonalBest: boolean;
  dailyAlreadyPlayedToday: boolean;
  newlyUnlockedSkins: ParrotSkinDefinition[];
} {
  const current = loadParrotFlapRecords();
  const prevFeathers = current.totalFeathers;
  const nextFeathers = prevFeathers + params.feathersCollected;

  const newlyUnlockedSkins = PARROT_SKINS.filter(
    (sk) => sk.unlockFeathers > prevFeathers && sk.unlockFeathers <= nextFeathers
  );

  const prevModeBest = current.bestByMode[params.mode] || 0;
  let isNewPersonalBest = false;
  let dailyAlreadyPlayedToday = false;

  const updated: ParrotFlapRecords = {
    ...current,
    bestByMode: { ...current.bestByMode },
    dailyByDate: { ...current.dailyByDate },
    totalFeathers: nextFeathers,
    totalGames: current.totalGames + 1,
    totalPillarsPassed: current.totalPillarsPassed + params.pillarsPassed,
  };

  if (params.mode === 'daily' && params.dailyDate) {
    if (updated.dailyByDate[params.dailyDate]) {
      // Official daily run was already recorded today; this was a practice attempt
      dailyAlreadyPlayedToday = true;
    } else {
      updated.dailyByDate[params.dailyDate] = {
        score: params.score,
        feathers: params.feathersCollected,
        pillarsPassed: params.pillarsPassed,
        medal: getMedalForScore(params.score),
      };
      if (params.score > prevModeBest) {
        updated.bestByMode.daily = params.score;
        isNewPersonalBest = true;
      }
      if (updated.lastDailyDate === params.dailyDate) {
        // Streak already updated
      } else if (
        updated.lastDailyDate &&
        isYesterdayDate(updated.lastDailyDate, params.dailyDate)
      ) {
        updated.dailyStreak += 1;
      } else {
        updated.dailyStreak = 1;
      }
      updated.lastDailyDate = params.dailyDate;
    }
  } else {
    if (params.score > prevModeBest) {
      updated.bestByMode[params.mode] = params.score;
      isNewPersonalBest = true;
    }
  }

  saveParrotFlapRecords(updated);
  return {
    updated,
    isNewPersonalBest,
    dailyAlreadyPlayedToday,
    newlyUnlockedSkins,
  };
}

export function loadParrotFlapSettings(): ParrotFlapSettings {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const defaults: ParrotFlapSettings = {
    soundEnabled: true,
    reducedMotion: Boolean(prefersReduced),
    highContrastPillars: false,
    assistMode: false,
    theme: 'dark',
  };

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      soundEnabled:
        typeof parsed.soundEnabled === 'boolean'
          ? parsed.soundEnabled
          : defaults.soundEnabled,
      reducedMotion:
        typeof parsed.reducedMotion === 'boolean'
          ? parsed.reducedMotion
          : defaults.reducedMotion,
      highContrastPillars:
        typeof parsed.highContrastPillars === 'boolean'
          ? parsed.highContrastPillars
          : defaults.highContrastPillars,
      assistMode:
        typeof parsed.assistMode === 'boolean'
          ? parsed.assistMode
          : defaults.assistMode,
      theme: parsed.theme === 'light' ? 'light' : 'dark',
    };
  } catch {
    return defaults;
  }
}

export function saveParrotFlapSettings(settings: ParrotFlapSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}
