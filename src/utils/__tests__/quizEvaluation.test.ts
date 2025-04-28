
import { calculateQuizResult, evaluateCondition, evaluateConditions } from '../quizEvaluation';
import { Quiz, QuizResponse, UserData } from '@/types/quiz';

describe('evaluateCondition', () => {
  const answers = {
    'q1': 'yes',
    'q2': '5',
    'q3': ['option1', 'option2'],
    'q4': 'test string'
  };

  test('equals operator works correctly', () => {
    expect(evaluateCondition({
      operator: 'equals' as const,
      question_id: 'q1',
      value: 'yes'
    }, answers)).toBe(true);

    expect(evaluateCondition({
      operator: 'equals' as const,
      question_id: 'q1',
      value: 'no'
    }, answers)).toBe(false);
  });

  test('not-equals operator works correctly', () => {
    expect(evaluateCondition({
      operator: 'not-equals',
      question_id: 'q1',
      value: 'no'
    }, answers)).toBe(true);
  });

  test('greater-than operator works correctly', () => {
    expect(evaluateCondition({
      operator: 'greater-than',
      question_id: 'q2',
      value: '3'
    }, answers)).toBe(true);
  });

  test('less-than operator works correctly', () => {
    expect(evaluateCondition({
      operator: 'less-than',
      question_id: 'q2',
      value: '10'
    }, answers)).toBe(true);
  });

  test('contains operator works correctly', () => {
    expect(evaluateCondition({
      operator: 'contains',
      question_id: 'q3',
      value: 'option1'
    }, answers)).toBe(true);
  });
});

describe('evaluateConditions', () => {
  const answers = {
    'q1': 'yes',
    'q2': '5'
  };

  test('evaluates single condition correctly', () => {
    const conditions = [{
      operator: 'equals' as const,
      question_id: 'q1',
      value: 'yes',
      logical_operator: 'AND' as const
    }];

    expect(evaluateConditions(conditions, answers)).toBe(true);
  });

  test('evaluates AND conditions correctly', () => {
    const conditions = [
      {
        operator: 'equals' as const,
        question_id: 'q1',
        value: 'yes',
        logical_operator: 'AND' as const
      },
      {
        operator: 'equals' as const,
        question_id: 'q2',
        value: '5',
        logical_operator: 'AND' as const
      }
    ];

    expect(evaluateConditions(conditions, answers)).toBe(true);
  });

  test('evaluates OR conditions correctly', () => {
    const conditions = [
      {
        operator: 'equals',
        question_id: 'q1',
        value: 'no',
        logical_operator: 'OR'
      },
      {
        operator: 'equals',
        question_id: 'q2',
        value: '5',
        logical_operator: 'OR'
      }
    ];

    expect(evaluateConditions(conditions, answers)).toBe(true);
  });
});

describe('calculateQuizResult', () => {
  const mockQuiz: Quiz = {
    id: '1',
    title: 'Test Quiz',
    description: 'Test Description',
    questions: [
      {
        id: 'q1',
        text: 'Question 1',
        type: 'multiple-choice',
        required: true,
        options: [
          { id: 'opt1', text: 'Option 1', weight: 2 },
          { id: 'opt2', text: 'Option 2', weight: 1 }
        ]
      },
      {
        id: 'q2',
        text: 'Question 2',
        type: 'checkbox',
        required: true,
        options: [
          { id: 'opt3', text: 'Option 3', weight: 3 },
          { id: 'opt4', text: 'Option 4', weight: 1 }
        ]
      }
    ],
    profileRanges: [
      {
        min: 0,
        max: 3,
        profile: 'Beginner',
        description: 'Beginner level'
      },
      {
        min: 4,
        max: 7,
        profile: 'Advanced',
        description: 'Advanced level'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockResponses: QuizResponse[] = [
    {
      questionId: 'q1',
      answer: 'opt1'
    },
    {
      questionId: 'q2',
      answer: ['opt3', 'opt4']
    }
  ];

  const mockUserData: UserData = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '1234567890'
  };

  test('calculates score correctly', () => {
    const result = calculateQuizResult(mockQuiz, mockResponses, mockUserData);
    
    // Expected score:
    // Q1: opt1 = 2 points
    // Q2: opt3 = 3 points, opt4 = 1 point
    // Total = 6 points
    expect(result.score).toBe(6);
  });

  test('assigns correct profile based on score', () => {
    const result = calculateQuizResult(mockQuiz, mockResponses, mockUserData);
    expect(result.profile).toBe('Advanced'); // Score 6 falls in Advanced range (4-7)
  });

  test('includes user data in result', () => {
    const result = calculateQuizResult(mockQuiz, mockResponses, mockUserData);
    expect(result.userData).toEqual(mockUserData);
  });
});
