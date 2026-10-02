import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ALL_GAMES, CATEGORIES } from '../src/data/gamesCatalog';
import { GAME_ALIASES } from '../src/utils/routes';
import { BENCHMARK_DATASET } from '../src/components/BenchmarksView';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// Read dist/index.html as base template
const indexHtmlPath = path.resolve(distDir, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  console.error('dist/index.html does not exist! Run vite build first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');

console.log(`Loaded ${CATEGORIES.length} categories and ${ALL_GAMES.length} games for static page generation.`);

const BASE_URL = 'https://wanjaaro.com';

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function generateHtml({
  title,
  description,
  canonicalPath,
  jsonLd,
  bodyContent,
}: {
  title: string;
  description: string;
  canonicalPath: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
  bodyContent?: string;
}): string {
  let html = baseHtml;

  // Title
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

  // Meta description
  html = html.replace(
    /<meta\s+[^>]*?name="description"[^>]*?>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );

  // Canonical (Strictly no trailing slash for any subpath; root keeps '/')
  let cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.replace(/\/+$/, '');
  }
  const fullUrl = cleanPath === '/' ? `${BASE_URL}/` : `${BASE_URL}${cleanPath}`;
  html = html.replace(/<link\s+[^>]*?rel="canonical"[^>]*?>/i, `<link rel="canonical" href="${fullUrl}" />`);

  // OpenGraph
  html = html.replace(/<meta\s+[^>]*?property="og:title"[^>]*?>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`);
  html = html.replace(
    /<meta\s+[^>]*?property="og:description"[^>]*?>/i,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  );
  html = html.replace(/<meta\s+[^>]*?property="og:url"[^>]*?>/i, `<meta property="og:url" content="${fullUrl}" />`);

  // Twitter
  html = html.replace(/<meta\s+[^>]*?name="twitter:title"[^>]*?>/i, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
  html = html.replace(
    /<meta\s+[^>]*?name="twitter:description"[^>]*?>/i,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`
  );

  // Replace default JSON-LD with page-specific Schema.org graph
  if (jsonLd) {
    const jsonLdTag = `\n    <!-- Page Specific Schema.org Graph -->\n    <script type="application/ld+json">\n${JSON.stringify(
      jsonLd,
      null,
      2
    )}\n    </script>\n  </head>`;
    // If baseHtml already has application/ld+json, replace it or append
    if (html.includes('<script type="application/ld+json">')) {
      html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n    </script>`);
    } else {
      html = html.replace('</head>', jsonLdTag);
    }
  }

  // Pre-rendered semantic body content for search engines & answer engines (placed directly in #root)
  if (bodyContent) {
    html = html.replace(
      '<div id="root"></div>',
      `<div id="root">${bodyContent}</div>`
    );
  }

  return html;
}

function generateStaticFooter(): string {
  return `
    <footer style="margin-top:48px;border-top:1px solid #1e293b;padding-top:28px;font-size:12px;color:#94a3b8;line-height:1.6;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:24px;margin-bottom:24px;">
        <div>
          <p style="margin:0 0 8px 0;color:#ffffff;font-weight:700;font-size:14px;">Wanjaaro Platform</p>
          <p style="margin:0 0 10px 0;font-size:12px;color:#64748b;">
            Zero-latency client-side browser gaming. 100% free with local score storage and no mandatory account sign-up.
          </p>
          <a href="/" style="color:#f59e0b;font-weight:600;text-decoration:none;">&larr; Platform Homepage</a>
        </div>
        <div>
          <p style="margin:0 0 8px 0;color:#ffffff;font-weight:700;font-size:13px;">Cognitive Disciplines</p>
          <div style="display:flex;flex-direction:column;gap:5px;">
            ${CATEGORIES.slice(0, 6)
              .map((c) => `<a href="/${c.id}" style="color:#cbd5e1;text-decoration:none;">${escapeHtml(c.name)}</a>`)
              .join('')}
          </div>
        </div>
        <div>
          <p style="margin:0 0 8px 0;color:#ffffff;font-weight:700;font-size:13px;">More Disciplines</p>
          <div style="display:flex;flex-direction:column;gap:5px;">
            ${CATEGORIES.slice(6)
              .map((c) => `<a href="/${c.id}" style="color:#cbd5e1;text-decoration:none;">${escapeHtml(c.name)}</a>`)
              .join('')}
          </div>
        </div>
        <div>
          <p style="margin:0 0 8px 0;color:#ffffff;font-weight:700;font-size:13px;">Benchmarks &amp; Legal</p>
          <div style="display:flex;flex-direction:column;gap:5px;">
            <a href="/benchmarks" style="color:#38bdf8;text-decoration:none;">Global Benchmarks &amp; Norms</a>
            <a href="/scores" style="color:#cbd5e1;text-decoration:none;">High Scores &amp; Leaderboards</a>
            <a href="/privacy" style="color:#cbd5e1;text-decoration:none;">Privacy Policy &amp; Terms</a>
          </div>
        </div>
      </div>
      <div style="border-top:1px solid #1e293b;padding-top:14px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:11px;color:#64748b;">
        <span>&copy; ${new Date().getFullYear()} Wanjaaro. All rights reserved.</span>
        <span>Empirical Cognitive &amp; Reflex Arcade</span>
      </div>
    </footer>
  `;
}

// 0. GENERATE RICH HOMEPAGE (dist/index.html)
console.log('Generating pre-rendered root homepage for search and answer engines...');

const homeFaqs = [
  {
    q: 'What is Wanjaaro and how does it work without logins or downloads?',
    a: 'Wanjaaro is an open client-side web gaming platform engineered with TypeScript, HTML5 Canvas, and Web Audio. When you play any game, the code runs directly in your web browser using your device processor and GPU. No code is streamed from remote game servers, which means zero network latency, instant loading, and no account or registration needed. All high scores and personal records are saved privately on your device using browser localStorage.',
  },
  {
    q: 'What is an average human reaction time, and how can I test mine?',
    a: 'For visual signals, the average human reaction time is between 215ms and 250ms. Scores between 180ms and 200ms are considered fast, typical of competitive gamers, martial artists, and racing drivers. Scores below 170ms approach biological human limits. You can test your speed on Wanjaaro with the Reaction Time Test, which measures your millisecond response with sub-millisecond local input polling.',
  },
  {
    q: 'How does the Chimp Memory Test work and why can chimpanzees outperform humans?',
    a: 'The test recreates the renowned Kyoto University Primate Research Institute study with the chimpanzee Ayumu. Numbers 1 through 9 are displayed on a grid for a fraction of a second before turning into blank squares. Players must recall and click the hidden numbers in ascending order. While most adult humans struggle past 7 or 8 items due to working memory limits (Miller\'s Law: 7 ± 2 items), young chimpanzees recall all 9 numbers effortlessly due to extraordinary photographic (eidetic) visual memory.',
  },
  {
    q: 'What are the rules and strategies for Klondike Solitaire?',
    a: 'In Klondike Solitaire, your goal is to move all 52 cards into the 4 foundation piles from Ace to King by suit. In the 7 tableau columns, cards are arranged in descending rank with alternating red and black suits. Key winning strategies include prioritizing moves that uncover face-down cards in deep tableau columns rather than immediately drawing from the stock deck, and keeping empty columns open for Kings.',
  },
  {
    q: 'How do you solve 9x9 Sudoku puzzles logically without guessing?',
    a: 'Every valid Sudoku puzzle can be solved through pure deductive reasoning. Start by scanning for "naked singles"—cells where only one digit from 1 to 9 fits based on existing digits in that row, column, and 3x3 block. Next, use note mode to write candidate digits in cells with few options. Look for "hidden singles" and "naked pairs" to systematically eliminate candidates until the entire grid is solved.',
  },
  {
    q: 'What are Nonograms (Picross) and how do you read the number clues?',
    a: 'Nonograms (also known as Picross, Paint by Numbers, or Griddlers) are Japanese picture-logic puzzles where numbers along the top and left edges indicate groups of consecutive filled squares. For example, a clue of "3 2" means there is an unbroken block of 3 filled squares, followed by at least one space, followed by an unbroken block of 2 filled squares. By cross-referencing row and column constraints, you systematically uncover a pixel art illustration.',
  },
  {
    q: 'How does Wanjaaro measure millisecond latency and input accuracy?',
    a: 'Wanjaaro captures high-resolution timestamps to measure the exact millisecond delta between when a target or prompt appears and when you tap, click, or press a key. For accuracy benchmarks, games calculate the percentage of correct inputs against total attempts under fixed time constraints.',
  },
  {
    q: 'Why do client-side browser games have lower latency than cloud gaming?',
    a: 'Client-side web games execute code directly on your own device\'s hardware via hardware-accelerated requestAnimationFrame loops, eliminating network latency. Cloud streaming services must encode, transmit, and decode video over the internet, adding 30ms to 120ms of uncontrollable ping that disrupts millisecond-sensitive reflex tests.',
  },
  {
    q: 'Are my scores and personal bests private?',
    a: 'Yes. Every personal best, reaction latency record, and streak is saved exclusively inside your personal browser localStorage. The site may use third-party cookies for ads and analytics as described in the Privacy Policy.',
  },
  {
    q: 'Can I play Wanjaaro on mobile phones, tablets, and offline?',
    a: 'Yes. Every game is built with responsive dual-input architecture: intuitive touch gestures for smartphones and tablets, alongside precision keyboard and mouse controls for laptops and desktops. Because the games are lightweight client-side assets, once loaded in your browser, they continue to run smoothly even without an active internet connection.',
  },
];

const homeSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://wanjaaro.com/#website',
      name: 'Wanjaaro',
      url: 'https://wanjaaro.com/',
      description: 'Play free instant client-side browser games on Wanjaaro. Test your reflexes, memory, logic, precision, typing, and mental agility with local high score tracking.',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://wanjaaro.com/?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://wanjaaro.com/#organization',
      name: 'Wanjaaro',
      url: 'https://wanjaaro.com/',
      logo: 'https://wanjaaro.com/favicon.ico',
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://wanjaaro.com/#webapp',
      name: 'Wanjaaro Mind & Skill Arcade',
      url: 'https://wanjaaro.com/',
      applicationCategory: 'GameApplication',
      operatingSystem: 'All modern web browsers (Desktop, Mobile, Tablet)',
      description: 'Comprehensive suite of 100+ instant client-side cognitive benchmarks, reflex tests, and brain puzzles.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        '100% Free Client-Side In-Browser Execution',
        'Sub-Millisecond Input Latency (Zero Cloud Lag)',
        'Local High Score and Personal Best Tracking',
        'Responsive Touch & Desktop Keyboard Controls',
        'Zero Accounts or Logins Required',
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://wanjaaro.com/#faq',
      mainEntity: homeFaqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      })),
    },
  ],
};

const featuredGameSlugs = [
  'solitaire',
  'sudoku',
  'mahjong',
  'nonogram',
  'daily-puzzle',
  'idle-games',
  'reflex-reaction-time',
  'memory-spatial-span',
  'aim-sniper',
  'typing-speed-words',
  'perception-stroop-test',
  'arcade-brick-breaker',
];

const featuredGamesList = ALL_GAMES.filter((g) => featuredGameSlugs.includes(g.id));

const homeBodyContent = `
  <div style="background:#090d16;color:#f8fafc;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;padding:24px;max-width:1200px;margin:0 auto;">
    <header style="border-bottom:1px solid #1e293b;padding-bottom:20px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
      <div>
        <a href="/" style="text-decoration:none;display:flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#f59e0b,#d97706);display:flex;align-items:center;justify-content:center;color:#000;font-weight:900;font-size:20px;">W</div>
          <span style="font-size:22px;font-weight:800;letter-spacing:-0.03em;color:#ffffff;">WANJAARO</span>
        </a>
        <p style="font-size:13px;color:#94a3b8;margin:4px 0 0 0;">Zero-Latency Mind, Reflex &amp; Brain Training Arcade</p>
      </div>
      <nav style="display:flex;gap:16px;font-size:14px;font-weight:600;">
        <a href="/" style="color:#f59e0b;text-decoration:none;">Home</a>
        <a href="/scores" style="color:#cbd5e1;text-decoration:none;">Scores &amp; Benchmarks</a>
        <a href="/reflex-reaction" style="color:#cbd5e1;text-decoration:none;">Reflex</a>
        <a href="/memory-recall" style="color:#cbd5e1;text-decoration:none;">Memory</a>
        <a href="/logic-puzzles" style="color:#cbd5e1;text-decoration:none;">Logic</a>
        <a href="/casual-arcade" style="color:#cbd5e1;text-decoration:none;">Arcade</a>
      </nav>
    </header>

    <main>
      <section style="background:linear-gradient(180deg,#0f172a,#090d16);border:1px solid #1e293b;border-radius:24px;padding:36px 24px;text-align:center;margin-bottom:36px;">
        <div style="display:inline-block;padding:6px 14px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);color:#fbbf24;font-size:12px;font-weight:700;border-radius:999px;margin-bottom:16px;">
          ✦ High-Performance Browser Arcade
        </div>
        <h1 style="font-size:36px;font-weight:900;letter-spacing:-0.03em;color:#ffffff;margin:0 0 16px 0;line-height:1.2;">
          Train Your Reflexes, Memory, Logic &amp; Mental Speed
        </h1>
        <p style="font-size:16px;color:#cbd5e1;max-width:760px;margin:0 auto 24px auto;line-height:1.7;">
          Wanjaaro is an open client-side web gaming platform built for athletes of the mind, esports competitors, students, and puzzle lovers.
          Enjoy over <strong>${ALL_GAMES.length} instant games</strong> running directly in your browser with sub-millisecond input handling, zero server lag, no logins, and private local high-score tracking.
        </p>
        <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
          <a href="/solitaire" style="background:#f59e0b;color:#000;font-weight:700;font-size:14px;padding:10px 20px;border-radius:12px;text-decoration:none;">Play Klondike Solitaire</a>
          <a href="/sudoku" style="background:#1e293b;color:#f8fafc;border:1px solid #334155;font-weight:700;font-size:14px;padding:10px 20px;border-radius:12px;text-decoration:none;">Play 9x9 Sudoku</a>
          <a href="/reflex-reaction-time" style="background:#1e293b;color:#f8fafc;border:1px solid #334155;font-weight:700;font-size:14px;padding:10px 20px;border-radius:12px;text-decoration:none;">Test Reaction Time</a>
          <a href="/daily-puzzle" style="background:#1e293b;color:#f8fafc;border:1px solid #334155;font-weight:700;font-size:14px;padding:10px 20px;border-radius:12px;text-decoration:none;">Daily Mind Puzzle</a>
        </div>
      </section>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:22px;font-weight:800;color:#ffffff;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <span>⭐</span> Featured Mind &amp; Benchmark Games
        </h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:16px;">
          ${featuredGamesList
            .map(
              (g) => `
            <article style="background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:18px;display:flex;flex-col;justify-content:space-between;">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                  <span style="font-size:28px;">${g.icon || '🎮'}</span>
                  <span style="font-size:11px;font-family:monospace;background:#1e293b;color:#f59e0b;padding:2px 8px;border-radius:6px;">${escapeHtml(g.difficulty || 'Normal')}</span>
                </div>
                <h3 style="font-size:17px;font-weight:700;color:#ffffff;margin:0 0 6px 0;">
                  <a href="/${g.id}" style="color:#ffffff;text-decoration:none;">${escapeHtml(g.title)}</a>
                </h3>
                <p style="font-size:13px;color:#94a3b8;margin:0 0 12px 0;line-height:1.5;">${escapeHtml(g.summary)}</p>
              </div>
              <div style="border-top:1px solid #1e293b;padding-top:10px;margin-top:10px;display:flex;justify-content:space-between;align-items:center;font-size:12px;">
                <span style="color:#64748b;">${escapeHtml(g.skillsTested?.[0] || 'Skill')}</span>
                <a href="/${g.id}" style="color:#38bdf8;font-weight:600;text-decoration:none;">Play Now &rarr;</a>
              </div>
            </article>
          `
            )
            .join('')}
        </div>
      </section>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:22px;font-weight:800;color:#ffffff;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <span>🧠</span> 12 Cognitive &amp; Reflex Disciplines
        </h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(240px, 1fr));gap:14px;">
          ${CATEGORIES.map(
            (c) => `
            <a href="/${c.id}" style="background:#0f172a;border:1px solid #1e293b;border-radius:14px;padding:16px;text-decoration:none;display:block;transition:border-color 0.2s;">
              <div style="font-size:24px;margin-bottom:6px;">${c.icon || '🎯'}</div>
              <h3 style="font-size:16px;font-weight:700;color:#ffffff;margin:0 0 4px 0;">${escapeHtml(c.name)}</h3>
              <p style="font-size:12px;color:#94a3b8;margin:0 0 8px 0;line-height:1.4;">${escapeHtml(c.shortDesc)}</p>
              <span style="font-size:11px;font-family:monospace;color:#f59e0b;">${c.gameCount} games available &rarr;</span>
            </a>
          `
          ).join('')}
        </div>
      </section>

      <section style="background:#0f172a;border:1px solid #1e293b;border-radius:20px;padding:24px;margin-bottom:36px;">
        <h2 style="font-size:20px;font-weight:800;color:#ffffff;margin:0 0 6px 0;">
          Human Cognitive &amp; Reflex Performance Norms
        </h2>
        <p style="font-size:13px;color:#94a3b8;margin:0 0 16px 0;">
          Baseline population averages versus top 1% elite human records across core cognitive disciplines:
        </p>
        <div style="overflow-x:auto;">
          <table style="width:100%;text-align:left;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr style="border-bottom:1px solid #334155;color:#f59e0b;font-weight:700;font-size:12px;text-transform:uppercase;">
                <th style="padding:10px 12px;">Benchmark Test</th>
                <th style="padding:10px 12px;">Metric</th>
                <th style="padding:10px 12px;">Population Average</th>
                <th style="padding:10px 12px;">Elite Tier (Top 1%)</th>
                <th style="padding:10px 12px;">Physiological Basis</th>
              </tr>
            </thead>
            <tbody style="color:#cbd5e1;">
              <tr style="border-bottom:1px solid #1e293b;">
                <td style="padding:10px 12px;font-weight:600;color:#ffffff;"><a href="/reflex-reaction-time" style="color:#38bdf8;text-decoration:none;">Reaction Time Test</a></td>
                <td style="padding:10px 12px;font-family:monospace;">Visual Latency (ms)</td>
                <td style="padding:10px 12px;">215ms – 250ms</td>
                <td style="padding:10px 12px;color:#10b981;font-weight:700;">&lt; 180ms</td>
                <td style="padding:10px 12px;font-size:11px;color:#94a3b8;">Retinal photoreceptor excitation to visual cortex and corticospinal motor nerve conduction.</td>
              </tr>
              <tr style="border-bottom:1px solid #1e293b;">
                <td style="padding:10px 12px;font-weight:600;color:#ffffff;"><a href="/memory-spatial-span" style="color:#38bdf8;text-decoration:none;">Chimp Memory Test</a></td>
                <td style="padding:10px 12px;font-family:monospace;">Working Memory Span</td>
                <td style="padding:10px 12px;">Level 7 – 9 (Miller's Law)</td>
                <td style="padding:10px 12px;color:#10b981;font-weight:700;">Level 12+ (Ayumu Benchmark)</td>
                <td style="padding:10px 12px;font-size:11px;color:#94a3b8;">Visual sequence recall and spatial pattern retention under brief stimulus masking.</td>
              </tr>
              <tr style="border-bottom:1px solid #1e293b;">
                <td style="padding:10px 12px;font-weight:600;color:#ffffff;"><a href="/solitaire" style="color:#38bdf8;text-decoration:none;">Klondike Solitaire Classic</a></td>
                <td style="padding:10px 12px;font-family:monospace;">Moves &amp; Completion Rate</td>
                <td style="padding:10px 12px;">110 – 145 moves (~33% wins)</td>
                <td style="padding:10px 12px;color:#10b981;font-weight:700;">&lt; 85 moves (&gt; 80% wins)</td>
                <td style="padding:10px 12px;font-size:11px;color:#94a3b8;">Card depth prioritization, tableau excavation, and alternate-color planning.</td>
              </tr>
              <tr style="border-bottom:1px solid #1e293b;">
                <td style="padding:10px 12px;font-weight:600;color:#ffffff;"><a href="/sudoku" style="color:#38bdf8;text-decoration:none;">Master Sudoku 9x9</a></td>
                <td style="padding:10px 12px;font-family:monospace;">Solving Time</td>
                <td style="padding:10px 12px;">12 – 18 mins</td>
                <td style="padding:10px 12px;color:#10b981;font-weight:700;">&lt; 6 mins</td>
                <td style="padding:10px 12px;font-size:11px;color:#94a3b8;">Combinatorial candidate reduction, naked/hidden single detection, and logical elimination.</td>
              </tr>
              <tr style="border-bottom:1px solid #1e293b;">
                <td style="padding:10px 12px;font-weight:600;color:#ffffff;"><a href="/aim-sniper" style="color:#38bdf8;text-decoration:none;">Precision Sniper Aim</a></td>
                <td style="padding:10px 12px;font-family:monospace;">Target Acquisition Time</td>
                <td style="padding:10px 12px;">420ms – 520ms</td>
                <td style="padding:10px 12px;color:#10b981;font-weight:700;">&lt; 320ms</td>
                <td style="padding:10px 12px;font-size:11px;color:#94a3b8;">Target acquisition velocity and cursor micro-adjustment motor control.</td>
              </tr>
              <tr style="border-bottom:1px solid #1e293b;">
                <td style="padding:10px 12px;font-weight:600;color:#ffffff;"><a href="/typing-speed-words" style="color:#38bdf8;text-decoration:none;">Speed Typist Drill</a></td>
                <td style="padding:10px 12px;font-family:monospace;">Words Per Minute (WPM)</td>
                <td style="padding:10px 12px;">42 – 62 WPM</td>
                <td style="padding:10px 12px;color:#10b981;font-weight:700;">100+ WPM (99th percentile)</td>
                <td style="padding:10px 12px;font-size:11px;color:#94a3b8;">Typing muscle memory, anticipatory key buffering, and reading flow.</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;font-weight:600;color:#ffffff;"><a href="/perception-stroop-test" style="color:#38bdf8;text-decoration:none;">Stroop Color Challenge</a></td>
                <td style="padding:10px 12px;font-family:monospace;">Inhibition Delay Cost</td>
                <td style="padding:10px 12px;">120ms – 180ms delay</td>
                <td style="padding:10px 12px;color:#10b981;font-weight:700;">&lt; 60ms delay</td>
                <td style="padding:10px 12px;font-size:11px;color:#94a3b8;">Interference resolution and selective attention when color and text meaning conflict.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:22px;font-weight:800;color:#ffffff;margin-bottom:16px;">
          Frequently Asked Questions &amp; Direct Answers
        </h2>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${homeFaqs
            .map(
              (faq) => `
            <details style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:14px;">
              <summary style="font-weight:700;font-size:15px;color:#ffffff;cursor:pointer;">${escapeHtml(faq.q)}</summary>
              <p style="margin:10px 0 0 0;font-size:13px;color:#cbd5e1;line-height:1.6;">${escapeHtml(faq.a)}</p>
            </details>
          `
            )
            .join('')}
        </div>
      </section>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:20px;font-weight:800;color:#ffffff;margin-bottom:14px;">
          All 12 Cognitive Disciplines &amp; Skill Categories
        </h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:12px;font-size:13px;">
          ${CATEGORIES.map(
            (c) => `
            <a href="/${c.id}" style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:12px;color:#cbd5e1;text-decoration:none;display:block;">
              <div style="font-size:22px;margin-bottom:4px;">${c.icon}</div>
              <div style="font-weight:700;color:#ffffff;margin-bottom:2px;">${escapeHtml(c.name)}</div>
              <div style="font-size:11px;color:#94a3b8;line-height:1.4;">${escapeHtml(c.shortDesc)}</div>
              <div style="font-size:11px;color:#38bdf8;font-weight:600;margin-top:6px;">${c.gameCount} Games &rarr;</div>
            </a>
          `
          ).join('')}
        </div>
      </section>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:20px;font-weight:800;color:#ffffff;margin-bottom:14px;">
          Complete Directory of Instant Games
        </h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:10px;font-size:12px;">
          ${ALL_GAMES.map(
            (g) => `
            <a href="/${g.id}" style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;color:#cbd5e1;text-decoration:none;display:block;">
              <div style="font-weight:700;color:#ffffff;margin-bottom:2px;">${escapeHtml(g.title)}</div>
              <div style="font-size:11px;color:#64748b;">${escapeHtml(g.skillsTested?.[0] || 'Skill')} &bull; ${escapeHtml(g.difficulty || 'Normal')}</div>
            </a>
          `
          ).join('')}
        </div>
      </section>
    </main>

    ${generateStaticFooter()}
  </div>
`;

const homeHtml = generateHtml({
  title: 'Wanjaaro – Free Instant Mind & Skill Games | Zero Lag',
  description:
    'Play free instant client-side browser games on Wanjaaro. Test your reflexes, memory, logic, precision, typing, and mental agility with local high score tracking.',
  canonicalPath: '/',
  jsonLd: homeSchema,
  bodyContent: homeBodyContent,
});

fs.writeFileSync(path.resolve(distDir, 'index.html'), homeHtml, 'utf8');
console.log('✅ Generated rich pre-rendered dist/index.html');

// 1. GENERATE GAME PAGES at plain URLs: dist/<game-id>/index.html and dist/<game-id>.html
console.log('Generating pre-rendered game pages...');
for (const game of ALL_GAMES) {
  const pageTitle = `${game.title} – Play Online Free | Wanjaaro`;
  const pageDesc = `Play ${game.title} online for free on Wanjaaro. ${game.summary} Instant client-side play with zero latency, no download, and private local high-score tracking.`;

  const categoryObj = CATEGORIES.find((c) => c.id === game.category);
  const categoryName = categoryObj ? categoryObj.name : 'Skill Games';
  const relatedGames = ALL_GAMES.filter((g) => g.category === game.category && g.id !== game.id).slice(0, 6);

  // Schema.org Graph for the game
  const gameSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: game.title,
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any Modern Web Browser (Desktop, Mobile, Tablet)',
        description: game.summary,
        url: `${BASE_URL}/${game.id}`,
        genre: categoryName,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          '100% Free Client-Side In-Browser Execution',
          'Sub-Millisecond Input Latency (Zero Cloud Lag)',
          'Local High Score and Personal Best Tracking',
          'Responsive Touch & Desktop Keyboard Controls',
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: BASE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: categoryName,
            item: `${BASE_URL}/${game.category}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: game.title,
            item: `${BASE_URL}/${game.id}`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: (game.faq && game.faq.length > 0 ? game.faq : [
          {
            question: `How do you play ${game.title}?`,
            answer: `${game.instructions}`,
          },
          {
            question: `What does ${game.title} measure?`,
            answer: `${game.whatItMeasures}`,
          },
          {
            question: `How are scores saved in ${game.title}?`,
            answer: `All scores are stored locally in your browser's localStorage.`,
          },
        ]).map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  };

  // Semantic pre-rendered HTML for search & answer engines directly inside #root
  const bodyContent = `
    <div style="background:#090d16;color:#f8fafc;padding:24px;font-family:system-ui,-apple-system,sans-serif;max-width:960px;margin:0 auto;line-height:1.6;">
      <nav aria-label="Breadcrumbs" style="margin-bottom:16px;font-size:13px;color:#94a3b8;">
        <a href="/" style="color:#38bdf8;text-decoration:none;">Home</a> &gt; 
        <a href="/${game.category}" style="color:#38bdf8;text-decoration:none;">${escapeHtml(categoryName)}</a> &gt; 
        <span style="color:#cbd5e1;">${escapeHtml(game.title)}</span>
      </nav>
      
      <header style="margin-bottom:24px;border-bottom:1px solid #1e293b;padding-bottom:16px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
          <span style="font-size:32px;">${game.icon || '🎮'}</span>
          <h1 style="font-size:30px;font-weight:900;color:#f8fafc;margin:0;letter-spacing:-0.02em;">${escapeHtml(game.title)}</h1>
        </div>
        <p style="font-size:15px;color:#94a3b8;margin:0 0 10px 0;">${escapeHtml(game.summary)}</p>
        <div style="display:flex;gap:12px;align-items:center;font-size:12px;color:#64748b;">
          <span>Category: <strong style="color:#cbd5e1;">${escapeHtml(categoryName)}</strong></span>
          <span>&bull;</span>
          <span>Difficulty: <strong style="color:#f59e0b;">${escapeHtml(game.difficulty || 'Normal')}</strong></span>
          <span>&bull;</span>
          <span>Scoring: <strong style="color:#38bdf8;">${escapeHtml(game.scoringUnit || 'pts')}</strong></span>
        </div>
      </header>

      <!-- Pre-rendered Game Shell Placeholder -->
      <section style="background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:24px;text-align:center;margin-bottom:28px;">
        <div style="font-size:40px;margin-bottom:12px;">${game.icon || '🎮'}</div>
        <h2 style="font-size:20px;font-weight:700;color:#ffffff;margin:0 0 8px 0;">Play ${escapeHtml(game.title)} Online</h2>
        <p style="font-size:13px;color:#94a3b8;max-width:540px;margin:0 auto 16px auto;">
          Click anywhere or tap below to start playing. Controls: <strong>${escapeHtml(game.controls === 'all' ? 'Mouse, Touch & Keyboard' : game.controls)}</strong>. 100% free with zero input lag.
        </p>
        <div style="display:inline-block;padding:10px 24px;background:#f59e0b;color:#000;font-weight:800;font-size:14px;border-radius:10px;cursor:pointer;">
          ▶ Start Game
        </div>
      </section>

      <!-- Objective & Rules Grid -->
      <section style="margin-bottom:28px;display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:16px;">
        <div style="background:#0f172a;padding:18px;border-radius:14px;border:1px solid #1e293b;">
          <h2 style="font-size:16px;font-weight:700;color:#10b981;margin:0 0 6px 0;">🎯 Objective</h2>
          <p style="font-size:13px;color:#cbd5e1;margin:0;line-height:1.5;">${escapeHtml(game.objective)}</p>
        </div>

        <div style="background:#0f172a;padding:18px;border-radius:14px;border:1px solid #1e293b;">
          <h2 style="font-size:16px;font-weight:700;color:#38bdf8;margin:0 0 6px 0;">📋 How to Play &amp; Scoring</h2>
          <p style="font-size:13px;color:#cbd5e1;margin:0 0 8px 0;line-height:1.5;">${escapeHtml(game.howToPlay || game.instructions)}</p>
          <p style="font-size:12px;color:#94a3b8;margin:0;">
            Scored in <strong>${escapeHtml(game.scoringUnit)}</strong> (${game.scoringCriterion === 'lower' ? 'lower values indicate better performance' : 'higher scores indicate better performance'}).
          </p>
        </div>
      </section>

      <!-- What This Game Measures & Privacy Grid -->
      <section style="margin-bottom:28px;display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:16px;">
        <div style="background:#0f172a;padding:18px;border-radius:14px;border:1px solid #1e293b;">
          <h2 style="font-size:16px;font-weight:700;color:#f59e0b;margin:0 0 6px 0;">🧠 What This Game Measures</h2>
          <p style="font-size:13px;color:#cbd5e1;margin:0;line-height:1.5;">${escapeHtml(game.whatItMeasures)}</p>
        </div>

        <div style="background:#0f172a;padding:18px;border-radius:14px;border:1px solid #1e293b;">
          <h2 style="font-size:16px;font-weight:700;color:#a855f7;margin:0 0 6px 0;">🔒 Privacy &amp; Data Storage</h2>
          <p style="font-size:13px;color:#cbd5e1;margin:0;line-height:1.5;">
            Scores and personal records are saved locally in your browser's localStorage. This site may use cookies for advertisements and analytics as described in the <a href="/privacy" style="color:#f59e0b;text-decoration:underline;">Privacy Policy</a>.
          </p>
        </div>
      </section>

      <!-- Tips Section (3-5 tips) -->
      ${
        game.tips && game.tips.length > 0
          ? `<section style="margin-bottom:28px;background:#0f172a;padding:20px;border-radius:14px;border:1px solid #1e293b;">
              <h2 style="font-size:18px;font-weight:700;color:#ffffff;margin:0 0 14px 0;">💡 Strategy &amp; Gameplay Tips</h2>
              <ul style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:10px;padding:0;margin:0;list-style:none;">
                ${game.tips
                  .map(
                    (tip, idx) => `
                  <li style="background:#090d16;border:1px solid #1e293b;padding:12px;border-radius:10px;font-size:13px;color:#cbd5e1;display:flex;gap:8px;">
                    <span style="color:#f59e0b;font-weight:700;">${idx + 1}.</span>
                    <span>${escapeHtml(tip)}</span>
                  </li>
                `
                  )
                  .join('')}
              </ul>
            </section>`
          : ''
      }

      <!-- Verified Sourced Benchmark Section (Rendered ONLY if verified source exists) -->
      ${
        game.benchmark
          ? `<section style="margin-bottom:28px;background:#0f172a;border:1px solid #1e293b;border-radius:14px;padding:18px;">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
                <h2 style="font-size:18px;font-weight:700;color:#ffffff;margin:0;">📊 Verified Performance Benchmark</h2>
                <span style="font-size:11px;font-family:monospace;color:#94a3b8;">Source: ${escapeHtml(game.benchmark.source)}</span>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:10px;font-size:13px;">
                <div style="background:#090d16;padding:12px;border-radius:8px;border:1px solid #1e293b;">
                  <span style="font-size:11px;color:#64748b;display:block;text-transform:uppercase;">Metric</span>
                  <strong style="color:#ffffff;">${escapeHtml(game.benchmark.metric)}</strong>
                </div>
                <div style="background:#090d16;padding:12px;border-radius:8px;border:1px solid #1e293b;">
                  <span style="font-size:11px;color:#64748b;display:block;text-transform:uppercase;">Population Average</span>
                  <strong style="color:#38bdf8;">${escapeHtml(game.benchmark.average)}</strong>
                </div>
                <div style="background:#090d16;padding:12px;border-radius:8px;border:1px solid #1e293b;">
                  <span style="font-size:11px;color:#64748b;display:block;text-transform:uppercase;">Elite Tier</span>
                  <strong style="color:#10b981;">${escapeHtml(game.benchmark.elite)}</strong>
                </div>
              </div>
            </section>`
          : ''
      }

      <!-- FAQ Section (3 specific questions) -->
      ${
        game.faq && game.faq.length > 0
          ? `<section style="margin-bottom:28px;">
              <h2 style="font-size:18px;font-weight:700;color:#ffffff;margin-bottom:12px;">❓ Frequently Asked Questions</h2>
              <div style="display:flex;flex-direction:column;gap:10px;">
                ${game.faq
                  .map(
                    (item) => `
                  <details style="background:#0f172a;padding:12px 16px;border-radius:10px;border:1px solid #1e293b;">
                    <summary style="font-weight:700;font-size:14px;color:#ffffff;cursor:pointer;">${escapeHtml(item.question)}</summary>
                    <p style="margin:8px 0 0 0;font-size:13px;color:#cbd5e1;line-height:1.6;">${escapeHtml(item.answer)}</p>
                  </details>
                `
                  )
                  .join('')}
              </div>
            </section>`
          : ''
      }

      <!-- Related Games in Same Category -->
      <section style="margin-top:32px;border-top:1px solid #1e293b;padding-top:20px;">
        <h2 style="font-size:16px;font-weight:700;color:#f8fafc;margin-bottom:12px;">Related ${escapeHtml(categoryName)} Games</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:12px;">
          ${relatedGames
            .map(
              (rg) => `
            <a href="/${rg.id}" style="display:block;background:#0f172a;padding:12px;border-radius:8px;border:1px solid #1e293b;color:#f8fafc;text-decoration:none;">
              <div style="font-weight:700;font-size:13px;color:#38bdf8;">${escapeHtml(rg.title)}</div>
              <div style="font-size:11px;color:#94a3b8;margin-top:4px;">${escapeHtml(rg.summary.slice(0, 75))}...</div>
            </a>
          `
            )
            .join('')}
        </div>
      </section>

      ${generateStaticFooter()}
    </div>
  `;

  const html = generateHtml({
    title: pageTitle,
    description: pageDesc,
    canonicalPath: `/${game.id}`,
    jsonLd: gameSchema,
    bodyContent,
  });

  const targetDir = path.resolve(distDir, game.id);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.resolve(targetDir, 'index.html'), html, 'utf8');
  fs.writeFileSync(path.resolve(distDir, `${game.id}.html`), html, 'utf8');

  // Legacy fallback: /game/<id>/index.html with redirect
  const legacyDir = path.resolve(distDir, 'game', game.id);
  fs.mkdirSync(legacyDir, { recursive: true });
  const redirectHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Redirecting to ${escapeHtml(game.title)}...</title>
    <link rel="canonical" href="${BASE_URL}/${game.id}">
    <meta http-equiv="refresh" content="0; url=/${game.id}">
    <script>window.location.replace('/${game.id}');</script>
  </head>
  <body>
    <p>Moved permanently. <a href="/${game.id}">Click here to play ${escapeHtml(game.title)}</a>.</p>
  </body>
</html>`;
  fs.writeFileSync(path.resolve(legacyDir, 'index.html'), redirectHtml, 'utf8');
  fs.writeFileSync(path.resolve(distDir, 'game', `${game.id}.html`), redirectHtml, 'utf8');
}

// 2. GENERATE CATEGORY PAGES at plain URLs: dist/<category-id>/index.html and dist/<category-id>.html
console.log('Generating pre-rendered category pages...');
for (const cat of CATEGORIES) {
  const pageTitle = `${cat.name} Games – Free Mind & Reflex Benchmarks | Wanjaaro`;
  const pageDesc = `Play free instant ${cat.name} games on Wanjaaro. ${cat.shortDesc} Zero latency, 100% in-browser, no registration required.`;
  const categoryGames = ALL_GAMES.filter((g) => g.category === cat.id);

  const categorySchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${cat.name} Games`,
    description: cat.shortDesc,
    url: `${BASE_URL}/${cat.id}`,
    hasPart: categoryGames.map((g) => ({
      '@type': 'SoftwareApplication',
      name: g.title,
      url: `${BASE_URL}/${g.id}`,
      description: g.summary,
    })),
  };

  const bodyContent = `
    <div style="background:#090d16;color:#f8fafc;padding:24px;font-family:system-ui,-apple-system,sans-serif;max-width:960px;margin:0 auto;line-height:1.6;">
      <nav aria-label="Breadcrumbs" style="margin-bottom:16px;font-size:13px;color:#94a3b8;">
        <a href="/" style="color:#38bdf8;text-decoration:none;">Home</a> &gt; 
        <span style="color:#cbd5e1;">${escapeHtml(cat.name)}</span>
      </nav>
      
      <header style="margin-bottom:24px;border-bottom:1px solid #1e293b;padding-bottom:16px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
          <span style="font-size:32px;">${cat.icon || '🎯'}</span>
          <h1 style="font-size:30px;font-weight:900;color:#f8fafc;margin:0;">${escapeHtml(cat.name)} Games</h1>
        </div>
        <p style="font-size:15px;color:#94a3b8;margin:0 0 10px 0;">${escapeHtml(cat.shortDesc)}</p>
        <span style="font-size:12px;color:#f59e0b;font-weight:600;">${categoryGames.length} instant games in this category</span>
      </header>

      <section style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:16px;margin-top:20px;">
        ${categoryGames
          .map(
            (g) => `
          <article style="background:#0f172a;padding:16px;border-radius:12px;border:1px solid #1e293b;display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <span style="font-size:22px;">${g.icon || '🎮'}</span>
                <span style="font-size:10px;font-family:monospace;background:#1e293b;color:#f59e0b;padding:2px 6px;border-radius:4px;">${escapeHtml(g.difficulty || 'Normal')}</span>
              </div>
              <h2 style="font-size:16px;font-weight:700;color:#ffffff;margin:0 0 6px 0;">
                <a href="/${g.id}" style="color:#ffffff;text-decoration:none;">${escapeHtml(g.title)}</a>
              </h2>
              <p style="font-size:13px;color:#94a3b8;margin:0 0 10px 0;line-height:1.4;">${escapeHtml(g.summary)}</p>
            </div>
            <div style="border-top:1px solid #1e293b;padding-top:8px;margin-top:8px;display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:11px;color:#64748b;font-family:monospace;">${escapeHtml(g.scoringUnit || 'pts')}</span>
              <a href="/${g.id}" style="color:#38bdf8;font-size:12px;font-weight:700;text-decoration:none;">Play &rarr;</a>
            </div>
          </article>
        `
          )
          .join('')}
      </section>

      <!-- Cross-Link Other Disciplines (Eliminates category orphans) -->
      <section style="margin-top:36px;border-top:1px solid #1e293b;padding-top:24px;">
        <h2 style="font-size:18px;font-weight:700;color:#ffffff;margin-bottom:14px;">Explore Other Cognitive Disciplines</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:12px;">
          ${CATEGORIES.filter((c) => c.id !== cat.id)
            .map(
              (oc) => `
            <a href="/${oc.id}" style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:12px;color:#cbd5e1;text-decoration:none;display:block;">
              <div style="font-size:20px;margin-bottom:4px;">${oc.icon}</div>
              <div style="font-weight:700;color:#ffffff;font-size:13px;">${escapeHtml(oc.name)}</div>
              <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${oc.gameCount} games available &rarr;</div>
            </a>
          `
            )
            .join('')}
        </div>
      </section>

      ${generateStaticFooter()}
    </div>
  `;

  const html = generateHtml({
    title: pageTitle,
    description: pageDesc,
    canonicalPath: `/${cat.id}`,
    jsonLd: categorySchema,
    bodyContent,
  });

  const targetDir = path.resolve(distDir, cat.id);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.resolve(targetDir, 'index.html'), html, 'utf8');
  fs.writeFileSync(path.resolve(distDir, `${cat.id}.html`), html, 'utf8');

  // Legacy fallback: /category/<id>/index.html with redirect
  const legacyDir = path.resolve(distDir, 'category', cat.id);
  fs.mkdirSync(legacyDir, { recursive: true });
  const redirectHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Redirecting to ${escapeHtml(cat.name)} Games...</title>
    <link rel="canonical" href="${BASE_URL}/${cat.id}">
    <meta http-equiv="refresh" content="0; url=/${cat.id}">
    <script>window.location.replace('/${cat.id}');</script>
  </head>
  <body>
    <p>Moved permanently. <a href="/${cat.id}">Click here to view ${escapeHtml(cat.name)} Games</a>.</p>
  </body>
