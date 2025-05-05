
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Quiz, QuizResponse, Question, UserData } from "@/types/quiz";
import QuestionCard from "@/components/quiz/QuestionCard";
import NoQuestionsDisplay from "@/components/quiz/NoQuestionsDisplay";
import { useQuizResponse } from "@/hooks/useQuizResponse";
import UserDataForm from "@/components/quiz/UserDataForm";
import QuestionHeader from "@/components/quiz/QuestionHeader";
import { useActiveQuestions } from "@/hooks/useActiveQuestions";
import { useQuizNavigation } from "@/hooks/useQuizNavigation";

interface QuizFormProps {
  quiz: Quiz;
  onComplete: (responses: QuizResponse[], userData: UserData) => void;
}

const QuizForm: React.FC<QuizFormProps> = ({ quiz, onComplete }) => {
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: ''
  });

  // Safety check for quiz
  if (!quiz || !quiz.questions) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center">
        <div>
          <h2 className="text-xl font-semibold">Erro ao carregar o questionário</h2>
          <p className="text-gray-500 mt-2">Não foi possível carregar o questionário. Por favor, tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  const { 
    currentQuestionIndex, 
    currentQuestion, 
    progress,
    handleStartQuiz,
    handleNextQuestion,
    handlePreviousQuestion,
    isNextDisabled 
  } = useQuizNavigation({
    activeQuestions,
    onComplete,
    userData
  });

  const { activeQuestions, questionGroups } = useActiveQuestions(
    quiz, 
    responses, 
    currentQuestionIndex
  );
  
  const handleResponseChange = (questionId: string, answer: string | string[]) => {
    const newResponses = [...responses];
    const existingIndex = newResponses.findIndex(r => r.questionId === questionId);
    
    if (existingIndex >= 0) {
      newResponses[existingIndex] = { questionId, answer };
    } else {
      newResponses.push({ questionId, answer });
    }
    
    setResponses(newResponses);
  };

  // Find which group the current question belongs to
  const currentGroupIndex = currentQuestion ? questionGroups.findIndex(group =>
    group.questions.some(q => q.id === currentQuestion.id)
  ) : -1;
  
  // Find the group details
  const currentGroup = currentGroupIndex > -1 ? questionGroups[currentGroupIndex] : null;
  
  // User data form
  if (currentQuestionIndex < 0) {
    return (
      <UserDataForm 
        userData={userData} 
        onUserDataChange={setUserData}
        onStartQuiz={handleStartQuiz}
      />
    );
  }
  
  if (!currentQuestion) {
    return (
      <NoQuestionsDisplay
        activeQuestionsCount={activeQuestions.length}
        onComplete={onComplete}
        responses={responses}
        userData={userData}
      />
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto py-8">
      <QuestionHeader
        progress={progress}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={activeQuestions.length}
        currentGroup={currentGroup}
      />
      
      <QuestionCard
        question={currentQuestion}
        response={responses.find(r => r.questionId === currentQuestion.id)?.answer || (currentQuestion.type === 'checkbox' ? [] : '')}
        onResponseChange={handleResponseChange}
        onPreviousClick={handlePreviousQuestion}
        onNextClick={() => handleNextQuestion(responses)}
        isNextDisabled={isNextDisabled(responses)}
        isLastQuestion={currentQuestionIndex === activeQuestions.length - 1}
      />
    </div>
  );
};

export default QuizForm;
