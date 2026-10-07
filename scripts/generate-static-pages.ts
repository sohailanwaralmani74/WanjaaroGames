import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ALL_GAMES } from '../src/data/gamesCatalog';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

const indexHtmlPath = path.resolve(distDir, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  console.error('dist/index.html does not exist! Run vite build first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');

const BASE_URL = 'https://reptilebirds.com';

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

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

  html = html.replace(
    /<meta\s+[^>]*?name="description"[^>]*?>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );

  let cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.replace(/\/+$/, '');
  }
  const fullUrl = cleanPath === '/' ? `${BASE_URL}/` : `${BASE_URL}${cleanPath}`;
  html = html.replace(
    /<link\s+[^>]*?rel="canonical"[^>]*?>/i,
    `<link rel="canonical" href="${fullUrl}" />`
  );

  html = html.replace(
    /<meta\s+[^>]*?property="og:title"[^>]*?>/i,
    `<meta property="og:title" content="${escapeHtml(title)}" />`
  );
  html = html.replace(
    /<meta\s+[^>]*?property="og:description"[^>]*?>/i,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  );
  html = html.replace(
    /<meta\s+[^>]*?property="og:url"[^>]*?>/i,
    `<meta property="og:url" content="${fullUrl}" />`
  );

  html = html.replace(
    /<meta\s+[^>]*?name="twitter:title"[^>]*?>/i,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`
  );
  html = html.replace(
    /<meta\s+[^>]*?name="twitter:description"[^>]*?>/i,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`
  );

  if (jsonLd) {
    const jsonLdTag = `\n    <!-- Page Specific Schema.org Graph -->\n    <script type="application/ld+json">\n${JSON.stringify(
      jsonLd,
      null,
      2
    )}\n    </script>\n  </head>`;
    if (html.includes('<script type="application/ld+json">')) {
      html = html.replace(
        /<script type="application\/ld\+json">[\s\S]*?<\/script>/i,
        `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n    </script>`
      );
    } else {
      html = html.replace('</head>', jsonLdTag);
    }
  }

  if (bodyContent) {
    html = html.replace('<div id="root"></div>', `<div id="root">${bodyContent}</div>`);
  }

  return html;
}

function generateStaticNavBar(activeSlug: string): string {
  return `
    <header style="border-bottom:1px solid #1e293b;padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
      <a href="/" style="font-size:22px;font-weight:800;color:#10b981;text-decoration:none;">ReptileBirds</a>
      <nav aria-label="Primary navigation" style="display:flex;gap:16px;font-size:14px;flex-wrap:wrap;">
        <a href="/" style="color:${activeSlug === 'home' ? '#10b981' : '#cbd5e1'};text-decoration:none;font-weight:${activeSlug === 'home' ? '700' : '500'};">Home</a>
        <a href="/snake-escape" style="color:${activeSlug === 'snake-escape' ? '#fb7185' : '#cbd5e1'};text-decoration:none;font-weight:${activeSlug === 'snake-escape' ? '700' : '500'};">Snake Escape</a>
        <a href="/matching-card-game" style="color:${activeSlug === 'matching-card-game' ? '#38bdf8' : '#cbd5e1'};text-decoration:none;font-weight:${activeSlug === 'matching-card-game' ? '700' : '500'};">Matching Cards</a>
        <a href="/snake-game" style="color:${activeSlug === 'snake-game' ? '#10b981' : '#cbd5e1'};text-decoration:none;font-weight:${activeSlug === 'snake-game' ? '700' : '500'};">Snake Game</a>
        <a href="/snake-and-ladder" style="color:${activeSlug === 'snake-and-ladder' ? '#fbbf24' : '#cbd5e1'};text-decoration:none;font-weight:${activeSlug === 'snake-and-ladder' ? '700' : '500'};">Snake and Ladder</a>
        <a href="/privacy" style="color:#94a3b8;text-decoration:none;">Privacy</a>
      </nav>
    </header>
  `;
}

