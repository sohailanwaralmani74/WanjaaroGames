import { GameExtraContent } from './content/types';
import { REFLEX_CONTENT } from './content/reflex';
import { AIM_CONTENT } from './content/aim';
import { MEMORY_CONTENT } from './content/memory';
import { TYPING_CONTENT } from './content/typing';
import { PERCEPTION_CONTENT } from './content/perception';
import { LOGIC_CONTENT } from './content/logic';
import { STRATEGY_CONTENT } from './content/strategy';
import { COORDINATION_CONTENT } from './content/coordination';
import { SPEED_CONTENT } from './content/speed';
import { MATH_CONTENT } from './content/math';
import { VISUAL_CONTENT } from './content/visual';
import { CASUAL_CONTENT } from './content/casual';

export const GAME_CONTENT_REGISTRY: Record<string, GameExtraContent> = {
  ...REFLEX_CONTENT,
  ...AIM_CONTENT,
  ...MEMORY_CONTENT,
  ...TYPING_CONTENT,
  ...PERCEPTION_CONTENT,
  ...LOGIC_CONTENT,
  ...STRATEGY_CONTENT,
  ...COORDINATION_CONTENT,
  ...SPEED_CONTENT,
  ...MATH_CONTENT,
  ...VISUAL_CONTENT,
  ...CASUAL_CONTENT,
};

export function getGameExtraContent(gameId: string): GameExtraContent | undefined {
  return GAME_CONTENT_REGISTRY[gameId];
}
