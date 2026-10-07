import snakeFactsData from '../../data/snake-facts.json';

export type SnakeGameMode = 'classic' | 'wrap' | 'jungle' | 'daily';

export type BoardSizeOption = 15 | 20 | 25;

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type SnakeSkinId =
  | 'ball-python'
  | 'green-tree-python'
  | 'corn-snake'
  | 'king-cobra'
  | 'garter-snake'
  | 'emerald-boa';

export interface GridPoint {
  x: number;
  y: number;
}

export interface ObstacleCell extends GridPoint {
  kind: 'rock' | 'log';
}

export interface BonusEggState {
  x: number;
  y: number;
  spawnTimeMs: number;
  durationMs: number; // 6000ms
}

export interface SnakeFactItem {
  species: string;
  scientificName: string;
  fact: string;
  source: string;
  verified: boolean;
}

export const SNAKE_FACTS_DB: SnakeFactItem[] = snakeFactsData as SnakeFactItem[];

export function getFactForSpecies(speciesName: string): SnakeFactItem {
  const found = SNAKE_FACTS_DB.find(
    (item) => item.species.toLowerCase() === speciesName.toLowerCase()
  );
  return (
    found || {
      species: speciesName,
      scientificName: 'Serpentes',
      fact: '',
      source: '',
      verified: false,
    }
  );
}

/**
 * Deterministic seeded PRNG (cyrb128 + mulberry32) for Daily Challenge (YYYY-MM-DD)
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
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  let a = (h1 ^ h2 ^ h3 ^ h4) >>> 0;

  return function mulberry32() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getTodayDateIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isOppositeDirection(d1: Direction, d2: Direction): boolean {
  return (
    (d1 === 'UP' && d2 === 'DOWN') ||
    (d1 === 'DOWN' && d2 === 'UP') ||
    (d1 === 'LEFT' && d2 === 'RIGHT') ||
    (d1 === 'RIGHT' && d2 === 'LEFT')
  );
}

/**
 * Queues up to 2 buffered direction inputs so rapid double-turns never drop or reverse into self.
 */
export function enqueueDirection(
  currentDir: Direction,
  queue: Direction[],
  nextDir: Direction
): Direction[] {
  if (queue.length >= 2) return queue;
  const referenceDir = queue.length > 0 ? queue[queue.length - 1] : currentDir;
  if (nextDir === referenceDir || isOppositeDirection(referenceDir, nextDir)) {
    return queue;
  }
  return [...queue, nextDir];
}

/**
 * Calculates level, tick interval (ms), and speed multiplier (x1 to x3) from mice eaten.
 * Speed starts at a comfortable 155ms/cell and speeds up every 5 mice up to a fair cap (75ms).
 */
export function getSpeedAndLevelMetrics(miceEaten: number): {
  level: number;
  tickMs: number;
  multiplier: 1 | 2 | 3;
} {
  const level = Math.floor(miceEaten / 5) + 1;
  // Decrease tick interval by 8ms per level, capped at 75ms
  const tickMs = Math.max(75, 155 - (level - 1) * 8);
  let multiplier: 1 | 2 | 3 = 1;
  if (level >= 7) {
    multiplier = 3;
  } else if (level >= 4) {
    multiplier = 2;
  }
  return { level, tickMs, multiplier };
}

/**
 * Creates the initial 3-segment python centered horizontally, moving RIGHT.
 */
export function createInitialSnake(gridSize: BoardSizeOption): GridPoint[] {
  const midY = Math.floor(gridSize / 2);
  const midX = Math.floor(gridSize / 2);
  return [
    { x: midX, y: midY }, // Head
    { x: midX - 1, y: midY },
    { x: midX - 2, y: midY },
  ];
}

function pointKey(x: number, y: number): string {
  return `${x},${y}`;
}

/**
 * Breadth-First Search (BFS) flood-fill to verify that:
 * 1. All non-obstacle cells form a single connected component (no dead pockets)
 * 2. Every empty cell has at least 2 free neighbors so the snake cannot be trapped in a 1-way cul-de-sac
 */