function generateStaticFooter(): string {
  return `
    <footer style="margin-top:48px;border-top:1px solid #1e293b;padding-top:24px;font-size:12px;color:#94a3b8;line-height:1.6;">
      <p style="margin:0 0 6px 0;color:#e2e8f0;font-weight:600;">
        Scores are stored only on your device. No data leaves your browser.
      </p>
      <p style="margin:0;color:#64748b;">
        &copy; ${new Date().getFullYear()} ReptileBirds
      </p>
    </footer>
  `;
}

// 1. GENERATE HOMEPAGE (dist/index.html)
const homeTitle = 'ReptileBirds – Free Online Reptile & Bird Browser Games';
const homeDesc =
  'Play Snake Escape, Matching Card Game, Snake Game, and Snake and Ladder online free on ReptileBirds. 100% client-side browser games with local high scores and zero accounts.';

const homeBody = `
  <div style="background:#020617;color:#f8fafc;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;padding:24px;max-width:960px;margin:0 auto;">
    <div id="ad-slot-top"></div>
    ${generateStaticNavBar('home')}
    <main>
      <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;">
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:20px;padding:24px;">
          <h2 style="margin:0 0 8px 0;color:#ffffff;">Snake Escape</h2>
          <p style="font-size:14px;color:#cbd5e1;">Slither through a field eating mice while dodging diving Hawks, Peregrine Falcons, Bald Eagles, and Barn Owls.</p>
          <a href="/snake-escape" style="color:#fb7185;font-weight:700;text-decoration:none;">Play Snake Escape &rarr;</a>
        </div>
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:20px;padding:24px;">
          <h2 style="margin:0 0 8px 0;color:#ffffff;">Matching Card Game</h2>
          <p style="font-size:14px;color:#cbd5e1;">Flip cards to match pairs of 9 birds and 9 reptiles across Easy, Medium, Hard, and Expert grids.</p>
          <a href="/matching-card-game" style="color:#38bdf8;font-weight:700;text-decoration:none;">Play Matching Card Game &rarr;</a>
        </div>
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:20px;padding:24px;">
          <h2 style="margin:0 0 8px 0;color:#ffffff;">Snake Game</h2>
          <p style="font-size:14px;color:#cbd5e1;">Guide a python hunting mice on a 15x15, 20x20, or 25x25 grid with 4 modes and 6 unlockable snake species skins.</p>
          <a href="/snake-game" style="color:#10b981;font-weight:700;text-decoration:none;">Play Snake Game &rarr;</a>
        </div>
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:20px;padding:24px;">
          <h2 style="margin:0 0 8px 0;color:#ffffff;">Snake and Ladder</h2>
          <p style="font-size:14px;color:#cbd5e1;">Play classic 10x10 Snake and Ladder with 8 climbing vines, 8 real snake species, and 4 SVG bird tokens.</p>
          <a href="/snake-and-ladder" style="color:#fbbf24;font-weight:700;text-decoration:none;">Play Snake and Ladder &rarr;</a>
        </div>
      </section>
    </main>
    <div id="ad-slot-bottom"></div>
    ${generateStaticFooter()}
  </div>
`;

const homeHtml = generateHtml({
  title: homeTitle,
  description: homeDesc,
  canonicalPath: '/',
  bodyContent: homeBody,
});
fs.writeFileSync(path.resolve(distDir, 'index.html'), homeHtml, 'utf8');

// 2. GENERATE SEPARATE STATIC HTML PAGE AT ROOT FOR EACH GAME (/snake-escape, /matching-card-game, /snake-game, /snake-and-ladder)
const gamePagesConfig: Record<
  string,
  { title: string; description: string; heading: string; bodyHtml: string }
