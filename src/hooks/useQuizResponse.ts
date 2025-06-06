
import { useState } from 'react';
import { Quiz, QuizResponse, QuizResult, UserData, GroupScore } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { translations } from '@/locales/pt-BR';
import { useScarfCalculation } from './useScarfCalculation';

export const useQuizResponse = (quiz: Quiz) => {
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const { user } = useAuth();
  const { calculateScarfResult } = useScarfCalculation();

  const handleQuizComplete = async (quizResponses: QuizResponse[], userData: UserData) => {
    setResponses(quizResponses);
    
    // Verificar se é um quiz SCARF
    const isScarfQuiz = quiz.title.toLowerCase().includes('scarf');
    
    let totalScore = 0;
    let groupScores: GroupScore[] = [];
    let profile = translations.quiz.unknownProfile;
    
    if (isScarfQuiz) {
      console.log("Processing SCARF quiz with", quizResponses.length, "responses");
      
      // Usar cálculo SCARF especializado
      const scarfResult = calculateScarfResult(quiz, quizResponses);
      
      totalScore = Math.round(scarfResult.fitScore);
      groupScores = scarfResult.groupScores;
      profile = `${scarfResult.leadershipProfile} (${scarfResult.fitRange})`;
      
      console.log("SCARF result:", {
        fitScore: scarfResult.fitScore,
        profile: scarfResult.leadershipProfile,
        fitRange: scarfResult.fitRange
      });
    } else {
      // Usar cálculo original para outros tipos de quiz
      const groupScoreMap = new Map<string, {score: number, maxScore: number}>();
      
      // Initialize group scores
      quiz.questionGroups?.forEach(group => {
        groupScoreMap.set(group.id, {score: 0, maxScore: 0});
      });
      
      // Calculate scores for each response
      quizResponses.forEach(response => {
        const question = quiz.questions.find(q => q.id === response.questionId);
        if (!question || question.type === 'open-ended') return;
        
        let questionScore = 0;
        let questionMaxScore = 0;
        
        if (question.type === 'multiple-choice') {
          const selectedOption = question.options?.find(opt => opt.id === response.answer);
          if (selectedOption) {
            questionScore = selectedOption.weight;
          }
          
          // Calculate max possible score for this question
          const maxOption = question.options?.reduce((max, opt) => 
            opt.weight > max.weight ? opt : max, 
            question.options[0]);
            
          questionMaxScore = maxOption?.weight || 0;
        } else if (question.type === 'checkbox') {
          const selectedOptionIds = response.answer as string[];
          const selectedOptions = question.options?.filter(opt => selectedOptionIds.includes(opt.id));
          if (selectedOptions) {
            selectedOptions.forEach(opt => {
              questionScore += opt.weight;
            });
          }
          
          // Max score would be selecting all positive options
          question.options?.forEach(opt => {
            if (opt.weight > 0) {
              questionMaxScore += opt.weight;
            }
          });
        }
        
        // Apply group weight if question belongs to a group
        const groupWeight = question.groupId ? 
          quiz.questionGroups?.find(g => g.id === question.groupId)?.weight || 1 : 1;
        
        questionScore *= groupWeight;
        questionMaxScore *= groupWeight;
        
        // Add to total score
        totalScore += questionScore;
        
        // Add to group scores if applicable
        if (question.groupId && groupScoreMap.has(question.groupId)) {
          const groupData = groupScoreMap.get(question.groupId);
          if (groupData) {
            groupData.score += questionScore;
            groupData.maxScore += questionMaxScore;
            groupScoreMap.set(question.groupId, groupData);
          }
        }
      });
      
      // Convert group score map to array
      groupScoreMap.forEach((scores, groupId) => {
        const group = quiz.questionGroups?.find(g => g.id === groupId);
        if (group && scores.maxScore > 0) {
          groupScores.push({
            groupId,
            groupTitle: group.title,
            score: scores.score,
            maxScore: scores.maxScore,
            percentage: (scores.score / scores.maxScore) * 100
          });
        }
      });
      
      // Find matching profile
      const profileRange = quiz.profileRanges.find(range => 
        totalScore >= range.min && totalScore <= range.max
      );
      
      profile = profileRange?.profile || translations.quiz.unknownProfile;
    }
    
    // Create result object
    const result: QuizResult = {
      quizId: quiz.id,
      responses: quizResponses,
      score: totalScore,
      groupScores,
      profile,
      completedAt: new Date().toISOString(),
      isPremium: false,
      userData
    };

    try {
      console.log("Saving quiz response...");
      console.log("Current user:", user ? "Logged in" : "Anonymous");
      console.log("User data:", userData);
      
      // Insert response with user data
      const { data: responseData, error: responseError } = await supabase
        .from('quiz_responses')
        .insert({
          quiz_id: quiz.id,
          user_id: user?.id || null,
          score: totalScore,
          profile: profile,
          is_premium: false,
          user_email: userData.email,
          user_name: userData.name,
          user_phone: userData.phone || null
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
