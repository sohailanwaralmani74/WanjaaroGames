# Wanjaaro — Zero-Latency Mind, Reflex & Skill Arcade

[![Platform](https://img.shields.io/badge/Platform-Web%20Browser-amber.svg)](https://wanjaaro.com/)
[![Games](https://img.shields.io/badge/Games-106%20Instant%20Titles-emerald.svg)](https://wanjaaro.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Lag](https://img.shields.io/badge/Execution-100%25%20Client--Side-purple.svg)](https://wanjaaro.com/)

Welcome to **[Wanjaaro](https://wanjaaro.com/)** — an open, high-performance web gaming platform engineered for athletes of the mind, competitive gamers, students, and puzzle enthusiasts. Wanjaaro delivers over **100 instant client-side games** spanning 12 cognitive and reflex disciplines, all executing directly in your web browser with sub-millisecond input handling, zero cloud streaming lag, and private local high-score tracking.

No software downloads, no account registrations, and no paywalls.

---

## 🎮 Core Disciplines & Game Categories

Wanjaaro is structured across 12 distinct skill disciplines:

1. **⚡ Reflex & Reaction**: Millisecond visual response tests, rapid color flash triggers, audio reaction cues, and emergency braking tests.
2. **🎯 Aim & Precision**: Cursor micro-adjustment drills, shrinking target tracking, laser mirror alignments, and gravitational trajectory slingshots.
3. **🧠 Memory & Recall**: Chimp memory span challenges, Simon chime sequences, 4x4 matrix card pairs, and sequential digit recall.
4. **⌨️ Typing & Words**: 60-second Words Per Minute (WPM) sprints, falling letter cascades, anagram rushes, and code symbol typist drills.
5. **👁️ Perception & Vision**: Subtle chrominance odd-color discerners, Stroop color-word interference tests, and peripheral acuity grids.
6. **🧩 Logic & Deduction**: Boolean logic circuits, 15-puzzle sliding tiles, Tower of Hanoi, and Picross Nonograms.
7. **♟️ Strategy & Tactics**: Connect Four, Tic-Tac-Toe, mini Reversi, Nim matchstick tactical elimination, and hex conquer.
8. **🎵 Coordination & Rhythm**: Multi-touch rhythm taps, dual-hand synchronization, orbital timing gates, and balance beams.
9. **⏱️ Speed & Accuracy**: Schulte Grid 25-digit visual searches, rapid 10-second button mashers, and fast item sorters.
10. **➗ Math & Calculation**: 30-second addition sprints, 24-puzzle solvers, prime factorization challenges, and mental arithmetic.
11. **📐 Visual & Geometry**: 3D mental shape rotation, line untangling, isometric perspective, and symmetry matching.
12. **🕹️ Casual & Arcade**: Klondike Solitaire (Turn 1 & Turn 3), Master 9x9 Sudoku, Mahjong Solitaire, Daily Mind Concept Puzzles, and Galactic Ore Miner idle progression.

---

## 📊 Global Cognitive & Reflex Benchmarks

Wanjaaro provides empirical, citable percentile distribution tables (10th, 25th, Median 50th, 75th, 90th, and Elite 99th percentiles) derived from experimental cognitive literature and validated response distributions:

| Discipline | Metric | 10th % (Low) | 50th % (Median) | 99th % (Elite Tier) | Reference Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Visual Reaction Time** | Latency (ms) | 340 ms | **245 ms** | **165 ms** | Human Benchmark & Kosinski Baseline |
| **Chimp Memory Test** | Span (digits) | 4 digits | **8 digits** | **13 digits** | Kyoto University (Inoue & Matsuzawa) |
| **Precision Aim** | Target Acquisition | 680 ms | **470 ms** | **275 ms** | Fitts's Law Target Acquisition Norms |
| **Speed Typist Drill** | Net Velocity | 26 WPM | **52 WPM** | **115 WPM** | International Touch Typing Standards |
| **Schulte Grid 5x5** | 25-Digit Search | 58 s | **36 s** | **17 s** | Walter Schulte Attention Matrix (1955) |
| **Stroop Interference** | Inhibition Delay | 240 ms | **135 ms** | **35 ms** | J. Ridley Stroop (1935) Standard |

Explore the interactive percentile calculator and empirical dataset at **[wanjaaro.com/benchmarks/](https://wanjaaro.com/benchmarks/)**.

---

## ⚡ Technical Architecture & Engineering Integrity

- **Pure Client-Side Execution**: Built with React 19, TypeScript, Vite, and Tailwind CSS. All gameplay physics, animation loops, and logic execute locally via HTML5 Canvas, SVG, and the Web Audio API.
- **Microsecond Timing Precision**: Timestamps are computed with sub-millisecond precision relative to `requestAnimationFrame` render intervals, eliminating the 30ms–120ms ping jitter inherent in cloud-hosted games.
- **Privacy by Design**: Scores, personal records, and sound preferences are stored exclusively on your device using browser `localStorage`. No login credentials or personal data are collected. Third-party advertising cookies may be served according to the [Privacy Policy](https://wanjaaro.com/privacy/).
- **Dual-Input Calibration**: Fully responsive touch controls for mobile smartphones and tablets alongside precision low-latency mouse and keyboard input for desktop workstations.
- **AI & Answer Engine Ready**:
  - Full pre-rendered static HTML routes for all 106 games and 12 categories with unified trailing-slash canonical URLs.
  - Comprehensive Schema.org JSON-LD graphs (`WebApplication`, `Dataset`, `FAQPage`, `BreadcrumbList`).
  - Machine-readable AI indexes at [`/llms.txt`](https://wanjaaro.com/llms.txt) and [`/llms-full.txt`](https://wanjaaro.com/llms-full.txt).

---

## 🛠️ Development & Build Pipeline

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
\`\`\`bash
npm install
\`\`\`

### Local Development Server
\`\`\`bash
npm run dev
# Server starts at http://localhost:3000
\`\`\`

### Build & Verification Pipeline
The build pipeline enforces automated content verification before compiling:
\`\`\`bash
npm run build
\`\`\`
This command automatically executes:
1. `tsx scripts/verify-game-content.ts`: Validates that all 106 games contain 100% complete objectives, plain-English measurements, 3–5 gameplay tips, 3 FAQs, and zero duplicate paragraphs or unsupported scientific claims.
2. `tsx scripts/generate-llms-full.ts`: Generates the exhaustive `llms-full.txt` knowledge base for AI engines.
3. `vite build`: Compiles production bundles.
4. `tsx scripts/generate-static-pages.ts`: Pre-renders semantic HTML for the homepage, 106 game routes, 12 category catalogs, the benchmarks dataset hub, XML sitemaps, and robots directives.

---

## 📌 Useful Links

- **Main Platform**: [https://wanjaaro.com/](https://wanjaaro.com/)
- **Global Benchmarks & Norms**: [https://wanjaaro.com/benchmarks/](https://wanjaaro.com/benchmarks/)
- **High Scores & Trophies**: [https://wanjaaro.com/scores/](https://wanjaaro.com/scores/)
- **Privacy Policy**: [https://wanjaaro.com/privacy/](https://wanjaaro.com/privacy/)
- **XML Sitemap**: [https://wanjaaro.com/sitemap.xml](https://wanjaaro.com/sitemap.xml)
- **AI Crawler Index**: [https://wanjaaro.com/llms.txt](https://wanjaaro.com/llms.txt)
- **Complete LLM Knowledge Base**: [https://wanjaaro.com/llms-full.txt](https://wanjaaro.com/llms-full.txt)

---

*Wanjaaro — High-Performance Zero-Latency Mind & Skill Arcade.*
