
import { describe, it, expect } from 'vitest';
import { calculateResultScore, determineProfile } from '../quizEvaluation';
import { Question, QuestionType, QuizResponse } from '@/types/quiz';

describe('Quiz Evaluation Utils', () => {
  describe('calculateResultScore', () => {
    it('should calculate the total score for multiple-choice questions', () => {
      const questionResponse: QuizResponse = { questionId: 'q1', answer: 'option1' };
      const question: Question = { 
        id: 'q1', 
        text: 'Test question',
        type: 'multiple-choice' as QuestionType, 
        required: true,
        options: [{ id: 'option1', text: 'Option 1', weight: 5 }]
      };
      
      expect(calculateResultScore([questionResponse], [question])).toBe(5);
    });
    
    it('should calculate the total score for checkbox questions', () => {
      const questionResponse: QuizResponse = { questionId: 'q1', answer: ['option1', 'option2'] };
      const question: Question = { 
        id: 'q1', 
        text: 'Test question',
        type: 'checkbox' as QuestionType,
        required: true,
        options: [
          { id: 'option1', text: 'Option 1', weight: 5 },
          { id: 'option2', text: 'Option 2', weight: 3 },
          { id: 'option3', text: 'Option 3', weight: 1 }
        ]
      };
      
      expect(calculateResultScore([questionResponse], [question])).toBe(8);
    });
  });

  describe('determineProfile', () => {
    it('should determine profile based on score and ranges', () => {
      const profileRanges = [
        { min: 0, max: 5, profile: 'Beginner', description: 'Beginner level' },
        { min: 6, max: 10, profile: 'Intermediate', description: 'Intermediate level' },
        { min: 11, max: 15, profile: 'Advanced', description: 'Advanced level' }
      ];
      
      expect(determineProfile(3, profileRanges)).toBe('Beginner');
      expect(determineProfile(7, profileRanges)).toBe('Intermediate');
      expect(determineProfile(12, profileRanges)).toBe('Advanced');
    });
    
    it('should return "Unknown profile" if no matching range is found', () => {
      const profileRanges = [
        { min: 0, max: 5, profile: 'Beginner', description: 'Beginner level' },
        { min: 6, max: 10, profile: 'Intermediate', description: 'Intermediate level' }
      ];
      
      expect(determineProfile(15, profileRanges)).toBe('Unknown profile');
    });
  });
});
