
import { useState, useEffect } from "react";
import { Quiz } from "@/types/quiz";
import { supabase } from "@/integrations/supabase/client";
import { translations } from "@/locales/pt-BR";

export const useQuizData = (quizId: string | undefined) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        
        if (!quizId) {
          setError(translations.quiz.invalidQuizId);
          setLoading(false);
          return;
        }
        
        // Fetch quiz basic data
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single();
          
        if (quizError) {
          throw quizError;
        }
        
        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quizId)
          .order('order_index', { ascending: true });
        
        if (questionsError) {
          throw questionsError;
        }
        
        // Fetch options and conditions for each question
        const questionsWithOptions = await Promise.all(questionsData.map(async (question) => {
          // Fetch options
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
          
          // Fetch conditions
          const { data: conditionsData, error: conditionsError } = await supabase
            .from('question_conditions')
            .select('*')
            .eq('dependent_question_id', question.id);
            
          if (conditionsError) {
            console.error(`Erro ao carregar condições para questão ${question.id}:`, conditionsError);
          }
          
          return {
            id: question.id,
            text: question.text,
            type: question.type as any,
            required: question.required,
            options: optionsData.map(opt => ({
              id: opt.id,
              text: opt.text,
              weight: opt.weight
            })),
            conditions: conditionsData ? conditionsData.map(cond => ({
              questionId: cond.question_id,
              operator: cond.operator as "equals" | "not-equals" | "greater-than" | "less-than" | "contains",
              value: cond.value,
              logical_operator: cond.logical_operator as "AND" | "OR" || 'AND'
            })) : [],
            imageUrl: question.image_url,
            groupId: question.group_id
          };
        }));
        
        // Fetch profile ranges
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
          const { data: groupsData, error: groupsError } = await supabase.rpc(
            'get_question_groups_by_quiz', 
            { quiz_id_param: quizId }
          );
            
          if (groupsError) {
            throw groupsError;
          }
          
          questionGroups = groupsData ? groupsData.map((group: any) => ({
            id: group.id,
            title: group.title,
            description: group.description || '',
            weight: group.weight || 1,
            order: group.order_index || 0
          })) : [];
        } catch (error) {
          console.error("Erro ao carregar grupos de perguntas:", error);
          questionGroups = [];
        }
        
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
        
        setQuiz(loadedQuiz);
      } catch (err) {
        console.error(err);
        setError(translations.quiz.loadError);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuiz();
  }, [quizId]);

  return { quiz, loading, error };
};