</html>`;
  fs.writeFileSync(path.resolve(legacyDir, 'index.html'), redirectHtml, 'utf8');
  fs.writeFileSync(path.resolve(distDir, 'category', `${cat.id}.html`), redirectHtml, 'utf8');
}

// 3. GENERATE FRIENDLY ALIASES at plain URLs: dist/<alias>/index.html with redirect
console.log('Generating pre-rendered alias routes...');
for (const [alias, targetGameId] of Object.entries(GAME_ALIASES)) {
  const targetGame = ALL_GAMES.find((g) => g.id === targetGameId);
  if (!targetGame) continue;
  const redirectHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Redirecting to ${escapeHtml(targetGame.title)}...</title>
    <link rel="canonical" href="${BASE_URL}/${targetGame.id}">
    <meta http-equiv="refresh" content="0; url=/${targetGame.id}">
    <script>window.location.replace('/${targetGame.id}');</script>
  </head>
  <body>
    <p>Moved permanently. <a href="/${targetGame.id}">Click here to play ${escapeHtml(targetGame.title)}</a>.</p>
  </body>
</html>`;

  const targetDir = path.resolve(distDir, alias);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.resolve(targetDir, 'index.html'), redirectHtml, 'utf8');
  fs.writeFileSync(path.resolve(distDir, `${alias}.html`), redirectHtml, 'utf8');
}

