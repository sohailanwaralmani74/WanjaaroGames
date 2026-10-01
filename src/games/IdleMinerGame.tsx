import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';
import { GameProps } from './ReflexGames';

interface Generator {
  id: string;
  name: string;
  cost: number;
  baseOps: number;
  count: number;
  icon: string;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
}

export function IdleMinerGame({ onFinish }: GameProps) {
  const [ore, setOre] = useState(0);
  const [lifetimeOre, setLifetimeOre] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [prestigeCount, setPrestigeCount] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const nextTextId = useRef(1);

  const [generators, setGenerators] = useState<Generator[]>([
    { id: 'pickaxe', name: 'Plasma Drill', cost: 15, baseOps: 1, count: 0, icon: '⛏️' },
    { id: 'rover', name: 'Automated Rover', cost: 100, baseOps: 6, count: 0, icon: '🚜' },
    { id: 'laser', name: 'Orbital Laser Rig', cost: 1100, baseOps: 40, count: 0, icon: '🛰️' },
    { id: 'station', name: 'Deep Space Refinery', cost: 12000, baseOps: 320, count: 0, icon: '🛸' },
    { id: 'dyson', name: 'Planetary Siphon', cost: 130000, baseOps: 2500, count: 0, icon: '🪐' },
  ]);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('wanjaaro_idle_miner_state');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.ore !== undefined) setOre(data.ore);
        if (data.lifetimeOre !== undefined) setLifetimeOre(data.lifetimeOre);
        if (data.clickPower !== undefined) setClickPower(data.clickPower);
        if (data.prestigeCount !== undefined) setPrestigeCount(data.prestigeCount);
        if (data.generators) setGenerators(data.generators);

        // Offline progress calculation
        if (data.lastTimestamp) {
          const elapsedSecs = Math.min(86400, Math.floor((Date.now() - data.lastTimestamp) / 1000));
          if (elapsedSecs > 5) {
            const currentOps = data.generators.reduce(
              (acc: number, g: Generator) => acc + g.count * g.baseOps,
              0
            );
            const offlineGains = Math.floor(currentOps * elapsedSecs * (1 + (data.prestigeCount || 0) * 0.2));
            if (offlineGains > 0) {
              setOre((o) => o + offlineGains);
              setLifetimeOre((l) => l + offlineGains);
            }
          }
        }
      } catch {
        // Fallback to fresh start
      }
    }
  }, []);

  // Save to local storage periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const stateToSave = {
        ore,
        lifetimeOre,
        clickPower,
        prestigeCount,
        generators,
        lastTimestamp: Date.now(),
      };
      localStorage.setItem('wanjaaro_idle_miner_state', JSON.stringify(stateToSave));
    }, 3000);
    return () => clearInterval(interval);
  }, [ore, lifetimeOre, clickPower, prestigeCount, generators]);

  // Total OPS
  const multiplier = 1 + prestigeCount * 0.25;
  const totalOps =
    generators.reduce((acc, g) => acc + g.count * g.baseOps, 0) * multiplier;

  // Passive Ore Generation Loop (10 ticks/sec)
  useEffect(() => {
    const interval = setInterval(() => {
      if (totalOps > 0) {
        const gain = totalOps / 10;
        setOre((o) => o + gain);
        setLifetimeOre((l) => l + gain);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [totalOps]);

  // Click Core
  const handleClickCore = (e: React.MouseEvent<HTMLButtonElement>) => {
    sound.playTap();
    const isCrit = Math.random() < 0.15;
    const gained = clickPower * multiplier * (isCrit ? 4 : 1);

    setOre((o) => o + gained);
    setLifetimeOre((l) => l + gained);

    // Floating text
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = nextTextId.current++;

    setFloatingTexts((prev) => [
      ...prev.slice(-6),
      { id, x, y, text: isCrit ? `CRIT! +${Math.round(gained)}` : `+${Math.round(gained)}` },
    ]);

    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 800);

    // Check achievement milestones
    if (lifetimeOre + gained >= 50000) {
      onFinish(Math.round(lifetimeOre + gained), `${Math.round(lifetimeOre + gained)} Galactic Ore Mined`);
    }
  };

  // Buy Generator
  const buyGenerator = (id: string) => {
    const gen = generators.find((g) => g.id === id);
    if (!gen || ore < gen.cost) return;

    sound.playSuccess();
    setOre((o) => o - gen.cost);

    setGenerators((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              count: g.count + 1,
              cost: Math.floor(g.cost * 1.15),
            }
          : g
      )
    );
  };

  // Upgrade Click Power
  const clickUpgradeCost = Math.floor(25 * Math.pow(1.8, clickPower - 1));
  const buyClickUpgrade = () => {
    if (ore < clickUpgradeCost) return;
    sound.playSuccess();
    setOre((o) => o - clickUpgradeCost);
    setClickPower((p) => p + 1);
  };

  // Prestige / Cosmic Ascension
  const prestigeCost = 25000;
  const canPrestige = lifetimeOre >= prestigeCost;

  const handlePrestige = () => {
    if (!canPrestige) return;
    sound.playSuccess();
    setPrestigeCount((p) => p + 1);
    setOre(0);
    setClickPower(1);
    setGenerators((prev) =>
      prev.map((g) => ({
        ...g,
        count: 0,
        cost: Math.floor(g.baseOps * 15),
      }))
    );
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none max-w-2xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono text-slate-300 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white flex items-center gap-1.5">
            🪐 Galactic Ore Miner
          </span>
          <span className="text-amber-400 font-bold">
            {prestigeCount > 0 ? `Cosmic Tier ${prestigeCount} (+${Math.round((multiplier - 1) * 100)}%)` : ''}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-cyan-400 font-bold">{totalOps.toFixed(1)} Ore/sec</span>
        </div>
      </div>

      {/* Main Game Screen: Click Area + Shop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Left Column: Cosmic Asteroid Node */}
        <div className="p-6 bg-slate-950 border-2 border-slate-800 rounded-3xl shadow-2xl flex flex-col items-center justify-between min-h-[360px] relative overflow-hidden">
          {/* Ore Counter */}
          <div className="text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-black font-mono text-amber-400">
              {Math.floor(ore).toLocaleString()}
            </span>
            <p className="text-xs text-slate-400 font-mono">Cosmic Ore</p>
          </div>

          {/* Interactive Clickable Asteroid */}
          <div className="relative">
            <button
              onClick={handleClickCore}
              className="w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-indigo-600 via-purple-700 to-slate-900 border-4 border-amber-400/80 shadow-2xl shadow-indigo-500/30 flex items-center justify-center text-6xl active:scale-92 transition-transform cursor-pointer relative group"
            >
              <span className="group-hover:rotate-12 transition-transform duration-300">💎</span>
            </button>

            {/* Floating click text popups */}
            {floatingTexts.map((ft) => (
              <span
                key={ft.id}
                style={{ left: `${ft.x}px`, top: `${ft.y}px` }}
                className="absolute font-black font-mono text-sm text-amber-300 animate-float-up pointer-events-none"
              >
                {ft.text}
              </span>
            ))}
          </div>

          {/* Click Power Upgrade */}
          <button
            onClick={buyClickUpgrade}
            disabled={ore < clickUpgradeCost}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 rounded-xl text-xs font-mono flex items-center justify-between text-slate-200 transition-all active:scale-95"
          >
            <span>Upgrade Drill (Lvl {clickPower})</span>
            <span className="text-amber-400 font-bold">{clickUpgradeCost} Ore</span>
          </button>
        </div>

        {/* Right Column: Automated Generators & Ascension */}
        <div className="p-4 sm:p-5 bg-slate-950 border-2 border-slate-800 rounded-3xl shadow-2xl flex flex-col justify-between gap-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 px-1">
            Automated Harvesters
          </h4>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[320px] pr-1">
            {generators.map((gen) => {
              const canAfford = ore >= gen.cost;
              return (
                <button
                  key={gen.id}
                  onClick={() => buyGenerator(gen.id)}
                  disabled={!canAfford}
                  className="w-full p-2.5 bg-slate-900 hover:bg-slate-850 disabled:opacity-40 border border-slate-800 rounded-xl flex items-center justify-between transition-all active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{gen.icon}</span>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white">{gen.name}</p>
                      <p className="text-[10px] text-cyan-400 font-mono">
                        +{gen.baseOps * multiplier} OPS each
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-amber-400">{gen.cost} Ore</p>
                    <p className="text-[10px] text-slate-400 font-mono">Owned: {gen.count}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Prestige / Ascension Button */}
          {lifetimeOre >= 5000 && (
            <button
              onClick={handlePrestige}
              disabled={!canPrestige}
              className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 ${
                canPrestige
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {canPrestige ? 'Ascend (+25% Permanent Multiplier)' : `Ascend at ${prestigeCost} Lifetime Ore`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
