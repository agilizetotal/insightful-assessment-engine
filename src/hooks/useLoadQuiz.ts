
import { useState, useEffect } from 'react';
import { Quiz } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { setupQuestionGroupsProcedures } from '@/database/procedures';

export const useLoadQuiz = (quizId: string | undefined) => {
  const [isLoading, setIsLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && quizId) {
      loadQuiz();
    }
  }, [user, quizId]);

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      
      // First set up needed database procedures
      await setupQuestionGroupsProcedures();
      
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .eq('user_id', user?.id)
        .single();
      
      if (quizError) {
        throw quizError;
      }
      
      // Fetch questions for the quiz
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true });
      
      if (questionsError) {
        throw questionsError;
      }
      
      // For each question, fetch its options
      const questionsWithOptions = await Promise.all(questionsData.map(async (question) => {
        const { data: optionsData, error: optionsError } = await supabase
          .from('question_options')
          .select('*')
          .eq('question_id', question.id)
          .order('order_index', { ascending: true });
        
        if (optionsError) {
          console.error(`Erro ao carregar opções para questão ${question.id}:`, optionsError);
          return {
            ...question,
            type: question.type as any,
            options: []
          };
        }
        
        // Get conditions for this question
        const { data: conditionsData, error: conditionsError } = await supabase
          .from('question_conditions')
          .select('*')
          .eq('dependent_question_id', question.id);
          
        if (conditionsError) {
          console.error(`Erro ao carregar condições para questão ${question.id}:`, conditionsError);
        }

        // Convert database structure to our app's structure
        return {
          id: question.id,
          text: question.text,
          type: question.type as any,
          required: question.required,
          imageUrl: question.image_url || undefined,
          groupId: question.group_id || undefined,
          options: optionsData.map(opt => ({
            id: opt.id,
            text: opt.text,
            weight: opt.weight
          })),
          conditions: conditionsData ? conditionsData.map(cond => ({
            id: cond.id,
            questionId: cond.question_id,
            operator: cond.operator as any,
            value: cond.value,
            logical_operator: (cond.logical_operator as 'AND' | 'OR' | undefined) || undefined
          })) : []
        };
      }));
      
      // Fetch profile ranges for the quiz
      const { data: rangesData, error: rangesError } = await supabase
        .from('profile_ranges')
        .select('*')
        .eq('quiz_id', quizId);
      
      if (rangesError) {
        console.error("Erro ao carregar faixas de perfil:", rangesError);
      }
      
      // Get question groups using RPC function
      let questionGroups = [];
      try {
        console.log("Fetching question groups for quiz:", quizId);
        const { data: groupsData, error: groupsError } = await supabase.rpc(
          'get_question_groups_by_quiz', 
          { quiz_id_param: quizId }
        );
          
        if (groupsError) {
          throw groupsError;
        }
        
        console.log("Retrieved question groups:", groupsData);
        
        questionGroups = groupsData ? groupsData.map((group: any) => ({
          id: group.id,
          title: group.title,
          description: group.description || '',
          weight: group.weight || 1,
          order: group.order_index || 0
        })) : [];
        
        console.log("Processed question groups:", questionGroups);
      } catch (error) {
        console.error("Erro ao carregar grupos de perguntas:", error);
        questionGroups = [];
      }
      
      // Build the complete quiz object
      const loadedQuiz: Quiz = {
        id: quizData.id,
        title: quizData.title,
        description: quizData.description || '',
        questions: questionsWithOptions,
        questionGroups: questionGroups,
        profileRanges: rangesData ? rangesData.map(range => ({
          min: range.min_score,
          max: range.max_score,
          profile: range.profile,
          description: range.description || ''
        })) : [],
        createdAt: quizData.created_at,
        updatedAt: quizData.updated_at
      };
      
      console.log("Loaded quiz with questions and groups:", {
        questions: loadedQuiz.questions.length,
        questionGroups: loadedQuiz.questionGroups.length,
        questionGroups_details: loadedQuiz.questionGroups,
        questionsWithGroups: loadedQuiz.questions.filter(q => q.groupId).length
      });
      
      setQuiz(loadedQuiz);
      return loadedQuiz;
    } catch (error) {
      console.error("Erro ao carregar questionário:", error);
      toast.error("Erro ao carregar questionário");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, quiz, setQuiz };
};
