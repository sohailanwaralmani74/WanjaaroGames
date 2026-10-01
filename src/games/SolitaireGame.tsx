import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';
import { GameProps } from './ReflexGames';

export type Suit = '♠' | '♥' | '♦' | '♣';
export type CardColor = 'red' | 'black';

export interface Card {
  id: string;
  suit: Suit;
  rank: number; // 1 (Ace) to 13 (King)
  color: CardColor;
  faceUp: boolean;
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANK_LABELS: Record<number, string> = {
  1: 'A',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
};

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    const color: CardColor = suit === '♥' || suit === '♦' ? 'red' : 'black';
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        color,
        faceUp: false,
      });
    }
  }
  return deck;
}

function shuffleDeck(deck: Card[]): Card[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function SolitaireGame({ onFinish }: GameProps) {
  const [stock, setStock] = useState<Card[]>([]);
  const [waste, setWaste] = useState<Card[]>([]);
  const [foundations, setFoundations] = useState<Card[][]>([[], [], [], []]);
  const [tableau, setTableau] = useState<Card[][]>([[], [], [], [], [], [], []]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [selectedCard, setSelectedCard] = useState<{
    card: Card;
    source: 'waste' | 'tableau';
    tableauCol?: number;
    cardIdx?: number;
  } | null>(null);

  const timerRef = useRef<number | null>(null);

  // Initialize game
  const initGame = () => {
    const deck = shuffleDeck(createDeck());
    const newTableau: Card[][] = [[], [], [], [], [], [], []];

    // Deal tableau
    let cardIdx = 0;
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const card = { ...deck[cardIdx++] };
        if (row === col) {
          card.faceUp = true;
        }
        newTableau[col].push(card);
      }
    }

    // Remaining cards to stock
    const newStock = deck.slice(cardIdx).map((c) => ({ ...c, faceUp: false }));

    setStock(newStock);
    setWaste([]);
    setFoundations([[], [], [], []]);
    setTableau(newTableau);
    setMoves(0);
    setScore(0);
    setTime(0);
    setIsWon(false);
    setSelectedCard(null);
    sound.playTap();
  };

  useEffect(() => {
    initGame();
    timerRef.current = window.setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Check victory condition (all 4 foundations have 13 cards)
  useEffect(() => {
    const totalFoundationCards = foundations.reduce((acc, f) => acc + f.length, 0);
    if (totalFoundationCards === 52 && !isWon) {
      setIsWon(true);
      sound.playSuccess();
      const finalScore = Math.max(100, 1000 - time * 2 - moves * 5 + 500);
      onFinish(finalScore, `Victory in ${moves} moves (${Math.floor(time / 60)}m ${time % 60}s)`);
    }
  }, [foundations, isWon, moves, time, onFinish]);

  // Click stock pile to draw
  const handleStockClick = () => {
    sound.playTap();
    if (stock.length === 0) {
      // Recycle waste to stock
      if (waste.length === 0) return;
      const recycled = [...waste].reverse().map((c) => ({ ...c, faceUp: false }));
      setStock(recycled);
      setWaste([]);
      setMoves((m) => m + 1);
    } else {
      const top = stock[stock.length - 1];
      const newStock = stock.slice(0, -1);
      const drawnCard = { ...top, faceUp: true };
      setStock(newStock);
      setWaste((w) => [...w, drawnCard]);
      setMoves((m) => m + 1);
    }
    setSelectedCard(null);
  };

  // Try auto move to foundation
  const tryMoveToFoundation = (card: Card): boolean => {
    for (let fIdx = 0; fIdx < 4; fIdx++) {
      const fPile = foundations[fIdx];
      const topF = fPile[fPile.length - 1];

      // Ace onto empty foundation
      if (!topF && card.rank === 1) {
        return placeInFoundation(fIdx, card);
      }
      // Same suit, consecutive rank
      if (topF && topF.suit === card.suit && topF.rank + 1 === card.rank) {
        return placeInFoundation(fIdx, card);
      }
    }
    return false;
  };

  const placeInFoundation = (fIdx: number, card: Card): boolean => {
    sound.playSuccess();
    setFoundations((prev) => {
      const next = [...prev];
      next[fIdx] = [...next[fIdx], card];
      return next;
    });
    setScore((s) => s + 15);
    setMoves((m) => m + 1);
    return true;
  };

  // Click waste card
  const handleWasteClick = () => {
    if (waste.length === 0) return;
    const topCard = waste[waste.length - 1];

    // Try auto-move to foundation first
    if (tryMoveToFoundation(topCard)) {
      setWaste((w) => w.slice(0, -1));
      setSelectedCard(null);
      return;
    }

    // Toggle select
    if (selectedCard?.source === 'waste') {
      setSelectedCard(null);
    } else {
      sound.playTap();
      setSelectedCard({ card: topCard, source: 'waste' });
    }
  };

  // Click tableau card
  const handleTableauCardClick = (colIdx: number, cardIdx: number) => {
    const col = tableau[colIdx];
    const card = col[cardIdx];

    // Reveal face-down card if it is at the end of the column
    if (!card.faceUp && cardIdx === col.length - 1) {
      sound.playTap();
      setTableau((prev) => {
        const next = [...prev];
        const nextCol = [...next[colIdx]];
        nextCol[cardIdx] = { ...card, faceUp: true };
        next[colIdx] = nextCol;
        return next;
      });
      setScore((s) => s + 5);
      setMoves((m) => m + 1);
      return;
    }

    if (!card.faceUp) return;

    // If already holding a selected card, try to drop it onto this card
    if (selectedCard) {
      if (selectedCard.source === 'waste') {
        if (canPlaceOnTableau(selectedCard.card, card)) {
          executeMoveFromWasteToTableau(colIdx);
          return;
        }
      } else if (selectedCard.source === 'tableau' && selectedCard.tableauCol !== undefined) {
        if (selectedCard.tableauCol !== colIdx && canPlaceOnTableau(selectedCard.card, card)) {
          executeMoveTableauToTableau(selectedCard.tableauCol, selectedCard.cardIdx!, colIdx);
          return;
        }
      }
    }

    // Try auto-move top card to foundation if it's the top card of column
    if (cardIdx === col.length - 1) {
      if (tryMoveToFoundation(card)) {
        setTableau((prev) => {
          const next = [...prev];
          const nextCol = next[colIdx].slice(0, -1);
          if (nextCol.length > 0) {
            nextCol[nextCol.length - 1] = { ...nextCol[nextCol.length - 1], faceUp: true };
          }
          next[colIdx] = nextCol;
          return next;
        });
        setSelectedCard(null);
        return;
      }
    }

    // Otherwise select stack starting from this card
    sound.playTap();
    if (
      selectedCard?.source === 'tableau' &&
      selectedCard.tableauCol === colIdx &&
      selectedCard.cardIdx === cardIdx
    ) {
      setSelectedCard(null);
    } else {
      setSelectedCard({
        card,
        source: 'tableau',
        tableauCol: colIdx,
        cardIdx,
      });
    }
  };

  // Click empty tableau column
  const handleEmptyTableauClick = (colIdx: number) => {
    if (!selectedCard) return;

    // Only Kings (rank 13) can go on empty columns
    if (selectedCard.card.rank === 13) {
      if (selectedCard.source === 'waste') {
        executeMoveFromWasteToTableau(colIdx);
      } else if (selectedCard.source === 'tableau' && selectedCard.tableauCol !== undefined) {
        executeMoveTableauToTableau(selectedCard.tableauCol, selectedCard.cardIdx!, colIdx);
      }
    }
  };

  const canPlaceOnTableau = (movingCard: Card, targetCard: Card): boolean => {
    return movingCard.color !== targetCard.color && movingCard.rank === targetCard.rank - 1;
  };

  const executeMoveFromWasteToTableau = (destCol: number) => {
    sound.playTap();
    setTableau((prev) => {
      const next = [...prev];
      next[destCol] = [...next[destCol], selectedCard!.card];
      return next;
    });
    setWaste((w) => w.slice(0, -1));
    setSelectedCard(null);
    setMoves((m) => m + 1);
    setScore((s) => s + 5);
  };

  const executeMoveTableauToTableau = (sourceCol: number, sourceCardIdx: number, destCol: number) => {
    sound.playTap();
    const movingStack = tableau[sourceCol].slice(sourceCardIdx);

    setTableau((prev) => {
      const next = [...prev];
      // remove from source
      const remainingSource = next[sourceCol].slice(0, sourceCardIdx);
      if (remainingSource.length > 0) {
        remainingSource[remainingSource.length - 1] = {
          ...remainingSource[remainingSource.length - 1],
          faceUp: true,
        };
      }
      next[sourceCol] = remainingSource;
      // add to dest
      next[destCol] = [...next[destCol], ...movingStack];
      return next;
    });

    setSelectedCard(null);
    setMoves((m) => m + 1);
    setScore((s) => s + 5);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none max-w-4xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center w-full px-3 py-2 bg-emerald-950/80 border border-emerald-800/80 rounded-2xl text-xs font-mono text-emerald-200 shadow-lg">
        <div className="flex items-center gap-4">
          <span className="font-bold text-white tracking-wider flex items-center gap-1.5">
            <span>♠</span> Klondike Solitaire
          </span>
          <span className="text-emerald-400">Score: {score}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-emerald-300">Moves: {moves}</span>
          <span className="text-amber-400 font-bold">⏱ {formatTime(time)}</span>
          <button
            onClick={initGame}
            className="px-3 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg transition-colors font-sans text-xs active:scale-95"
          >
            New Deal
          </button>
        </div>
      </div>

      {/* Felt Playing Arena */}
      <div className="w-full bg-gradient-to-b from-emerald-900 to-emerald-950 border-4 border-emerald-950/90 rounded-3xl p-4 sm:p-6 shadow-2xl min-h-[580px] flex flex-col justify-between">
        {/* Top Row: Stock, Waste, and 4 Foundation Piles */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 w-full mb-6">
          {/* Stock Pile */}
          <div
            onClick={handleStockClick}
            className="w-full aspect-[2.5/3.5] rounded-xl border-2 border-dashed border-emerald-700/60 bg-emerald-950/50 flex items-center justify-center cursor-pointer transition-all hover:border-emerald-500 shadow-md relative"
          >
            {stock.length > 0 ? (
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-800 to-indigo-950 border-2 border-indigo-400/40 shadow-md flex items-center justify-center">
                <span className="text-indigo-200/40 text-xl font-bold">🂠</span>
              </div>
            ) : (
              <span className="text-emerald-600 text-xl">↺</span>
            )}
            <span className="absolute -bottom-5 text-[10px] font-mono text-emerald-300/70">
              {stock.length} left
            </span>
          </div>

          {/* Waste Pile */}
          <div
            onClick={handleWasteClick}
            className={`w-full aspect-[2.5/3.5] rounded-xl border-2 border-dashed border-emerald-700/60 bg-emerald-950/50 flex items-center justify-center cursor-pointer transition-all relative ${
              selectedCard?.source === 'waste' ? 'ring-2 ring-amber-400 scale-105' : ''
            }`}
          >
            {waste.length > 0 && (
              <CardView card={waste[waste.length - 1]} isSelected={selectedCard?.source === 'waste'} />
            )}
          </div>

          {/* Gap column */}
          <div />

          {/* 4 Foundation Piles */}
          {foundations.map((fPile, idx) => {
            const suitSymbol = SUITS[idx];
            return (
              <div
                key={idx}
                className="w-full aspect-[2.5/3.5] rounded-xl border-2 border-dashed border-emerald-700/60 bg-emerald-950/50 flex items-center justify-center shadow-md relative"
              >
                {fPile.length > 0 ? (
                  <CardView card={fPile[fPile.length - 1]} isSelected={false} />
                ) : (
                  <span className="text-emerald-700/50 text-2xl select-none">{suitSymbol}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Tableau: 7 Cascading Columns */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 w-full flex-1 items-start min-h-[360px]">
          {tableau.map((col, colIdx) => (
            <div
              key={colIdx}
              onClick={() => col.length === 0 && handleEmptyTableauClick(colIdx)}
              className="w-full min-h-[300px] flex flex-col relative"
            >
              {col.length === 0 ? (
                <div className="w-full aspect-[2.5/3.5] rounded-xl border-2 border-dashed border-emerald-700/40 bg-emerald-950/30 flex items-center justify-center hover:border-emerald-500 cursor-pointer">
                  <span className="text-[11px] font-mono text-emerald-600/70">K</span>
                </div>
              ) : (
                col.map((card, cardIdx) => {
                  const isSelected =
                    selectedCard?.source === 'tableau' &&
                    selectedCard.tableauCol === colIdx &&
                    selectedCard.cardIdx !== undefined &&
                    cardIdx >= selectedCard.cardIdx;

                  return (
                    <div
                      key={card.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTableauCardClick(colIdx, cardIdx);
                      }}
                      style={{
                        marginTop: cardIdx === 0 ? '0' : '-44px',
                        zIndex: cardIdx + 1,
                      }}
                      className="cursor-pointer transition-transform"
                    >
                      <CardView card={card} isSelected={isSelected} />
                    </div>
                  );
                })
              )}
            </div>
          ))}
        </div>

        {/* Victory Celebration Overlay */}
        {isWon && (
          <div className="fixed inset-0 bg-emerald-950/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center">
            <span className="text-6xl mb-3 animate-bounce">🏆</span>
            <h2 className="text-3xl font-black text-amber-400 mb-2">SOLITAIRE VICTORY!</h2>
            <p className="text-sm text-emerald-200 mb-6">
              All 4 foundations packed in {moves} moves · Time: {formatTime(time)}
            </p>
            <button
              onClick={initGame}
              className="px-8 py-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black rounded-xl text-sm shadow-xl active:scale-95 transition-transform uppercase tracking-wider"
            >
              Play Another Hand
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-emerald-400/80 font-mono text-center">
        Click to auto-move to foundations or build tableau in descending alternating colors.
      </p>
    </div>
  );
}

// Reusable High-Fidelity Card View Component
function CardView({ card, isSelected }: { card: Card; isSelected: boolean }) {
  if (!card.faceUp) {
    return (
      <div className="w-full aspect-[2.5/3.5] rounded-xl bg-gradient-to-br from-indigo-800 to-indigo-950 border-2 border-indigo-400/50 shadow-md flex items-center justify-center select-none">
        <div className="w-4/5 h-4/5 rounded-lg border border-indigo-500/30 flex items-center justify-center">
          <span className="text-indigo-300/40 text-sm">✦</span>
        </div>
      </div>
    );
  }

  const isRed = card.color === 'red';
  const rankLabel = RANK_LABELS[card.rank];

  return (
    <div
      className={`w-full aspect-[2.5/3.5] rounded-xl bg-white border border-slate-300 shadow-md p-1 sm:p-1.5 flex flex-col justify-between select-none transition-all ${
        isSelected ? 'ring-3 ring-amber-400 -translate-y-1 shadow-xl' : 'hover:-translate-y-0.5'
      }`}
    >
      {/* Top Left Rank & Suit */}
      <div className={`flex flex-col items-center leading-none ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
        <span className="text-xs sm:text-sm font-extrabold font-mono">{rankLabel}</span>
        <span className="text-xs">{card.suit}</span>
      </div>

      {/* Center Giant Suit */}
      <div className={`self-center text-xl sm:text-2xl ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
        {card.suit}
      </div>

      {/* Bottom Right Rank & Suit (Inverted) */}
      <div
        className={`flex flex-col items-center leading-none rotate-180 ${
          isRed ? 'text-rose-600' : 'text-slate-900'
        }`}
      >
        <span className="text-xs sm:text-sm font-extrabold font-mono">{rankLabel}</span>
        <span className="text-xs">{card.suit}</span>
      </div>
    </div>
  );
}
