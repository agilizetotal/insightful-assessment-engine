
import { useState } from 'react';
import { Quiz } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { saveQuestions } from './useQuestionsSave';
import { saveProfileRanges } from './useProfileRangesSave';
import { saveQuestionGroups } from './useQuestionGroupsSave';

export const useQuizSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const saveQuizBasicInfo = async (quiz: Quiz) => {
    if (!user) {
      throw new Error("Authentication required");
    }
    
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .upsert({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        user_id: user.id,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (quizError) {
      throw quizError;
    }
    
    return quizData;
  };

  const saveToSupabase = async (quiz: Quiz): Promise<Quiz | null> => {
    if (!user) {
      toast.error("Você precisa estar logado para salvar questionários");
      return null;
    }

    setIsSaving(true);
    try {
      // Step 1: Update or insert quiz basic info
      await saveQuizBasicInfo(quiz);
      
      // Step 2: Save question groups
      if (quiz.questionGroups && quiz.questionGroups.length > 0) {
        await saveQuestionGroups(quiz.id, quiz.questionGroups);
      }
      
      // Step 3: Save questions (and their options and conditions)
      await saveQuestions(quiz.id, quiz.questions);
      
      // Step 4: Save profile ranges
      if (quiz.profileRanges && quiz.profileRanges.length > 0) {
        await saveProfileRanges(quiz.id, quiz.profileRanges);
      }
      
      // Return the updated quiz
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
