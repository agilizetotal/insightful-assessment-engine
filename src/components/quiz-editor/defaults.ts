
import { Question, Option, Condition, ProfileRange } from '@/types/quiz';

export const defaultQuestion: Question = {
  id: '',
  text: '',
  type: 'multiple-choice',
  options: [],
  required: true,
  conditions: []
};

export const defaultOption: Option = {
  id: '',
  text: '',
  weight: 0
};

export const defaultCondition: Condition = {
  questionId: '',
  operator: 'equals',
  value: '',
  logical_operator: 'AND'
};

export const defaultProfileRange: ProfileRange = {
  min: 0,
  max: 0,
  profile: '',
  description: ''
};
