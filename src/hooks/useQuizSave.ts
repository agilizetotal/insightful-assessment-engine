
import { useState } from 'react';
import { Quiz } from '@/types/quiz';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { saveQuestions } from './quiz/useQuestionsSave';
import { saveProfileRanges } from './quiz/useProfileRangesSave';
import { saveQuestionGroups } from './quiz/useQuestionGroupsSave';
import { saveQuizBasicInfo } from './quiz/useQuizBasicInfoSave';

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
      console.log("User ID:", user.id);
      console.log("Quiz data:", JSON.stringify(quiz, null, 2));
      
      // Step 1: Update or insert quiz basic info
      await saveQuizBasicInfo(quiz, user.id);
      
      // Step 2: Save question groups first (with debug logging)
      if (quiz.questionGroups && quiz.questionGroups.length > 0) {
        console.log("Saving question groups:", JSON.stringify(quiz.questionGroups, null, 2));
        const groupsSaved = await saveQuestionGroups(quiz.id, quiz.questionGroups);
        if (!groupsSaved) {
          console.error("Failed to save question groups");
          throw new Error("Falha ao salvar grupos de perguntas");
        }
      }
      
      // Step 3: Save questions (and their options and conditions)
      console.log("Saving questions with groups:", quiz.questions.map(q => ({ 
        id: q.id, 
        text: q.text.substring(0, 20),
        groupId: q.groupId
      })));
      
      const questionsSaved = await saveQuestions(quiz.id, quiz.questions);
      if (!questionsSaved) {
        console.error("Failed to save questions");
        throw new Error("Falha ao salvar perguntas");
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
      toast.error(`Erro ao salvar questionário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