// 4. GENERATE SCORES / LEADERBOARD PAGE at plain URL
console.log('Generating pre-rendered scores page...');
const scoresBodyContent = `
  <div style="background:#090d16;color:#f8fafc;padding:24px;font-family:system-ui,-apple-system,sans-serif;max-width:960px;margin:0 auto;line-height:1.6;">
    <nav aria-label="Breadcrumbs" style="margin-bottom:16px;font-size:13px;color:#94a3b8;">
      <a href="/" style="color:#38bdf8;text-decoration:none;">Home</a> &gt; 
      <span style="color:#cbd5e1;">High Scores &amp; Leaderboards</span>
    </nav>
    <header style="margin-bottom:24px;border-bottom:1px solid #1e293b;padding-bottom:16px;">
      <h1 style="font-size:30px;font-weight:900;color:#ffffff;margin:0 0 8px 0;">Cognitive Benchmarks &amp; High Scores</h1>
      <p style="font-size:15px;color:#94a3b8;margin:0;">Track your personal bests, reaction times, working memory spans, and puzzle completion records privately.</p>
    </header>
    <section style="background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:24px;margin-bottom:24px;">
      <h2 style="font-size:18px;font-weight:700;color:#f59e0b;margin-top:0;">Private Local Score Storage</h2>
      <p style="font-size:14px;color:#cbd5e1;line-height:1.6;">
        Wanjaaro saves all of your scores, reaction time percentiles, round counts, and daily puzzle streaks directly inside your browser's localStorage.
        We do not require account logins, keeping your score data on your device. Cookies may be used for ads and analytics as described in the Privacy Policy.
      </p>
    </section>
    ${generateStaticFooter()}
  </div>
`;

