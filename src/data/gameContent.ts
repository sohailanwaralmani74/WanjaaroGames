import { ALL_GAMES } from './gamesCatalog';

export interface GameExtraContent {
  historicalContext?: string;
  cognitiveMechanics?: string;
}

export const GAME_CONTENT_REGISTRY: Record<string, GameExtraContent> = {
  'parrot-flap': {
    historicalContext:
      'Set in a multi-layered desert canyon with warm sandstone pillars and 5 real avian species, Parrot Flap combines one-tap vertical impulse flight with reachability-verified canyon openings.',
    cognitiveMechanics:
      'Requires precise rhythmic timing of upward velocity impulses against constant gravitational acceleration while tracking narrowing vertical apertures.',
  },
  'snake-escape': {
    historicalContext:
      'Inspired by real ecological predator-prey dynamics between terrestrial snakes and diurnal/nocturnal raptors, Snake Escape blends continuous-trail movement with telegraphed aerial dive zones.',
    cognitiveMechanics:
      'Requires simultaneous tracking of foraging targets (mice and golden mice) and multi-stage circular strike shadows while managing defensive burrow cooldowns.',
  },
  'matching-card-game': {
    historicalContext:
      'Known historically as Concentration, Memory, Pelmanism, or Shinkei-suijaku, pair-matching card games have been played since the 19th century to sharpen working spatial memory.',
    cognitiveMechanics:
      'Requiring players to encode species identity and grid coordinates simultaneously exercises visuospatial working memory and executive recall.',
  },
  'snake-game': {
    historicalContext:
      'Inspired by the 1976 arcade classic Blockade and popularized on mobile handsets in the late 1990s, Snake Game on ReptileBirds brings real python and colubrid species patterns to a precision fixed-timestep grid.',
    cognitiveMechanics:
      'Sustaining a growing snake body inside a bounded or obstacle-filled grid demands continuous Hamiltonian-like path planning, look-ahead spatial reasoning, and rapid directional buffering.',
  },
  'snake-and-ladder': {
    historicalContext:
      'Originated in ancient India as Moksha Patam, Snakes and Ladders has been played for centuries as a game of climbs and setbacks across a 100-square grid.',
    cognitiveMechanics:
      'Combining fair cryptographic die rolls with deterministic Daily Board seeds lets players compare turn counts across identical board configurations.',
  },
};

export const FULL_CATALOG = ALL_GAMES;
