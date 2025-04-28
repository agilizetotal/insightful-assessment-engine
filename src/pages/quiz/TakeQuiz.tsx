import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuizForm from "@/components/QuizForm";
import ResultsSummary from "@/components/ResultsSummary";
import { QuizResponse, QuizResult, UserData } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { translations } from "@/locales/pt-BR";
import { useQuizData } from "@/hooks/useQuizData";
import { QuizLoading } from "@/components/quiz/QuizLoading";
import { QuizError } from "@/components/quiz/QuizError";
import { saveQuizResponses, calculateQuizResult } from "@/utils/quizEvaluation";
import { QuizErrorBoundary } from "@/components/quiz/QuizErrorBoundary";

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { quiz, loading, error } = useQuizData(quizId);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showingResults, setShowingResults] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  const handleCompleteQuiz = async (quizResponses: QuizResponse[], userDataInput: UserData) => {
    if (!quiz) return;
    
    setResponses(quizResponses);
    setUserData(userDataInput);
    
    const result = calculateQuizResult(quiz, quizResponses, userDataInput);
    
    await saveQuizResponses(
      quiz,
      quizResponses,
      userDataInput,
      result.score,
      quiz.profileRanges.find(range => result.score >= range.min && result.score <= range.max)
    );
    
    setQuizResult(result);
    setShowingResults(true);
  };
  
  const handleSendEmail = () => {
    toast.info(translations.quiz.emailFunctionInfo);
  };
  
  const handleUpgrade = () => {
    toast.info(translations.quiz.upgradingInfo);
    
    setTimeout(() => {
      if (quizResult) {
        setQuizResult({
          ...quizResult,
          isPremium: true
        });
        toast.success(translations.quiz.upgradeComplete);
      }
    }, 2000);
  };
  
  const handleRetakeQuiz = () => {
    setResponses([]);
    setQuizResult(null);
    setShowingResults(false);
    setUserData(null);
  };
  
  if (loading) {
    return (
      <QuizErrorBoundary>
        <QuizLoading />
      </QuizErrorBoundary>
    );
  }
  
  if (error) {
    return (
      <QuizErrorBoundary>
        <QuizError error={error} />
      </QuizErrorBoundary>
    );
  }
  
  if (!quiz) {
    return null;
  }
  
  return (
    <QuizErrorBoundary>
      <div className="container mx-auto p-4">
        {!showingResults ? (
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {translations.common.backToHome}
              </Button>
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{quiz.title}</h1>
                <p className="text-gray-600 max-w-xl mx-auto">{quiz.description}</p>
              </div>
            </div>
            <QuizForm quiz={quiz} onComplete={handleCompleteQuiz} />
          </div>
        ) : (
          <>
            {quizResult && (
              <>
                <div className="mb-4">
                  <Button 
                    variant="ghost" 
                    onClick={handleRetakeQuiz}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {translations.quiz.retakeQuiz}
                  </Button>
                </div>
                <ResultsSummary 
                  quiz={quiz} 
                  result={quizResult} 
                  onSendEmail={handleSendEmail}
                  onUpgrade={handleUpgrade}
                />
              </>
            )}
          </>
        )}
      </div>
    </QuizErrorBoundary>
  );
};

export default TakeQuiz;
