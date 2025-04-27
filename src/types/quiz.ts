export type QuestionType = 'multiple-choice' | 'checkbox' | 'open-ended';

export interface Option {
  id: string;
  text: string;
  weight: number;
}

export interface Condition {
  questionId: string;
  operator: 'equals' | 'not-equals' | 'greater-than' | 'less-than' | 'contains';
  value: string;
  logicalOperator?: 'AND' | 'OR';
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: Option[];
  required: boolean;
  conditions?: Condition[];
}

export interface ProfileRange {
  min: number;
  max: number;
  profile: string;
  description: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  profileRanges: ProfileRange[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizResponse {
  questionId: string;
  answer: string | string[];
}

export interface QuizResult {
  quizId: string;
  responses: QuizResponse[];
  score: number;
  profile: string;
  completedAt: string;
  userId?: string;
  isPremium: boolean;
  userData?: UserData;
}

export interface UserData {
  name: string;
  email: string;
  phone: string;
}
