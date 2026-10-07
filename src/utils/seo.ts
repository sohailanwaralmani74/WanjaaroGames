interface MetaTagOptions {
  title?: string;
  description?: string;
  path?: string;
}

const DEFAULT_TITLE = 'Snake and Ladder Game Online – Free | Reptile Birds';
const DEFAULT_DESCRIPTION =
  'Play Snake and Ladder (Snakes and Ladders) online free at reptilebirds.com. 10x10 jungle board with Solo Race, Daily Board, Vs Computer, and 2-4 Player Local Multiplayer.';
const BASE_URL = 'https://reptilebirds.com';

export function updateMetaTags({ title, description, path = '/' }: MetaTagOptions) {
  const finalTitle = title || DEFAULT_TITLE;
  const finalDesc = description || DEFAULT_DESCRIPTION;

  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.replace(/\/+$/, '');
  }
  const canonicalUrl = cleanPath === '/' ? `${BASE_URL}/` : `${BASE_URL}${cleanPath}`;

  document.title = finalTitle;

  const setMeta = (selector: string, attr: string, val: string) => {
    const el = document.querySelector(selector);
    if (el) {
      el.setAttribute(attr, val);
    }
  };

  setMeta('meta[name="description"]', 'content', finalDesc);
  setMeta('link[rel="canonical"]', 'href', canonicalUrl);
  setMeta('meta[property="og:title"]', 'content', finalTitle);
  setMeta('meta[property="og:description"]', 'content', finalDesc);
  setMeta('meta[property="og:url"]', 'content', canonicalUrl);
  setMeta('meta[name="twitter:title"]', 'content', finalTitle);
  setMeta('meta[name="twitter:description"]', 'content', finalDesc);
}
