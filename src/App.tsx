import React, { useState, useEffect, useMemo } from 'react';
import { ALL_GAMES, CATEGORIES } from './data/gamesCatalog';
import { getRecentGames, getScore } from './utils/storage';
import { sound } from './utils/sound';
import { GameContainer } from './components/GameContainer';
import { LeaderboardModal } from './components/LeaderboardModal';
import { WanjaaroLogo } from './components/WanjaaroLogo';
import { WanjaaroSEOSection } from './components/WanjaaroSEOSection';
import { BenchmarksView } from './components/BenchmarksView';
import { PrivacyView } from './components/PrivacyView';
import { DesktopSidebarAdLayout } from './components/ads/DesktopSidebarAdLayout';
import { TitleIntroAdBanner } from './components/ads/TitleIntroAdBanner';
import { ClosableStickyMobileAd } from './components/ads/ClosableStickyMobileAd';
import { DesktopSideRails } from './components/ads/DesktopSideRails';
import { AdBanner } from './components/ads/AdBanner';
import { updateMetaTags } from './utils/seo';
import {
  findGameBySlugOrId,
  findCategoryBySlug,
  getGameUrl,
  getCategoryUrl,
} from './utils/routes';
import {
  Search,
  Trophy,
  Dices,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Filter,
  CheckCircle,
  Menu,
  X,
  BarChart2,
} from 'lucide-react';

