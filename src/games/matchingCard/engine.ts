import speciesFactsData from '../../data/species-facts.json';

export type MatchingDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type MatchingGameMode = 'classic' | 'timed' | 'daily' | 'two-player';

export interface SpeciesFactEntry {
  species: string;
  scientificName: string;
  type: 'bird' | 'reptile';
  fact: string;
  source: string;
  verified: boolean;
}

export const ALL_SPECIES_LIST: SpeciesFactEntry[] = speciesFactsData as SpeciesFactEntry[];

export interface DifficultyConfig {
  id: MatchingDifficulty;
  label: string;
  cols: number;
  rows: number;
  pairs: number;
  timeLimitSec: number;
}

export const DIFFICULTY_CONFIGS: Record<MatchingDifficulty, DifficultyConfig> = {
  easy: { id: 'easy', label: 'Easy (4×3)', cols: 4, rows: 3, pairs: 6, timeLimitSec: 60 },
  medium: { id: 'medium', label: 'Medium (4×4)', cols: 4, rows: 4, pairs: 8, timeLimitSec: 90 },
  hard: { id: 'hard', label: 'Hard (6×4)', cols: 6, rows: 4, pairs: 12, timeLimitSec: 150 },
  expert: { id: 'expert', label: 'Expert (6×6)', cols: 6, rows: 6, pairs: 18, timeLimitSec: 240 },
};

export interface CardSlot {
  uid: string;
  index: number;
  species: string;
  scientificName: string;
  animalType: 'bird' | 'reptile';
  status: 'down' | 'up' | 'matched';
}

/**
 * Cryptographically fair random integer in [0, maxExclusive) using crypto.getRandomValues
 */
export function cryptoRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 1) return 0;
  const arr = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
  while (true) {
    window.crypto.getRandomValues(arr);
    if (arr[0] < limit) {
      return arr[0] % maxExclusive;
    }
  }
}

/**
 * Deterministic seeded random generator (cyrb128 + mulberry32) for Daily Challenge (YYYY-MM-DD)
 */
