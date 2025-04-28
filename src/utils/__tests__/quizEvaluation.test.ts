
import { describe, it, expect } from 'vitest';
import { evaluateCondition, evaluateConditions, calculateQuizResult } from '../quizEvaluation';
import { Quiz, QuizResponse } from '@/types/quiz';

describe('evaluateCondition', () => {
  it('should evaluate equals condition correctly', () => {
    expect(evaluateCondition('equals', 'value1', 'value1')).toBe(true);
    expect(evaluateCondition('equals', 'value1', 'value2')).toBe(false);
  });

  it('should evaluate not-equals condition correctly', () => {
    expect(evaluateCondition('not-equals', 'value1', 'value2')).toBe(true);
    expect(evaluateCondition('not-equals', 'value1', 'value1')).toBe(false);
  });

  it('should evaluate greater-than condition correctly', () => {
    expect(evaluateCondition('greater-than', '5', '3')).toBe(true);
    expect(evaluateCondition('greater-than', '3', '5')).toBe(false);
  });

  it('should evaluate less-than condition correctly', () => {
    expect(evaluateCondition('less-than', '3', '5')).toBe(true);
    expect(evaluateCondition('less-than', '5', '3')).toBe(false);
  });

  it('should evaluate contains condition correctly', () => {
    expect(evaluateCondition('contains', 'abc', 'a')).toBe(true);
    expect(evaluateCondition('contains', 'abc', 'd')).toBe(false);
  });
});

describe('evaluateConditions', () => {
  const responses = [
    { questionId: 'q1', answer: 'answer1' },
    { questionId: 'q2', answer: 'answer2' },
    { questionId: 'q3', answer: 'answer3' },
  ];

  it('should return true when no conditions provided', () => {
    expect(evaluateConditions([], responses)).toBe(true);
  });

  it('should evaluate single condition correctly', () => {
    const conditions = [
      { questionId: 'q1', operator: 'equals' as const, value: 'answer1' }
    ];
    expect(evaluateConditions(conditions, responses)).toBe(true);

    const failingConditions = [
      { questionId: 'q1', operator: 'equals' as const, value: 'wrong' }
    ];
    expect(evaluateConditions(failingConditions, responses)).toBe(false);
  });

  it('should evaluate multiple conditions with AND correctly', () => {
    const conditions = [
      { questionId: 'q1', operator: 'equals' as const, value: 'answer1', logical_operator: 'AND' as const },
      { questionId: 'q2', operator: 'equals' as const, value: 'answer2', logical_operator: 'AND' as const }
    ];
    expect(evaluateConditions(conditions, responses)).toBe(true);

    const failingConditions = [
      { questionId: 'q1', operator: 'equals' as const, value: 'answer1', logical_operator: 'AND' as const },
      { questionId: 'q2', operator: 'equals' as const, value: 'wrong', logical_operator: 'AND' as const }
    ];
    expect(evaluateConditions(failingConditions, responses)).toBe(false);
  });

  it('should evaluate multiple conditions with OR correctly', () => {
    const conditions = [
      { questionId: 'q1', operator: 'equals' as const, value: 'wrong', logical_operator: 'OR' as const },
      { questionId: 'q2', operator: 'equals' as const, value: 'answer2', logical_operator: 'OR' as const }
    ];
    expect(evaluateConditions(conditions, responses)).toBe(true);

    const failingConditions = [
      { questionId: 'q1', operator: 'equals' as const, value: 'wrong', logical_operator: 'OR' as const },
      { questionId: 'q2', operator: 'equals' as const, value: 'also-wrong', logical_operator: 'OR' as const }
    ];
    expect(evaluateConditions(failingConditions, responses)).toBe(false);
  });
});

describe('calculateQuizResult', () => {
  const mockQuiz: Quiz = {
    id: 'quiz1',
    title: 'Test Quiz',
    description: 'A test quiz',
    questions: [
      {
        id: 'q1',
        text: 'Question 1',
        type: 'multiple-choice',
        required: true,
        options: [
          { id: 'opt1', text: 'Option 1', weight: 5 },
          { id: 'opt2', text: 'Option 2', weight: 10 }
        ]
      },
      {
        id: 'q2',
        text: 'Question 2',
        type: 'checkbox',
        required: true,
        options: [
          { id: 'opt3', text: 'Option 3', weight: 3 },
          { id: 'opt4', text: 'Option 4', weight: 7 }
        ]
      },
      {
        id: 'q3',
        text: 'Question 3',
        type: 'open-ended',
        required: false
      }
    ],
    profileRanges: [
      { min: 0, max: 10, profile: 'Beginner', description: 'You are a beginner' },
      { min: 11, max: 20, profile: 'Intermediate', description: 'You are intermediate' },
      { min: 21, max: 100, profile: 'Advanced', description: 'You are advanced' }
    ],
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  };

  it('should calculate score and assign correct profile', () => {
    const responses: QuizResponse[] = [
      { questionId: 'q1', answer: 'opt1' }, // 5 points
      { questionId: 'q2', answer: ['opt3', 'opt4'] }, // 10 points
      { questionId: 'q3', answer: 'This is an open-ended response' } // 0 points (open-ended)
    ];

    const userData = { name: 'Test User', email: 'test@example.com', phone: '123456789' };
    
    const result = calculateQuizResult(mockQuiz, responses, userData);
    
    expect(result.score).toBe(15);
    expect(result.profile).toBe('Intermediate');
    expect(result.userData).toBe(userData);
    expect(result.quizId).toBe('quiz1');
    expect(result.responses).toEqual(responses);
    expect(typeof result.completedAt).toBe('string');
  });

  it('should handle empty responses', () => {
    const result = calculateQuizResult(mockQuiz, [], { name: '', email: '', phone: '' });
    
    expect(result.score).toBe(0);
    expect(result.profile).toBe('Beginner');
  });
});