export default function App() {
  // Navigation Route State
  const [currentRoute, setCurrentRoute] = useState<{
    view: 'home' | 'game' | 'category' | 'benchmarks' | 'privacy';
    param?: string;
  }>({ view: 'home' });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdsEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(sound.isSoundMuted());
  const [recentGameIds, setRecentGameIds] = useState<string[]>([]);

  // Helper to extract clean path from pathname or legacy hash fallback
  const getCurrentCleanPath = (): string => {
    // If user arrived with legacy hash like /#/game/xyz or /#xyz, seamlessly convert to clean pathname
    if (window.location.hash.startsWith('#/')) {
      let cleanFromHash = window.location.hash.slice(1);
      cleanFromHash = cleanFromHash.replace(/^\/game\//, '/').replace(/^\/category\//, '/');
      window.history.replaceState(null, '', cleanFromHash);
      return cleanFromHash;
    }
    const path = window.location.pathname || '/';
    // Fallback if 404 query string redirect wasn't consumed
    if (window.location.search.startsWith('?/')) {
      let cleanFromSearch = '/' + window.location.search.slice(2).replace(/~and~/g, '&');
      cleanFromSearch = cleanFromSearch.replace(/^\/game\//, '/').replace(/^\/category\//, '/');
      window.history.replaceState(null, '', cleanFromSearch);
      return cleanFromSearch;
    }
    return path;
  };

  // Parse Clean Plain URL Path for deep-linking & dynamic SEO metadata
  const handleRouteChange = () => {
    const rawPath = getCurrentCleanPath();
    let slug = rawPath.replace(/^\//, '').replace(/\/$/, '');

    // Clean trailing slashes from browser address bar (except root '/')
    if (window.location.pathname.length > 1 && window.location.pathname.endsWith('/')) {
      const cleanPath = window.location.pathname.replace(/\/+$/, '');
      window.history.replaceState(null, '', cleanPath + window.location.search);
    }

    // Seamless migration: If URL contains old /game/ or /category/, strip it and clean browser address bar
    if (slug.startsWith('game/')) {
      slug = slug.replace(/^game\//, '');
      window.history.replaceState(null, '', `/${slug}`);
    } else if (slug.startsWith('category/')) {
      slug = slug.replace(/^category\//, '');
      window.history.replaceState(null, '', `/${slug}`);
    }

    if (!slug) {
      setCurrentRoute({ view: 'home' });
      updateMetaTags({ path: '/' });
      setRecentGameIds(getRecentGames());
      return;
    }

    if (slug === 'scores') {
      setIsLeaderboardOpen(true);
      setCurrentRoute({ view: 'home' });
      updateMetaTags({
        title: 'Top High Scores & Leaderboards | Wanjaaro',
        description: 'View top scores, reaction latency benchmarks, and personal best records across all instant games on Wanjaaro.',
        path: '/scores',
      });
      setRecentGameIds(getRecentGames());
      return;
    }

    if (slug === 'benchmarks') {
      setCurrentRoute({ view: 'benchmarks' });
      updateMetaTags({
        title: 'Global Cognitive & Reflex Performance Benchmarks | Wanjaaro',
        description: 'Standardized empirical reference distributions, median population norms, and elite tier thresholds across reflex latency, memory capacity, aim precision, and puzzle deduction speed.',
        path: '/benchmarks',
      });
      setRecentGameIds(getRecentGames());
      return;
    }

    if (slug === 'privacy') {
      setCurrentRoute({ view: 'privacy' });
      updateMetaTags({
        title: 'Privacy Policy | Wanjaaro',
        description: 'Wanjaaro is committed to user privacy. 100% free client-side gameplay, zero mandatory accounts, transparent local storage disclosure.',
        path: '/privacy',
      });
      setRecentGameIds(getRecentGames());
      return;
    }

    // 1. Try finding game by exact ID, alias, or stripped name
    const matchedGame = findGameBySlugOrId(slug);
    if (matchedGame) {
      setCurrentRoute({ view: 'game', param: matchedGame.id });
      updateMetaTags({
        title: `${matchedGame.title} – Free Online Reflex & Skill Benchmark | Wanjaaro`,
        description: `Play ${matchedGame.title} online for free on Wanjaaro. ${matchedGame.description || matchedGame.summary} Zero lag, instant client-side execution, local best score tracking.`,
        path: `/${matchedGame.id}`,
        game: matchedGame,
      });
      setRecentGameIds(getRecentGames());
      return;
    }

    // 2. Try finding category
    const matchedCategory = findCategoryBySlug(slug);
    if (matchedCategory) {
      setCurrentRoute({ view: 'category', param: matchedCategory.id });
      updateMetaTags({
        title: `${matchedCategory.name} Games – Free Mind & Reflex Benchmarks | Wanjaaro`,
        description: `Play free instant ${matchedCategory.name} games on Wanjaaro. ${matchedCategory.shortDesc} No registration, 100% client-side, zero latency.`,
        path: `/${matchedCategory.id}`,
      });
      setRecentGameIds(getRecentGames());
      return;
    }

    // Fallback: Home
    setCurrentRoute({ view: 'home' });
    updateMetaTags({ path: '/' });
    setRecentGameIds(getRecentGames());
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

  const navigateToHome = () => {
    navigateTo('/');
  };

  const navigateToGame = (gameId: string) => {
    navigateTo(getGameUrl(gameId));
  };

  const navigateToCategory = (catId: string) => {
    navigateTo(getCategoryUrl(catId));
  };

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Launch a random game
  const handleRandomGame = () => {
    const randomIdx = Math.floor(Math.random() * ALL_GAMES.length);
    navigateToGame(ALL_GAMES[randomIdx].id);
  };

  // Filtered games based on category or search term
  const filteredGames = useMemo(() => {
    let result = ALL_GAMES;

    if (currentRoute.view === 'category' && currentRoute.param) {
      result = result.filter((g) => g.category === currentRoute.param);
    } else if (selectedCategory !== 'all') {
      result = result.filter((g) => g.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          (g.description || g.summary).toLowerCase().includes(q) ||
          g.mechanic.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [searchQuery, selectedCategory, currentRoute]);

  // Current active game object if on game view
  const activeGame = currentRoute.view === 'game' && currentRoute.param
    ? ALL_GAMES.find((g) => g.id === currentRoute.param)
    : null;

  // Active category object if on category view
  const activeCategory = currentRoute.view === 'category' && currentRoute.param
    ? CATEGORIES.find((c) => c.id === currentRoute.param)
    : null;

  // Games marked as recently played
  const recentGames = useMemo(() => {
    return recentGameIds
      .map((id) => ALL_GAMES.find((g) => g.id === id))
      .filter(Boolean) as typeof ALL_GAMES;
  }, [recentGameIds]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black pb-24 lg:pb-0">
      {/* Ultra-Wide Desktop Side Rails (160x600 Skyscraper in outer gutters on 2xl: >= 1536px) */}
      {isAdsEnabled && <DesktopSideRails />}

      {/* Mobile & Tablet Closable Sticky Bottom Ad (Shown on catalog & browsing views so it NEVER overlaps active gameplay) */}
      {isAdsEnabled && currentRoute.view !== 'game' && <ClosableStickyMobileAd />}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-neutral-950/85 backdrop-blur-md border-b border-neutral-850 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigateToHome();
            }}
            className="cursor-pointer shrink-0 no-underline"
          >
            <WanjaaroLogo size="sm" showTagline />
          </a>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentRoute.view !== 'home') {
                    navigateToHome();
                  }
                }}
                aria-label="Search all games"
                placeholder="Search games by title, mechanic, skill..."
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-400 text-xs py-2 pl-9 pr-4 rounded-xl text-white outline-none transition-colors placeholder:text-neutral-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="text-xs text-neutral-400 hover:text-white absolute right-3 top-1/2 -translate-y-1/2"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Desktop & Tablet Navigation Controls (Intact on Tablet/Desktop, Hidden on Mobile) */}
          <div className="hidden sm:flex items-center gap-2">
            <a
              href="/benchmarks"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/benchmarks');
              }}
              title="Global Cognitive Benchmarks & Percentiles"
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-amber-400 transition-colors flex items-center gap-1.5 text-xs font-medium no-underline"
            >
              <BarChart2 className="w-4 h-4 text-amber-400" />
              <span>Benchmarks</span>
            </a>

            <button
              onClick={handleRandomGame}
              title="Launch Random Game"
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-amber-400 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Dices className="w-4 h-4 text-amber-400" />
              <span>Random Pick</span>
            </button>

            <a
              href="/scores"
              onClick={(e) => {
                e.preventDefault();
                setIsLeaderboardOpen(true);
              }}
              title="View Local High Scores"
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-amber-400 transition-colors flex items-center gap-1.5 text-xs font-medium no-underline"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Trophies</span>
            </a>

            <button
              onClick={toggleSound}
              title={isMuted ? 'Unmute' : 'Mute'}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>

          {/* Mobile Hamburger Menu Toggle Button (Visible only on Mobile <640px) */}
          <div className="flex sm:hidden items-center gap-1.5">
            <button
              onClick={toggleSound}
              title={isMuted ? 'Unmute' : 'Mute'}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={isMobileMenuOpen}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 hover:text-amber-400 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentRoute.view !== 'home') navigateToHome();
              }}
              aria-label="Search all games"
              placeholder="Search games by title or skill..."
              className="w-full bg-neutral-900 border border-neutral-800 text-xs py-2 pl-9 pr-3 rounded-xl text-white outline-none"
            />
          </div>
        </div>

        {/* Mobile Hamburger Dropdown Drawer (Mobile Only) */}
        {isMobileMenuOpen && (
          <div className="sm:hidden mt-3 pt-3 border-t border-neutral-850 space-y-2 animate-in slide-in-from-top-2 duration-150">
            <button
              onClick={() => {
                handleRandomGame();
                setIsMobileMenuOpen(false);
              }}
              className="w-full p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 hover:text-amber-400 flex items-center justify-between text-xs font-medium transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Dices className="w-4 h-4 text-amber-400" />
                <span>Play Random Game</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">Instant pick</span>
            </button>

            <a
              href="/scores"
              onClick={(e) => {
                e.preventDefault();
                setIsLeaderboardOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 hover:text-amber-400 flex items-center justify-between text-xs font-medium transition-colors no-underline"
            >
              <div className="flex items-center gap-2.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>My High Scores &amp; Trophies</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Local Save</span>
            </a>

            <a
              href="/benchmarks"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/benchmarks');
                setIsMobileMenuOpen(false);
              }}
              className="w-full p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 hover:text-amber-400 flex items-center justify-between text-xs font-medium transition-colors no-underline"
            >
              <div className="flex items-center gap-2.5">
                <BarChart2 className="w-4 h-4 text-amber-400" />
                <span>Global Benchmarks &amp; Data</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">Dataset</span>
            </a>

            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/privacy');
                setIsMobileMenuOpen(false);
              }}
              className="w-full p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 hover:text-amber-400 flex items-center justify-between text-xs font-medium transition-colors no-underline"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Privacy &amp; Data Policy</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">Disclosures</span>
            </a>

            <div className="pt-2 border-t border-neutral-900">
              <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-2 px-1">
                Browse Skill Categories
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <a
                    key={cat.id}
                    href={`/${cat.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToCategory(cat.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-left text-xs text-neutral-300 hover:text-amber-400 flex items-center gap-1.5 truncate transition-colors no-underline"
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {currentRoute.view === 'benchmarks' ? (
          <BenchmarksView
            onNavigateGame={navigateToGame}
            onNavigateHome={navigateToHome}
          />
        ) : currentRoute.view === 'privacy' ? (
          <PrivacyView
            onNavigateHome={navigateToHome}
            onNavigateCategory={navigateToCategory}
          />
        ) : currentRoute.view === 'game' && activeGame ? (
          <GameContainer
            game={activeGame}
            onNavigateHome={navigateToHome}
            onNavigateGame={navigateToGame}
            onNavigateCategory={navigateToCategory}
          />
        ) : currentRoute.view === 'category' && activeCategory ? (
          /* Category Dedicated Page */
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-in fade-in duration-300">
            {/* Category Header */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activeCategory.icon}</span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{activeCategory.name}</h1>
                </div>
                <p className="text-sm text-neutral-400 max-w-2xl">{activeCategory.description}</p>
                <div className="flex items-center gap-2 pt-2 text-xs font-mono text-neutral-400">
                  <span className="text-amber-400 font-bold">{filteredGames.length} Games</span>
                  <span>•</span>
                  <span>100% Client-Side</span>
                  <span>•</span>
                  <span>Local Best Tracking</span>
                </div>
              </div>
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToHome();
                }}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded-xl text-xs font-medium border border-neutral-700 self-start md:self-center transition-colors no-underline"
              >
                ← Back to All Categories
              </a>
            </div>

            {/* Mobile & Tablet Ad under title & intro */}
            <div className="lg:hidden">
              <TitleIntroAdBanner slotId={`wanjaaro-cat-${activeCategory.id}-intro`} />
            </div>

            {/* Desktop 2-Column: Left 75% Category Grid + Right 25% Sticky Ads Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className={isAdsEnabled ? 'lg:col-span-3 space-y-6' : 'lg:col-span-4 space-y-6'}>
                {/* Games in Category Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredGames.map((game) => {
                    const stat = getScore(game.id);
                    return (
                      <a
                        key={game.id}
                        href={`/${game.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToGame(game.id);
                        }}
                        className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between group shadow-sm no-underline text-inherit"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-3xl">{game.icon}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                                game.difficulty === 'Easy'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : game.difficulty === 'Medium'
                                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                  : 'bg-rose-950 text-rose-400 border border-rose-800'
                              }`}
                            >
                              {game.difficulty}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                            {game.title}
                          </h3>
                          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                            {game.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                          <span className="text-neutral-500 font-mono text-[11px]">{game.mechanic}</span>
                          {stat ? (
                            <span className="font-mono font-bold text-amber-400">Best: {stat.formattedScore}</span>
                          ) : (
                            <span className="text-neutral-600">Unplayed</span>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>

                {/* Cross-Link Other Disciplines (Eliminating Category Orphans) */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>🧭</span> Explore Other Skill Disciplines
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {CATEGORIES.filter((c) => c.id !== activeCategory.id).map((otherCat) => (
                      <a
                        key={otherCat.id}
                        href={`/${otherCat.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToCategory(otherCat.id);
                        }}
                        className="p-3 rounded-xl bg-neutral-950/70 hover:bg-neutral-850 border border-neutral-800/80 hover:border-neutral-700 transition-colors flex items-center gap-2.5 text-xs text-neutral-300 hover:text-amber-400 no-underline"
                      >
                        <span className="text-base">{otherCat.icon}</span>
                        <div className="truncate">
                          <div className="font-semibold truncate">{otherCat.name}</div>
                          <div className="text-[10px] text-neutral-500 font-mono">{otherCat.gameCount} games</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right 25% Desktop Ads Column (Sticky, scrolls only when bottom matches loaded page bottom) */}
              {isAdsEnabled && (
                <aside
                  aria-label="Desktop 25% Right Sponsored Column"
                  className="hidden lg:block lg:col-span-1 h-full select-none"
                >
                  <div className="sticky top-20">
                    <DesktopSidebarAdLayout />
                  </div>
                </aside>
              )}
            </div>
          </div>
        ) : (
          /* Homepage Catalog View */
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10">
            {/* Hero Banner */}
            <section className="relative overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl">
              {/* Subtle background grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                  backgroundSize: '24px 24px',
                }}
              />

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Expanding Mind &amp; Skill Arcade
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto">
                Train Your Reflexes, Memory, Logic &amp; Speed
              </h1>

              <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                A browser-based arcade engineered for instant cognitive training, precision benchmarks, and casual amusement.
                100% free and client-side with persistent local high scores and no account registration required.
              </p>

              {/* Dynamic Stats Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-4 text-center">
                <div className="p-3 bg-neutral-950/70 border border-neutral-850 rounded-xl">
                  <div className="text-2xl font-mono font-bold text-amber-400">{ALL_GAMES.length}+</div>
                  <div className="text-[11px] text-neutral-400 uppercase tracking-wider">Instant Games</div>
                </div>
                <div className="p-3 bg-neutral-950/70 border border-neutral-850 rounded-xl">
                  <div className="text-2xl font-mono font-bold text-emerald-400">{CATEGORIES.length}</div>
                  <div className="text-[11px] text-neutral-400 uppercase tracking-wider">Skill Categories</div>
                </div>
                <div className="p-3 bg-neutral-950/70 border border-neutral-850 rounded-xl">
                  <div className="text-2xl font-mono font-bold text-cyan-400">0</div>
                  <div className="text-[11px] text-neutral-400 uppercase tracking-wider">Logins Required</div>
                </div>
                <div className="p-3 bg-neutral-950/70 border border-neutral-850 rounded-xl">
                  <div className="text-2xl font-mono font-bold text-rose-400">100%</div>
                  <div className="text-[11px] text-neutral-400 uppercase tracking-wider">Local &amp; Private</div>
                </div>
              </div>
            </section>

            {/* Recently Played Shelf */}
            {recentGames.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" /> Jump Back In (Recently Played)
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {recentGames.map((rg) => {
                    const stat = getScore(rg.id);
                    return (
                      <a
                        key={rg.id}
                        href={`/${rg.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToGame(rg.id);
                        }}
                        className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 p-3.5 rounded-xl cursor-pointer transition-colors flex flex-col justify-between group no-underline text-inherit"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{rg.icon}</span>
                          <span className="text-xs font-bold text-white truncate group-hover:text-amber-400">
                            {rg.title}
                          </span>
                        </div>
                        {stat && (
                          <div className="mt-2 text-[11px] font-mono text-amber-400">
                            Best: {stat.formattedScore}
                          </div>
                        )}
                      </a>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Ad under Title & Intro description (Mobile & Tablet priority) */}
            <div className="lg:hidden">
              <TitleIntroAdBanner slotId="wanjaaro-home-intro-banner" />
            </div>

            {/* Desktop 2-Column Layout: Left 75% Games & Content + Right 25% Sticky Ads */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left 75% Column on Desktop (or Full Width on Mobile/Tablet) */}
              <div className={`space-y-10 ${isAdsEnabled ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
                {/* Category Filter Pills */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-bold text-white">Browse Categories:</span>
                    </div>
                    <span className="text-xs text-neutral-400 font-mono">
                      Showing <strong>{filteredGames.length}</strong> Games
                    </span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                          : 'bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800'
                      }`}
                    >
                      All Games ({ALL_GAMES.length})
                    </button>
                    {CATEGORIES.map((cat) => (
                      <a
                        key={cat.id}
                        href={`/${cat.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToCategory(cat.id);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 no-underline ${
                          selectedCategory === cat.id
                            ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                            : 'bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </a>
                    ))}
                  </div>
                </section>

                {/* Games Grid (All Games Available) */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredGames.map((game) => {
                    const stat = getScore(game.id);
                    return (
                      <a
                        key={game.id}
                        href={`/${game.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToGame(game.id);
                        }}
                        className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between group shadow-sm no-underline text-inherit"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-3xl">{game.icon}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                                game.difficulty === 'Easy'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : game.difficulty === 'Medium'
                                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                  : 'bg-rose-950 text-rose-400 border border-rose-800'
                              }`}
                            >
                              {game.difficulty}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                            {game.title}
                          </h3>
                          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                            {game.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                          <span className="text-neutral-500 font-mono text-[11px]">{game.mechanic}</span>
                          {stat ? (
                            <span className="font-mono font-bold text-amber-400">Best: {stat.formattedScore}</span>
                          ) : (
                            <span className="text-neutral-600">Unplayed</span>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </section>

                {/* Dedicated Cognitive Disciplines Directory (Guarantees crawlable internal links to all 12 categories) */}
                <section className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                        <span>🧠</span> All 12 Cognitive &amp; Skill Categories
                      </h2>
                      <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                        Explore dedicated benchmark collections grouped by neural, reflex, and logic disciplines.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-amber-400 font-semibold">{CATEGORIES.length} Categories</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {CATEGORIES.map((cat) => (
                      <a
                        key={cat.id}
                        href={`/${cat.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToCategory(cat.id);
                        }}
                        className="p-4 rounded-2xl bg-neutral-950/70 hover:bg-neutral-850 border border-neutral-800/80 hover:border-neutral-700 transition-all hover:-translate-y-0.5 group flex flex-col justify-between space-y-3 no-underline text-inherit"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">{cat.icon}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800 group-hover:border-amber-400/40 group-hover:text-amber-400 transition-colors">
                              {cat.gameCount} games
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                            {cat.name}
                          </h3>
                          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                            {cat.shortDesc}
                          </p>
                        </div>
                        <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1 pt-1">
                          <span>Explore Category</span>
                          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>

                {/* Bottom Leaderboard Banner */}
                {isAdsEnabled && (
                  <section aria-label="Catalog Sponsored Banner" className="w-full">
                    <AdBanner slotType="leaderboard" slotId="wanjaaro-home-bottom-banner" />
                  </section>
                )}
              </div>

              {/* Right 25% Column on Desktop: Sticky Ad Unit */}
              {isAdsEnabled && (
                <aside
                  aria-label="Desktop 25% Right Sponsored Column"
                  className="hidden lg:block lg:col-span-1 h-full select-none"
                >
                  <div className="sticky top-20">
                    <DesktopSidebarAdLayout />
                  </div>
                </aside>
              )}
            </div>

            {/* Rankable SEO & GEO Content Section with FAQs */}
            <WanjaaroSEOSection />
          </div>
        )}
      </main>

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        onSelectGame={navigateToGame}
      />

      {/* Platform Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-850 px-4 sm:px-8 py-10 mt-12 text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <WanjaaroLogo size="sm" showTagline />
            <p className="leading-relaxed">
              An expanding ecosystem of instant, high-performance browser games focused on mind, skill, reaction, memory, reflex, puzzle, and casual entertainment.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200 mb-3">Categories</h4>
            <ul className="space-y-1.5">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`/${cat.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToCategory(cat.id);
                    }}
                    className="hover:text-amber-400 transition-colors block"
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200 mb-3">More Categories</h4>
            <ul className="space-y-1.5">
              {CATEGORIES.slice(6).map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`/${cat.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToCategory(cat.id);
                    }}
                    className="hover:text-amber-400 transition-colors block"
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">Resources &amp; Privacy</h4>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="/benchmarks"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('/benchmarks');
                  }}
                  className="hover:text-amber-400 transition-colors block"
                >
                  Global Benchmarks &amp; Norms
                </a>
              </li>
              <li>
                <a
                  href="/scores"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLeaderboardOpen(true);
                  }}
                  className="hover:text-amber-400 transition-colors block"
                >
                  High Scores &amp; Leaderboards
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('/privacy');
                  }}
                  className="hover:text-amber-400 transition-colors block text-amber-400/90 font-medium"
                >
                  Privacy Policy &amp; Terms
                </a>
              </li>
            </ul>
            <div className="pt-2 flex items-center gap-1.5 text-emerald-400 text-[11px]">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>100% Client-Side Verified</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500">
          <p>© {new Date().getFullYear()} Wanjaaro Platform. All rights reserved.</p>
          <div className="flex gap-4 flex-wrap justify-center">
            <a
              href="/benchmarks"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/benchmarks');
              }}
              className="hover:text-amber-400 font-medium no-underline"
            >
              Global Benchmarks
            </a>
            <a
              href="/scores"
              onClick={(e) => {
                e.preventDefault();
                setIsLeaderboardOpen(true);
              }}
              className="hover:text-neutral-300 no-underline"
            >
              My Scores
            </a>
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/privacy');
              }}
              className="hover:text-neutral-300 no-underline"
            >
              Privacy Policy
            </a>
            <button onClick={handleRandomGame} className="hover:text-neutral-300">
              Random Game
            </button>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigateToHome();
              }}
              className="hover:text-neutral-300 no-underline"
            >
              Back to Top
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