const scoresHtml = generateHtml({
  title: 'Top High Scores & Leaderboards | Wanjaaro',
  description: 'View top scores, reaction latency benchmarks, and personal best records across all instant games on Wanjaaro.',
  canonicalPath: '/scores',
  bodyContent: scoresBodyContent,
});
const scoresDir = path.resolve(distDir, 'scores');
fs.mkdirSync(scoresDir, { recursive: true });
fs.writeFileSync(path.resolve(scoresDir, 'index.html'), scoresHtml, 'utf8');
fs.writeFileSync(path.resolve(distDir, 'scores.html'), scoresHtml, 'utf8');

// 4b. GENERATE PRIVACY POLICY PAGE at plain URL
console.log('Generating pre-rendered privacy policy page...');
const privacyBodyContent = `
  <div style="background:#090d16;color:#f8fafc;padding:24px;font-family:system-ui,-apple-system,sans-serif;max-width:960px;margin:0 auto;line-height:1.6;">
    <nav aria-label="Breadcrumbs" style="margin-bottom:16px;font-size:13px;color:#94a3b8;">
      <a href="/" style="color:#38bdf8;text-decoration:none;">Home</a> &gt; 
      <span style="color:#cbd5e1;">Privacy Policy</span>
    </nav>
    <header style="margin-bottom:24px;border-bottom:1px solid #1e293b;padding-bottom:16px;">
      <h1 style="font-size:30px;font-weight:900;color:#ffffff;margin:0 0 8px 0;">Privacy Policy</h1>
      <p style="font-size:15px;color:#94a3b8;margin:0;">Wanjaaro Gaming Platform Transparency &amp; Data Notice</p>
    </header>
    <section style="background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:24px;margin-bottom:20px;">
      <h2 style="font-size:18px;font-weight:700;color:#10b981;margin-top:0;">1. Local Storage for Game Scores</h2>
      <p style="font-size:14px;color:#cbd5e1;line-height:1.6;">
        Your high scores, best reaction latencies, round counts, and audio preferences are stored exclusively on your device using your browser's standard <code>localStorage</code>. This information is not transmitted to our servers.
      </p>
    </section>
    <section style="background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:24px;margin-bottom:20px;">
      <h2 style="font-size:18px;font-weight:700;color:#f59e0b;margin-top:0;">2. Cookies and Third-Party Advertising</h2>
      <p style="font-size:14px;color:#cbd5e1;line-height:1.6;">
        Wanjaaro does not require user accounts or logins. However, this website displays third-party advertisements and may use analytics tools. These third parties (such as Google and analytics providers) may place or read cookies on your browser to serve relevant ads based on your visits to this and other websites.
      </p>
    </section>
    <section style="background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:24px;margin-bottom:20px;">
      <h2 style="font-size:18px;font-weight:700;color:#38bdf8;margin-top:0;">3. No Personal Data Collection</h2>
      <p style="font-size:14px;color:#cbd5e1;line-height:1.6;">
        We do not collect names, email addresses, passwords, phone numbers, or payment card details. All games are completely free to play without registration.
      </p>
    </section>
    ${generateStaticFooter()}
  </div>
`;

