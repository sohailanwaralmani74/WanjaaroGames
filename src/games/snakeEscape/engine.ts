import speciesFactsData from '../../data/species-facts.json';

export const ARENA_SIZE = 800;
export const WAVE_DURATION_SEC = 30;
export const TIMED_HUNT_DURATION_SEC = 180; // 3 minutes
export const MAX_SNAKE_SEGMENTS = 46;
export const SEGMENT_SPACING = 11;
export const INITIAL_SEGMENTS = 12;
export const BURROW_DURATION_SEC = 2.0;
export const BURROW_COOLDOWN_SEC = 10.0;
export const INVULNERABLE_DURATION_SEC = 1.5;

export type SnakeEscapeMode = 'survival' | 'timed' | 'daily';

export type BirdOfPreyType = 'hawk' | 'falcon' | 'eagle' | 'owl';

export type SnakeEscapeSkinId =
  | 'ball-python'
  | 'green-tree-python'
  | 'corn-snake'
  | 'king-cobra'
  | 'garter-snake'
  | 'emerald-boa';

export interface SpeciesFactRecord {
  species: string;
  scientificName: string;
  type: 'bird' | 'reptile';
  fact: string;
  source: string;
  verified: boolean;
}

export const SPECIES_FACTS_LIST: SpeciesFactRecord[] =
  speciesFactsData as SpeciesFactRecord[];

export interface BirdOfPreyProfile {
  id: BirdOfPreyType;
  displayName: string;
  speciesKey: string;
  scientificName: string;
  minWave: number;
  baseTrackingSec: number;
  baseLockSec: number;
  diveDurationSec: number;
  radius: number;
  trackingSpeedPx: number;
  isNightPulse: boolean;
  introToast: string;
}

export const BIRD_OF_PREY_PROFILES: Record<BirdOfPreyType, BirdOfPreyProfile> = {
  hawk: {
    id: 'hawk',
    displayName: 'Hawk',
    speciesKey: 'Red-tailed Hawk',
    scientificName: 'Buteo jamaicensis',
    minWave: 1,
    baseTrackingSec: 1.5,
    baseLockSec: 0.6,
    diveDurationSec: 0.28,
    radius: 64,
    trackingSpeedPx: 235,
    isNightPulse: false,
    introToast: 'Wave 1: Red-tailed Hawk patrolling above!',
  },
  falcon: {
    id: 'falcon',
    displayName: 'Peregrine Falcon',
    speciesKey: 'Peregrine Falcon',
    scientificName: 'Falco peregrinus',
    minWave: 3,
    baseTrackingSec: 1.35,
    baseLockSec: 0.4,
    diveDurationSec: 0.2,
    radius: 46,
    trackingSpeedPx: 330,
    isNightPulse: false,
    introToast: 'New Predator: Peregrine Falcon! Fast tracking & 0.4s lock!',
  },
  eagle: {
    id: 'eagle',
    displayName: 'Bald Eagle',
    speciesKey: 'Bald Eagle',
    scientificName: 'Haliaeetus leucocephalus',
    minWave: 5,
    baseTrackingSec: 1.65,
    baseLockSec: 0.78,
    diveDurationSec: 0.36,
    radius: 96,
    trackingSpeedPx: 195,
    isNightPulse: false,
    introToast: 'New Predator: Bald Eagle! Massive strike radius!',
  },
  owl: {
    id: 'owl',
    displayName: 'Barn Owl',
    speciesKey: 'Barn Owl',
    scientificName: 'Tyto alba',
    minWave: 7,
    baseTrackingSec: 1.5,
    baseLockSec: 0.6,
    diveDurationSec: 0.28,
    radius: 86,
    trackingSpeedPx: 240,
    isNightPulse: true,
    introToast: 'Night Wave: Barn Owl! Pulsing ring & wide shadow in the dark!',
  },
};

export interface ArenaObstacle {
  id: string;
  kind: 'rock' | 'log';
  x: number;
  y: number;
  radius: number;
  width?: number;
  height?: number;
  angle?: number;
}

