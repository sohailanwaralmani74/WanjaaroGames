import { GameMeta } from '../types/game';

const DEFAULT_TITLE = 'Wanjaaro – Free Instant Mind & Skill Games';
const DEFAULT_DESCRIPTION =
  'Play free instant client-side browser games on Wanjaaro. Test your reflexes, memory, logic, precision, typing, and mental agility with local high score tracking.';
const BASE_URL = 'https://wanjaaro.com';

/**
 * Updates dynamic meta tags for client-side SEO and Answer Engine optimization.
 */
export function updateMetaTags({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  game,
}: {
  title?: string;
  description?: string;
  path?: string;
  game?: GameMeta | null;
}) {
  if (typeof document === 'undefined') return;

  // 1. Update Title
  document.title = title;

  // 2. Helper to set or create meta tag
  const setMeta = (attrName: 'name' | 'property', attrValue: string, content: string) => {
    let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 3. Update Standard Meta Description
  setMeta('name', 'description', description);

  // 4. Update OpenGraph Tags
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', `${BASE_URL}/#${path}`);

  // 5. Update Twitter / X Cards
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);

  // 6. Dynamic JSON-LD for Game / Item Schema
  const existingJsonLd = document.getElementById('dynamic-game-schema');
  if (game) {
    const gameSchema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': game.title,
      'applicationCategory': 'GameApplication',
      'operatingSystem': 'Any Web Browser',
      'description': game.description || game.summary,
      'url': `${BASE_URL}/#/game/${game.id}`,
      'genre': game.category,
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD',
      },
      'featureList': [
        'Zero input lag client-side execution',
        'No registration or login needed',
        'Persistent personal best and high score tracking',
        'Mobile touch and desktop keyboard support',
      ],
    };

    if (existingJsonLd) {
      existingJsonLd.textContent = JSON.stringify(gameSchema);
    } else {
      const script = document.createElement('script');
      script.id = 'dynamic-game-schema';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(gameSchema);
      document.head.appendChild(script);
    }
  } else if (existingJsonLd) {
    existingJsonLd.remove();
  }
}
