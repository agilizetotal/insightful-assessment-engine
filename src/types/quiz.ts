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
  logical_operator?: 'AND' | 'OR';
  created_at?: string;
  dependent_question_id?: string;
  id?: string;
  question_id?: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: Option[];
  required: boolean;
  conditions?: Condition[];
  imageUrl?: string;
  groupId?: string;
}

export interface QuestionGroup {
  id: string;
  title: string;
  description?: string;
  weight: number;
  order: number;
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
  questionGroups: QuestionGroup[];
  profileRanges: ProfileRange[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizResponse {
  questionId: string;
  answer: string | string[];
}

export interface GroupScore {
  groupId: string;
  groupTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface QuizResult {
  quizId: string;
  responses: QuizResponse[];
  score: number;
  groupScores?: GroupScore[];
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

// New type for displaying question groups in the UI
export interface DisplayQuestionGroup {
  title?: string;
  description?: string;
  weight?: number;
  questions: Question[];
}
