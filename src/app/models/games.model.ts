import { GameStatus, RoundStatus } from '@sharedEnums/states';

export interface GameModel {
  id?: string;
  player1: UserOfGameModel;
  player2: UserOfGameModel;
  currentPlayerId: string;
  currentTurn: Turn;
  winner?: 'player1' | 'player2';
  rounds: RoundModel[];
  startTime: Date;
  endTime?: Date;
  status: GameStatus;
}

export interface Turn {
  id?: string;
  playerId: string;
  roundNumber: number;
}

export interface RoundModel {
  id?: string;
  roundNumber: number;
  questionId: string;
  player1Answer?: PlayerAnswer;
  player2Answer?: PlayerAnswer;
  status: RoundStatus;
}

export interface PlayerAnswer {
  answerId: string;
  isCorrect: boolean;
}

export interface UserOfGameModel {
  userId: string;
  userName: string;
  score: number;
}
