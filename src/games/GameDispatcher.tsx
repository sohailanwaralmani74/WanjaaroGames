import React from 'react';
import { SnakeAndLadderGame } from './snakeAndLadder/SnakeAndLadderGame';

export interface GameProps {
  onFinish: (score: number, formattedScore: string) => void;
}

interface DispatcherProps {
  gameId: string;
  onFinish: (score: number, formattedScore: string) => void;
}

export function GameDispatcher({ gameId }: DispatcherProps) {
  if (gameId === 'snake-and-ladder' || !gameId) {
    return <SnakeAndLadderGame />;
  }
  return <SnakeAndLadderGame />;
}
