
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
        
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single();
          
        if (quizError) {
          throw quizError;
        }
        
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quizId)
          .order('order_index', { ascending: true });
        
        if (questionsError) {
          throw questionsError;
        }
        
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
              logical_operator: (cond.logical_operator || 'AND') as 'AND' | 'OR'
            })) : []
          };
        }));
        
        const { data: rangesData, error: rangesError } = await supabase
          .from('profile_ranges')
          .select('*')
          .eq('quiz_id', quizId);
        
        if (rangesError) {
          console.error("Erro ao carregar faixas de perfil:", rangesError);
        }
        
        const loadedQuiz: Quiz = {
          id: quizData.id,
          title: quizData.title,
          description: quizData.description || '',
          questions: questionsWithOptions,
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