> = {
  'snake-escape': {
    title: 'Snake Escape Game Online – Free | Reptile Birds',
    description:
      'Play Snake Escape online free on ReptileBirds. Slither through an 800x800 field eating mice while dodging diving Hawks, Peregrine Falcons, Bald Eagles, and Barn Owls.',
    heading: 'Snake Escape',
    bodyHtml: `
      <div style="background:#020617;color:#f8fafc;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;padding:24px;max-width:960px;margin:0 auto;">
        <div id="ad-slot-top"></div>
        ${generateStaticNavBar('snake-escape')}
        <main>
          <h1 style="font-size:28px;font-weight:800;color:#10b981;margin:0 0 16px 0;">Snake Escape</h1>
          <section style="background:#0f172a;border:1px solid #1e293b;border-radius:20px;padding:24px;margin-bottom:24px;">
            <h2 style="font-size:20px;color:#ffffff;margin:0 0 10px 0;">How to Play Snake Escape</h2>
            <p style="font-size:14px;color:#cbd5e1;margin:0 0 12px 0;">
              <strong>Snake Escape</strong> is a top-down 2D survival game where you steer a continuous-body snake hunting mice in an 800&times;800 field while birds of prey circle overhead. Watch for tracking ground shadows (1.5s), escape before the 0.6s lock ring fills, hide in tall grass patches to slow tracking, or press <strong>Space</strong> to burrow underground for 2 seconds.
            </p>
            <h2 style="font-size:20px;color:#ffffff;margin:16px 0 10px 0;">Meet the Birds of Prey</h2>
            <p style="font-size:14px;color:#cbd5e1;margin:0 0 12px 0;">
              Survive 30-second waves against 4 distinct aerial predators: <strong>Red-tailed Hawk</strong> (standard dive), <strong>Peregrine Falcon</strong> (Wave 3+, fast tracking &amp; 0.4s lock), <strong>Bald Eagle</strong> (Wave 5+, large strike zone), and <strong>Barn Owl</strong> (Wave 7+ night waves with pulsing warning rings).
            </p>
            <h2 style="font-size:20px;color:#ffffff;margin:16px 0 10px 0;">Tips for Surviving Longer</h2>
            <p style="font-size:14px;color:#cbd5e1;margin:0;">
              Bait raptors into locking onto your position and slither out right before impact for a <strong>+25 Near-Miss bonus</strong>. Collect golden mice for a 4-second speed boost and rare eggs to restore a lost heart.
            </p>
          </section>
        </main>
        <div id="ad-slot-bottom"></div>
        ${generateStaticFooter()}
      </div>
    `,
  },
  'matching-card-game': {
    title: 'Matching Card Game Online – Free Bird & Reptile Memory Game | Reptile Birds',
    description:
      'Play Matching Card Game (Memory Game / Concentration) online free on ReptileBirds. Flip cards to match pairs of 9 birds and 9 reptiles across Easy, Medium, Hard, and Expert grids.',
    heading: 'Matching Card Game',
    bodyHtml: `
      <div style="background:#020617;color:#f8fafc;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;padding:24px;max-width:960px;margin:0 auto;">
        <div id="ad-slot-top"></div>
        ${generateStaticNavBar('matching-card-game')}
        <main>
          <h1 style="font-size:28px;font-weight:800;color:#10b981;margin:0 0 16px 0;">Matching Card Game</h1>
          <section style="background:#0f172a;border:1px solid #1e293b;border-radius:20px;padding:24px;margin-bottom:24px;">
            <h2 style="font-size:20px;color:#ffffff;margin:0 0 10px 0;">How to Play Matching Card Game (Memory Game &amp; Concentration)</h2>
            <p style="font-size:14px;color:#cbd5e1;margin:0;">
              <strong>Matching Card Game</strong>—also known as <strong>Memory Game</strong>, <strong>Concentration</strong>, or <strong>Find the Pairs</strong>—challenges you to flip two face-down cards per turn to find matching pairs of 9 birds and 9 reptiles across Easy (4x3), Medium (4x4), Hard (6x4), and Expert (6x6) grids.
            </p>
          </section>
        </main>
        <div id="ad-slot-bottom"></div>
        ${generateStaticFooter()}
      </div>
    `,
  },
  'snake-game': {
    title: 'Snake Game Online – Free | Reptile Birds',
    description:
      'Play Snake Game online free on ReptileBirds. Hunt mice across 15x15, 20x20, or 25x25 grids, unlock 6 real snake species skins, and master Classic, Wrap-Around, Jungle, and Daily Challenge modes.',
    heading: 'Snake Game',
    bodyHtml: `
      <div style="background:#020617;color:#f8fafc;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;padding:24px;max-width:960px;margin:0 auto;">
        <div id="ad-slot-top"></div>
        ${generateStaticNavBar('snake-game')}
        <main>
          <h1 style="font-size:28px;font-weight:800;color:#10b981;margin:0 0 16px 0;">Snake Game</h1>
          <section style="background:#0f172a;border:1px solid #1e293b;border-radius:20px;padding:24px;margin-bottom:24px;">
            <h2 style="font-size:20px;color:#ffffff;margin:0 0 10px 0;">How to Play Snake Game</h2>
            <p style="font-size:14px;color:#cbd5e1;margin:0;">
              Steer your python using Arrow keys, WASD, touch swipes, or the on-screen D-pad. Eat mice (+10 points &times; speed multiplier) and bonus golden eggs (+50 points) while avoiding walls, obstacles, and your own tail. Unlock 6 SVG snake skins: Ball Python, Green Tree Python, Corn Snake, King Cobra, Garter Snake, and Emerald Boa.
            </p>
          </section>
        </main>
        <div id="ad-slot-bottom"></div>
        ${generateStaticFooter()}
      </div>
    `,
  },
  'snake-and-ladder': {
    title: 'Snake and Ladder Game Online – Free | Reptile Birds',
    description:
      'Play Snake and Ladder (Snakes and Ladders) online free on ReptileBirds. 10x10 jungle board with Solo Race, Daily Board, Vs Computer, and 2-4 Player Local Multiplayer.',
    heading: 'Snake and Ladder',
    bodyHtml: `
      <div style="background:#020617;color:#f8fafc;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;padding:24px;max-width:960px;margin:0 auto;">
        <div id="ad-slot-top"></div>
        ${generateStaticNavBar('snake-and-ladder')}
        <main>
          <h1 style="font-size:28px;font-weight:800;color:#10b981;margin:0 0 16px 0;">Snake and Ladder</h1>
          <section style="background:#0f172a;border:1px solid #1e293b;border-radius:20px;padding:24px;margin-bottom:24px;">
            <h2 style="font-size:20px;color:#ffffff;margin:0 0 10px 0;">How to Play Snake and Ladder Online</h2>
            <p style="font-size:14px;color:#cbd5e1;margin:0;">
              <strong>Snake and Ladder</strong> (also known as <strong>Snakes and Ladders</strong>) is played on a 10x10 numbered board from 1 to 100 in a classic zigzag path. Choose from 4 SVG bird tokens (Parrot, Owl, Eagle, or Penguin), roll the fair 6-sided die on the board, climb the 8 jungle vines, and avoid the 8 real snake species.
            </p>
          </section>
        </main>
        <div id="ad-slot-bottom"></div>
        ${generateStaticFooter()}
      </div>
    `,
  },
};

