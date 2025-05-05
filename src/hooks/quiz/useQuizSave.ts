
import { useState } from 'react';
import { Quiz } from '@/types/quiz';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { saveQuestions } from './useQuestionsSave';
import { saveProfileRanges } from './useProfileRangesSave';
import { saveQuestionGroups } from './useQuestionGroupsSave';
import { saveQuizBasicInfo } from './useQuizBasicInfoSave';

export const useQuizSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const saveToSupabase = async (quiz: Quiz): Promise<Quiz | null> => {
    if (!user) {
      toast.error("Você precisa estar logado para salvar questionários");
      return null;
    }

    setIsSaving(true);
    try {
      console.log("Starting quiz save operation");
      
      // Step 1: Update or insert quiz basic info
      await saveQuizBasicInfo(quiz, user.id);
      
      // Step 2: Save question groups first
      if (quiz.questionGroups && quiz.questionGroups.length > 0) {
        console.log("Saving question groups:", quiz.questionGroups.length);
        const groupsSaved = await saveQuestionGroups(quiz.id, quiz.questionGroups);
        if (!groupsSaved) {
          console.error("Failed to save question groups");
          throw new Error("Failed to save question groups");
        }
      }
      
      // Step 3: Save questions (and their options and conditions)
      console.log("Saving questions:", quiz.questions.length);
      const questionsSaved = await saveQuestions(quiz.id, quiz.questions);
      if (!questionsSaved) {
        console.error("Failed to save questions");
        throw new Error("Failed to save questions");
      }
      
      // Step 4: Save profile ranges
      if (quiz.profileRanges && quiz.profileRanges.length > 0) {
        console.log("Saving profile ranges:", quiz.profileRanges.length);
        await saveProfileRanges(quiz.id, quiz.profileRanges);
      }
      
      // Return the updated quiz
      console.log("Quiz saved successfully");
      const updatedQuiz: Quiz = {
        ...quiz,
        updatedAt: new Date().toISOString()
      };
      
      return updatedQuiz;
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.error("Erro ao salvar questionário");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveToSupabase
  };
};