const privacyHtml = generateHtml({
  title: 'Privacy Policy | Wanjaaro',
  description: 'Learn about data storage, browser localStorage for scores, and third-party advertising cookies on Wanjaaro.',
  canonicalPath: '/privacy',
  bodyContent: privacyBodyContent,
});
const privacyDir = path.resolve(distDir, 'privacy');
fs.mkdirSync(privacyDir, { recursive: true });
fs.writeFileSync(path.resolve(privacyDir, 'index.html'), privacyHtml, 'utf8');
fs.writeFileSync(path.resolve(distDir, 'privacy.html'), privacyHtml, 'utf8');

// 4c. GENERATE BENCHMARKS & NORMS DATASET PAGE
console.log('Generating pre-rendered benchmarks and empirical dataset page...');
const benchmarksSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Dataset',
      name: 'Global Cognitive & Reflex Performance Norms',
      description:
        'Standardized empirical percentile distributions, median norms, and elite tier thresholds across visual reaction time, working memory span, precision aim acquisition, and typing velocity.',
      url: `${BASE_URL}/benchmarks`,
      creator: {
        '@type': 'Organization',
        name: 'Wanjaaro',
        url: BASE_URL,
      },
      variableMeasured: BENCHMARK_DATASET.map((b) => `${b.name} (${b.metric} in ${b.unit})`),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: BASE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Benchmarks',
          item: `${BASE_URL}/benchmarks`,
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is considered an elite reaction time for competitive esports and athletics?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Visual reaction times under 180ms place individuals in the top 1% (99th percentile) of human performance. Professional esports athletes and martial artists typically record between 170ms and 195ms.',
          },
        },
        {
          '@type': 'Question',
          name: 'Why does the Chimp Memory Test challenge adult humans past 7 items?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Human working memory is subject to Miller\'s Law, maintaining an immediate span of 7 ± 2 items. Young chimpanzees retain remarkable eidetic recall for brief visual configurations, enabling recall of all 9 numbers effortlessly.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does Wanjaaro eliminate latency skew in browser benchmark measurements?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'All Wanjaaro benchmark games run 100% client-side in the web browser using high-resolution hardware timestamps, eliminating the 30ms-120ms network ping delay typical of cloud-hosted tests.',
          },
        },
      ],
    },
  ],
};

