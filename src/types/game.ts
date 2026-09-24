export type CategoryId =
  | 'reflex-reaction'
  | 'aim-precision'
  | 'memory-recall'
  | 'typing-words'
  | 'perception-vision'
  | 'logic-puzzles'
  | 'strategy-tactics'
  | 'coordination-rhythm'
  | 'speed-accuracy'
  | 'math-calculation'
  | 'visual-geometry'
  | 'casual-arcade';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  shortDesc: string;
  description?: string;
  iconName: string;
  icon?: string;
  gameCount: number;
}

export interface GameMeta {
  id: string;
  title: string;
  category: CategoryId;
  summary: string;
  description?: string;
  instructions: string;
  howToPlay?: string;
  objective?: string;
  mechanic: string;
  controls: 'touch' | 'mouse' | 'keyboard' | 'all';
  skillsTested: string[];
  skill?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  icon?: string;
  scoringUnit: string;
  scoreUnit?: string;
  scoringCriterion: 'higher' | 'lower'; // 'higher' = more points is better; 'lower' = fewer ms/moves is better
  proTips: string;
  tags: string[];
}

export interface GameScoreEntry {
  gameId: string;
  score: number;
  formattedScore: string;
  timestamp: number;
  dateStr: string;
}

export interface UserGameStat {
  gameId: string;
  bestScore: number;
  formattedBest: string;
  formattedScore?: string;
  playCount: number;
  lastPlayed: number;
  history: { score: number; timestamp: number }[];
}