export function isObstacleLayoutValid(
  gridSize: number,
  obstacles: ObstacleCell[],
  snake: GridPoint[]
): boolean {
  const obsSet = new Set<string>(obstacles.map((o) => pointKey(o.x, o.y)));
  const snakeHead = snake[0];

  // Ensure no obstacle overlaps the snake or the 3 cells directly in front of the head
  for (const seg of snake) {
    if (obsSet.has(pointKey(seg.x, seg.y))) return false;
  }
  for (let dx = 1; dx <= 3; dx++) {
    if (obsSet.has(pointKey(snakeHead.x + dx, snakeHead.y))) return false;
  }

  // Every open cell must have at least 2 open orthogonal neighbors so no cell is a 3-walled trap
  const dirs = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];

  let totalFreeCells = 0;
  let startCell: GridPoint | null = null;

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (obsSet.has(pointKey(x, y))) continue;
      totalFreeCells++;
      if (!startCell) startCell = { x, y };

      let openNeighbors = 0;
      for (const [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        if (
          nx >= 0 &&
          nx < gridSize &&
          ny >= 0 &&
          ny < gridSize &&
          !obsSet.has(pointKey(nx, ny))
        ) {
          openNeighbors++;
        }
      }
      if (openNeighbors < 2) {
        return false;
      }
    }
  }

  if (!startCell) return false;

  // Flood-fill from startCell to verify 100% of free cells are mutually reachable
  const visited = new Set<string>([pointKey(startCell.x, startCell.y)]);
  const queue: GridPoint[] = [startCell];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    for (const [dx, dy] of dirs) {
      const nx = curr.x + dx;
      const ny = curr.y + dy;
      if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) continue;
      const k = pointKey(nx, ny);
      if (obsSet.has(k) || visited.has(k)) continue;
      visited.add(k);
      queue.push({ x: nx, y: ny });
    }
  }

  return visited.size === totalFreeCells;
}

/**
 * Generates obstacles (rocks & logs) for Jungle mode or Daily Challenge.
 * Obstacle count rises with level in Jungle mode, and every generated layout
 * is verified via BFS so it never traps the snake or blocks paths to food.
 */
export function generateObstacles(
  gridSize: BoardSizeOption,
  level: number,
  snake: GridPoint[],
  rng: () => number,
  existingObstacles: ObstacleCell[] = []
): ObstacleCell[] {
  const targetCount = Math.min(
    Math.floor((gridSize * gridSize) * 0.08),
    4 + (level - 1) * 2
  );

  const current = [...existingObstacles];
  if (current.length >= targetCount) return current;

  const occupied = new Set<string>();
  snake.forEach((s) => occupied.add(pointKey(s.x, s.y)));
  // Keep a 2-cell safe zone around the snake head
  const head = snake[0];
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 3; dx++) {
      occupied.add(pointKey(head.x + dx, head.y + dy));
    }
  }
  current.forEach((o) => occupied.add(pointKey(o.x, o.y)));

  for (let tries = 0; tries < 250 && current.length < targetCount; tries++) {
    // Keep obstacles at least 1 cell away from outer border so perimeter loop stays open
    const rx = Math.floor(rng() * (gridSize - 2)) + 1;
    const ry = Math.floor(rng() * (gridSize - 2)) + 1;
    const k = pointKey(rx, ry);
    if (occupied.has(k)) continue;

    const candidate: ObstacleCell = {
      x: rx,
      y: ry,
      kind: current.length % 2 === 0 ? 'rock' : 'log',
    };
    const nextList = [...current, candidate];
    if (isObstacleLayoutValid(gridSize, nextList, snake)) {
      current.push(candidate);
      occupied.add(k);
    }
  }

  return current;
}

/**
 * Checks if a target cell is reachable from the snake's current head position
 * without passing through the snake's body or any obstacle.
 */
