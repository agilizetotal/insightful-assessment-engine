
import { UserData, Question, QuizResponse } from "@/types/quiz";

interface UseQuizNavigationProps {
  activeQuestions: Question[];
  onComplete: (responses: QuizResponse[], userData: UserData) => void;
  userData: UserData;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
}

export const useQuizNavigation = ({
  activeQuestions,
  onComplete,
  userData,
  currentQuestionIndex,
  setCurrentQuestionIndex
}: UseQuizNavigationProps) => {
  const progress = 
    currentQuestionIndex < 0 ? 0 :
    activeQuestions.length === 0 ? 100 :
    (currentQuestionIndex / Math.max(1, activeQuestions.length - 1)) * 100;
  
  const currentQuestion = currentQuestionIndex >= 0 && activeQuestions.length > 0 ? 
    activeQuestions[currentQuestionIndex < activeQuestions.length ? currentQuestionIndex : 0] : null;
  
  const handleStartQuiz = () => {
    if (!userData.name || !userData.email) {
      return;
    }
    
    setCurrentQuestionIndex(0);
  };
  
  const handleNextQuestion = (responses: QuizResponse[]) => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete(responses, userData);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentQuestionIndex === 0) {
      setCurrentQuestionIndex(-1); // Go back to user data form
    }
  };

  const isNextDisabled = (responses: QuizResponse[]) => {
    if (currentQuestionIndex < 0) {
      return !userData.name || !userData.email;
    }
    
    if (!currentQuestion) return true;
    if (!currentQuestion.required) return false;
    
    const response = responses.find(r => r.questionId === currentQuestion.id);
    if (!response) return true;
    
    if (Array.isArray(response.answer)) {
      return response.answer.length === 0;
    }
    
    return !response.answer;
  };

  return {
    currentQuestionIndex,
    currentQuestion,
    progress,
    handleStartQuiz,
    handleNextQuestion,
    handlePreviousQuestion,
    isNextDisabled
  };
};
