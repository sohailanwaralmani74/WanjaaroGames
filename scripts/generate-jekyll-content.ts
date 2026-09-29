import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ALL_GAMES, CATEGORIES } from '../src/data/gamesCatalog';
import { GAME_ALIASES } from '../src/utils/routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const gamesDir = path.resolve(rootDir, '_games');
const categoriesDir = path.resolve(rootDir, '_categories');

fs.mkdirSync(gamesDir, { recursive: true });
fs.mkdirSync(categoriesDir, { recursive: true });

// Inverted alias map: gameId -> list of aliases
const gameIdToAliases: Record<string, string[]> = {};
for (const [alias, targetId] of Object.entries(GAME_ALIASES)) {
  if (!gameIdToAliases[targetId]) {
    gameIdToAliases[targetId] = [];
  }
  gameIdToAliases[targetId].push(alias);
}

// 1. Generate _games/*.md
for (const game of ALL_GAMES) {
  const aliases = gameIdToAliases[game.id] || [];
  const redirectList = [
    `/game/${game.id}`,
    `/game/${game.id}/`,
  ];
  for (const a of aliases) {
    redirectList.push(`/${a}`);
    redirectList.push(`/${a}/`);
    redirectList.push(`/game/${a}`);
    redirectList.push(`/game/${a}/`);
  }

  const frontmatter = `---
layout: game
id: "${game.id}"
title: "${game.title.replace(/"/g, '\\"')}"
category: "${game.category}"
summary: "${(game.summary || '').replace(/"/g, '\\"')}"
scoringCriterion: "${game.scoringCriterion}"
permalink: /${game.id}/
redirect_from:
${redirectList.map((r) => `  - ${r}`).join('\n')}
tags:
${(game.tags || []).map((t) => `  - ${t}`).join('\n')}
---

## Overview

${game.description || game.summary}

## Instructions

${game.instructions}

## Strategy & Pro Tips

${game.proTips}

## Underlying Mechanics

${game.mechanic}
`;

  fs.writeFileSync(path.resolve(gamesDir, `${game.id}.md`), frontmatter, 'utf8');
}

// 2. Generate _categories/*.md
for (const cat of CATEGORIES) {
  const redirectList = [
    `/category/${cat.id}`,
    `/category/${cat.id}/`,
  ];

  const frontmatter = `---
layout: category
id: "${cat.id}"
title: "${cat.name.replace(/"/g, '\\"')}"
description: "${(cat.description || cat.shortDesc).replace(/"/g, '\\"')}"
shortDesc: "${cat.shortDesc.replace(/"/g, '\\"')}"
permalink: /${cat.id}/
redirect_from:
${redirectList.map((r) => `  - ${r}`).join('\n')}
---

## About ${cat.name}

${cat.description || cat.shortDesc}

### Benchmark Skill Focus
This suite targets high-frequency reaction, cognitive load endurance, and perceptual processing.
`;

  fs.writeFileSync(path.resolve(categoriesDir, `${cat.id}.md`), frontmatter, 'utf8');
}

console.log(`Generated ${ALL_GAMES.length} Jekyll game documents in _games/`);
console.log(`Generated ${CATEGORIES.length} Jekyll category documents in _categories/`);
