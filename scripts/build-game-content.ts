// Script to construct src/data/gameContent.ts with unique, high-quality, verified content for all 106 games
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ALL_GAMES } from '../src/data/gamesCatalog';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to sanitize text and ensure no banned words
const BANNED_WORDS = [
  'neuroplasticity',
  'prefrontal cortex',
  'motor strip',
  'saccades',
  'saccadic',
  'peak neuro-performance',
  'performance.now()',
  'delay delay',
];

export interface GameExtraContent {
  objective: string;
  whatItMeasures: string;
  tips: string[];
  faq: { question: string; answer: string }[];
  benchmark?: {
    metric: string;
    average: string;
    elite: string;
    source: string;
  };
}

console.log(`Processing content for ${ALL_GAMES.length} games...`);
