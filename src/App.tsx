import React, { useState, useEffect } from 'react';
import { SnakeAndLadderGame } from './games/snakeAndLadder/SnakeAndLadderGame';
import { SnakeGame } from './games/snakeGame/SnakeGame';
import { MatchingCardGame } from './games/matchingCard/MatchingCardGame';
import { SnakeEscapeGame } from './games/snakeEscape/SnakeEscapeGame';
import { ParrotFlapGame } from './games/parrotFlap/ParrotFlapGame';
import { WanjaaroLogo } from './components/WanjaaroLogo';
import { BenchmarksView } from './components/BenchmarksView';
import { PrivacyView } from './components/PrivacyView';
import { updateMetaTags } from './utils/seo';
import { BirdTokenSvg } from './games/snakeAndLadder/BirdTokens';
import { SnakeSkinPreviewSvg } from './games/snakeGame/SnakeSkins';
import { SpeciesArtSvg } from './games/matchingCard/SpeciesArt';
import { BirdOfPreySvg, EscapeSkinSvg } from './games/snakeEscape/EscapeSkins';
import { ParrotSkinSvg } from './games/parrotFlap/ParrotSkins';
import {
  Gamepad2,
  Dices,
  ShieldCheck,
  Trophy,
  Sparkles,
  Grid,
  Shield,
  Feather,
} from 'lucide-react';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<{
    view:
      | 'home'
      | 'parrot-flap'
      | 'snake-escape'
      | 'matching-card-game'
      | 'snake-game'
      | 'snake-and-ladder'
      | 'benchmarks'
      | 'privacy';
  }>({ view: 'home' });

  const getCurrentCleanPath = (): string => {
    if (window.location.hash.startsWith('#/')) {
      const cleanFromHash = window.location.hash.slice(1);
      window.history.replaceState(null, '', cleanFromHash);
      return cleanFromHash;
    }
    const path = window.location.pathname || '/';
    if (window.location.search.startsWith('?/')) {
      const cleanFromSearch =
        '/' + window.location.search.slice(2).replace(/~and~/g, '&');
      window.history.replaceState(null, '', cleanFromSearch);
      return cleanFromSearch;
    }
    return path;
  };

  const handleRouteChange = () => {
    const rawPath = getCurrentCleanPath();
    const slug = rawPath.replace(/^\//, '').replace(/\/$/, '').replace(/\.html$/, '');

    if (
      window.location.pathname.length > 1 &&
      window.location.pathname.endsWith('/')
    ) {
      const cleanPath = window.location.pathname.replace(/\/+$/, '');
      window.history.replaceState(null, '', cleanPath + window.location.search);
    }

    if (slug === 'parrot-flap') {
      setCurrentRoute({ view: 'parrot-flap' });
      updateMetaTags({
        title: 'Parrot Flap – Free Tap to Fly Bird Game Online | Reptile Birds',
        description:
          'Play Parrot Flap online free on ReptileBirds. Tap to fly a Scarlet Macaw through sandstone canyon pillars, collect feathers, unlock 5 SVG birds, and earn Platinum medals.',
        path: '/parrot-flap',
      });
      return;
    }

    if (slug === 'snake-escape') {
      setCurrentRoute({ view: 'snake-escape' });
      updateMetaTags({
        title: 'Snake Escape Game Online – Free | Reptile Birds',
        description:
          'Play Snake Escape online free on ReptileBirds. Slither through a field eating mice while dodging diving Hawks, Peregrine Falcons, Bald Eagles, and Barn Owls.',
        path: '/snake-escape',
      });
      return;
    }

    if (slug === 'matching-card-game') {
      setCurrentRoute({ view: 'matching-card-game' });
      updateMetaTags({
        title:
          'Matching Card Game Online – Free Bird & Reptile Memory Game | Reptile Birds',
        description:
          'Play Matching Card Game (Memory Game / Concentration) online free on ReptileBirds. Flip cards to match pairs of 9 birds and 9 reptiles across Easy, Medium, Hard, and Expert grids.',
        path: '/matching-card-game',
      });
      return;
    }

    if (slug === 'snake-game') {
      setCurrentRoute({ view: 'snake-game' });
      updateMetaTags({
        title: 'Snake Game Online – Free | Reptile Birds',
        description:
          'Play Snake Game online free on ReptileBirds. Guide a python hunting mice across 15x15, 20x20, or 25x25 grids with 4 modes and 6 unlockable snake species skins.',
        path: '/snake-game',
      });
      return;
    }

    if (slug === 'snake-and-ladder') {
      setCurrentRoute({ view: 'snake-and-ladder' });
      updateMetaTags({
        title: 'Snake and Ladder Game Online – Free | Reptile Birds',
        description:
          'Play Snake and Ladder (Snakes and Ladders) online free on ReptileBirds. Classic 10x10 jungle board with Solo Race, Daily Board, Vs Computer, and Local Multiplayer.',
        path: '/snake-and-ladder',
      });
      return;
    }

    if (slug === 'benchmarks') {
      setCurrentRoute({ view: 'benchmarks' });
      updateMetaTags({
        title: 'Global Benchmarks | ReptileBirds',
        description:
          'Standardized reference distributions and percentile tools on ReptileBirds.',
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

    // Home Hub (/)
    setCurrentRoute({ view: 'home' });
    updateMetaTags({
      title: 'ReptileBirds – Free Online Reptile & Bird Browser Games',
      description:
        'Play Parrot Flap, Snake Escape, Matching Card Game, Snake Game, and Snake and Ladder online free on ReptileBirds. 100% client-side games with local device records.',
      path: '/',
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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950 via-slate-950 to-black text-slate-100 flex flex-col font-sans select-none">
      {/* Shared Top Navigation Bar Available on Index and Every Game Page */}
      <header className="w-[min(96vw,86rem)] mx-auto px-[clamp(0.5rem,2vw,1.5rem)] pt-[clamp(0.4rem,1dvh,0.75rem)] pb-1">
        <div className="flex flex-wrap items-center justify-between gap-2 px-[clamp(0.75rem,2vw,1.25rem)] py-[clamp(0.45rem,1dvh,0.75rem)] rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-lg backdrop-blur-md">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/');
            }}
            className="no-underline shrink-0"
          >
            <WanjaaroLogo size="sm" showTagline />
          </a>

          <nav
            aria-label="Primary navigation"
            className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs font-semibold"
          >
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/');
              }}
              className={`transition-colors no-underline hidden sm:inline ${
                currentRoute.view === 'home'
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-300 hover:text-emerald-400'
              }`}
            >
              Home
            </a>
            <a
              href="/parrot-flap"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/parrot-flap');
              }}
              className={`transition-colors no-underline ${
                currentRoute.view === 'parrot-flap'
                  ? 'text-amber-400 font-bold underline underline-offset-4'
                  : 'text-slate-200 hover:text-amber-400'
              }`}
            >
              Parrot Flap
            </a>
            <a
              href="/snake-escape"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/snake-escape');
              }}
              className={`transition-colors no-underline ${
                currentRoute.view === 'snake-escape'
                  ? 'text-rose-400 font-bold underline underline-offset-4'
                  : 'text-slate-200 hover:text-rose-400'
              }`}
            >
              Snake Escape
            </a>
            <a
              href="/matching-card-game"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/matching-card-game');
              }}
              className={`transition-colors no-underline ${
                currentRoute.view === 'matching-card-game'
                  ? 'text-sky-400 font-bold underline underline-offset-4'
                  : 'text-slate-200 hover:text-sky-400'
              }`}
            >
              Matching Cards
            </a>
            <a
              href="/snake-game"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/snake-game');
              }}
              className={`transition-colors no-underline ${
                currentRoute.view === 'snake-game'
                  ? 'text-emerald-400 font-bold underline underline-offset-4'
                  : 'text-slate-200 hover:text-emerald-400'
              }`}
            >
              Snake Game
            </a>
            <a
              href="/snake-and-ladder"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/snake-and-ladder');
              }}
              className={`transition-colors no-underline ${
                currentRoute.view === 'snake-and-ladder'
                  ? 'text-amber-400 font-bold underline underline-offset-4'
                  : 'text-slate-200 hover:text-amber-400'
              }`}
            >
              Snake and Ladder
            </a>
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/privacy');
              }}
              className={`transition-colors no-underline hidden md:inline ${
                currentRoute.view === 'privacy'
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Privacy
            </a>
          </nav>
        </div>
      </header>

      {/* Route Views */}
      {currentRoute.view === 'parrot-flap' ? (
        <div className="flex-1 flex flex-col">
          <div
            id="ad-slot-top"
            className="w-full h-0 overflow-hidden"
            aria-label="Top sponsor slot"
          />
          <ParrotFlapGame />
          <div
            id="ad-slot-bottom"
            className="w-full h-0 overflow-hidden"
            aria-label="Bottom sponsor slot"
          />
          <footer className="w-full max-w-5xl mx-auto px-4 py-5 border-t border-slate-800/70 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>Scores are stored only on your device. No data leaves your browser.</p>
            <span className="font-bold text-amber-400">ReptileBirds</span>
          </footer>
        </div>
      ) : currentRoute.view === 'snake-escape' ? (
        <div className="flex-1 flex flex-col">
          <SnakeEscapeGame />
        </div>
      ) : currentRoute.view === 'matching-card-game' ? (
        <div className="flex-1 flex flex-col">
          <MatchingCardGame onNavigateHome={() => navigateTo('/')} />
        </div>
      ) : currentRoute.view === 'snake-game' ? (
        <div className="flex-1 flex flex-col">
          <SnakeGame onNavigateHome={() => navigateTo('/')} />
        </div>
      ) : currentRoute.view === 'snake-and-ladder' ? (
        <div className="flex-1 flex flex-col">
          <SnakeAndLadderGame onNavigateHome={() => navigateTo('/')} />
        </div>
      ) : currentRoute.view === 'benchmarks' ? (
        <div className="flex-1">
          <BenchmarksView
            onNavigateGame={() => navigateTo('/')}
            onNavigateHome={() => navigateTo('/')}
          />
        </div>
      ) : currentRoute.view === 'privacy' ? (
        <div className="flex-1">
          <PrivacyView
            onNavigateHome={() => navigateTo('/')}
            onNavigateCategory={() => navigateTo('/')}
          />
        </div>
      ) : (
        /* ReptileBirds Home Hub (/) */
        <>
          <div
            id="ad-slot-top"
            className="w-full h-0 overflow-hidden"
            aria-label="Top sponsor slot"
          />

          <main className="flex-1 flex flex-col items-center justify-center max-w-5xl w-full mx-auto px-4 py-6 space-y-8">
            <div className="text-center space-y-2 max-w-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Official Arcade Hub
              </p>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                ReptileBirds
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Choose a game below to play immediately in your browser. Every game
                has its own dedicated page and stores your high scores locally on
                your device.
              </p>
            </div>

            {/* 5 Featured Game Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
              {/* Card 1: Parrot Flap (/parrot-flap) */}
              <a
                href="/parrot-flap"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/parrot-flap');
                }}
                className="group rounded-3xl bg-slate-900/95 border-2 border-amber-500/40 hover:border-amber-400 p-5 flex flex-col justify-between gap-5 shadow-2xl transition-all hover:-translate-y-0.5 no-underline text-left"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                      <Feather className="w-4 h-4" />
                      <span>ONE-TAP FLIGHT · 5 BIRDS</span>
                    </div>
                    <ParrotSkinSvg skinId="scarlet-macaw" size={40} wingUp />
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-amber-400 transition-colors">
                    Parrot Flap
                  </h2>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tap to fly a Scarlet Macaw through sandstone canyon pillars with
                    a 25-point day/night cycle. Collect feathers (+2 pts), unlock 5
                    SVG bird species, and earn Platinum medals!
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Classic, Chill &amp; Daily</span>
                  </span>
                  <span className="px-3.5 py-2 rounded-xl bg-amber-500 group-hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow">
                    Play Parrot Flap →
                  </span>
                </div>
              </a>

              {/* Card 2: Snake Escape (/snake-escape) */}
              <a
                href="/snake-escape"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/snake-escape');
                }}
                className="group rounded-3xl bg-slate-900/95 border-2 border-rose-500/40 hover:border-rose-400 p-5 flex flex-col justify-between gap-5 shadow-2xl transition-all hover:-translate-y-0.5 no-underline text-left"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                      <Shield className="w-4 h-4" />
                      <span>ARENA SURVIVAL · RAPTOR EVASION</span>
                    </div>
                    <div className="flex items-center -space-x-1">
                      <EscapeSkinSvg skinId="corn-snake" size={34} />
                      <BirdOfPreySvg birdType="falcon" size={34} />
                    </div>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-rose-400 transition-colors">
                    Snake Escape
                  </h2>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Slither through an 800×800 meadow eating mice while Hawks,
                    Peregrine Falcons, Bald Eagles, and nocturnal Barn Owls hunt from
                    above. Hide in tall grass and burrow underground!
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                    <span>4 Raptors &amp; 6 Skins</span>
                  </span>
                  <span className="px-3.5 py-2 rounded-xl bg-rose-600 group-hover:bg-rose-500 text-white font-extrabold text-xs shadow">
                    Play Snake Escape →
                  </span>
                </div>
              </a>

              {/* Card 3: Matching Card Game (/matching-card-game) */}
              <a
                href="/matching-card-game"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/matching-card-game');
                }}
                className="group rounded-3xl bg-slate-900/95 border-2 border-sky-500/40 hover:border-sky-400 p-5 flex flex-col justify-between gap-5 shadow-2xl transition-all hover:-translate-y-0.5 no-underline text-left"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold">
                      <Grid className="w-4 h-4" />
                      <span>MEMORY · 18 SPECIES</span>
                    </div>
                    <div className="flex items-center -space-x-1">
                      <SpeciesArtSvg species="Scarlet Macaw" size={34} />
                      <SpeciesArtSvg species="Green Sea Turtle" size={34} />
                    </div>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-sky-400 transition-colors">
                    Matching Card Game
                  </h2>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Flip cards to match pairs of 9 birds and 9 reptiles across Easy
                    (4×3), Medium (4×4), Hard (6×4), and Expert (6×6) grids. Includes
                    Classic, Timed, Daily Challenge, and Two-Player modes.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>Species Gallery</span>
                  </span>
                  <span className="px-3.5 py-2 rounded-xl bg-sky-600 group-hover:bg-sky-500 text-white font-extrabold text-xs shadow">
                    Play Matching Cards →
                  </span>
                </div>
              </a>

              {/* Card 4: Snake Game (/snake-game) */}
              <a
                href="/snake-game"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/snake-game');
                }}
                className="group rounded-3xl bg-slate-900/95 border-2 border-emerald-500/40 hover:border-emerald-400 p-5 flex flex-col justify-between gap-5 shadow-2xl transition-all hover:-translate-y-0.5 no-underline text-left"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                      <Gamepad2 className="w-4 h-4" />
                      <span>GRID ACTION · 4 MODES</span>
                    </div>
                    <SnakeSkinPreviewSvg skinId="emerald-boa" size={44} />
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                    Snake Game
                  </h2>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Guide a python hunting mice across 15×15, 20×20, or 25×25 grids.
                    Features Classic, Wrap-Around, Jungle Obstacles, Daily Challenge,
                    bonus golden eggs, and 6 unlockable snake skins.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>6 Species Skins</span>
                  </span>
                  <span className="px-3.5 py-2 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 text-white font-extrabold text-xs shadow">
                    Play Snake Game →
                  </span>
                </div>
              </a>

              {/* Card 5: Snake and Ladder (/snake-and-ladder) */}
              <a
                href="/snake-and-ladder"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/snake-and-ladder');
                }}
                className="group rounded-3xl bg-slate-900/95 border-2 border-amber-500/40 hover:border-amber-400 p-5 flex flex-col justify-between gap-5 shadow-2xl transition-all hover:-translate-y-0.5 no-underline text-left"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                      <Dices className="w-4 h-4" />
                      <span>10×10 BOARD · 1–4P</span>
                    </div>
                    <div className="flex items-center -space-x-1.5">
                      <BirdTokenSvg token="parrot" size={32} />
                      <BirdTokenSvg token="owl" size={32} />
                      <BirdTokenSvg token="eagle" size={32} />
                    </div>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-amber-400 transition-colors">
                    Snake and Ladder
                  </h2>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Roll the 3D die directly across the 10×10 jungle board. Climb 8
                    vines, dodge 8 real snake species, and race to square 100 in Solo
                    Race, Daily Board, Vs Computer, or Local Pass-and-Play.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Fair Crypto Dice</span>
                  </span>
                  <span className="px-3.5 py-2 rounded-xl bg-amber-500 group-hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow">
                    Play Snake and Ladder →
                  </span>
                </div>
              </a>
            </div>
          </main>

          <div
            id="ad-slot-bottom"
            className="w-full h-0 overflow-hidden"
            aria-label="Bottom sponsor slot"
          />

          {/* Home Footer */}
          <footer className="w-full max-w-5xl mx-auto px-4 py-5 border-t border-slate-800/70 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>Scores are stored only on your device. No data leaves your browser.</p>
            <div className="flex items-center gap-4">
              <span className="font-bold text-emerald-400">ReptileBirds</span>
              <a
                href="/privacy"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/privacy');
                }}
                className="hover:text-white no-underline"
              >
                Privacy
              </a>
              <a
                href="/benchmarks"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/benchmarks');
                }}
                className="hover:text-white no-underline"
              >
                Benchmarks
              </a>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
