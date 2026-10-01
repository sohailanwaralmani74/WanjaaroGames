import { GameBenchmark, GameFaq } from '../../types/game';

export interface GameExtraContent {
  objective: string;
  whatItMeasures: string;
  tips: string[];
  faq: GameFaq[];
  benchmark?: GameBenchmark;
}
