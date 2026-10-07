import React, { useState, useEffect } from 'react';
import { SnakeAndLadderGame } from './games/snakeAndLadder/SnakeAndLadderGame';
import { WanjaaroLogo } from './components/WanjaaroLogo';
import { BenchmarksView } from './components/BenchmarksView';
import { PrivacyView } from './components/PrivacyView';
import { updateMetaTags } from './utils/seo';
import { CheckCircle, BarChart2, Gamepad2 } from 'lucide-react';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<{
    view: 'game' | 'benchmarks' | 'privacy';
  }>({ view: 'game' });

  const getCurrentCleanPath = (): string => {
    if (window.location.hash.startsWith('#/')) {
      const cleanFromHash = window.location.hash.slice(1);
      window.history.replaceState(null, '', cleanFromHash);
      return cleanFromHash;
    }
    const path = window.location.pathname || '/';
    if (window.location.search.startsWith('?/')) {
      const cleanFromSearch = '/' + window.location.search.slice(2).replace(/~and~/g, '&');
      window.history.replaceState(null, '', cleanFromSearch);
      return cleanFromSearch;
    }
    return path;
  };

  const handleRouteChange = () => {
    const rawPath = getCurrentCleanPath();
    const slug = rawPath.replace(/^\//, '').replace(/\/$/, '').replace(/\.html$/, '');

    if (window.location.pathname.length > 1 && window.location.pathname.endsWith('/')) {
      const cleanPath = window.location.pathname.replace(/\/+$/, '');
      window.history.replaceState(null, '', cleanPath + window.location.search);
    }

    if (slug === 'benchmarks') {
      setCurrentRoute({ view: 'benchmarks' });
      updateMetaTags({
        title: 'Global Benchmarks | ReptileBirds',
        description: 'Standardized reference distributions and percentile tools on ReptileBirds.',
        path: '/benchmarks',
      });
      return;
    }

    if (slug === 'privacy') {
      setCurrentRoute({ view: 'privacy' });
      updateMetaTags({
        title: 'Privacy Policy | ReptileBirds',
        description:
          'ReptileBirds is committed to user privacy. Scores are stored only on your device.',
        path: '/privacy',
      });
      return;
    }

    // Default & /snake-and-ladder route
    setCurrentRoute({ view: 'game' });
    updateMetaTags({
      title: 'Snake and Ladder Game Online – Free | Reptile Birds',
      description:
        'Play Snake and Ladder (Snakes and Ladders) online free at reptilebirds.com. 10x10 jungle board with Solo Race, Daily Board, Vs Computer, and 2-4 Player Local Multiplayer.',
      path: slug === 'snake-and-ladder' ? '/snake-and-ladder' : '/',
    });
  };

  useEffect(() => {
    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  const navigateTo = (newPath: string) => {
    let clean = newPath;
    if (clean.length > 1 && clean.endsWith('/')) {
      clean = clean.replace(/\/+$/, '');
    }
    if (window.location.pathname !== clean) {
      window.history.pushState(null, '', clean);
    }
    handleRouteChange();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <a
            href="/snake-and-ladder"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/snake-and-ladder');
            }}
            className="cursor-pointer shrink-0 no-underline"
          >
            <WanjaaroLogo size="sm" showTagline />
          </a>

          <nav aria-label="Main navigation" className="flex items-center gap-4 text-xs font-medium">
            <a
              href="/snake-and-ladder"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/snake-and-ladder');
              }}
              className={`flex items-center gap-1.5 transition-colors no-underline ${
                currentRoute.view === 'game'
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-300 hover:text-emerald-400'
              }`}
            >
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
              <span>Snake and Ladder</span>
            </a>

            <a
              href="/benchmarks"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/benchmarks');
              }}
              className={`hidden sm:flex items-center gap-1.5 transition-colors no-underline ${
                currentRoute.view === 'benchmarks'
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-300 hover:text-emerald-400'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              <span>Benchmarks</span>
            </a>

            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/privacy');
              }}
              className={`flex items-center gap-1.5 transition-colors no-underline ${
                currentRoute.view === 'privacy'
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-300 hover:text-emerald-400'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Privacy</span>
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {currentRoute.view === 'benchmarks' ? (
          <BenchmarksView
            onNavigateGame={() => navigateTo('/snake-and-ladder')}
            onNavigateHome={() => navigateTo('/snake-and-ladder')}
          />
        ) : currentRoute.view === 'privacy' ? (
          <PrivacyView
            onNavigateHome={() => navigateTo('/snake-and-ladder')}
            onNavigateCategory={() => navigateTo('/snake-and-ladder')}
          />
        ) : (
          <SnakeAndLadderGame />
        )}
      </main>

      {/* Required Footer with Exact Privacy & Domain Statement */}
      <footer className="bg-slate-950 border-t border-slate-800/80 px-4 sm:px-8 py-8 text-xs text-slate-400">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-semibold text-slate-200">
              Scores are stored only on your device. No data leaves your browser.
            </p>
            <p className="text-slate-400">
              © {new Date().getFullYear()} ReptileBirds ·{' '}
              <a
                href="https://reptilebirds.com"
                className="text-emerald-400 hover:underline font-medium"
              >
                reptilebirds.com
              </a>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/snake-and-ladder"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/snake-and-ladder');
              }}
              className="hover:text-emerald-400 transition-colors no-underline"
            >
              Snake and Ladder
            </a>
            <a
              href="/benchmarks"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/benchmarks');
              }}
              className="hover:text-emerald-400 transition-colors no-underline"
            >
              Benchmarks
            </a>
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/privacy');
              }}
              className="hover:text-emerald-400 transition-colors no-underline"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
