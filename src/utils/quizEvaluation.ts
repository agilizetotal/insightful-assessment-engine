
import { QuizResponse, QuizResult, UserData, Quiz } from "@/types/quiz";
import { supabase } from "@/integrations/supabase/client";
import { translations } from "@/locales/pt-BR";
import { toast } from "sonner";

export const evaluateCondition = (
  condition: {
    operator: "equals" | "not-equals" | "greater-than" | "less-than" | "contains";
    question_id?: string;
    value: string;
    logical_operator?: "AND" | "OR";
  },
  answers: Record<string, any>
): boolean => {
  const dependentAnswer = answers[condition.question_id || ''];
  const conditionValue = condition.value;
  
  switch (condition.operator) {
    case "equals":
      return dependentAnswer === conditionValue;
    case "not-equals":
      return dependentAnswer !== conditionValue;
    case "greater-than":
      return Number(dependentAnswer) > Number(conditionValue);
    case "less-than":
      return Number(dependentAnswer) < Number(conditionValue);
    case "contains":
      return dependentAnswer?.includes(conditionValue);
    default:
      return false;
  }
};

export const evaluateConditions = (
  conditions: {
    operator: "equals" | "not-equals" | "greater-than" | "less-than" | "contains";
    question_id?: string;
    value: string;
    logical_operator?: "AND" | "OR";
  }[],
  answers: Record<string, any>
): boolean => {
  if (!conditions || conditions.length === 0) return true;
  
  const defaultLogicalOperator = "AND";
  
  if (conditions.length === 1) {
    return evaluateCondition(conditions[0], answers);
  }
  
  return conditions.reduce((result, condition, index) => {
    const conditionResult = evaluateCondition(condition, answers);
    
    if (index === 0) return conditionResult;
    
    const logicalOperator = condition.logical_operator || defaultLogicalOperator;
    
    if (logicalOperator === "AND") {
      return result && conditionResult;
    } else {
      return result || conditionResult;
    }
  }, true);
};

export const saveQuizResponses = async (
  quiz: Quiz,
  quizResponses: QuizResponse[],
  userDataInput: UserData,
  totalScore: number,
  profileRange: { profile: string } | undefined
) => {
  try {
    const { data: responseData, error: responseError } = await supabase
      .from('quiz_responses')
      .insert({
        quiz_id: quiz.id,
        score: totalScore,
        profile: profileRange?.profile || translations.quiz.unknownProfile,
        is_premium: false,
        user_data: {
          name: userDataInput.name,
          email: userDataInput.email,
          phone: userDataInput.phone || ''
        }
      })
      .select('id')
      .single();

    if (responseError) {
      throw responseError;
    }

    if (responseData) {
      const answersToInsert = quizResponses.map(response => ({
        response_id: responseData.id,
        question_id: response.questionId,
        answer: Array.isArray(response.answer) ? response.answer : [response.answer as string]
      }));

      const { error: answersError } = await supabase
        .from('question_answers')
        .insert(answersToInsert);

      if (answersError) {
        throw answersError;
      }

      toast.success(translations.quiz.responsesSaved);
    }
  } catch (error) {
    console.error("Erro ao salvar respostas:", error);
    toast.error(translations.quiz.savingError);
  }
};

export const calculateQuizResult = (
  quiz: Quiz,
  quizResponses: QuizResponse[],
  userDataInput: UserData
): QuizResult => {
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
  
  return {
    quizId: quiz.id,
    responses: quizResponses,
    score: totalScore,
    profile: profileRange?.profile || translations.quiz.unknownProfile,
    completedAt: new Date().toISOString(),
    isPremium: false,
    userData: userDataInput
  };
};