const benchmarksBodyContent = `
  <div style="background:#090d16;color:#f8fafc;padding:24px;font-family:system-ui,-apple-system,sans-serif;max-width:1100px;margin:0 auto;line-height:1.6;">
    <nav aria-label="Breadcrumbs" style="margin-bottom:16px;font-size:13px;color:#94a3b8;">
      <a href="/" style="color:#38bdf8;text-decoration:none;">Home</a> &gt; 
      <span style="color:#cbd5e1;">Global Benchmarks &amp; Norms</span>
    </nav>
    <header style="margin-bottom:28px;border-bottom:1px solid #1e293b;padding-bottom:20px;">
      <div style="display:inline-block;padding:4px 12px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);color:#fbbf24;font-size:12px;font-weight:700;border-radius:999px;margin-bottom:12px;">
        ✦ Empirical Cognitive &amp; Reflex Dataset
      </div>
      <h1 style="font-size:32px;font-weight:900;color:#ffffff;margin:0 0 10px 0;letter-spacing:-0.02em;">
        Global Cognitive &amp; Reflex Performance Benchmarks
      </h1>
      <p style="font-size:15px;color:#cbd5e1;max-width:800px;margin:0;line-height:1.7;">
        Standardized empirical reference distributions, median population norms, and elite tier thresholds across reflex latency, memory capacity, aim precision, and puzzle deduction speed. Measured in-browser with zero server lag.
      </p>
    </header>

    <section style="background:#0f172a;border:1px solid #1e293b;border-radius:18px;padding:24px;margin-bottom:32px;">
      <h2 style="font-size:20px;font-weight:800;color:#ffffff;margin:0 0 8px 0;">
        Standardized Performance Distribution Table
      </h2>
      <p style="font-size:13px;color:#94a3b8;margin:0 0 16px 0;">
        Empirical percentile brackets from the 10th percentile through the 99th percentile across primary cognitive benchmarks:
      </p>
      <div style="overflow-x:auto;">
        <table style="width:100%;text-align:left;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr style="border-bottom:1px solid #334155;color:#94a3b8;font-family:monospace;font-size:11px;text-transform:uppercase;">
              <th style="padding:10px 12px;">Discipline</th>
              <th style="padding:10px 12px;">Metric</th>
              <th style="padding:10px 12px;">10th %</th>
              <th style="padding:10px 12px;">25th %</th>
              <th style="padding:10px 12px;color:#38bdf8;font-weight:bold;">50th % (Median)</th>
              <th style="padding:10px 12px;">75th %</th>
              <th style="padding:10px 12px;color:#f59e0b;font-weight:bold;">90th %</th>
              <th style="padding:10px 12px;color:#10b981;font-weight:bold;">99th % (Elite)</th>
              <th style="padding:10px 12px;">Reference Source</th>
            </tr>
          </thead>
          <tbody style="color:#cbd5e1;">
            ${BENCHMARK_DATASET.map(
              (b) => `
              <tr style="border-bottom:1px solid #1e293b;">
                <td style="padding:10px 12px;font-weight:700;color:#ffffff;">
                  <a href="/${b.gameId}" style="color:#38bdf8;text-decoration:none;">${escapeHtml(b.name)}</a>
                </td>
                <td style="padding:10px 12px;font-family:monospace;color:#94a3b8;">${escapeHtml(b.metric)} (${b.unit})</td>
                <td style="padding:10px 12px;font-family:monospace;">${b.p10} ${b.unit}</td>
                <td style="padding:10px 12px;font-family:monospace;">${b.p25} ${b.unit}</td>
                <td style="padding:10px 12px;font-family:monospace;color:#38bdf8;font-weight:bold;background:rgba(56,189,248,0.06);">${b.p50} ${b.unit}</td>
                <td style="padding:10px 12px;font-family:monospace;">${b.p75} ${b.unit}</td>
                <td style="padding:10px 12px;font-family:monospace;color:#f59e0b;font-weight:bold;">${b.p90} ${b.unit}</td>
                <td style="padding:10px 12px;font-family:monospace;color:#10b981;font-weight:bold;background:rgba(16,185,129,0.06);">${b.p99} ${b.unit}</td>
                <td style="padding:10px 12px;font-size:11px;color:#94a3b8;">${escapeHtml(b.source)}</td>
              </tr>
            `
            ).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <section style="background:#0f172a;border:1px solid #1e293b;border-radius:18px;padding:24px;margin-bottom:32px;">
      <h2 style="font-size:18px;font-weight:800;color:#ffffff;margin:0 0 12px 0;">
        Measurement Methodology &amp; Timing Integrity
      </h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:16px;font-size:13px;color:#cbd5e1;line-height:1.6;">
        <div style="background:#090d16;padding:16px;border-radius:12px;border:1px solid #1e293b;">
          <h3 style="font-size:14px;font-weight:700;color:#f59e0b;margin:0 0 6px 0;">⚡ Zero Network Round-Trip Delay</h3>
          <p style="margin:0;">Unlike cloud-hosted reflex tests that transmit input packets over the internet, Wanjaaro benchmarks run 100% locally in your client browser. This eliminates the 30ms to 100ms ping jitter that skews online reflex measurements.</p>
        </div>
        <div style="background:#090d16;padding:16px;border-radius:12px;border:1px solid #1e293b;">
          <h3 style="font-size:14px;font-weight:700;color:#38bdf8;margin:0 0 6px 0;">⏱ High-Resolution Timing Deltas</h3>
          <p style="margin:0;">Timestamps are captured at microsecond resolution relative to display frame presentation callbacks. Input handlers track hardware pointer and keyboard events at the browser event queue level for sub-millisecond accuracy.</p>
        </div>
        <div style="background:#090d16;padding:16px;border-radius:12px;border:1px solid #1e293b;">
          <h3 style="font-size:14px;font-weight:700;color:#10b981;margin:0 0 6px 0;">📚 Sourced Reference Grounding</h3>
          <p style="margin:0;">Percentiles reflect validated distributions from experimental cognitive psychology literature (including Kyoto University chimpanzee studies, Stroop 1935 interference studies, and Schulte grid normative data).</p>
        </div>
      </div>
    </section>

    ${generateStaticFooter()}
  </div>
`;

