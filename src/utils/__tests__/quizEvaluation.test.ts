
import { describe, it, expect } from 'vitest';
import { calculateScore, categorizeProfile } from '../quizEvaluation';

describe('Quiz Evaluation Utils', () => {
  describe('calculateScore', () => {
    it('should calculate the total score for multiple-choice questions', () => {
      const questionResponse = { questionId: 'q1', answer: 'option1' };
      const question = { 
        id: 'q1', 
        type: 'multiple-choice', 
        options: [{ id: 'option1', weight: 5 }],
        text: 'Test question',
        required: true
      };
      
      expect(calculateScore(questionResponse, question)).toBe(5);
    });
    
    it('should return 0 if option is not found for multiple-choice questions', () => {
      const questionResponse = { questionId: 'q1', answer: 'non-existent' };
      const question = { 
        id: 'q1', 
        type: 'multiple-choice', 
        options: [{ id: 'option1', weight: 5 }],
        text: 'Test question',
        required: true
      };
      
      expect(calculateScore(questionResponse, question)).toBe(0);
    });
    
    it('should calculate the total score for checkbox questions', () => {
      const questionResponse = { questionId: 'q1', answer: ['option1', 'option2'] };
      const question = { 
        id: 'q1', 
        type: 'checkbox', 
        options: [
          { id: 'option1', weight: 5 },
          { id: 'option2', weight: 3 },
          { id: 'option3', weight: 1 }
        ],
        text: 'Test question',
        required: true
      };
      
      expect(calculateScore(questionResponse, question)).toBe(8);
    });
    
    it('should return 0 for open-ended questions', () => {
      const questionResponse = { questionId: 'q1', answer: 'Some text answer' };
      const question = { 
        id: 'q1', 
        type: 'open-ended',
        text: 'Test question',
        required: true
      };
      
      expect(calculateScore(questionResponse, question)).toBe(0);
    });
  });

  describe('categorizeProfile', () => {
    it('should categorize profile based on score and ranges', () => {
      const profileRanges = [
        { min: 0, max: 5, profile: 'Beginner', description: 'Beginner level' },
        { min: 6, max: 10, profile: 'Intermediate', description: 'Intermediate level' },
        { min: 11, max: 15, profile: 'Advanced', description: 'Advanced level' }
      ];
      
      expect(categorizeProfile(3, profileRanges)).toBe('Beginner');
      expect(categorizeProfile(7, profileRanges)).toBe('Intermediate');
      expect(categorizeProfile(12, profileRanges)).toBe('Advanced');
    });
    
    it('should return "Unknown profile" if no matching range is found', () => {
      const profileRanges = [
        { min: 0, max: 5, profile: 'Beginner', description: 'Beginner level' },
        { min: 6, max: 10, profile: 'Intermediate', description: 'Intermediate level' }
      ];
      
      expect(categorizeProfile(15, profileRanges)).toBe('Unknown profile');
    });
  });
});