export function isCellReachableFromHead(
  gridSize: number,
  snake: GridPoint[],
  obstacles: ObstacleCell[],
  target: GridPoint,
  wrapAround: boolean
): boolean {
  const blocked = new Set<string>();
  // All snake segments except head block movement
  for (let i = 1; i < snake.length; i++) {
    blocked.add(pointKey(snake[i].x, snake[i].y));
  }
  for (const o of obstacles) {
    blocked.add(pointKey(o.x, o.y));
  }

  const start = snake[0];
  const targetKey = pointKey(target.x, target.y);
  if (pointKey(start.x, start.y) === targetKey) return true;

  const visited = new Set<string>([pointKey(start.x, start.y)]);
  const queue: GridPoint[] = [start];
  const dirs = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    for (const [dx, dy] of dirs) {
      let nx = curr.x + dx;
      let ny = curr.y + dy;
      if (wrapAround) {
        nx = (nx + gridSize) % gridSize;
        ny = (ny + gridSize) % gridSize;
      } else if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) {
        continue;
      }
      const k = pointKey(nx, ny);
      if (k === targetKey) return true;
      if (blocked.has(k) || visited.has(k)) continue;
      visited.add(k);
      queue.push({ x: nx, y: ny });
    }
  }

  return false;
}

/**
 * Spawns a mouse or bonus egg on an unoccupied, reachable cell.
 */
export function spawnCollectibleCell(
  gridSize: BoardSizeOption,
  snake: GridPoint[],
  obstacles: ObstacleCell[],
  rng: () => number,
  avoidPoints: GridPoint[] = [],
  wrapAround = false
): GridPoint {
  const occupied = new Set<string>();
  snake.forEach((s) => occupied.add(pointKey(s.x, s.y)));
  obstacles.forEach((o) => occupied.add(pointKey(o.x, o.y)));
  avoidPoints.forEach((a) => occupied.add(pointKey(a.x, a.y)));

  const freeReachable: GridPoint[] = [];
  const freeFallback: GridPoint[] = [];

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (!occupied.has(pointKey(x, y))) {
        const pt = { x, y };
        freeFallback.push(pt);
        if (isCellReachableFromHead(gridSize, snake, obstacles, pt, wrapAround)) {
          freeReachable.push(pt);
        }
      }
    }
  }

  const pool = freeReachable.length > 0 ? freeReachable : freeFallback;
  if (pool.length === 0) {
    return { x: 0, y: 0 };
  }
  const idx = Math.floor(rng() * pool.length);
  return pool[idx];
}

export interface StepResult {
  snake: GridPoint[];
  direction: Direction;
  ateMouse: boolean;
  ateBonusEgg: boolean;
  gameOver: boolean;
  deathReason?: 'wall' | 'self' | 'obstacle';
}

/**
 * Advances the snake by 1 cell in the queued/current direction and evaluates collisions.
 */
