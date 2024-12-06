export interface GameModel {
  id: string;
  player1: UserOfGameModel;
  player2: UserOfGameModel;
  currentPlayerId: string;
  startTime: Date;
  endTime?: Date;
  rounds: RoundModel[];
  winner?: string;
  categories: number[];
  status: number;
}

export interface RoundModel {
  roundNumber: number;
  category: string;
  question: string;
  options: string[];
  correctAnswer: string;
  player1Answer?: string;
  player2Answer?: string;
  timeLimit: number;
}

export interface UserOfGameModel {
  id: string;
  name: string;
  score: number;
}