for (const game of ALL_GAMES) {
  const cfg = gamePagesConfig[game.id] || {
    title: `${game.title} – Free Online | Reptile Birds`,
    description: game.summary,
    heading: game.title,
    bodyHtml: homeBody,
  };
  const canonicalPath = `/${game.id}`;

  const gameSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: cfg.heading,
    url: `${BASE_URL}${canonicalPath}`,
    description: cfg.description,
    applicationCategory: 'Game',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  const gameHtml = generateHtml({
    title: cfg.title,
    description: cfg.description,
    canonicalPath,
    jsonLd: gameSchema,
    bodyContent: cfg.bodyHtml,
  });

  const gameDir = path.resolve(distDir, game.id);
  fs.mkdirSync(gameDir, { recursive: true });
  fs.writeFileSync(path.resolve(gameDir, 'index.html'), gameHtml, 'utf8');
  fs.writeFileSync(path.resolve(distDir, `${game.id}.html`), gameHtml, 'utf8');
}

// 3. GENERATE PRIVACY & BENCHMARKS PAGES
const privacyHtml = generateHtml({
  title: 'Privacy Policy | ReptileBirds',
  description: 'Scores are stored only on your device. No data leaves your browser.',
  canonicalPath: '/privacy',
});
const privacyDir = path.resolve(distDir, 'privacy');
fs.mkdirSync(privacyDir, { recursive: true });
fs.writeFileSync(path.resolve(privacyDir, 'index.html'), privacyHtml, 'utf8');
fs.writeFileSync(path.resolve(distDir, 'privacy.html'), privacyHtml, 'utf8');

