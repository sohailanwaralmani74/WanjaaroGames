import speciesFactsData from '../../data/species-facts.json';

export const CANYON_WIDTH = 400;
export const CANYON_HEIGHT = 700;
export const GROUND_HEIGHT = 64;
export const PLAYABLE_HEIGHT = CANYON_HEIGHT - GROUND_HEIGHT; // 636 px

// Physics Constants
export const GRAVITY_PX_S2 = 1500;
export const FLAP_VELOCITY_PX_S = -480;
export const MAX_FALL_SPEED_PX_S = 700;

// Pillar & Course Constants
export const PILLAR_WIDTH = 66;
export const BASE_SCROLL_SPEED_PX_S = 180;
export const CHILL_SCROLL_SPEED_PX_S = 142;
export const SPAWN_INTERVAL_SEC = 1.5;

export const CLASSIC_START_GAP = 170;
export const CLASSIC_MIN_GAP = 130;
export const CHILL_BASE_GAP = 220;

export const PARROT_X = 104;
export const PARROT_START_Y = 300;
// Identical forgiving physics hitbox radius across all skins
export const PARROT_HITBOX_RADIUS = 13;

export type ParrotFlapMode = 'classic' | 'chill' | 'daily';

export type ParrotSkinId =
  | 'scarlet-macaw'
  | 'common-kingfisher'
  | 'barn-owl'
  | 'ruby-hummingbird'
  | 'indian-peafowl';

export type ParrotMedal = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';

export interface SpeciesFactItem {
  species: string;
  scientificName: string;
  type: 'bird' | 'reptile';
  fact: string;
  source: string;
  verified: boolean;
}

export const SPECIES_FACTS_DB: SpeciesFactItem[] =
  speciesFactsData as SpeciesFactItem[];

export interface SandstonePillarPair {
  id: number;
  x: number;
  gapCenterY: number;
  gapHeight: number;
  passed: boolean;
  hasFeather: boolean;
  featherCollected: boolean;
  featherBobOffset: number;
}

export interface FloatingScoreText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  ttl: number;
}

/**
 * Cryptographically fair random float in [0, 1) using crypto.getRandomValues.
 */
export function cryptoRandom(): number {
  const buf = new Uint32Array(1);
  window.crypto.getRandomValues(buf);
  return buf[0] / 4294967296;
}

/**
 * Deterministic seeded random generator (cyrb128 + mulberry32) for Daily Challenge (YYYY-MM-DD).
 */
