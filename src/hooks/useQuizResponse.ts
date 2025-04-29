
import { useState } from 'react';
import { Quiz, QuizResponse, QuizResult } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { translations } from '@/locales/pt-BR';

export const useQuizResponse = (quiz: Quiz) => {
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const { user } = useAuth();

  const handleQuizComplete = async (quizResponses: QuizResponse[]) => {
    setResponses(quizResponses);
    
    let totalScore = 0;
    
    quizResponses.forEach(response => {
      const question = quiz.questions.find(q => q.id === response.questionId);
      if (!question || question.type === 'open-ended') return;
      
      if (question.type === 'multiple-choice') {
        const selectedOption = question.options?.find(opt => opt.id === response.answer);
        if (selectedOption) {
          totalScore += selectedOption.weight;
        }
      } else if (question.type === 'checkbox') {
        const selectedOptionIds = response.answer as string[];
        const selectedOptions = question.options?.filter(opt => selectedOptionIds.includes(opt.id));
        if (selectedOptions) {
          selectedOptions.forEach(opt => {
            totalScore += opt.weight;
          });
        }
      }
    });
    
    const profileRange = quiz.profileRanges.find(range => 
      totalScore >= range.min && totalScore <= range.max
    );
    
    const result: QuizResult = {
      quizId: quiz.id,
      responses: quizResponses,
      score: totalScore,
      profile: profileRange?.profile || translations.quiz.unknownProfile,
      completedAt: new Date().toISOString(),
      isPremium: false
    };

    try {
      const { data: responseData, error: responseError } = await supabase
        .from('quiz_responses')
        .insert({
          quiz_id: quiz.id,
          user_id: user?.id,
          score: totalScore,
          profile: profileRange?.profile || translations.quiz.unknownProfile,
          is_premium: false
        })
        .select('id')
        .single();

      if (responseError) throw responseError;

      const answersToInsert = quizResponses.map(response => ({
        response_id: responseData.id,
        question_id: response.questionId,
        answer: Array.isArray(response.answer) ? response.answer : [response.answer as string]
      }));

      const { error: answersError } = await supabase
        .from('question_answers')
        .insert(answersToInsert);

      if (answersError) throw answersError;

      toast.success(translations.quiz.responsesSaved);
    } catch (error) {
      console.error("Error saving responses:", error);
      toast.error(translations.quiz.savingError);
    }
    
    setQuizResult(result);
  };

  return {
    responses,
    quizResult,
    handleQuizComplete
  };
};
