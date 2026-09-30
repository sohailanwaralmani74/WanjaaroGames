import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ALL_GAMES, CATEGORIES } from '../src/data/gamesCatalog';
import { GAME_ALIASES } from '../src/utils/routes';

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
}: {
  title: string;
  description: string;
  canonicalPath: string;
  jsonLd?: Record<string, unknown>;
}): string {
  let html = baseHtml;

  // Title
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

  // Meta description
  html = html.replace(
    /<meta\s+[^>]*?name="description"[^>]*?>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );

  // Canonical
  const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
  const fullUrl = `${BASE_URL}${cleanPath === '/' ? '/' : cleanPath}`;
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

  // JSON-LD injection if provided
  if (jsonLd) {
    const jsonLdTag = `\n    <!-- Page Specific Schema.org Entity -->\n    <script type="application/ld+json">\n${JSON.stringify(
      jsonLd,
      null,
      2
    )}\n    </script>\n  </head>`;
    html = html.replace('</head>', jsonLdTag);
  }

  return html;
}

// 1. Generate Game Pages at plain URLs: dist/<game-id>/index.html
for (const game of ALL_GAMES) {
  const pageTitle = `${game.title} – Free Online Reflex & Skill Benchmark | Wanjaaro`;
  const pageDesc = `Play ${game.title} online for free on Wanjaaro. ${game.description || game.summary} Zero lag, instant client-side execution, local best score tracking.`;
  const gameSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: game.title,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Any Modern Web Browser (Desktop, Mobile, Tablet)',
    description: game.description || game.summary,
    url: `${BASE_URL}/${game.id}`,
    genre: game.category,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      '100% Free and Client-Side Execution',
      'Sub-1ms Input Response with 0ms Network Lag',
      'Local High Score and Personal Best Tracking',
      'Full Mobile Touch and Desktop Keyboard Support',
    ],
  };

  const html = generateHtml({
    title: pageTitle,
    description: pageDesc,
    canonicalPath: `/${game.id}`,
    jsonLd: gameSchema,
  });

  const targetDir = path.resolve(distDir, game.id);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.resolve(targetDir, 'index.html'), html, 'utf8');
  // Also write direct .html file for hosts that don't do directory index rewrites
  fs.writeFileSync(path.resolve(distDir, `${game.id}.html`), html, 'utf8');

  // Legacy fallback: /game/<id>/index.html with 301-equivalent redirect to plain URL
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

// 2. Generate Category Pages at plain URLs: dist/<category-id>/index.html and dist/<category-id>.html
for (const cat of CATEGORIES) {
  const pageTitle = `${cat.name} Games – Free Mind & Reflex Benchmarks | Wanjaaro`;
  const pageDesc = `Play free instant ${cat.name} games on Wanjaaro. ${cat.shortDesc} No registration, 100% client-side, zero latency.`;

  const html = generateHtml({
    title: pageTitle,
    description: pageDesc,
    canonicalPath: `/${cat.id}`,
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

// 3. Generate Friendly Aliases at plain URLs: dist/<alias>/index.html and dist/<alias>.html
for (const [alias, targetGameId] of Object.entries(GAME_ALIASES)) {
  const targetGame = ALL_GAMES.find((g) => g.id === targetGameId);
  if (!targetGame) continue;
  const pageTitle = `${targetGame.title} – Free Online Reflex & Skill Benchmark | Wanjaaro`;
  const pageDesc = `Play ${targetGame.title} online for free on Wanjaaro. ${targetGame.description || targetGame.summary} Zero lag, instant client-side execution, local best score tracking.`;

  const html = generateHtml({
    title: pageTitle,
    description: pageDesc,
    canonicalPath: `/${targetGame.id}`,
  });

  const targetDir = path.resolve(distDir, alias);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.resolve(targetDir, 'index.html'), html, 'utf8');
  fs.writeFileSync(path.resolve(distDir, `${alias}.html`), html, 'utf8');
}

// 4. Generate Scores / Leaderboard page at plain URL: dist/scores/index.html and dist/scores.html
const scoresHtml = generateHtml({
  title: 'Top High Scores & Leaderboards | Wanjaaro',
  description: 'View top scores, reaction latency benchmarks, and personal best records across all instant games on Wanjaaro.',
  canonicalPath: '/scores',
});
const scoresDir = path.resolve(distDir, 'scores');
fs.mkdirSync(scoresDir, { recursive: true });
fs.writeFileSync(path.resolve(scoresDir, 'index.html'), scoresHtml, 'utf8');
fs.writeFileSync(path.resolve(distDir, 'scores.html'), scoresHtml, 'utf8');

// 5. Ensure GitHub Pages .nojekyll and CNAME
fs.writeFileSync(path.resolve(distDir, '.nojekyll'), '', 'utf8');
if (fs.existsSync(path.resolve(rootDir, 'CNAME'))) {
  fs.copyFileSync(path.resolve(rootDir, 'CNAME'), path.resolve(distDir, 'CNAME'));
}

// 6. Generate _redirects for Netlify / Cloudflare Pages
fs.writeFileSync(path.resolve(distDir, '_redirects'), '/* /index.html 200\n', 'utf8');

console.log('✅ Static page generation completed successfully:');
console.log(`- ${ALL_GAMES.length} plain game routes (e.g. dist/reflex-reaction-time/index.html)`);
console.log(`- ${CATEGORIES.length} plain category routes (e.g. dist/reflex-reaction/index.html)`);
console.log(`- ${Object.keys(GAME_ALIASES).length} friendly aliases (e.g. dist/reaction-time/index.html)`);
console.log(`- 1 scores route (dist/scores/index.html)`);
console.log(`- Legacy redirects for /game/* and /category/*`);
console.log(`- _redirects file for modern SPA web hosting`);
