
import { useState } from 'react';
import { Quiz, QuizResponse, QuizResult, UserData } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { translations } from '@/locales/pt-BR';

export const useQuizResponse = (quiz: Quiz) => {
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const { user } = useAuth();

  const handleQuizComplete = async (quizResponses: QuizResponse[], userData: UserData) => {
    setResponses(quizResponses);
    
    // Calculate score
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
    
    // Find matching profile
    const profileRange = quiz.profileRanges.find(range => 
      totalScore >= range.min && totalScore <= range.max
    );
    
    // Create result object
    const result: QuizResult = {
      quizId: quiz.id,
      responses: quizResponses,
      score: totalScore,
      profile: profileRange?.profile || translations.quiz.unknownProfile,
      completedAt: new Date().toISOString(),
      isPremium: false,
      userData
    };

    try {
      console.log("Saving quiz response...");
      console.log("Current user:", user ? "Logged in" : "Anonymous");
      
      // Insert response - works for both authenticated and anonymous users
      const { data: responseData, error: responseError } = await supabase
        .from('quiz_responses')
        .insert({
          quiz_id: quiz.id,
          user_id: user?.id || null, // Will be null for anonymous users
          score: totalScore,
          profile: profileRange?.profile || translations.quiz.unknownProfile,
          is_premium: false,
          user_email: userData.email, // Store email for all users
          user_name: userData.name    // Store name for all users
        })
        .select('id')
        .single();

      if (responseError) {
        console.error("Error saving response:", responseError);
        throw responseError;
      }

      console.log("Response saved successfully:", responseData);

      // Insert answers
      const answersToInsert = quizResponses.map(response => ({
        response_id: responseData.id,
        question_id: response.questionId,
        answer: Array.isArray(response.answer) ? response.answer : [response.answer as string]
      }));

      const { error: answersError } = await supabase
        .from('question_answers')
        .insert(answersToInsert);

      if (answersError) {
        console.error("Error saving answers:", answersError);
        throw answersError;
      }

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
