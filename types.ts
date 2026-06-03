
export type QuestionType = 'boolean' | 'multiple';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // Only for multiple choice
  correctAnswer: string; // 'صح', 'غلط' or 'أ', 'ب', 'ج', 'د'
  userAnswer?: string;
}

export type AppState = 'input' | 'quiz' | 'result';
