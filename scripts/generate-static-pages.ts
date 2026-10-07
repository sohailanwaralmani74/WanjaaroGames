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
  html = html.replace(/<link\s+[^>]*?rel="canonical"[^>]*?>/i, `<link rel="canonical" href="${fullUrl}" />`);

  html = html.replace(/<meta\s+[^>]*?property="og:title"[^>]*?>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`);
  html = html.replace(
    /<meta\s+[^>]*?property="og:description"[^>]*?>/i,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  );
  html = html.replace(/<meta\s+[^>]*?property="og:url"[^>]*?>/i, `<meta property="og:url" content="${fullUrl}" />`);

  html = html.replace(/<meta\s+[^>]*?name="twitter:title"[^>]*?>/i, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
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

function generateStaticFooter(): string {
  return `
    <footer style="margin-top:48px;border-top:1px solid #1e293b;padding-top:24px;font-size:12px;color:#94a3b8;line-height:1.6;">
      <p style="margin:0 0 6px 0;color:#e2e8f0;font-weight:600;">
        Scores are stored only on your device. No data leaves your browser.
      </p>
      <p style="margin:0;color:#64748b;">
        &copy; ${new Date().getFullYear()} ReptileBirds &middot; <a href="https://reptilebirds.com" style="color:#10b981;text-decoration:none;">reptilebirds.com</a>
      </p>
    </footer>
  `;
}

// 1. GENERATE DEDICATED ROOT HTML PAGE FOR EACH GAME IN ALL_GAMES (e.g. /snake-and-ladder)
const snakeAndLadderSeoTitle = 'Snake and Ladder Game Online – Free | Reptile Birds';
const snakeAndLadderSeoDesc =
  'Play Snake and Ladder (Snakes and Ladders) online free at reptilebirds.com. 10x10 jungle board with Solo Race, Daily Board, Vs Computer, and 2-4 Player Local Multiplayer.';

const snakeAndLadderBodyContent = `
  <div style="background:#020617;color:#f8fafc;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;padding:24px;max-width:1024px;margin:0 auto;">
    <div id="ad-slot-top"></div>
    <header style="border-bottom:1px solid #1e293b;padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
      <div>
        <h1 style="font-size:28px;font-weight:800;color:#10b981;margin:0;">Snake and Ladder</h1>
        <p style="font-size:13px;color:#94a3b8;margin:4px 0 0 0;">Play Free Online Snakes and Ladders at reptilebirds.com</p>
      </div>
      <nav style="display:flex;gap:16px;font-size:13px;">
        <a href="/snake-and-ladder" style="color:#10b981;text-decoration:none;font-weight:600;">Snake and Ladder</a>
        <a href="/privacy" style="color:#cbd5e1;text-decoration:none;">Privacy</a>
      </nav>
    </header>
    <main>
      <section style="background:#0f172a;border:1px solid #1e293b;border-radius:20px;padding:28px;margin-bottom:28px;">
        <h2 style="font-size:20px;font-weight:700;color:#ffffff;margin:0 0 12px 0;">How to Play Snake and Ladder Online</h2>
        <p style="font-size:14px;color:#cbd5e1;margin:0 0 12px 0;">
          <strong>Snake and Ladder</strong> (also known as <strong>Snakes and Ladders</strong>) is played on a 10x10 numbered board from 1 to 100 in a classic zigzag path. Players start at 0 with an original SVG bird token (Parrot, Owl, Eagle, or Penguin) and roll a fair six-sided die. Climb the 8 jungle vines to jump ahead, avoid the 8 snake heads that slide you down to their tails, and roll the exact number needed to land on square 100.
        </p>
      </section>
    </main>
    <div id="ad-slot-bottom"></div>
    ${generateStaticFooter()}
  </div>
`;

for (const game of ALL_GAMES) {
  const isSnake = game.id === 'snake-and-ladder';
  const title = isSnake ? snakeAndLadderSeoTitle : `${game.title} – Free Online Game | ReptileBirds`;
  const description = isSnake ? snakeAndLadderSeoDesc : game.summary;
  const canonicalPath = `/${game.id}`;

  const gameSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.title,
    alternateName: isSnake ? 'Snakes and Ladders' : undefined,
    url: `${BASE_URL}${canonicalPath}`,
    description,
    applicationCategory: 'Game',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  const gameHtml = generateHtml({
    title,
    description,
    canonicalPath,
    jsonLd: gameSchema,
    bodyContent: snakeAndLadderBodyContent,
  });

  const gameDir = path.resolve(distDir, game.id);
  fs.mkdirSync(gameDir, { recursive: true });
  fs.writeFileSync(path.resolve(gameDir, 'index.html'), gameHtml, 'utf8');
  fs.writeFileSync(path.resolve(distDir, `${game.id}.html`), gameHtml, 'utf8');
}

// Update dist/index.html with the same rich static fallback
const homeHtml = generateHtml({
  title: snakeAndLadderSeoTitle,
  description: snakeAndLadderSeoDesc,
  canonicalPath: '/',
  bodyContent: snakeAndLadderBodyContent,
});
fs.writeFileSync(path.resolve(distDir, 'index.html'), homeHtml, 'utf8');

// 2. GENERATE PRIVACY POLICY PAGE
const privacyBodyContent = `
  <div style="background:#020617;color:#f8fafc;padding:24px;font-family:system-ui,-apple-system,sans-serif;max-width:960px;margin:0 auto;line-height:1.6;">
    <h1 style="font-size:28px;font-weight:800;color:#ffffff;margin:0 0 12px 0;">Privacy Policy</h1>
    <p style="font-size:14px;color:#cbd5e1;">Scores are stored only on your device. No data leaves your browser.</p>
    ${generateStaticFooter()}
  </div>
`;

const privacyHtml = generateHtml({
  title: 'Privacy Policy | ReptileBirds',
  description: 'Scores are stored only on your device. No data leaves your browser at reptilebirds.com.',
  canonicalPath: '/privacy',
  bodyContent: privacyBodyContent,
});
const privacyDir = path.resolve(distDir, 'privacy');
fs.mkdirSync(privacyDir, { recursive: true });
fs.writeFileSync(path.resolve(privacyDir, 'index.html'), privacyHtml, 'utf8');
fs.writeFileSync(path.resolve(distDir, 'privacy.html'), privacyHtml, 'utf8');

// 3. GENERATE BENCHMARKS PAGE
const benchmarksHtml = generateHtml({
  title: 'Global Benchmarks | ReptileBirds',
  description: 'Standardized reference distributions and percentile norms on ReptileBirds.',
  canonicalPath: '/benchmarks',
});
const benchmarksDir = path.resolve(distDir, 'benchmarks');
fs.mkdirSync(benchmarksDir, { recursive: true });
fs.writeFileSync(path.resolve(benchmarksDir, 'index.html'), benchmarksHtml, 'utf8');
fs.writeFileSync(path.resolve(distDir, 'benchmarks.html'), benchmarksHtml, 'utf8');

// 4. Copy data/snake-facts.json into dist/data/snake-facts.json
const distDataDir = path.resolve(distDir, 'data');
fs.mkdirSync(distDataDir, { recursive: true });
if (fs.existsSync(path.resolve(rootDir, 'data', 'snake-facts.json'))) {
  fs.copyFileSync(
    path.resolve(rootDir, 'data', 'snake-facts.json'),
    path.resolve(distDataDir, 'snake-facts.json')
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

console.log('✅ Static page generation completed for ReptileBirds (reptilebirds.com/snake-and-ladder).');
