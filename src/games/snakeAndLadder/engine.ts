import snakeFactsData from '../../data/snake-facts.json';

export type BirdTokenId = 'parrot' | 'owl' | 'eagle' | 'penguin';

export type GameMode = 'solo' | 'cpu' | 'multi' | 'daily';

export interface SnakeFactEntry {
  species: string;
  scientificName: string;
  fact: string;
  source: string;
  verified: boolean;
}

export const SNAKE_SPECIES_LIST: SnakeFactEntry[] = snakeFactsData as SnakeFactEntry[];

export interface BoardLink {
  id: string;
  type: 'ladder' | 'snake';
  start: number; // bottom for ladder, head for snake
  end: number;   // top for ladder, tail for snake
  species?: SnakeFactEntry; // present for snakes
}

export interface BoardConfig {
  ladders: BoardLink[];
  snakes: BoardLink[];
  seed?: string;
}

export interface PlayerState {
  id: string;
  name: string;
  token: BirdTokenId;
  isCpu: boolean;
  position: number; // 0 (off-board) to 100
  turnsTaken: number;
  consecutiveSixes: number;
  laddersClimbed: number;
  snakeBites: number;
  longestClimb: number;
}

/**
 * Cryptographically fair 6-sided die roll using crypto.getRandomValues
 * Uses rejection sampling (< 252) to eliminate modulo bias.
 */
export function rollFairDie(): number {
  const array = new Uint8Array(1);
  while (true) {
    window.crypto.getRandomValues(array);
    const val = array[0];
    if (val < 252) {
      return (val % 6) + 1;
    }
  }
}

/**
 * Deterministic seeded random number generator (cyrb128 + mulberry32)
 * Used for Daily Board (YYYY-MM-DD) so all players get the identical layout.
 */
