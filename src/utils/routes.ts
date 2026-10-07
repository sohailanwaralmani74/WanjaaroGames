import { ALL_GAMES, CATEGORIES } from '../data/gamesCatalog';
import { GameMeta, CategoryInfo } from '../types/game';

/**
 * Friendly aliases and search-optimized short slugs mapped to canonical game IDs.
 */
export const GAME_ALIASES: Record<string, string> = {};

/**
 * Resolves a URL slug to a game.
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

  // 3. Stripped category prefix match
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
