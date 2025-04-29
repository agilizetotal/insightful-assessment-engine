
import { Quiz, Question, QuizResponse, QuizResult, ProfileRange, UserData } from "@/types/quiz";
import { supabase } from "@/integrations/supabase/client";
import { translations } from "@/locales/pt-BR";

export const calculateResultScore = (responses: QuizResponse[], questions: Question[]): number => {
  let totalScore = 0;

  responses.forEach(response => {
    const question = questions.find(q => q.id === response.questionId);
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

  return totalScore;
};

export const determineProfile = (score: number, profileRanges: ProfileRange[]): string => {
  const matchingProfile = profileRanges.find(
    range => score >= range.min && score <= range.max
  );
  
  return matchingProfile?.profile || translations.quiz.unknownProfile;
};

export const calculateQuizResult = (
  quiz: Quiz, 
  responses: QuizResponse[],
  userData: UserData
): QuizResult => {
  const score = calculateResultScore(responses, quiz.questions);
  
  const profile = determineProfile(score, quiz.profileRanges);
  
  return {
    quizId: quiz.id,
    responses,
    score,
    profile,
    completedAt: new Date().toISOString(),
    isPremium: false,
    userData
  };
};

export const saveQuizResponses = async (
  quiz: Quiz, 
  responses: QuizResponse[],
  userData: UserData,
  score: number,
  profileRange?: ProfileRange
) => {
  try {
    const { data: responseData, error: responseError } = await supabase
      .from('quiz_responses')
      .insert({
        quiz_id: quiz.id,
        score: score,
        profile: profileRange?.profile || translations.quiz.unknownProfile,
        is_premium: false
      })
      .select('id')
      .single();

    if (responseError) throw responseError;

    const answersToInsert = responses.map(response => ({
      response_id: responseData.id,
      question_id: response.questionId,
      answer: Array.isArray(response.answer) ? response.answer : [response.answer as string]
    }));

    const { error: answersError } = await supabase
      .from('question_answers')
      .insert(answersToInsert);

    if (answersError) throw answersError;

    return true;
  } catch (error) {
    console.error("Error saving responses:", error);
    return false;
  }
};