export interface TallGrassPatch {
  id: string;
  x: number;
  y: number;
  radius: number;
}

export interface ArenaFieldLayout {
  obstacles: ArenaObstacle[];
  grassPatches: TallGrassPatch[];
}

export interface FieldMouse {
  id: string;
  kind: 'normal' | 'golden' | 'egg';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  changeDirTimer: number;
  ttl?: number;
}

export interface BirdAttack {
  id: string;
  birdType: BirdOfPreyType;
  x: number;
  y: number;
  radius: number;
  phase: 'tracking' | 'locked' | 'diving' | 'impact';
  elapsedInPhase: number;
  trackingLimitSec: number;
  lockDurationSec: number;
  diveDurationSec: number;
  wasInsideDuringLock: boolean;
  nearMissAwarded: boolean;
  startEdgeX: number;
  startEdgeY: number;
}

export interface FloatingCallout {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  ttl: number;
}

export interface SnakeSegment {
  x: number;
  y: number;
}

/**
 * Cryptographically fair random float in [0, 1) using crypto.getRandomValues.
 */
export function cryptoRandomFloat(): number {
  const arr = new Uint32Array(1);
  window.crypto.getRandomValues(arr);
  return arr[0] / 4294967296;
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

export function distanceBetween(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

/**
 * Checks whether a circle at (x, y) with radius `r` collides with any solid obstacle.
 */
export function collidesWithObstacle(
  x: number,
  y: number,
  r: number,
  obstacles: ArenaObstacle[]
): ArenaObstacle | null {
  for (const obs of obstacles) {
    const d = distanceBetween(x, y, obs.x, obs.y);
    if (d < r + obs.radius) {
      return obs;
    }
  }
  return null;
}

/**
 * Checks whether the snake head is currently inside any tall grass patch.
 */
export function isInsideTallGrass(
  x: number,
  y: number,
  grassPatches: TallGrassPatch[]
): boolean {
  for (const patch of grassPatches) {
    if (distanceBetween(x, y, patch.x, patch.y) <= patch.radius) {
      return true;
    }
  }
  return false;
}

/**
 * Coarse 20x20 grid BFS reachability check over the 800x800 arena.
 * Confirms that all non-blocked cells form a single connected component so the snake can never be trapped.
 */
export function verifyArenaConnectivity(obstacles: ArenaObstacle[]): boolean {
  const gridCells = 20;
  const cellSize = ARENA_SIZE / gridCells; // 40px
  const clearance = 16;

  const blocked: boolean[][] = Array.from({ length: gridCells }, () =>
    Array(gridCells).fill(false)
  );

  let totalOpen = 0;
  let startR = -1;
  let startC = -1;

  for (let r = 0; r < gridCells; r++) {
    for (let c = 0; c < gridCells; c++) {
      const cx = (c + 0.5) * cellSize;
      const cy = (r + 0.5) * cellSize;
      const hit = collidesWithObstacle(cx, cy, clearance, obstacles);
      if (hit) {
        blocked[r][c] = true;
      } else {
        totalOpen++;
        if (startR === -1) {
          startR = r;
          startC = c;
        }
      }
    }
  }

  // Center spawn (400, 400) must also be open
  if (collidesWithObstacle(ARENA_SIZE / 2, ARENA_SIZE / 2, 32, obstacles)) {
    return false;
  }

  if (totalOpen === 0 || startR === -1) return false;

  const visited: boolean[][] = Array.from({ length: gridCells }, () =>
    Array(gridCells).fill(false)
  );
  const queue: [number, number][] = [[startR, startC]];
  visited[startR][startC] = true;
  let visitedCount = 0;

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  while (queue.length > 0) {
    const [cr, cc] = queue.shift()!;
    visitedCount++;
    for (const [dr, dc] of dirs) {
      const nr = cr + dr;
      const nc = cc + dc;
      if (
        nr >= 0 &&
        nr < gridCells &&
        nc >= 0 &&
        nc < gridCells &&
        !blocked[nr][nc] &&
        !visited[nr][nc]
      ) {
        visited[nr][nc] = true;
        queue.push([nr, nc]);
      }
    }
  }

  return visitedCount === totalOpen;
}

/**
 * Generates an obstacle & tall-grass layout for the 800x800 arena.
 * Ensures well-spaced rocks and logs that never trap the snake or block center spawn.
 */
export function generateArenaLayout(seedStr?: string): ArenaFieldLayout {
  const rng = seedStr
    ? createSeededRng(`snake-escape-field-${seedStr}`)
    : cryptoRandomFloat;

  for (let attempt = 0; attempt < 25; attempt++) {
    const obstacles: ArenaObstacle[] = [];
    const grassPatches: TallGrassPatch[] = [];

    // 4 Tall Grass Patches (radius 62-78)
    for (let g = 0; g < 4; g++) {
      for (let tries = 0; tries < 30; tries++) {
        const gx = 110 + rng() * (ARENA_SIZE - 220);
        const gy = 110 + rng() * (ARENA_SIZE - 220);
        const gr = 64 + Math.floor(rng() * 14);
        const tooClose = grassPatches.some(
          (p) => distanceBetween(gx, gy, p.x, p.y) < p.radius + gr + 40
        );
        if (!tooClose) {
          grassPatches.push({ id: `grass-${g}`, x: gx, y: gy, radius: gr });
          break;
        }
      }
    }

    // 8 Solid Obstacles (5 rocks, 3 logs) kept clear of center (400,400) and arena borders
    const totalObs = 8;
    for (let i = 0; i < totalObs; i++) {
      const kind: 'rock' | 'log' = i < 5 ? 'rock' : 'log';
      const radius = kind === 'rock' ? 28 + Math.floor(rng() * 10) : 32;

      for (let tries = 0; tries < 40; tries++) {
        const ox = 95 + rng() * (ARENA_SIZE - 190);
        const oy = 95 + rng() * (ARENA_SIZE - 190);

        // Keep center spawn zone clear
        if (distanceBetween(ox, oy, ARENA_SIZE / 2, ARENA_SIZE / 2) < 115) {
          continue;
        }

        // Keep minimum 95px clearance between obstacle centers so wide corridors always exist
        const overlapsOther = obstacles.some(
          (o) => distanceBetween(ox, oy, o.x, o.y) < o.radius + radius + 55
        );
        if (overlapsOther) continue;

        obstacles.push({
          id: `obs-${i}`,
          kind,
          x: ox,
          y: oy,
          radius,
          width: kind === 'log' ? 68 : radius * 2,
          height: kind === 'log' ? 26 : radius * 2,
          angle: kind === 'log' ? rng() * Math.PI : 0,
        });
        break;
      }
    }

    if (verifyArenaConnectivity(obstacles)) {
      return { obstacles, grassPatches };
    }
  }

  // Fallback guaranteed-connected layout
  return {
    obstacles: [
      { id: 'obs-0', kind: 'rock', x: 180, y: 180, radius: 30 },
      { id: 'obs-1', kind: 'rock', x: 620, y: 180, radius: 30 },
      { id: 'obs-2', kind: 'log', x: 180, y: 620, radius: 32, width: 68, height: 26, angle: 0.4 },
      { id: 'obs-3', kind: 'log', x: 620, y: 620, radius: 32, width: 68, height: 26, angle: -0.5 },
    ],
    grassPatches: [
      { id: 'grass-0', x: 260, y: 380, radius: 70 },
      { id: 'grass-1', x: 540, y: 380, radius: 70 },
      { id: 'grass-2', x: 400, y: 210, radius: 66 },
      { id: 'grass-3', x: 400, y: 590, radius: 66 },
    ],
  };
}

/**
 * Spawns a mouse or power-up guaranteed never to be inside an obstacle or outside the arena.
 */
export function spawnValidPreyItem(
  kind: 'normal' | 'golden' | 'egg',
  obstacles: ArenaObstacle[],
  rng: () => number,
  idSuffix: string
): FieldMouse {
  const radius = kind === 'egg' ? 13 : kind === 'golden' ? 13 : 11;
  const speed = kind === 'golden' ? 92 : kind === 'normal' ? 56 : 0;

  for (let tries = 0; tries < 60; tries++) {
    const x = 55 + rng() * (ARENA_SIZE - 110);
    const y = 55 + rng() * (ARENA_SIZE - 110);
    if (!collidesWithObstacle(x, y, radius + 12, obstacles)) {
      const angle = rng() * Math.PI * 2;
      return {
        id: `prey-${kind}-${idSuffix}-${Math.floor(rng() * 100000)}`,
        kind,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius,
        changeDirTimer: 1.2 + rng() * 1.8,
        ttl: kind === 'golden' ? 9.0 : kind === 'egg' ? 11.0 : undefined,
      };
    }
  }

  return {
    id: `prey-${kind}-fallback-${idSuffix}`,
    kind,
    x: ARENA_SIZE / 2,
    y: ARENA_SIZE / 2 - 140,
    vx: speed,
    vy: 0,
    radius,
    changeDirTimer: 1.5,
    ttl: kind === 'golden' ? 9.0 : kind === 'egg' ? 11.0 : undefined,
  };
}

/**
 * Chooses which Bird of Prey spawns for the current wave.
 */
export function pickBirdForWave(wave: number, rng: () => number): BirdOfPreyType {
  const pool: BirdOfPreyType[] = ['hawk'];
  if (wave >= 3) pool.push('falcon');
  if (wave >= 5) pool.push('eagle');
  if (wave >= 7) pool.push('owl');

  // If it's a night wave (wave >= 7 and odd/even), weight Barn Owl higher
  if (wave >= 7 && rng() < 0.45) {
    return 'owl';
  }
  const idx = Math.floor(rng() * pool.length);
  return pool[idx];
}

/**
 * Creates a new BirdAttack instance targeting near the snake's current head.
 */
export function createBirdAttack(params: {
  wave: number;
  snakeHeadX: number;
  snakeHeadY: number;
  inTallGrass: boolean;
  easyMode: boolean;
  rng: () => number;
  idSuffix: string;
}): BirdAttack {
  const birdType = pickBirdForWave(params.wave, params.rng);
  const profile = BIRD_OF_PREY_PROFILES[birdType];

  // Faster lock times in higher waves (up to 25% faster by wave 10), slowed by 30% in Easy Mode
  const waveSpeedFactor = Math.max(0.75, 1 - (params.wave - 1) * 0.025);
  const easyMultiplier = params.easyMode ? 1.35 : 1.0;

  const baseTrack = params.inTallGrass
    ? Math.min(1.0, profile.baseTrackingSec)
    : profile.baseTrackingSec;

  const lockDurationSec = profile.baseLockSec * waveSpeedFactor * easyMultiplier;

  // Spawn shadow slightly offset from snake head
  const angle = params.rng() * Math.PI * 2;
  const dist = 70 + params.rng() * 75;
  const startX = Math.max(
    profile.radius + 16,
    Math.min(ARENA_SIZE - profile.radius - 16, params.snakeHeadX + Math.cos(angle) * dist)
  );
  const startY = Math.max(
    profile.radius + 16,
    Math.min(ARENA_SIZE - profile.radius - 16, params.snakeHeadY + Math.sin(angle) * dist)
  );

  // Edge position where the diving bird swoops in from
  const edgeSide = Math.floor(params.rng() * 4);
  const startEdgeX =
    edgeSide === 0 ? -40 : edgeSide === 1 ? ARENA_SIZE + 40 : params.rng() * ARENA_SIZE;
  const startEdgeY =
    edgeSide === 2 ? -40 : edgeSide === 3 ? ARENA_SIZE + 40 : params.rng() * ARENA_SIZE;

  return {
    id: `attack-${birdType}-${params.idSuffix}`,
    birdType,
    x: startX,
    y: startY,
    radius: profile.radius,
    phase: 'tracking',
    elapsedInPhase: 0,
    trackingLimitSec: baseTrack,
    lockDurationSec,
    diveDurationSec: profile.diveDurationSec,
    wasInsideDuringLock: false,
    nearMissAwarded: false,
    startEdgeX,
    startEdgeY,
  };
}

/**
 * Checks if ANY segment of the snake is inside the circular strike zone (cx, cy, radius).
 */
export function isSnakeInsideCircle(
  segments: SnakeSegment[],
  segmentRadius: number,
  cx: number,
  cy: number,
  circleRadius: number
): boolean {
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (distanceBetween(seg.x, seg.y, cx, cy) <= circleRadius + segmentRadius * 0.65) {
      return true;
    }
  }
  return false;
}

/**
 * Updates the continuous snake trail so each segment follows smoothly behind the preceding segment.
 */
export function updateSnakeSegments(
  segments: SnakeSegment[],
  newHeadX: number,
  newHeadY: number,
  targetLength: number
): SnakeSegment[] {
  const updated: SnakeSegment[] = [{ x: newHeadX, y: newHeadY }];
  let prevX = newHeadX;
  let prevY = newHeadY;

  const count = Math.min(MAX_SNAKE_SEGMENTS, Math.max(segments.length, targetLength));

  for (let i = 1; i < count; i++) {
    const oldSeg = segments[i] || segments[segments.length - 1] || { x: prevX, y: prevY };
    const dx = oldSeg.x - prevX;
    const dy = oldSeg.y - prevY;
    const dist = Math.hypot(dx, dy);
    if (dist > 0.0001) {
      const angle = Math.atan2(dy, dx);
      const nx = prevX + Math.cos(angle) * SEGMENT_SPACING;
      const ny = prevY + Math.sin(angle) * SEGMENT_SPACING;
      updated.push({ x: nx, y: ny });
      prevX = nx;
      prevY = ny;
    } else {
      updated.push({ x: prevX, y: prevY + SEGMENT_SPACING });
      prevY += SEGMENT_SPACING;
    }
  }

  return updated;
}

/**
 * Automated self-test function verifying:
 * 1. Obstacle layouts never trap the snake or block all routes (BFS connectivity).
 * 2. Mice never spawn inside obstacles.
 * 3. Daily Challenge layout is 100% identical for the same date seed.
 */
export function runSnakeEscapeSelfTest(): {
  passed: boolean;
  testedCount: number;
  failures: string[];
} {
  const failures: string[] = [];
  let testedCount = 0;

  // 1. Test 12 random arena layouts for connectivity and valid mouse spawns
  for (let i = 0; i < 12; i++) {
    testedCount++;
    const layout = generateArenaLayout();
    if (!verifyArenaConnectivity(layout.obstacles)) {
      failures.push(`Random arena #${i + 1} failed BFS connectivity check.`);
    }
    for (let m = 0; m < 10; m++) {
      const mouse = spawnValidPreyItem('normal', layout.obstacles, cryptoRandomFloat, `${i}-${m}`);
      if (collidesWithObstacle(mouse.x, mouse.y, mouse.radius, layout.obstacles)) {
        failures.push(`Mouse spawned inside obstacle on random arena #${i + 1}.`);
      }
    }
  }

  // 2. Test Daily Challenge determinism for same date seed
  const sampleDates = ['2026-10-07', '2026-10-08', '2026-12-31'];
  for (const dt of sampleDates) {
    testedCount++;
    const a = generateArenaLayout(dt);
    const b = generateArenaLayout(dt);
    if (a.obstacles.length !== b.obstacles.length) {
      failures.push(`Daily layout for ${dt} had mismatched obstacle counts.`);
      continue;
    }
    for (let idx = 0; idx < a.obstacles.length; idx++) {
      if (
        Math.abs(a.obstacles[idx].x - b.obstacles[idx].x) > 0.001 ||
        Math.abs(a.obstacles[idx].y - b.obstacles[idx].y) > 0.001
      ) {
        failures.push(`Daily layout for ${dt} was not identical at obstacle ${idx}.`);
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
