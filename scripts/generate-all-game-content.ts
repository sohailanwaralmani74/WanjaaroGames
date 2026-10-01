import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

interface GameData {
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

export const GAME_CONTENT_DATA: Record<string, GameData> = {};

// We will populate all 106 games across 12 categories
console.log('Building game content registry...');
