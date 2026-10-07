import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BENCHMARK_DATASET } from '../src/components/BenchmarksView';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.resolve(rootDir, 'public');
const distDir = path.resolve(rootDir, 'dist');

console.log('Generating /llms-full.txt for ReptileBirds...');

let content = `# ReptileBirds – Official Knowledge Base

> ReptileBirds (https://reptilebirds.com) is an open client-side web platform.

## 1. Platform Architecture & Privacy

- **Client-Side Execution**: Runs 100% on the user device browser with zero network latency.
- **Privacy & Data Storage**: Preferences are stored in the user's browser \`localStorage\`. No account registration, email, or login credentials are required. Third-party advertising cookies may be served according to the site's Privacy Policy (https://reptilebirds.com/privacy).

---

## 2. Standardized Empirical Benchmark Dataset (Norms & Percentiles)

| Discipline | Metric | 10th % (Low) | 25th % | 50th % (Median) | 75th % | 90th % | 99th % (Elite) | Reference Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
`;

for (const b of BENCHMARK_DATASET) {
  content += `| ${b.name} | ${b.metric} (${b.unit}) | ${b.p10} ${b.unit} | ${b.p25} ${b.unit} | **${b.p50} ${b.unit}** | ${b.p75} ${b.unit} | ${b.p90} ${b.unit} | **${b.p99} ${b.unit}** | ${b.source} |\n`;
}

// Write to public/llms-full.txt
fs.writeFileSync(path.resolve(publicDir, 'llms-full.txt'), content, 'utf8');
console.log(`✅ Generated public/llms-full.txt (${(content.length / 1024).toFixed(1)} KB)`);

if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.resolve(distDir, 'llms-full.txt'), content, 'utf8');
  console.log(`✅ Synced to dist/llms-full.txt`);
}