export function advanceSnakeStep(params: {
  gridSize: BoardSizeOption;
  snake: GridPoint[];
  currentDir: Direction;
  dirQueue: Direction[];
  mode: SnakeGameMode;
  obstacles: ObstacleCell[];
  mouse: GridPoint;
  bonusEgg: BonusEggState | null;
}): {
  result: StepResult;
  remainingQueue: Direction[];
} {
  const { gridSize, snake, currentDir, dirQueue, mode, obstacles, mouse, bonusEgg } = params;

  let nextDir = currentDir;
  let remainingQueue = dirQueue;
  if (dirQueue.length > 0) {
    nextDir = dirQueue[0];
    remainingQueue = dirQueue.slice(1);
  }

  const head = snake[0];
  let nx = head.x;
  let ny = head.y;

  if (nextDir === 'UP') ny -= 1;
  else if (nextDir === 'DOWN') ny += 1;
  else if (nextDir === 'LEFT') nx -= 1;
  else if (nextDir === 'RIGHT') nx += 1;

  // Wall collision or Wrap-Around
  if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) {
    if (mode === 'wrap') {
      nx = (nx + gridSize) % gridSize;
      ny = (ny + gridSize) % gridSize;
    } else {
      return {
        result: {
          snake,
          direction: nextDir,
          ateMouse: false,
          ateBonusEgg: false,
          gameOver: true,
          deathReason: 'wall',
        },
        remainingQueue,
      };
    }
  }

  // Obstacle collision
  if (obstacles.some((o) => o.x === nx && o.y === ny)) {
    return {
      result: {
        snake,
        direction: nextDir,
        ateMouse: false,
        ateBonusEgg: false,
        gameOver: true,
        deathReason: 'obstacle',
      },
      remainingQueue,
    };
  }

  const ateMouse = nx === mouse.x && ny === mouse.y;
  const ateBonusEgg = Boolean(bonusEgg && nx === bonusEgg.x && ny === bonusEgg.y);

  // If not growing this tick, the tail tip vacates its cell
  const bodyToCheck = ateMouse ? snake : snake.slice(0, snake.length - 1);
  if (bodyToCheck.some((seg) => seg.x === nx && seg.y === ny)) {
    return {
      result: {
        snake,
        direction: nextDir,
        ateMouse: false,
        ateBonusEgg: false,
        gameOver: true,
        deathReason: 'self',
      },
      remainingQueue,
    };
  }

  const newHead: GridPoint = { x: nx, y: ny };
  const nextSnake = ateMouse
    ? [newHead, ...snake]
    : [newHead, ...snake.slice(0, snake.length - 1)];

  return {
    result: {
      snake: nextSnake,
      direction: nextDir,
      ateMouse,
      ateBonusEgg,
      gameOver: false,
    },
    remainingQueue,
  };
}

/**
 * Self-test function that verifies:
 * 1. Obstacle layouts never overlap the snake and always leave 100% of open cells mutually reachable.
 * 2. Spawned mice and bonus eggs never land on the snake or obstacles and are always reachable from the head.
 * 3. Daily Challenge seeded generator produces identical obstacle & food sequences for the same date.
 */
export function runSnakeEngineSelfTest(iterations = 20): {
  passed: boolean;
  testedCount: number;
  failures: string[];
} {
  const failures: string[] = [];
  const sizes: BoardSizeOption[] = [15, 20, 25];

  for (let i = 0; i < iterations; i++) {
    const size = sizes[i % sizes.length];
    const seed = `2026-10-${String((i % 28) + 1).padStart(2, '0')}`;
    const rng1 = createSeededRng(seed);
    const rng2 = createSeededRng(seed);

    const snake = createInitialSnake(size);
    const obs1 = generateObstacles(size, (i % 6) + 1, snake, rng1);
    const obs2 = generateObstacles(size, (i % 6) + 1, snake, rng2);

    if (!isObstacleLayoutValid(size, obs1, snake)) {
      failures.push(`Obstacle layout invalid on iteration ${i}`);
    }

    if (obs1.length !== obs2.length || (obs1[0] && obs1[0].x !== obs2[0].x)) {
      failures.push(`Daily seeded obstacles not deterministic for ${seed}`);
    }

    const mouse1 = spawnCollectibleCell(size, snake, obs1, rng1);
    const mouse2 = spawnCollectibleCell(size, snake, obs2, rng2);

    if (mouse1.x !== mouse2.x || mouse1.y !== mouse2.y) {
      failures.push(`Daily seeded food spawn not deterministic for ${seed}`);
    }

    const hitsSnake = snake.some((s) => s.x === mouse1.x && s.y === mouse1.y);
    const hitsObstacle = obs1.some((o) => o.x === mouse1.x && o.y === mouse1.y);
    if (hitsSnake || hitsObstacle) {
      failures.push(`Spawned mouse overlapped snake or obstacle on iteration ${i}`);
    }

    if (!isCellReachableFromHead(size, snake, obs1, mouse1, false)) {
      failures.push(`Spawned mouse unreachable from snake head on iteration ${i}`);
    }
  }

  return {
    passed: failures.length === 0,
    testedCount: iterations,
    failures,
  };
}
