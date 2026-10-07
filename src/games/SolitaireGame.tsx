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
  const [hintMsg, setHintMsg] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<{
    card: Card;
    source: 'waste' | 'tableau';
    tableauCol?: number;
    cardIdx?: number;
  } | null>(null);

  const timerRef = useRef<number | null>(null);

  const initGame = () => {
    const deck = shuffleDeck(createDeck());
    const newTableau: Card[][] = [[], [], [], [], [], [], []];

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
    setHintMsg('Click any card to select, or double-click / click foundation to move up.');
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

  useEffect(() => {
    const totalFoundationCards = foundations.reduce((acc, f) => acc + f.length, 0);
    if (totalFoundationCards === 52 && !isWon) {
      setIsWon(true);
      sound.playSuccess();
      const finalScore = Math.max(100, 1000 - time * 2 - moves * 5 + 500);
      onFinish(finalScore, `Victory in ${moves} moves (${Math.floor(time / 60)}m ${time % 60}s)`);
    }
  }, [foundations, isWon, moves, time, onFinish]);

  const canPlaceOnTableau = (movingCard: Card, targetCard: Card): boolean => {
    return movingCard.color !== targetCard.color && movingCard.rank === targetCard.rank - 1;
  };

  const canPlaceOnFoundation = (card: Card, fPile: Card[], fSuit: Suit): boolean => {
    if (card.suit !== fSuit) return false;
    const topF = fPile[fPile.length - 1];
    if (!topF) return card.rank === 1;
    return topF.rank + 1 === card.rank;
  };

  const placeInFoundation = (fIdx: number, card: Card) => {
    sound.playSuccess();
    setFoundations((prev) => {
      const next = [...prev];
      next[fIdx] = [...next[fIdx], card];
      return next;
    });
    setScore((s) => s + 15);
    setMoves((m) => m + 1);
    setHintMsg(`Moved ${RANK_LABELS[card.rank]}${card.suit} to foundation!`);
  };

  const tryMoveToFoundation = (card: Card): boolean => {
    const fIdx = SUITS.indexOf(card.suit);
    if (fIdx === -1) return false;
    if (canPlaceOnFoundation(card, foundations[fIdx], SUITS[fIdx])) {
      placeInFoundation(fIdx, card);
      return true;
    }
    return false;
  };

  const handleStockClick = () => {
    sound.playTap();
    if (stock.length === 0) {
      if (waste.length === 0) return;
      const recycled = [...waste].reverse().map((c) => ({ ...c, faceUp: false }));
      setStock(recycled);
      setWaste([]);
      setMoves((m) => m + 1);
      setHintMsg('Recycled waste pile back into stock.');
    } else {
      const top = stock[stock.length - 1];
      const newStock = stock.slice(0, -1);
      const drawnCard = { ...top, faceUp: true };
      setStock(newStock);
      setWaste((w) => [...w, drawnCard]);
      setMoves((m) => m + 1);
      setHintMsg(`Drew ${RANK_LABELS[drawnCard.rank]}${drawnCard.suit}`);
    }
    setSelectedCard(null);
  };

  // Auto-move waste or tableau card to best valid destination (foundation or tableau)
  const autoMoveCard = (
    card: Card,
    source: 'waste' | 'tableau',
    sourceCol?: number,
    sourceCardIdx?: number
  ): boolean => {
    const isSingleCard =
      source === 'waste' ||
      (source === 'tableau' && sourceCol !== undefined && sourceCardIdx === tableau[sourceCol].length - 1);

    // 1. Try Foundation first if single card
    if (isSingleCard && tryMoveToFoundation(card)) {
      if (source === 'waste') {
        setWaste((w) => w.slice(0, -1));
      } else if (source === 'tableau' && sourceCol !== undefined) {
        setTableau((prev) => {
          const next = [...prev];
          const nextCol = next[sourceCol].slice(0, -1);
          if (nextCol.length > 0) {
            nextCol[nextCol.length - 1] = { ...nextCol[nextCol.length - 1], faceUp: true };
          }
          next[sourceCol] = nextCol;
          return next;
        });
      }
      setSelectedCard(null);
      return true;
    }

    // 2. Try Tableau columns
    for (let destCol = 0; destCol < 7; destCol++) {
      if (source === 'tableau' && sourceCol === destCol) continue;
      const col = tableau[destCol];
      if (col.length === 0) {
        if (card.rank === 13) {
          // Avoid pointless King move from one empty base to another empty column
          if (source === 'tableau' && sourceCardIdx === 0) continue;
          if (source === 'waste') {
            executeMoveFromWasteToTableau(destCol, card);
          } else if (source === 'tableau' && sourceCol !== undefined && sourceCardIdx !== undefined) {
            executeMoveTableauToTableau(sourceCol, sourceCardIdx, destCol);
          }
          return true;
        }
      } else {
        const targetCard = col[col.length - 1];
        if (targetCard.faceUp && canPlaceOnTableau(card, targetCard)) {
          if (source === 'waste') {
            executeMoveFromWasteToTableau(destCol, card);
          } else if (source === 'tableau' && sourceCol !== undefined && sourceCardIdx !== undefined) {
            executeMoveTableauToTableau(sourceCol, sourceCardIdx, destCol);
          }
          return true;
        }
      }
    }

    return false;
  };

  const handleWasteClick = () => {
    if (waste.length === 0) return;
    const topCard = waste[waste.length - 1];

    // If already selected, second click triggers smart auto-move!
    if (selectedCard?.source === 'waste') {
      if (!autoMoveCard(topCard, 'waste')) {
        setSelectedCard(null);
      }
      return;
    }

    // If Ace or 2 that can go straight to foundation, or user clicks waste
    sound.playTap();
    setSelectedCard({ card: topCard, source: 'waste' });
    setHintMsg(`Selected ${RANK_LABELS[topCard.rank]}${topCard.suit} — click a destination column, foundation, or click again to auto-move.`);
  };

  const handleFoundationClick = (fIdx: number) => {
    const fSuit = SUITS[fIdx];
    const fPile = foundations[fIdx];

    if (selectedCard) {
      const { card, source, tableauCol, cardIdx } = selectedCard;
      const isTopTableau =
        source === 'tableau' && tableauCol !== undefined && cardIdx === tableau[tableauCol].length - 1;

      if ((source === 'waste' || isTopTableau) && canPlaceOnFoundation(card, fPile, fSuit)) {
        placeInFoundation(fIdx, card);
        if (source === 'waste') {
          setWaste((w) => w.slice(0, -1));
        } else if (source === 'tableau' && tableauCol !== undefined) {
          setTableau((prev) => {
            const next = [...prev];
            const nextCol = next[tableauCol].slice(0, -1);
            if (nextCol.length > 0) {
              nextCol[nextCol.length - 1] = { ...nextCol[nextCol.length - 1], faceUp: true };
            }
            next[tableauCol] = nextCol;
            return next;
          });
        }
        setSelectedCard(null);
        return;
      }
    }

    // Also check if waste top card or any tableau top card can move to this foundation automatically
    if (waste.length > 0) {
      const topWaste = waste[waste.length - 1];
      if (canPlaceOnFoundation(topWaste, fPile, fSuit)) {
        placeInFoundation(fIdx, topWaste);
        setWaste((w) => w.slice(0, -1));
        setSelectedCard(null);
        return;
      }
    }

    for (let c = 0; c < 7; c++) {
      const col = tableau[c];
      if (col.length > 0) {
        const topT = col[col.length - 1];
        if (topT.faceUp && canPlaceOnFoundation(topT, fPile, fSuit)) {
          placeInFoundation(fIdx, topT);
          setTableau((prev) => {
            const next = [...prev];
            const nextCol = next[c].slice(0, -1);
            if (nextCol.length > 0) {
              nextCol[nextCol.length - 1] = { ...nextCol[nextCol.length - 1], faceUp: true };
            }
            next[c] = nextCol;
            return next;
          });
          setSelectedCard(null);
          return;
        }
      }
    }
  };

  const handleTableauCardClick = (colIdx: number, cardIdx: number) => {
    const col = tableau[colIdx];
    const card = col[cardIdx];

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

    // If holding a selected card from elsewhere, try to drop onto this column's bottom card
    if (selectedCard) {
      const targetCard = col[col.length - 1];
      if (selectedCard.source === 'waste') {
        if (canPlaceOnTableau(selectedCard.card, targetCard)) {
          executeMoveFromWasteToTableau(colIdx, selectedCard.card);
          return;
        }
      } else if (selectedCard.source === 'tableau' && selectedCard.tableauCol !== undefined) {
        if (selectedCard.tableauCol !== colIdx && canPlaceOnTableau(selectedCard.card, targetCard)) {
          executeMoveTableauToTableau(selectedCard.tableauCol, selectedCard.cardIdx!, colIdx);
          return;
        }
      }
    }

    // If clicking the already-selected card again -> auto-move it!
    if (
      selectedCard?.source === 'tableau' &&
      selectedCard.tableauCol === colIdx &&
      selectedCard.cardIdx === cardIdx
    ) {
      if (!autoMoveCard(card, 'tableau', colIdx, cardIdx)) {
        setSelectedCard(null);
      }
      return;
    }

    sound.playTap();
    setSelectedCard({
      card,
      source: 'tableau',
      tableauCol: colIdx,
      cardIdx,
    });
    setHintMsg(`Selected ${RANK_LABELS[card.rank]}${card.suit} — click destination or click again to auto-move.`);
  };

  const handleEmptyTableauClick = (colIdx: number) => {
    if (!selectedCard) return;

    if (selectedCard.card.rank === 13) {
      if (selectedCard.source === 'waste') {
        executeMoveFromWasteToTableau(colIdx, selectedCard.card);
      } else if (selectedCard.source === 'tableau' && selectedCard.tableauCol !== undefined) {
        executeMoveTableauToTableau(selectedCard.tableauCol, selectedCard.cardIdx!, colIdx);
      }
    } else {
      sound.playFail();
      setHintMsg('Only a King (K) can be placed on an empty column!');
    }
  };

  const executeMoveFromWasteToTableau = (destCol: number, cardToMove: Card) => {
    sound.playTap();
    setTableau((prev) => {
      const next = [...prev];
      next[destCol] = [...next[destCol], cardToMove];
      return next;
    });
    setWaste((w) => w.slice(0, -1));
    setSelectedCard(null);
    setMoves((m) => m + 1);
    setScore((s) => s + 5);
    setHintMsg(`Placed ${RANK_LABELS[cardToMove.rank]}${cardToMove.suit} on column ${destCol + 1}.`);
  };

  const executeMoveTableauToTableau = (sourceCol: number, sourceCardIdx: number, destCol: number) => {
    sound.playTap();
    const movingStack = tableau[sourceCol].slice(sourceCardIdx);

    setTableau((prev) => {
      const next = [...prev];
      const remainingSource = next[sourceCol].slice(0, sourceCardIdx);
      if (remainingSource.length > 0) {
        remainingSource[remainingSource.length - 1] = {
          ...remainingSource[remainingSource.length - 1],
          faceUp: true,
        };
      }
      next[sourceCol] = remainingSource;
      next[destCol] = [...next[destCol], ...movingStack];
      return next;
    });

    setSelectedCard(null);
    setMoves((m) => m + 1);
    setScore((s) => s + 5);
  };

  const handleAutoFoundationPass = () => {
    // Try moving any eligible top card from waste or tableau to foundation
    if (waste.length > 0) {
      const topW = waste[waste.length - 1];
      if (tryMoveToFoundation(topW)) {
        setWaste((w) => w.slice(0, -1));
        setSelectedCard(null);
        return;
      }
    }
    for (let c = 0; c < 7; c++) {
      const col = tableau[c];
      if (col.length > 0) {
        const topT = col[col.length - 1];
        if (topT.faceUp && tryMoveToFoundation(topT)) {
          setTableau((prev) => {
            const next = [...prev];
            const nextCol = next[c].slice(0, -1);
            if (nextCol.length > 0) {
              nextCol[nextCol.length - 1] = { ...nextCol[nextCol.length - 1], faceUp: true };
            }
            next[c] = nextCol;
            return next;
          });
          setSelectedCard(null);
          return;
        }
      }
    }
    sound.playFail();
    setHintMsg('No immediate foundation moves available.');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full select-none max-w-3xl mx-auto">
      {/* Compact Header Bar */}
      <div className="flex flex-wrap justify-between items-center w-full px-3 py-1.5 bg-emerald-950/80 border border-emerald-800/80 rounded-xl text-xs font-mono text-emerald-200 shadow">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white flex items-center gap-1">
            <span>♠</span> Solitaire
          </span>
          <span className="text-emerald-400">Score: {score}</span>
          <span className="text-emerald-300">Moves: {moves}</span>
          <span className="text-amber-400 font-bold">⏱ {formatTime(time)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoFoundationPass}
            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg transition-colors font-sans text-[11px] font-semibold active:scale-95"
          >
            ⬆ Auto Foundation
          </button>
          <button
            onClick={initGame}
            className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg transition-colors font-sans text-[11px] font-semibold active:scale-95"
          >
            New Deal
          </button>
        </div>
      </div>

      {/* Felt Playing Arena - Compact so entire board fits without scrolling */}
      <div className="w-full bg-gradient-to-b from-emerald-900 to-emerald-950 border-2 border-emerald-800/80 rounded-2xl p-2.5 sm:p-4 shadow-xl flex flex-col justify-between">
        {/* Top Row: Stock, Waste, and 4 Foundation Piles */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 w-full mb-3">
          {/* Stock Pile */}
          <div
            onClick={handleStockClick}
            title="Draw Card from Stock"
            className="w-full h-16 sm:h-20 rounded-lg border-2 border-dashed border-emerald-700/60 bg-emerald-950/50 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-emerald-400 shadow relative"
          >
            {stock.length > 0 ? (
              <div className="w-full h-full rounded-lg bg-gradient-to-br from-indigo-700 to-indigo-950 border border-indigo-400/50 shadow flex flex-col items-center justify-center">
                <span className="text-indigo-200 text-base sm:text-lg font-bold">🂠</span>
                <span className="text-[9px] font-mono text-indigo-200">{stock.length}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-emerald-400 text-lg">↺</span>
                <span className="text-[9px] text-emerald-400 font-mono">Reset</span>
              </div>
            )}
          </div>

          {/* Waste Pile */}
          <div
            onClick={handleWasteClick}
            onDoubleClick={() => {
              if (waste.length > 0) {
                autoMoveCard(waste[waste.length - 1], 'waste');
              }
            }}
            className={`w-full h-16 sm:h-20 rounded-lg border-2 border-dashed border-emerald-700/60 bg-emerald-950/50 flex items-center justify-center cursor-pointer transition-all relative ${
              selectedCard?.source === 'waste' ? 'ring-2 ring-amber-400 scale-105 z-10' : ''
            }`}
          >
            {waste.length > 0 ? (
              <CardView card={waste[waste.length - 1]} isSelected={selectedCard?.source === 'waste'} />
            ) : (
              <span className="text-[10px] font-mono text-emerald-700">Waste</span>
            )}
          </div>

          {/* Spacer column */}
          <div className="flex items-center justify-center">
            <span className="text-[10px] font-mono text-emerald-600/70 hidden sm:inline text-center leading-tight">
              Double-click<br />to auto-move
            </span>
          </div>

          {/* 4 Foundation Piles */}
          {foundations.map((fPile, idx) => {
            const suitSymbol = SUITS[idx];
            const isRedSuit = suitSymbol === '♥' || suitSymbol === '♦';
            return (
              <div
                key={idx}
                onClick={() => handleFoundationClick(idx)}
                title={`Foundation (${suitSymbol})`}
                className="w-full h-16 sm:h-20 rounded-lg border-2 border-dashed border-emerald-700/60 bg-emerald-950/50 hover:border-amber-400/70 flex items-center justify-center shadow cursor-pointer relative transition-colors"
              >
                {fPile.length > 0 ? (
                  <CardView card={fPile[fPile.length - 1]} isSelected={false} />
                ) : (
                  <span
                    className={`text-xl sm:text-2xl select-none ${
                      isRedSuit ? 'text-rose-500/40' : 'text-emerald-500/40'
                    }`}
                  >
                    {suitSymbol}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Tableau: 7 Cascading Columns */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 w-full items-start min-h-[240px] sm:min-h-[270px]">
          {tableau.map((col, colIdx) => (
            <div
              key={colIdx}
              onClick={() => col.length === 0 && handleEmptyTableauClick(colIdx)}
              className="w-full min-h-[210px] flex flex-col relative"
            >
              {col.length === 0 ? (
                <div className="w-full h-16 sm:h-20 rounded-lg border-2 border-dashed border-emerald-700/40 bg-emerald-950/30 flex items-center justify-center hover:border-amber-400/60 cursor-pointer">
                  <span className="text-[10px] font-mono text-emerald-600/70">K</span>
                </div>
              ) : (
                col.map((card, cardIdx) => {
                  const isSelected =
                    selectedCard?.source === 'tableau' &&
                    selectedCard.tableauCol === colIdx &&
                    selectedCard.cardIdx !== undefined &&
                    cardIdx >= selectedCard.cardIdx;

                  const prevCard = cardIdx > 0 ? col[cardIdx - 1] : null;
                  const topOffset = cardIdx === 0 ? '0px' : prevCard?.faceUp ? '-42px' : '-52px';

                  return (
                    <div
                      key={card.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTableauCardClick(colIdx, cardIdx);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (card.faceUp) {
                          autoMoveCard(card, 'tableau', colIdx, cardIdx);
                        }
                      }}
                      style={{
                        marginTop: topOffset,
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
            <span className="text-5xl mb-2 animate-bounce">🏆</span>
            <h2 className="text-2xl font-black text-amber-400 mb-1">SOLITAIRE VICTORY!</h2>
            <p className="text-xs text-emerald-200 mb-4">
              All 4 foundations packed in {moves} moves · Time: {formatTime(time)}
            </p>
            <button
              onClick={initGame}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black rounded-xl text-xs shadow-xl active:scale-95 transition-transform uppercase tracking-wider"
            >
              Play Another Hand
            </button>
          </div>
        )}
      </div>

      {hintMsg && (
        <p className="text-[11px] text-emerald-300/90 font-mono text-center truncate max-w-full">
          {hintMsg}
        </p>
      )}
    </div>
  );
}

function CardView({ card, isSelected }: { card: Card; isSelected: boolean }) {
  if (!card.faceUp) {
    return (
      <div className="w-full h-16 sm:h-20 rounded-lg bg-gradient-to-br from-indigo-800 to-indigo-950 border border-indigo-400/50 shadow flex items-center justify-center select-none">
        <div className="w-4/5 h-4/5 rounded border border-indigo-500/30 flex items-center justify-center">
          <span className="text-indigo-300/40 text-xs">✦</span>
        </div>
      </div>
    );
  }

  const isRed = card.color === 'red';
  const rankLabel = RANK_LABELS[card.rank];

  return (
    <div
      className={`w-full h-16 sm:h-20 rounded-lg bg-white border border-slate-300 shadow p-1 sm:p-1.5 flex flex-col justify-between select-none transition-all ${
        isSelected ? 'ring-2 ring-amber-400 -translate-y-1 shadow-lg' : 'hover:-translate-y-0.5'
      }`}
    >
      {/* Top Row: Rank & Suit clearly visible even when stacked */}
      <div className={`flex items-center justify-between leading-none ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
        <span className="text-xs sm:text-sm font-black font-mono tracking-tighter">{rankLabel}</span>
        <span className="text-xs sm:text-sm leading-none">{card.suit}</span>
      </div>

      {/* Center Giant Suit */}
      <div className={`self-center text-lg sm:text-2xl leading-none ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
        {card.suit}
      </div>

      {/* Bottom Right Rank */}
      <div className={`flex items-center justify-end leading-none ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
        <span className="text-[10px] font-bold font-mono opacity-80">{rankLabel}{card.suit}</span>
      </div>
    </div>
  );
}
