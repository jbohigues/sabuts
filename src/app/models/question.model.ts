export interface QuestionModel {
  id?: string;
  categoryId?: string;
  isCrown?: boolean;
  questionText: string;
  answers: AnswerModel[];
}

export interface AnswerModel {
  id?: string;
  isCorrect: boolean;
  value: string;
}
