import { ALL_GAMES } from './gamesCatalog';

export interface GameExtraContent {
  historicalContext?: string;
  cognitiveMechanics?: string;
}

export const GAME_CONTENT_REGISTRY: Record<string, GameExtraContent> = {
  'snake-and-ladder': {
    historicalContext:
      'Originated in ancient India as Moksha Patam, teaching the interplay of helpful virtues (ladders) and setbacks (snakes) along a 100-square path.',
    cognitiveMechanics:
      'Combines cryptographically fair six-sided dice probability with spatial tracking across a 10x10 alternating boustrophedon grid.',
  },
};

export { ALL_GAMES };
