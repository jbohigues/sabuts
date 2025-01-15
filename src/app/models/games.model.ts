import { GameStatusEnum, RoundStatusEnum } from '@sharedEnums/states';

export interface GameModel {
  id: string;
  player1: UserOfGameModel; //! siempre será el usuario logueado
  player2: UserOfGameModel;
  currentTurn: Turn;
  winner?: 'player1' | 'player2';
  rounds: RoundModel[];
  startTime: Date;
  updatedAt: Date;
  endTime?: Date;
  status: GameStatusEnum;
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
  status: RoundStatusEnum;
}

export interface PlayerAnswer {
  answerId: string;
  isCorrect: boolean;
}

export interface UserOfGameModel {
  userId: string;
  userName: string;
  backgroundColor: string;
  score: number;
}