export function createSeededRandom(seedStr: string): () => number {
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

/**
 * Returns today's date string in YYYY-MM-DD format (local time).
 */
export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Converts a board square (1-100) into 0-indexed visual grid coordinates:
 * - visualRow: 0 is top row (squares 100..91), 9 is bottom row (squares 1..10)
 * - visualCol: 0 is leftmost column, 9 is rightmost column
 * - xPercent, yPercent: center of the square in 0..100 coordinate space
 */
export function getSquareCoords(square: number): {
  rowFromBottom: number;
  visualRow: number;
  visualCol: number;
  xPercent: number;
  yPercent: number;
} {
  const clamped = Math.max(1, Math.min(100, square));
  const zeroIdx = clamped - 1;
  const rowFromBottom = Math.floor(zeroIdx / 10); // 0..9
  const offsetInRow = zeroIdx % 10;
  // Row 0 from bottom (1..10) goes left-to-right; Row 1 (11..20) goes right-to-left
  const visualCol = rowFromBottom % 2 === 0 ? offsetInRow : 9 - offsetInRow;
  const visualRow = 9 - rowFromBottom;

  return {
    rowFromBottom,
    visualRow,
    visualCol,
    xPercent: visualCol * 10 + 5,
    yPercent: visualRow * 10 + 5,
  };
}

/**
 * Validates that a generated board strictly obeys all placement rules:
 * - Exactly 8 ladders and 8 snakes
 * - No snake head or ladder bottom on 1 or 100
 * - No ladder top on 100
 * - No square holds more than one snake head or ladder bottom
 * - No chains where a slide/climb ends on the start of another slide/climb
 * - No ladder or snake spanning less than 8 squares
 */
export function validateBoard(board: BoardConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (board.ladders.length !== 8) {
    errors.push(`Expected 8 ladders, got ${board.ladders.length}`);
  }
  if (board.snakes.length !== 8) {
    errors.push(`Expected 8 snakes, got ${board.snakes.length}`);
  }

  const allLinks = [...board.ladders, ...board.snakes];
  const starts = new Set<number>();
  const ends = new Set<number>();

  for (const link of allLinks) {
    if (link.start <= 1 || link.start >= 100) {
      errors.push(`${link.type} start on invalid square ${link.start}`);
    }
    if (link.end < 1 || link.end >= 100) {
      errors.push(`${link.type} end on invalid square ${link.end} (cannot be 100)`);
    }
    if (link.type === 'ladder' && link.end <= link.start) {
      errors.push(`Ladder ${link.id} must go up (${link.start} -> ${link.end})`);
    }
    if (link.type === 'snake' && link.end >= link.start) {
      errors.push(`Snake ${link.id} must go down (${link.start} -> ${link.end})`);
    }
    if (Math.abs(link.end - link.start) < 8) {
      errors.push(`${link.type} ${link.id} spans less than 8 squares (${link.start} -> ${link.end})`);
    }
    if (starts.has(link.start)) {
      errors.push(`Duplicate start square ${link.start}`);
    }
    starts.add(link.start);
    ends.add(link.end);
  }

  // Check for chains: no end square may be a start square of any snake or ladder
  for (const endSq of ends) {
    if (starts.has(endSq)) {
      errors.push(`Chain detected at square ${endSq}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Generates a fair, balanced 10x10 Snake and Ladder board with 8 ladders and 8 snakes.
 * If seedStr is provided, generation is 100% deterministic.
 */
export function generateBoard(seedStr?: string): BoardConfig {
  const rng = seedStr ? createSeededRandom(seedStr) : () => {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] / 4294967296;
  };

  const randInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;

  for (let attempt = 0; attempt < 200; attempt++) {
    const occupied = new Set<number>([1, 100]);
    const ladders: BoardLink[] = [];
    const snakes: BoardLink[] = [];

    // Generate 8 ladders distributed across the board so every region has climbing vines
    const ladderBands = [
      { minStart: 2, maxStart: 12, minSpan: 10, maxSpan: 26 },
      { minStart: 8, maxStart: 19, minSpan: 12, maxSpan: 32 },
      { minStart: 16, maxStart: 28, minSpan: 11, maxSpan: 34 },
      { minStart: 25, maxStart: 39, minSpan: 12, maxSpan: 35 },
      { minStart: 36, maxStart: 50, minSpan: 12, maxSpan: 34 },
      { minStart: 46, maxStart: 62, minSpan: 11, maxSpan: 30 },
      { minStart: 58, maxStart: 74, minSpan: 10, maxSpan: 24 },
      { minStart: 68, maxStart: 86, minSpan: 9, maxSpan: 18 },
    ];

    let failed = false;

    for (let i = 0; i < 8; i++) {
      const band = ladderBands[i];
      let placed = false;
      for (let tries = 0; tries < 80; tries++) {
        const start = randInt(band.minStart, band.maxStart);
        const span = randInt(band.minSpan, band.maxSpan);
        const end = Math.min(98, start + span);

        if (
          end - start >= 8 &&
          start > 1 &&
          end < 100 &&
          !occupied.has(start) &&
          !occupied.has(end) &&
          Math.floor((start - 1) / 10) !== Math.floor((end - 1) / 10)
        ) {
          occupied.add(start);
          occupied.add(end);
          ladders.push({
            id: `ladder-${i + 1}`,
            type: 'ladder',
            start,
            end,
          });
          placed = true;
          break;
        }
      }
      if (!placed) {
        failed = true;
        break;
      }
    }

    if (failed) continue;

    // Generate 8 snakes distributed from lower-mid board up to 99
    const snakeBands = [
      { minHead: 22, maxHead: 35, minDrop: 10, maxDrop: 20 },
      { minHead: 32, maxHead: 47, minDrop: 12, maxDrop: 26 },
      { minHead: 44, maxHead: 58, minDrop: 12, maxDrop: 32 },
      { minHead: 54, maxHead: 68, minDrop: 14, maxDrop: 36 },
      { minHead: 64, maxHead: 78, minDrop: 14, maxDrop: 40 },
      { minHead: 74, maxHead: 87, minDrop: 15, maxDrop: 44 },
      { minHead: 84, maxHead: 94, minDrop: 16, maxDrop: 52 },
      { minHead: 92, maxHead: 99, minDrop: 18, maxDrop: 65 },
    ];

    for (let i = 0; i < 8; i++) {
      const band = snakeBands[i];
      let placed = false;
      for (let tries = 0; tries < 80; tries++) {
        const head = randInt(band.minHead, band.maxHead);
        const drop = randInt(band.minDrop, band.maxDrop);
        const tail = Math.max(2, head - drop);

        // Avoid blocking 6 consecutive squares with snake heads
        const adjacentHeads = snakes.filter((s) => Math.abs(s.start - head) <= 2).length;

        if (
          head - tail >= 8 &&
          head < 100 &&
          tail > 1 &&
          adjacentHeads < 2 &&
          !occupied.has(head) &&
          !occupied.has(tail) &&
          Math.floor((head - 1) / 10) !== Math.floor((tail - 1) / 10)
        ) {
          occupied.add(head);
          occupied.add(tail);
          const species = SNAKE_SPECIES_LIST[i % SNAKE_SPECIES_LIST.length];
          snakes.push({
            id: `snake-${i + 1}`,
            type: 'snake',
            start: head,
            end: tail,
            species,
          });
          placed = true;
          break;
        }
      }
      if (!placed) {
        failed = true;
        break;
      }
    }

    if (failed) continue;

    const candidate: BoardConfig = { ladders, snakes, seed: seedStr };
    const check = validateBoard(candidate);
    if (check.valid) {
      return candidate;
    }
  }

  // Fallback guaranteed-valid canonical board if random retries exhausted
  const fallbackLadders: BoardLink[] = [
    { id: 'ladder-1', type: 'ladder', start: 4, end: 25 },
    { id: 'ladder-2', type: 'ladder', start: 13, end: 46 },
    { id: 'ladder-3', type: 'ladder', start: 33, end: 49 },
    { id: 'ladder-4', type: 'ladder', start: 42, end: 63 },
    { id: 'ladder-5', type: 'ladder', start: 50, end: 69 },
    { id: 'ladder-6', type: 'ladder', start: 62, end: 81 },
    { id: 'ladder-7', type: 'ladder', start: 74, end: 92 },
    { id: 'ladder-8', type: 'ladder', start: 80, end: 98 },
  ];
  const fallbackSnakes: BoardLink[] = [
    { id: 'snake-1', type: 'snake', start: 27, end: 5, species: SNAKE_SPECIES_LIST[0] },
    { id: 'snake-2', type: 'snake', start: 40, end: 3, species: SNAKE_SPECIES_LIST[1] },
    { id: 'snake-3', type: 'snake', start: 43, end: 18, species: SNAKE_SPECIES_LIST[2] },
    { id: 'snake-4', type: 'snake', start: 54, end: 31, species: SNAKE_SPECIES_LIST[3] },
    { id: 'snake-5', type: 'snake', start: 66, end: 45, species: SNAKE_SPECIES_LIST[4] },
    { id: 'snake-6', type: 'snake', start: 76, end: 58, species: SNAKE_SPECIES_LIST[5] },
    { id: 'snake-7', type: 'snake', start: 89, end: 53, species: SNAKE_SPECIES_LIST[6] },
    { id: 'snake-8', type: 'snake', start: 99, end: 41, species: SNAKE_SPECIES_LIST[7] },
  ];
  return { ladders: fallbackLadders, snakes: fallbackSnakes, seed: seedStr };
}

/**
 * Self-test function that verifies generated boards (both random and daily seeded)
 * strictly obey every placement rule.
 */
export function runBoardValidationSelfTest(iterations = 25): {
  passed: boolean;
  testedCount: number;
  failures: string[];
} {
  const failures: string[] = [];
  for (let i = 0; i < iterations; i++) {
    const b1 = generateBoard();
    const res1 = validateBoard(b1);
    if (!res1.valid) {
      failures.push(`Random board #${i} failed: ${res1.errors.join('; ')}`);
    }

    const seed = `2026-10-${String((i % 28) + 1).padStart(2, '0')}`;
    const b2 = generateBoard(seed);
    const b2Repeat = generateBoard(seed);
    const res2 = validateBoard(b2);
    if (!res2.valid) {
      failures.push(`Seeded board ${seed} failed: ${res2.errors.join('; ')}`);
    }
    if (b2.ladders[0].start !== b2Repeat.ladders[0].start || b2.snakes[0].start !== b2Repeat.snakes[0].start) {
      failures.push(`Seeded board ${seed} was not deterministic`);
    }
  }
  return {
    passed: failures.length === 0,
    testedCount: iterations * 2,
    failures,
  };
}

export interface TurnOutcome {
  diceValue: number;
  fromSquare: number;
  hopSquares: number[]; // step-by-step squares for hopping animation
  landedSquare: number;
  finalSquare: number;
  overshot: boolean;
  linkTriggered: BoardLink | null;
  earnedBonusRoll: boolean;
  tripleSixCancelledBonus: boolean;
  wonGame: boolean;
}

/**
 * Computes the complete outcome of a single die roll for a player.
 */
export function evaluateRollOutcome(
  player: PlayerState,
  diceValue: number,
  board: BoardConfig,
  bonusRollOnSix: boolean
): TurnOutcome {
  const fromSquare = player.position;
  const targetSquare = fromSquare + diceValue;

  // Check bonus roll eligibility (rolling 6 gives extra turn unless it's the 3rd consecutive 6)
  const newConsecutiveSixes = diceValue === 6 ? player.consecutiveSixes + 1 : 0;
  let earnedBonusRoll = false;
  let tripleSixCancelledBonus = false;

  if (bonusRollOnSix && diceValue === 6) {
    if (newConsecutiveSixes >= 3) {
      earnedBonusRoll = false;
      tripleSixCancelledBonus = true;
    } else {
      earnedBonusRoll = true;
    }
  }

  // Exact roll required to land on 100
  if (targetSquare > 100) {
    return {
      diceValue,
      fromSquare,
      hopSquares: [],
      landedSquare: fromSquare,
      finalSquare: fromSquare,
      overshot: true,
      linkTriggered: null,
      earnedBonusRoll,
      tripleSixCancelledBonus,
      wonGame: false,
    };
  }

  const hopSquares: number[] = [];
  for (let s = fromSquare + 1; s <= targetSquare; s++) {
    hopSquares.push(s);
  }

  const landedSquare = targetSquare;
  const ladder = board.ladders.find((l) => l.start === landedSquare) || null;
  const snake = board.snakes.find((s) => s.start === landedSquare) || null;
  const linkTriggered = ladder || snake;
  const finalSquare = linkTriggered ? linkTriggered.end : landedSquare;
  const wonGame = finalSquare === 100;

  if (wonGame) {
    earnedBonusRoll = false;
  }

  return {
    diceValue,
    fromSquare,
    hopSquares,
    landedSquare,
    finalSquare,
    overshot: false,
    linkTriggered,
    earnedBonusRoll,
    tripleSixCancelledBonus,
    wonGame,
  };
}
