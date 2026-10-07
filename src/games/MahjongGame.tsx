import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';
import { GameProps } from './ReflexGames';

export interface MahjongTile {
  id: string;
  type: string;
  symbol: string;
  subText: string;
  color: string;
  layer: number; // 0, 1, 2
  row: number;
  col: number;
  removed: boolean;
}

const TILE_DEFS = [
  // Dots / Circles
  { type: 'dot-1', symbol: '🔴', subText: '1 Dot', color: 'text-rose-500' },
  { type: 'dot-2', symbol: '🔵', subText: '2 Dot', color: 'text-blue-500' },
  { type: 'dot-3', symbol: '🟢', subText: '3 Dot', color: 'text-emerald-500' },
  { type: 'dot-4', symbol: '🟡', subText: '4 Dot', color: 'text-amber-500' },
  // Bamboos
  { type: 'bam-1', symbol: '🎋', subText: '1 Bam', color: 'text-emerald-600' },
  { type: 'bam-2', symbol: '🎍', subText: '2 Bam', color: 'text-emerald-600' },
  { type: 'bam-3', symbol: '🎋', subText: '3 Bam', color: 'text-teal-600' },
  // Dragons & Winds
  { type: 'drag-red', symbol: '中', subText: 'Red', color: 'text-rose-600' },
  { type: 'drag-green', symbol: '發', subText: 'Green', color: 'text-emerald-600' },
  { type: 'wind-east', symbol: '東', subText: 'East', color: 'text-slate-800' },
  { type: 'wind-south', symbol: '南', subText: 'South', color: 'text-slate-800' },
  { type: 'flower-plum', symbol: '🌸', subText: 'Plum', color: 'text-pink-500' },
];

