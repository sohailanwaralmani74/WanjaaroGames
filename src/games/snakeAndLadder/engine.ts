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
 * Geometric 2D line segment intersection & minimum clearance check.
 * Ensures no two ladders or snakes cross each other or crowd the same path.
 */
interface Point2D {
  x: number;
  y: number;
}

function ccw(A: Point2D, B: Point2D, C: Point2D): boolean {
  return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
}

function segmentsIntersect(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D): boolean {
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

function pointToSegmentDistance(p: Point2D, v: Point2D, w: Point2D): number {
  const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = v.x + t * (w.x - v.x);
  const projY = v.y + t * (w.y - v.y);
  return Math.hypot(p.x - projX, p.y - projY);
}

function segmentsDistance(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D): number {
  if (segmentsIntersect(p1, p2, p3, p4)) return 0;
  return Math.min(
    pointToSegmentDistance(p1, p3, p4),
    pointToSegmentDistance(p2, p3, p4),
    pointToSegmentDistance(p3, p1, p2),
    pointToSegmentDistance(p4, p1, p2)
  );
}

export function doLinksConflictGeometrically(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
  minClearance = 7.5
): boolean {
  const a1 = getSquareCoords(aStart);
  const a2 = getSquareCoords(aEnd);
  const b1 = getSquareCoords(bStart);
  const b2 = getSquareCoords(bEnd);

  const p1 = { x: a1.xPercent, y: a1.yPercent };
  const p2 = { x: a2.xPercent, y: a2.yPercent };
  const p3 = { x: b1.xPercent, y: b1.yPercent };
  const p4 = { x: b2.xPercent, y: b2.yPercent };

  return segmentsDistance(p1, p2, p3, p4) < minClearance;
}

/**
 * Validates that a generated board strictly obeys all placement rules:
 * - Exactly 8 ladders and 8 snakes
 * - No snake head or ladder bottom on 1 or 100
 * - No ladder top on 100
 * - No square holds more than one snake head or ladder bottom
 * - No chains where a slide/climb ends on the start of another slide/climb
 * - No ladder or snake spanning less than 8 squares
 * - No geometric path crossing or overlapping between any two snakes/ladders
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

  // Check geometric non-intersection so no two paths cross or override each other
  for (let i = 0; i < allLinks.length; i++) {
    for (let j = i + 1; j < allLinks.length; j++) {
      if (
        doLinksConflictGeometrically(
          allLinks[i].start,
          allLinks[i].end,
          allLinks[j].start,
          allLinks[j].end,
          5.0
        )
      ) {
        errors.push(`Geometric path intersection between ${allLinks[i].id} and ${allLinks[j].id}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Curated, spatially separated 16-lane templates (8 ladders + 8 snakes)
 * Every template has 16 non-crossing, well-spaced vertical/diagonal lanes
 * so ladders and snakes never cross or override each other's paths.
 */
interface RawBoardTemplate {
  ladders: [number, number][];
  snakes: [number, number][];
}

const CLEAN_NON_CROSSING_TEMPLATES: RawBoardTemplate[] = [
  {
    // Template A: Classic balanced lanes across left, center-left, center-right, and right columns
    ladders: [
      [2, 23],   // bottom-left col 1->2
      [6, 25],   // bottom-mid col 5->4
      [9, 30],   // bottom-right col 8->9
      [28, 49],  // mid-left col 7->8
      [36, 57],  // mid-left col 4->3
      [51, 72],  // upper-right col 9->8
      [64, 83],  // upper-mid col 3->2
      [78, 98],  // top-left col 2->2
    ],
    snakes: [
      [17, 4],   // lower-mid col 3->3
      [33, 12],  // lower-right col 7->8
      [47, 26],  // mid-right col 6->5
      [62, 41],  // mid-left col 1->0
      [69, 50],  // mid-right col 8->9
      [87, 66],  // upper-mid col 6->5
      [94, 75],  // top-mid col 6->5
      [99, 80],  // top-left col 1->0
    ],
  },
  {
    // Template B: Wide column separation
    ladders: [
      [3, 22],   // col 2->1
      [8, 29],   // col 7->8
      [19, 38],  // col 1->2
      [24, 45],  // col 3->4
      [42, 61],  // col 1->0
      [48, 67],  // col 7->6
      [70, 89],  // col 9->8
      [76, 95],  // col 4->5
    ],
    snakes: [
      [16, 5],   // col 4->4
      [31, 10],  // col 9->9
      [44, 25],  // col 3->4
      [56, 35],  // col 4->5
      [63, 40],  // col 2->0
      [73, 52],  // col 7->8
      [92, 71],  // col 8->9
      [97, 82],  // col 3->1
    ],
  },
];

/**
 * Generates a fair, balanced, 100% non-overlapping 10x10 Snake and Ladder board
 * with 8 ladders and 8 snakes whose visual paths NEVER cross or override each other.
 * If seedStr is provided, generation is 100% deterministic.
 */
export function generateBoard(seedStr?: string): BoardConfig {
  const rng = seedStr ? createSeededRandom(seedStr) : () => {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] / 4294967296;
  };

  const randInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;

  // Attempt dynamic non-crossing generation with strict geometric clearance
  for (let attempt = 0; attempt < 350; attempt++) {
    const occupied = new Set<number>([1, 100]);
    const placedLinks: BoardLink[] = [];
    const ladders: BoardLink[] = [];
    const snakes: BoardLink[] = [];

    // Place 8 ladders in clean, moderate-length spans (1-2 rows high, minimal horizontal drift)
    for (let i = 0; i < 8; i++) {
      let placed = false;
      const minRow = Math.floor((i * 8) / 8); // 0..7
      const maxRow = Math.min(8, minRow + 1);

      for (let tries = 0; tries < 90; tries++) {
        const startRow = randInt(minRow, maxRow);
        const startCol = randInt(0, 9);
        const endRow = Math.min(9, startRow + randInt(1, 2));
        if (endRow <= startRow) continue;
        const endCol = Math.max(0, Math.min(9, startCol + randInt(-1, 1)));

        const startSq =
          startRow * 10 + (startRow % 2 === 0 ? startCol : 9 - startCol) + 1;
        const endSq =
          endRow * 10 + (endRow % 2 === 0 ? endCol : 9 - endCol) + 1;

        if (
          startSq <= 1 ||
          endSq >= 100 ||
          endSq - startSq < 8 ||
          occupied.has(startSq) ||
          occupied.has(endSq)
        ) {
          continue;
        }

        // Check geometric distance against all existing links
        const hasConflict = placedLinks.some((other) =>
          doLinksConflictGeometrically(startSq, endSq, other.start, other.end, 8.2)
        );

        if (!hasConflict) {
          occupied.add(startSq);
          occupied.add(endSq);
          const link: BoardLink = {
            id: `ladder-${i + 1}`,
            type: 'ladder',
            start: startSq,
            end: endSq,
          };
          ladders.push(link);
          placedLinks.push(link);
          placed = true;
          break;
        }
      }

      if (!placed) break;
    }

    if (ladders.length < 8) continue;

    // Place 8 snakes in clean, non-crossing lanes
    for (let i = 0; i < 8; i++) {
      let placed = false;
      const minHeadRow = Math.min(9, Math.floor((i * 8) / 8) + 2); // 2..9
      const maxHeadRow = Math.min(9, minHeadRow + 1);

      for (let tries = 0; tries < 100; tries++) {
        const headRow = randInt(minHeadRow, maxHeadRow);
        const headCol = randInt(0, 9);
        const tailRow = Math.max(0, headRow - randInt(1, 2));
        if (tailRow >= headRow) continue;
        const tailCol = Math.max(0, Math.min(9, headCol + randInt(-1, 1)));

        const headSq =
          headRow * 10 + (headRow % 2 === 0 ? headCol : 9 - headCol) + 1;
        const tailSq =
          tailRow * 10 + (tailRow % 2 === 0 ? tailCol : 9 - tailCol) + 1;

        if (
          headSq >= 100 ||
          tailSq <= 1 ||
          headSq - tailSq < 8 ||
          occupied.has(headSq) ||
          occupied.has(tailSq)
        ) {
          continue;
        }

        const hasConflict = placedLinks.some((other) =>
          doLinksConflictGeometrically(headSq, tailSq, other.start, other.end, 8.2)
        );

        if (!hasConflict) {
          occupied.add(headSq);
          occupied.add(tailSq);
          const species = SNAKE_SPECIES_LIST[i % SNAKE_SPECIES_LIST.length];
          const link: BoardLink = {
            id: `snake-${i + 1}`,
            type: 'snake',
            start: headSq,
            end: tailSq,
            species,
          };
          snakes.push(link);
          placedLinks.push(link);
          placed = true;
          break;
        }
      }

      if (!placed) break;
    }

    if (snakes.length === 8) {
      const candidate: BoardConfig = { ladders, snakes, seed: seedStr };
      const check = validateBoard(candidate);
      if (check.valid) {
        return candidate;
      }
    }
  }

  // Fallback to guaranteed non-crossing template (with optional horizontal mirror based on seed)
  const tpl = CLEAN_NON_CROSSING_TEMPLATES[Math.floor(rng() * CLEAN_NON_CROSSING_TEMPLATES.length)];
  const fallbackLadders: BoardLink[] = tpl.ladders.map(([s, e], idx) => ({
    id: `ladder-${idx + 1}`,
    type: 'ladder',
    start: s,
    end: e,
  }));
  const fallbackSnakes: BoardLink[] = tpl.snakes.map(([s, e], idx) => ({
    id: `snake-${idx + 1}`,
    type: 'snake',
    start: s,
    end: e,
    species: SNAKE_SPECIES_LIST[idx % SNAKE_SPECIES_LIST.length],
  }));

  return { ladders: fallbackLadders, snakes: fallbackSnakes, seed: seedStr };
}

/**
 * Self-test function that verifies generated boards (both random and daily seeded)
 * strictly obey every placement and non-overlapping rule.
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
