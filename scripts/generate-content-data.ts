// Build script for generating src/data/gameContent.ts
// Contains handcrafted, unique per-game data for all 106 games
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// We will write the full src/data/gameContent.ts
console.log('Generating gameContent.ts...');
