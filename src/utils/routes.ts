import { ALL_GAMES, CATEGORIES } from '../data/gamesCatalog';
import { GameMeta, CategoryInfo } from '../types/game';

/**
 * Friendly aliases and search-optimized short slugs mapped to canonical game IDs.
 */
export const GAME_ALIASES: Record<string, string> = {
  'reaction-time': 'reflex-reaction-time',
  'speed-flash': 'reflex-speed-flash',
  'whack-hex': 'reflex-whack-hex',
  'hex-whack': 'reflex-whack-hex',
  'dodge-ball': 'reflex-dodge-ball',
  'dodge-vector': 'reflex-dodge-ball',
  'sound-cue': 'reflex-audio-snap',
  'audio-snap': 'reflex-audio-snap',
  'chroma-snap': 'reflex-color-switch',
  'stoplight': 'reflex-quick-brake',
  'trigger-tap': 'reflex-trigger-finger',
  'aim-trainer': 'aim-sniper',
  'sniper': 'aim-sniper',
  'chimp-test': 'memory-spatial-span',
  'spatial-span': 'memory-spatial-span',
  'speed-typist': 'typing-speed-words',
  'stroop-test': 'perception-stroop-test',
  'stroop-challenge': 'perception-stroop-test',
  'schulte-grid': 'speed-click-25',
  'math-blitz': 'math-speed-addition',
  'memory-matrix': 'memory-spatial-span',
  'lights-out': 'logic-lights-out',
  'sliding-15': 'logic-sliding-15',
  'tower-hanoi': 'logic-tower-hanoi',
  'tic-tac-toe': 'strategy-tic-tac-toe',
  'connect-four': 'strategy-connect-four',
  'snake-classic': 'casual-snake-classic',
  'brick-breaker': 'casual-brick-breaker',
  'klondike': 'solitaire',
  'klondike-solitaire': 'solitaire',
  'picross': 'nonogram',
  'daily': 'daily-puzzle',
  'daily-challenge': 'daily-puzzle',
  'idle-miner': 'idle-games',
  'clicker': 'idle-games',
};

/**
 * Resolves a URL slug to a game using:
 * 1. Exact game ID match (e.g. 'reflex-reaction-time')
 * 2. Friendly alias lookup (e.g. 'reaction-time' -> 'reflex-reaction-time')
 * 3. Stripped category prefix (e.g. 'reaction-time' matches 'reflex-reaction-time')
 */
export function findGameBySlugOrId(slug: string): GameMeta | undefined {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim();

  // 1. Exact match
  const exact = ALL_GAMES.find((g) => g.id === clean);
  if (exact) return exact;

  // 2. Alias match
  const aliasId = GAME_ALIASES[clean];
  if (aliasId) {
    const aliasGame = ALL_GAMES.find((g) => g.id === aliasId);
    if (aliasGame) return aliasGame;
  }

  // 3. Stripped category prefix match (e.g. 'snake-classic' -> 'casual-snake-classic')
  const strippedMatch = ALL_GAMES.find((g) => g.id.replace(/^[a-z]+-/, '') === clean);
  if (strippedMatch) return strippedMatch;

  return undefined;
}

/**
 * Resolves a URL slug to a category.
 */
export function findCategoryBySlug(slug: string): CategoryInfo | undefined {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim();
  return CATEGORIES.find((c) => c.id === clean);
}

/**
 * Returns plain clean URL for a game (no /game/ prefix).
 */
export function getGameUrl(gameIdOrMeta: string | GameMeta): string {
  const id = typeof gameIdOrMeta === 'string' ? gameIdOrMeta : gameIdOrMeta.id;
  return `/${id}`;
}

/**
 * Returns plain clean URL for a category (no /category/ prefix).
 */
export function getCategoryUrl(catIdOrMeta: string | CategoryInfo): string {
  const id = typeof catIdOrMeta === 'string' ? catIdOrMeta : catIdOrMeta.id;
  return `/${id}`;
}