const benchmarksHtml = generateHtml({
  title: 'Global Benchmarks | ReptileBirds',
  description: 'Standardized reference distributions and percentile norms on ReptileBirds.',
  canonicalPath: '/benchmarks',
});
const benchmarksDir = path.resolve(distDir, 'benchmarks');
fs.mkdirSync(benchmarksDir, { recursive: true });
fs.writeFileSync(path.resolve(benchmarksDir, 'index.html'), benchmarksHtml, 'utf8');
fs.writeFileSync(path.resolve(distDir, 'benchmarks.html'), benchmarksHtml, 'utf8');

// 4. Copy data/snake-facts.json and data/species-facts.json into dist/data/
const distDataDir = path.resolve(distDir, 'data');
fs.mkdirSync(distDataDir, { recursive: true });
if (fs.existsSync(path.resolve(rootDir, 'data', 'snake-facts.json'))) {
  fs.copyFileSync(
    path.resolve(rootDir, 'data', 'snake-facts.json'),
    path.resolve(distDataDir, 'snake-facts.json')
  );
}
if (fs.existsSync(path.resolve(rootDir, 'data', 'species-facts.json'))) {
  fs.copyFileSync(
    path.resolve(rootDir, 'data', 'species-facts.json'),
    path.resolve(distDataDir, 'species-facts.json')
  );
}

// 5. Ensure GitHub Pages .nojekyll and CNAME
fs.writeFileSync(path.resolve(distDir, '.nojekyll'), '', 'utf8');
if (fs.existsSync(path.resolve(rootDir, 'CNAME'))) {
  fs.copyFileSync(path.resolve(rootDir, 'CNAME'), path.resolve(distDir, 'CNAME'));
}

// 6. Generate _redirects
fs.writeFileSync(path.resolve(distDir, '_redirects'), '/* /index.html 200\n', 'utf8');

// 7. Generate XML Sitemap (sitemap.xml)
const todayIso = new Date().toISOString().slice(0, 10);
const sitemapUrls = [
  `<url><loc>${BASE_URL}/</loc><lastmod>${todayIso}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`,
  ...ALL_GAMES.map(
    (g) =>
      `<url><loc>${BASE_URL}/${g.id}</loc><lastmod>${todayIso}</lastmod><changefreq>daily</changefreq><priority>0.95</priority></url>`
  ),
  `<url><loc>${BASE_URL}/benchmarks</loc><lastmod>${todayIso}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
  `<url><loc>${BASE_URL}/privacy</loc><lastmod>${todayIso}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`,
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapUrls.join('\n  ')}
</urlset>`;

fs.writeFileSync(path.resolve(distDir, 'sitemap.xml'), sitemapXml, 'utf8');
fs.writeFileSync(path.resolve(rootDir, 'public', 'sitemap.xml'), sitemapXml, 'utf8');

console.log(
  '✅ Static pages generated for ReptileBirds: /, /snake-escape, /matching-card-game, /snake-game, and /snake-and-ladder.'
);
