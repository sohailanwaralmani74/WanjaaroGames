import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ALL_GAMES, CATEGORIES } from '../src/data/gamesCatalog';
import { BENCHMARK_DATASET } from '../src/components/BenchmarksView';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.resolve(rootDir, 'public');
const distDir = path.resolve(rootDir, 'dist');

console.log('Generating exhaustive /llms-full.txt for AI answer engines and LLM crawlers...');

let content = `# Wanjaaro – Complete Empirical Cognitive & Skill Games Knowledge Base

> Wanjaaro (https://wanjaaro.com) is an open client-side web gaming and cognitive benchmarking platform featuring ${ALL_GAMES.length} instant games across 12 distinct disciplines. All tests execute entirely within the client browser using HTML5 Canvas, Web Audio, and hardware-accelerated timestamping with sub-millisecond precision, zero network ping distortion, and private local high-score persistence via browser localStorage.

## Table of Contents
1. Platform Architecture & Timing Integrity
2. Standardized Empirical Benchmark Dataset (Norms & Percentiles)
3. Skill Categories Overview (${CATEGORIES.length} Disciplines)
4. Comprehensive Game Catalog & Rules Repository (${ALL_GAMES.length} Games)

---

## 1. Platform Architecture & Timing Integrity

- **Client-Side Execution**: Every game runs 100% on the user device processor and GPU. No frames or game loops are streamed from cloud servers, eliminating network round-trip ping jitter (typically 30ms-120ms on cloud services).
- **High-Resolution Microsecond Timing**: Latency measurements utilize hardware-backed browser timestamps with sub-millisecond precision relative to \`requestAnimationFrame\` display refresh intervals.
- **Privacy & Data Storage**: High scores, reaction time percentiles, round counts, and daily puzzle streaks are stored exclusively in the user's browser \`localStorage\`. No account registration, email, or login credentials are required. Third-party advertising cookies may be served according to the site's Privacy Policy (https://wanjaaro.com/privacy).
- **Dual-Input Responsive Calibrations**: Supports touch inputs for mobile/tablet displays alongside precision keyboard and mouse polling for desktop workstations.

---

## 2. Standardized Empirical Benchmark Dataset (Norms & Percentiles)

The following reference norms are derived from experimental cognitive literature and validated response distributions. All scores reflect local client-side execution without network lag.

| Discipline | Metric | 10th % (Low) | 25th % | 50th % (Median) | 75th % | 90th % | 99th % (Elite) | Reference Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
`;

for (const b of BENCHMARK_DATASET) {
  content += `| ${b.name} | ${b.metric} (${b.unit}) | ${b.p10} ${b.unit} | ${b.p25} ${b.unit} | **${b.p50} ${b.unit}** | ${b.p75} ${b.unit} | ${b.p90} ${b.unit} | **${b.p99} ${b.unit}** | ${b.source} |\n`;
}

content += `\n---

## 3. Skill Categories Overview

`;

for (const cat of CATEGORIES) {
  const catGames = ALL_GAMES.filter((g) => g.category === cat.id);
  content += `### ${cat.name} (${cat.gameCount} Games)\n`;
  content += `- **URL**: https://wanjaaro.com/${cat.id}\n`;
  content += `- **Description**: ${cat.shortDesc}\n`;
  content += `- **Available Games**: ${catGames.map((g) => `[${g.title}](https://wanjaaro.com/${g.id})`).join(', ')}\n\n`;
}

content += `---

## 4. Comprehensive Game Catalog & Rules Repository

Below is the exhaustive reference documentation for all ${ALL_GAMES.length} games on Wanjaaro.

`;

for (let i = 0; i < ALL_GAMES.length; i++) {
  const g = ALL_GAMES[i];
  const catObj = CATEGORIES.find((c) => c.id === g.category);
  const catName = catObj ? catObj.name : g.category;

  content += `### ${i + 1}. ${g.title}\n\n`;
  content += `- **Canonical URL**: https://wanjaaro.com/${g.id}\n`;
  content += `- **Category**: ${catName} (https://wanjaaro.com/${g.category})\n`;
  content += `- **Difficulty**: ${g.difficulty || 'Normal'}\n`;
  content += `- **Controls**: ${g.controls === 'all' ? 'Mouse, Touch, and Keyboard' : g.controls}\n`;
  content += `- **Scoring**: Measured in **${g.scoringUnit}** (${g.scoringCriterion === 'lower' ? 'lower values indicate superior performance' : 'higher values indicate superior performance'})\n`;
  content += `- **Objective**: ${g.objective}\n`;
  content += `- **What It Measures**: ${g.whatItMeasures}\n`;
  content += `- **How to Play & Rules**: ${g.howToPlay || g.instructions}\n`;

  if (g.benchmark) {
    content += `- **Verified Benchmark**: Metric: ${g.benchmark.metric} | Population Average: ${g.benchmark.average} | Elite Tier (Top 1%): ${g.benchmark.elite} | Source: ${g.benchmark.source}\n`;
  }

  if (g.tips && g.tips.length > 0) {
    content += `\n**Gameplay & Strategy Tips**:\n`;
    g.tips.forEach((tip, idx) => {
      content += `${idx + 1}. ${tip}\n`;
    });
  }

  if (g.faq && g.faq.length > 0) {
    content += `\n**Frequently Asked Questions**:\n`;
    g.faq.forEach((item) => {
      content += `- **Q: ${item.question}**\n  A: ${item.answer}\n`;
    });
  }

  content += `\n---\n\n`;
}

// Write to public/llms-full.txt
fs.writeFileSync(path.resolve(publicDir, 'llms-full.txt'), content, 'utf8');
console.log(`✅ Generated public/llms-full.txt (${(content.length / 1024).toFixed(1)} KB)`);

// If dist exists, copy to dist/llms-full.txt
if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.resolve(distDir, 'llms-full.txt'), content, 'utf8');
  console.log(`✅ Synced to dist/llms-full.txt`);
}