export function createSeededRng(seedStr: string): () => number {
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
 * Calculates medal tier from final score:
 * Bronze at 10, Silver at 25, Gold at 50, Platinum at 100.
 */
export function getMedalForScore(score: number): ParrotMedal {
  if (score >= 100) return 'platinum';
  if (score >= 50) return 'gold';
  if (score >= 25) return 'silver';
  if (score >= 10) return 'bronze';
  return 'none';
}

/**
 * Computes the pillar gap height for the given mode, pillars passed count, and Assist Mode toggle.
 */
export function computeGapHeight(
  mode: ParrotFlapMode,
  pillarsPassed: number,
  assistMode: boolean
): number {
  let gap = CLASSIC_START_GAP;
  if (mode === 'chill') {
    gap = CHILL_BASE_GAP;
  } else {
    // Shrink slowly from 170 px down to minimum 130 px as score/pillars rise
    gap = Math.max(CLASSIC_MIN_GAP, CLASSIC_START_GAP - pillarsPassed * 0.65);
  }
  if (assistMode) {
    gap = Math.round(gap * 1.2);
  }
  return gap;
}

/**
 * Computes current horizontal scroll speed (px/s).
 */
export function computeScrollSpeed(
  mode: ParrotFlapMode,
  pillarsPassed: number
): number {
  if (mode === 'chill') {
    return CHILL_SCROLL_SPEED_PX_S;
  }
  // Classic & Daily: starts at 180 px/s, increases gently up to 228 px/s cap
  return Math.min(228, BASE_SCROLL_SPEED_PX_S + pillarsPassed * 0.6);
}

/**
 * Calculates the maximum safe vertical climb and drop between two consecutive pillar gaps
 * under the physics constants (gravity 1500, flap -480, maxFall 700, interval 1.5s),
 * so every generated gap is 100% reachable from the previous one.
 */
export function getReachableVerticalDeltaBounds(dtSec = SPAWN_INTERVAL_SEC): {
  maxClimbPx: number;
  maxFallPx: number;
} {
  // Peak upward displacement of a single flap is v^2 / (2g) = 480^2 / 3000 = 76.8 px.
  // In 1.5 seconds, a player can comfortably chain 3 flaps to climb >190 px, or glide down >240 px.
  // We clamp consecutive gap centers conservatively within 155 px climb and 165 px descent.
  const maxClimbPx = Math.floor(105 * dtSec); // ~157 px
  const maxFallPx = Math.floor(110 * dtSec); // ~165 px
  return { maxClimbPx, maxFallPx };
}

/**
 * Generates the next sandstone pillar pair, guaranteeing reachability from `prevGapCenterY`.
 */
export function generateNextPillarPair(params: {
  id: number;
  spawnX: number;
  prevGapCenterY: number;
  mode: ParrotFlapMode;
  pillarsPassed: number;
  assistMode: boolean;
  rng: () => number;
}): SandstonePillarPair {
  const gapHeight = computeGapHeight(
    params.mode,
    params.pillarsPassed,
    params.assistMode
  );

  const marginTop = 68 + gapHeight / 2;
  const marginBottom = PLAYABLE_HEIGHT - 68 - gapHeight / 2;

  const { maxClimbPx, maxFallPx } = getReachableVerticalDeltaBounds(SPAWN_INTERVAL_SEC);

  const minReachableY = Math.max(marginTop, params.prevGapCenterY - maxClimbPx);
  const maxReachableY = Math.min(marginBottom, params.prevGapCenterY + maxFallPx);

  const gapCenterY =
    minReachableY + params.rng() * Math.max(1, maxReachableY - minReachableY);

  // ~42% chance a collectible feather floats in the gap
  const hasFeather = params.rng() < 0.42;
  const featherBobOffset = params.rng() * Math.PI * 2;

  return {
    id: params.id,
    x: params.spawnX,
    gapCenterY,
    gapHeight,
    passed: false,
    hasFeather,
    featherCollected: false,
    featherBobOffset,
  };
}

/**
 * Checks forgiving circle-vs-AABB collision between the parrot and a sandstone pillar pair.
 */
export function checkPillarCollision(
  parrotX: number,
  parrotY: number,
  hitboxRadius: number,
  pillar: SandstonePillarPair
): boolean {
  const pillarLeft = pillar.x;
  const pillarRight = pillar.x + PILLAR_WIDTH;

  // Quick horizontal bounding check
  if (parrotX + hitboxRadius < pillarLeft || parrotX - hitboxRadius > pillarRight) {
    return false;
  }

  const gapTop = pillar.gapCenterY - pillar.gapHeight / 2;
  const gapBottom = pillar.gapCenterY + pillar.gapHeight / 2;

  // Check top pillar rectangle [0 .. gapTop]
  const nearestX = Math.max(pillarLeft, Math.min(parrotX, pillarRight));
  const nearestTopY = Math.max(0, Math.min(parrotY, gapTop));
  const distTop = Math.hypot(parrotX - nearestX, parrotY - nearestTopY);
  if (distTop < hitboxRadius) {
    return true;
  }

  // Check bottom pillar rectangle [gapBottom .. PLAYABLE_HEIGHT]
  const nearestBottomY = Math.max(gapBottom, Math.min(parrotY, PLAYABLE_HEIGHT));
  const distBottom = Math.hypot(parrotX - nearestX, parrotY - nearestBottomY);
  if (distBottom < hitboxRadius) {
    return true;
  }

  return false;
}

/**
 * Automated self-test function confirming:
 * 1. Every generated gap in a 150-pillar sequence is reachable from the previous one under the physics constants.
 * 2. The Daily Challenge course generated for the same date (YYYY-MM-DD) is 100% identical.
 */
export function runParrotFlapSelfTest(): {
  passed: boolean;
  testedPillars: number;
  failures: string[];
} {
  const failures: string[] = [];
  let testedPillars = 0;

  const { maxClimbPx, maxFallPx } = getReachableVerticalDeltaBounds(SPAWN_INTERVAL_SEC);

  // 1. Verify reachability across 150 consecutive random pillars
  let prevY = PARROT_START_Y;
  for (let i = 0; i < 150; i++) {
    testedPillars++;
    const nextPillar = generateNextPillarPair({
      id: i + 1,
      spawnX: CANYON_WIDTH + 40,
      prevGapCenterY: prevY,
      mode: 'classic',
      pillarsPassed: i,
      assistMode: false,
      rng: cryptoRandom,
    });

    const delta = nextPillar.gapCenterY - prevY;
    if (delta < -(maxClimbPx + 0.01) || delta > maxFallPx + 0.01) {
      failures.push(
        `Pillar #${i + 1} vertical delta (${delta.toFixed(1)}px) exceeded reachable physics bounds.`
      );
    }

    const gapTop = nextPillar.gapCenterY - nextPillar.gapHeight / 2;
    const gapBottom = nextPillar.gapCenterY + nextPillar.gapHeight / 2;
    if (gapTop < 40 || gapBottom > PLAYABLE_HEIGHT - 40) {
      failures.push(`Pillar #${i + 1} gap exceeded canyon vertical boundaries.`);
    }

    prevY = nextPillar.gapCenterY;
  }

  // 2. Verify Daily Challenge determinism for identical dates
  const sampleDates = ['2026-10-07', '2026-10-08', '2026-12-25'];
  for (const dt of sampleDates) {
    const rngA = createSeededRng(`parrot-flap-daily-${dt}`);
    const rngB = createSeededRng(`parrot-flap-daily-${dt}`);
    let prevA = PARROT_START_Y;
    let prevB = PARROT_START_Y;

    for (let p = 0; p < 40; p++) {
      testedPillars++;
      const pairA = generateNextPillarPair({
        id: p,
        spawnX: CANYON_WIDTH,
        prevGapCenterY: prevA,
        mode: 'daily',
        pillarsPassed: p,
        assistMode: false,
        rng: rngA,
      });
      const pairB = generateNextPillarPair({
        id: p,
        spawnX: CANYON_WIDTH,
        prevGapCenterY: prevB,
        mode: 'daily',
        pillarsPassed: p,
        assistMode: false,
        rng: rngB,
      });

      if (
        Math.abs(pairA.gapCenterY - pairB.gapCenterY) > 0.0001 ||
        pairA.hasFeather !== pairB.hasFeather
      ) {
        failures.push(`Daily Challenge course for ${dt} diverged at pillar #${p + 1}.`);
        break;
      }
      prevA = pairA.gapCenterY;
      prevB = pairB.gapCenterY;
    }
  }

  return {
    passed: failures.length === 0,
    testedPillars,
    failures,
  };
}