const benchmarksHtml = generateHtml({
  title: 'Global Cognitive & Reflex Performance Benchmarks | Wanjaaro',
  description:
    'Standardized empirical reference distributions, median population norms, and elite tier thresholds across reflex latency, memory capacity, aim precision, and puzzle deduction speed.',
  canonicalPath: '/benchmarks',
  jsonLd: benchmarksSchema,
  bodyContent: benchmarksBodyContent,
});
const benchmarksDir = path.resolve(distDir, 'benchmarks');
fs.mkdirSync(benchmarksDir, { recursive: true });
fs.writeFileSync(path.resolve(benchmarksDir, 'index.html'), benchmarksHtml, 'utf8');
fs.writeFileSync(path.resolve(distDir, 'benchmarks.html'), benchmarksHtml, 'utf8');

// 5. Ensure GitHub Pages .nojekyll and CNAME
fs.writeFileSync(path.resolve(distDir, '.nojekyll'), '', 'utf8');
if (fs.existsSync(path.resolve(rootDir, 'CNAME'))) {
  fs.copyFileSync(path.resolve(rootDir, 'CNAME'), path.resolve(distDir, 'CNAME'));
}

// 6. Generate _redirects for Netlify / Cloudflare Pages
fs.writeFileSync(path.resolve(distDir, '_redirects'), '/* /index.html 200\n', 'utf8');

