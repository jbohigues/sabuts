export interface QuestionModel {
  id?: string;
  category: string;
  question: string;
  answers: AnswerModel[];
}

export interface AnswerModel {
  isCorrect: boolean;
  value: string;
}