export function MahjongGame({ onFinish }: GameProps) {
  const [tiles, setTiles] = useState<MahjongTile[]>([]);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [hintIds, setHintIds] = useState<string[]>([]);
  const [isWon, setIsWon] = useState(false);

  const initBoard = () => {
    // We create a structured pyramid layout with 36 tiles (18 matching pairs)
    const pairsNeeded = 18;
    const tilePool: { type: string; symbol: string; subText: string; color: string }[] = [];

    for (let i = 0; i < pairsNeeded; i++) {
      const def = TILE_DEFS[i % TILE_DEFS.length];
      // Add pair (2 of identical tile)
      tilePool.push(def, def);
    }

    // Shuffle pool
    const shuffled = [...tilePool].sort(() => Math.random() - 0.5);

    // Layered layout positions:
    // Layer 0: 6x4 = 24 tiles
    // Layer 1: 4x2 = 8 tiles
    // Layer 2: 2x2 = 4 tiles
    // Total = 36 tiles!
    const generated: MahjongTile[] = [];
    let idx = 0;

    // Layer 0 (Base 6 columns x 4 rows)
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 6; c++) {
        const item = shuffled[idx++];
        generated.push({
          id: `tile-0-${r}-${c}`,
          ...item,
          layer: 0,
          row: r,
          col: c,
          removed: false,
        });
      }
    }

    // Layer 1 (Middle 4 columns x 2 rows, centered)
    for (let r = 1; r <= 2; r++) {
      for (let c = 1; c <= 4; c++) {
        const item = shuffled[idx++];
        generated.push({
          id: `tile-1-${r}-${c}`,
          ...item,
          layer: 1,
          row: r,
          col: c,
          removed: false,
        });
      }
    }

    // Layer 2 (Top 2 columns x 2 rows, centered)
    for (let r = 1; r <= 2; r++) {
      for (let c = 2; c <= 3; c++) {
        const item = shuffled[idx++];
        generated.push({
          id: `tile-2-${r}-${c}`,
          ...item,
          layer: 2,
          row: r,
          col: c,
          removed: false,
        });
      }
    }

    setTiles(generated);
    setSelectedTileId(null);
    setScore(0);
    setMoves(0);
    setHintIds([]);
    setIsWon(false);
    sound.playTap();
  };

  useEffect(() => {
    initBoard();
  }, []);

  // Determine if a tile is "free" to select
  const isTileFree = (tile: MahjongTile, allTiles: MahjongTile[]): boolean => {
    if (tile.removed) return false;

    // 1. Check if any active tile is directly above it in layer+1
    const isCovered = allTiles.some(
      (other) =>
        !other.removed &&
        other.layer === tile.layer + 1 &&
        Math.abs(other.row - tile.row) < 1 &&
        Math.abs(other.col - tile.col) < 1
    );
    if (isCovered) return false;

    // 2. Check if left OR right is open at the same layer
    const hasLeftNeighbor = allTiles.some(
      (other) =>
        !other.removed &&
        other.layer === tile.layer &&
        other.row === tile.row &&
        other.col === tile.col - 1
    );

    const hasRightNeighbor = allTiles.some(
      (other) =>
        !other.removed &&
        other.layer === tile.layer &&
        other.row === tile.row &&
        other.col === tile.col + 1
    );

    // Free if AT LEAST ONE side is open
    return !hasLeftNeighbor || !hasRightNeighbor;
  };

  const handleTileClick = (tile: MahjongTile) => {
    if (tile.removed || !isTileFree(tile, tiles)) {
      sound.playFail();
      return;
    }

    setHintIds([]);

    // If no tile selected yet, select this one
    if (!selectedTileId) {
      sound.playTap();
      setSelectedTileId(tile.id);
      return;
    }

    // If clicked the exact same tile, deselect
    if (selectedTileId === tile.id) {
      sound.playTap();
      setSelectedTileId(null);
      return;
    }

    // A different tile was already selected, check if they match!
    const firstTile = tiles.find((t) => t.id === selectedTileId);
    if (!firstTile) return;

    if (firstTile.type === tile.type) {
      // MATCH!
      sound.playSuccess();
      const nextTiles = tiles.map((t) =>
        t.id === firstTile.id || t.id === tile.id ? { ...t, removed: true } : t
      );
      setTiles(nextTiles);
      setSelectedTileId(null);
      setScore((s) => s + 40);
      setMoves((m) => m + 1);

      // Check victory
      const remaining = nextTiles.filter((t) => !t.removed).length;
      if (remaining === 0) {
        setIsWon(true);
        sound.playSuccess();
        onFinish(score + 200, `Mahjong Master! Cleared in ${moves + 1} moves`);
      }
    } else {
      // Mismatch
      sound.playFail();
      setSelectedTileId(tile.id); // switch selection
    }
  };

  const handleHint = () => {
    // Find first available matching free pair
    const freeTiles = tiles.filter((t) => isTileFree(t, tiles));
    for (let i = 0; i < freeTiles.length; i++) {
      for (let j = i + 1; j < freeTiles.length; j++) {
        if (freeTiles[i].type === freeTiles[j].type) {
          sound.playSuccess();
          setHintIds([freeTiles[i].id, freeTiles[j].id]);
          return;
        }
      }
    }
    sound.playFail();
  };

  const remainingCount = tiles.filter((t) => !t.removed).length;

  return (
    <div className="flex flex-col items-center gap-2.5 w-full select-none max-w-xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 shadow">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white flex items-center gap-1">
            🀄 Mahjong Solitaire
          </span>
          <span className="text-emerald-400">Score: {score}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Left: {remainingCount}</span>
          <button
            onClick={handleHint}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-bold transition-all active:scale-95"
          >
            💡 Hint
          </button>
          <button
            onClick={initBoard}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-all active:scale-95"
          >
            New Deal
          </button>
        </div>
      </div>

      {/* Mahjong Solitaire Board */}
      <div className="relative w-full h-[290px] sm:h-[310px] bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-slate-800 rounded-2xl p-3 shadow-xl overflow-hidden flex items-center justify-center">
        <div className="relative w-[332px] h-[264px]">
          {tiles.map((tile) => {
            if (tile.removed) return null;

            const isFree = isTileFree(tile, tiles);
            const isSelected = selectedTileId === tile.id;
            const isHint = hintIds.includes(tile.id);

            // Calculate x, y positions on canvas
            const colWidth = 54;
            const rowHeight = 64;
            const left = tile.col * colWidth + tile.layer * 4;
            const top = tile.row * rowHeight - tile.layer * 6;
            const zIndex = tile.layer * 10 + tile.row;

            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                style={{
                  left: `${left}px`,
                  top: `${top}px`,
                  zIndex,
                }}
                className={`absolute w-12 h-15 rounded-xl border-2 flex flex-col items-center justify-between p-1 transition-all ${
                  isSelected
                    ? 'bg-amber-100 border-amber-400 ring-4 ring-amber-400/80 -translate-y-2 shadow-2xl scale-105'
                    : isHint
                    ? 'bg-emerald-100 border-emerald-400 ring-4 ring-emerald-400/80 animate-pulse'
                    : isFree
                    ? 'bg-slate-100 hover:bg-white border-slate-300 shadow-md hover:-translate-y-1 cursor-pointer'
                    : 'bg-slate-300/80 border-slate-400 opacity-60 cursor-not-allowed shadow-inner'
                }`}
              >
                <span className="text-[9px] font-mono font-bold text-slate-600 leading-none">
                  {tile.subText}
                </span>
                <span className={`text-xl sm:text-2xl ${tile.color}`}>{tile.symbol}</span>
                <div className="w-full flex justify-between px-0.5 text-[8px] font-mono text-slate-400 leading-none">
                  <span>L{tile.layer}</span>
                  <span>●</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Victory Screen */}
        {isWon && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center">
            <span className="text-6xl mb-3 animate-bounce">🀄</span>
            <h2 className="text-3xl font-black text-amber-400 mb-2">MAHJONG MASTER!</h2>
            <p className="text-sm text-slate-300 mb-6">
              All 18 tile pairs cleared in {moves} moves!
            </p>
            <button
              onClick={initBoard}
              className="px-8 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-sm shadow-xl active:scale-95 transition-transform uppercase tracking-wider"
            >
              Play Another Layout
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-400 font-mono text-center">
        Tiles must be free on top and on at least one side (left or right) to be matched.
      </p>
    </div>
  );
}