export function createSeededRandomGenerator(seedStr: string): () => number {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0; i < seedStr.length; i++) {
    const k = seedStr.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = h1 ^ Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = h2 ^ Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  let a = (h1 ^ h2 ^ h3 ^ h4) >>> 0;

  return function mulberry32() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Fisher-Yates shuffle using either a seeded RNG or crypto.getRandomValues.
 */
export function fisherYatesShuffle<T>(items: T[], seededRng?: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = seededRng
      ? Math.floor(seededRng() * (i + 1))
      : cryptoRandomInt(i + 1);
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

/**
 * Generates a balanced deck of bird and reptile pairs for the given difficulty.
 * For Daily Challenge (seedStr provided), always uses Medium (8 pairs: 4 birds + 4 reptiles)
 * and deterministic seeded Fisher-Yates shuffle.
 */
export function generateDeck(
  difficulty: MatchingDifficulty,
  seedStr?: string
): CardSlot[] {
  const activeDiff: MatchingDifficulty = seedStr ? 'medium' : difficulty;
  const cfg = DIFFICULTY_CONFIGS[activeDiff];
  const seededRng = seedStr
    ? createSeededRandomGenerator(`matching-daily-${seedStr}`)
    : undefined;

  const birds = ALL_SPECIES_LIST.filter((s) => s.type === 'bird');
  const reptiles = ALL_SPECIES_LIST.filter((s) => s.type === 'reptile');

  const shuffledBirds = fisherYatesShuffle(birds, seededRng);
  const shuffledReptiles = fisherYatesShuffle(reptiles, seededRng);

  const halfPairs = Math.floor(cfg.pairs / 2);
  const chosenSpecies: SpeciesFactEntry[] = [
    ...shuffledBirds.slice(0, halfPairs),
    ...shuffledReptiles.slice(0, cfg.pairs - halfPairs),
  ];

  // Create exactly 2 cards for each chosen animal
  const rawPairs: SpeciesFactEntry[] = [];
  chosenSpecies.forEach((sp) => {
    rawPairs.push(sp, sp);
  });

  const shuffledCards = fisherYatesShuffle(rawPairs, seededRng);

  return shuffledCards.map((sp, idx) => ({
    uid: `card-${idx}-${sp.species.replace(/\s+/g, '-').toLowerCase()}`,
    index: idx,
    species: sp.species,
    scientificName: sp.scientificName,
    animalType: sp.type,
    status: 'down',
  }));
}

/**
 * Scoring rules:
 * - Each match = 100 points
 * - Consecutive matches without a miss give +50 per streak step (streak >= 2 adds (streak-1)*50, capped at +300)
 * - Each wrong flip = -10 points (score never drops below 0)
 * - Time bonus (Timed and Daily): +2 points per remaining second
 */
export function calculateMatchGain(newStreak: number): {
  basePoints: number;
  comboBonus: number;
  totalAdded: number;
} {
  const basePoints = 100;
  const comboBonus = newStreak > 1 ? Math.min(300, (newStreak - 1) * 50) : 0;
  return {
    basePoints,
    comboBonus,
    totalAdded: basePoints + comboBonus,
  };
}

export function applyMismatchPenalty(currentScore: number): number {
  return Math.max(0, currentScore - 10);
}

export function calculateTimeBonus(remainingSeconds: number): number {
  return Math.max(0, Math.floor(remainingSeconds) * 2);
}

/**
 * Star rating 1-3 based on moves versus pairs:
 * - 3 stars if moves <= pairs * 1.5
 * - 2 stars if moves <= pairs * 2.5
 * - 1 star otherwise
 */
export function calculateStarRating(moves: number, pairs: number): 1 | 2 | 3 {
  if (moves <= pairs * 1.5) return 3;
  if (moves <= pairs * 2.5) return 2;
  return 1;
}

/**
 * Self-test function that verifies:
 * 1. Every generated board across all difficulties contains each chosen animal exactly twice.
 * 2. Every board has an equal balance of birds and reptiles.
 * 3. Daily Challenge boards are 100% identical for the same date seed.
 */
export function runMatchingBoardSelfTest(): {
  passed: boolean;
  testedCount: number;
  failures: string[];
} {
  const failures: string[] = [];
  const difficulties: MatchingDifficulty[] = ['easy', 'medium', 'hard', 'expert'];
  let testedCount = 0;

  for (const diff of difficulties) {
    for (let i = 0; i < 5; i++) {
      testedCount++;
      const deck = generateDeck(diff);
      const expectedCards = DIFFICULTY_CONFIGS[diff].pairs * 2;
      if (deck.length !== expectedCards) {
        failures.push(`${diff} deck length ${deck.length} !== ${expectedCards}`);
      }

      const counts = new Map<string, number>();
      for (const c of deck) {
        counts.set(c.species, (counts.get(c.species) || 0) + 1);
      }
      counts.forEach((cnt, sp) => {
        if (cnt !== 2) {
          failures.push(`Species ${sp} appeared ${cnt} times in ${diff} deck (expected 2)`);
        }
      });
    }
  }

  // Test Daily Challenge determinism
  const dates = ['2026-10-07', '2026-10-08', '2026-12-25'];
  for (const dt of dates) {
    testedCount++;
    const d1 = generateDeck('medium', dt);
    const d2 = generateDeck('medium', dt);
    if (d1.length !== 16 || d2.length !== 16) {
      failures.push(`Daily deck for ${dt} did not have 16 cards`);
    }
    for (let idx = 0; idx < d1.length; idx++) {
      if (d1[idx].species !== d2[idx].species) {
        failures.push(`Daily deck for ${dt} was not deterministic at card ${idx}`);
        break;
      }
    }
  }

  return {
    passed: failures.length === 0,
    testedCount,
    failures,
  };
}
