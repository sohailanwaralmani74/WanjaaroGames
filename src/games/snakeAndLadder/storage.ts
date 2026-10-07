export interface SnakeLadderRecords {
  bestSoloTurns: number | null;
  dailyBestByDate: Record<string, number>;
  totalWins: number;
  totalGames: number;
  longestLadderClimb: number;
  totalSnakeBites: number;
}

export interface SnakeLadderSettings {
  bonusRollOnSix: boolean;
  reducedMotion: boolean;
  theme: 'dark' | 'light';
}

const RECORDS_KEY = 'reptilebirds_snake_ladder_records_v1';
const SETTINGS_KEY = 'reptilebirds_snake_ladder_settings_v1';

const DEFAULT_RECORDS: SnakeLadderRecords = {
  bestSoloTurns: null,
  dailyBestByDate: {},
  totalWins: 0,
  totalGames: 0,
  longestLadderClimb: 0,
  totalSnakeBites: 0,
};

export function loadRecords(): SnakeLadderRecords {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return { ...DEFAULT_RECORDS, dailyBestByDate: {} };
    const parsed = JSON.parse(raw);
    return {
      bestSoloTurns: typeof parsed.bestSoloTurns === 'number' ? parsed.bestSoloTurns : null,
      dailyBestByDate: parsed.dailyBestByDate && typeof parsed.dailyBestByDate === 'object' ? parsed.dailyBestByDate : {},
      totalWins: typeof parsed.totalWins === 'number' ? parsed.totalWins : 0,
      totalGames: typeof parsed.totalGames === 'number' ? parsed.totalGames : 0,
      longestLadderClimb: typeof parsed.longestLadderClimb === 'number' ? parsed.longestLadderClimb : 0,
      totalSnakeBites: typeof parsed.totalSnakeBites === 'number' ? parsed.totalSnakeBites : 0,
    };
  } catch {
    return { ...DEFAULT_RECORDS, dailyBestByDate: {} };
  }
}

export function saveRecords(records: SnakeLadderRecords): void {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

export function resetRecords(): SnakeLadderRecords {
  const fresh: SnakeLadderRecords = { ...DEFAULT_RECORDS, dailyBestByDate: {} };
  try {
    localStorage.removeItem(RECORDS_KEY);
  } catch {
    // Ignore storage errors
  }
  return fresh;
}

export function recordCompletedGame(params: {
  mode: 'solo' | 'cpu' | 'multi' | 'daily';
  humanWon: boolean;
  turnsTaken: number;
  longestClimbInGame: number;
  snakeBitesInGame: number;
  dailyDate?: string;
}): {
  updated: SnakeLadderRecords;
  isNewPersonalBest: boolean;
} {
  const current = loadRecords();
  let isNewPersonalBest = false;

  const updated: SnakeLadderRecords = {
    ...current,
    dailyBestByDate: { ...current.dailyBestByDate },
    totalGames: current.totalGames + 1,
    totalWins: current.totalWins + (params.humanWon ? 1 : 0),
    longestLadderClimb: Math.max(current.longestLadderClimb, params.longestClimbInGame),
    totalSnakeBites: current.totalSnakeBites + params.snakeBitesInGame,
  };

  if (params.humanWon) {
    if (params.mode === 'solo') {
      if (updated.bestSoloTurns === null || params.turnsTaken < updated.bestSoloTurns) {
        updated.bestSoloTurns = params.turnsTaken;
        isNewPersonalBest = true;
      }
    } else if (params.mode === 'daily' && params.dailyDate) {
      const prevDaily = updated.dailyBestByDate[params.dailyDate];
      if (prevDaily === undefined || params.turnsTaken < prevDaily) {
        updated.dailyBestByDate[params.dailyDate] = params.turnsTaken;
        isNewPersonalBest = true;
      }
    }
  }

  saveRecords(updated);
  return { updated, isNewPersonalBest };
}

export function loadSettings(): SnakeLadderSettings {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const defaults: SnakeLadderSettings = {
    bonusRollOnSix: true,
    reducedMotion: Boolean(prefersReduced),
    theme: 'dark',
  };

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      bonusRollOnSix: typeof parsed.bonusRollOnSix === 'boolean' ? parsed.bonusRollOnSix : true,
      reducedMotion: typeof parsed.reducedMotion === 'boolean' ? parsed.reducedMotion : defaults.reducedMotion,
      theme: parsed.theme === 'light' ? 'light' : 'dark',
    };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: SnakeLadderSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}