// 7. Generate XML Sitemap (sitemap.xml) for Google Search Console, Bing Webmaster, etc.
const todayIso = new Date().toISOString().slice(0, 10);
const sitemapUrls = [
  `<url><loc>${BASE_URL}/</loc><lastmod>${todayIso}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`,
  `<url><loc>${BASE_URL}/benchmarks</loc><lastmod>${todayIso}</lastmod><changefreq>daily</changefreq><priority>0.95</priority></url>`,
  `<url><loc>${BASE_URL}/scores</loc><lastmod>${todayIso}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>`,
  `<url><loc>${BASE_URL}/privacy</loc><lastmod>${todayIso}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`,
  ...CATEGORIES.map(
    (c) =>
      `<url><loc>${BASE_URL}/${c.id}</loc><lastmod>${todayIso}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`
  ),
  ...ALL_GAMES.map(
    (g) =>
      `<url><loc>${BASE_URL}/${g.id}</loc><lastmod>${todayIso}</lastmod><changefreq>weekly</changefreq><priority>0.85</priority></url>`
  ),
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapUrls.join('\n  ')}
</urlset>`;

fs.writeFileSync(path.resolve(distDir, 'sitemap.xml'), sitemapXml, 'utf8');
fs.writeFileSync(path.resolve(rootDir, 'public', 'sitemap.xml'), sitemapXml, 'utf8');

// 8. Generate robots.txt welcoming all search and AI crawlers
const robotsTxt = `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Applebot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;
fs.writeFileSync(path.resolve(distDir, 'robots.txt'), robotsTxt, 'utf8');
fs.writeFileSync(path.resolve(rootDir, 'public', 'robots.txt'), robotsTxt, 'utf8');

// 9. Sync llms.txt and llms-full.txt to dist/
if (fs.existsSync(path.resolve(rootDir, 'public', 'llms.txt'))) {
  fs.copyFileSync(
    path.resolve(rootDir, 'public', 'llms.txt'),
    path.resolve(distDir, 'llms.txt')
  );
}
if (fs.existsSync(path.resolve(rootDir, 'public', 'llms-full.txt'))) {
  fs.copyFileSync(
    path.resolve(rootDir, 'public', 'llms-full.txt'),
    path.resolve(distDir, 'llms-full.txt')
  );
}

console.log('✅ Static page generation completed successfully:');
console.log(`- 1 rich homepage (dist/index.html) with full semantic SSR and Schema.org`);
console.log(`- ${ALL_GAMES.length} plain game routes with semantic SSR fallback & Schema.org JSON-LD`);
console.log(`- ${CATEGORIES.length} plain category routes with collection catalogs`);
console.log(`- ${Object.keys(GAME_ALIASES).length} friendly aliases (e.g. dist/reaction-time/index.html)`);
console.log(`- 1 scores route (dist/scores/index.html)`);
console.log(`- XML sitemap with ${sitemapUrls.length} indexed URLs (sitemap.xml)`);
console.log(`- Robots policy (robots.txt) welcoming all AI & search engines`);
console.log(`- Preserved wanjaaro.com CNAME and llms.txt`);
