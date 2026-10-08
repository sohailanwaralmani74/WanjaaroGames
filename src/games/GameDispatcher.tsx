import React from 'react';
import { SnakeAndLadderGame } from './snakeAndLadder/SnakeAndLadderGame';
import { SnakeGame } from './snakeGame/SnakeGame';
import { MatchingCardGame } from './matchingCard/MatchingCardGame';
import { SnakeEscapeGame } from './snakeEscape/SnakeEscapeGame';
import { ParrotFlapGame } from './parrotFlap/ParrotFlapGame';

export interface GameProps {
  onComplete?: (score: number) => void;
}

export const GameDispatcher: React.FC<{
  gameId: string;
  onComplete?: (score: number) => void;
}> = ({ gameId }) => {
  if (gameId === 'parrot-flap') {
    return <ParrotFlapGame />;
  }
  if (gameId === 'snake-escape') {
    return <SnakeEscapeGame />;
  }
  if (gameId === 'matching-card-game') {
    return <MatchingCardGame />;
  }
  if (gameId === 'snake-game') {
    return <SnakeGame />;
  }
  return <SnakeAndLadderGame />;
};
