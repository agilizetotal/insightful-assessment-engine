
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import QuizForm from "@/components/QuizForm";
import ResultsSummary from "@/components/ResultsSummary";
import { QuizResponse, QuizResult, UserData } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2 } from "lucide-react";
import { toast } from "sonner";
import { translations } from "@/locales/pt-BR";
import { useQuizData } from "@/hooks/useQuizData";
import { QuizLoading } from "@/components/quiz/QuizLoading";
import { QuizError } from "@/components/quiz/QuizError";
import { saveQuizResponses, calculateQuizResult } from "@/utils/quizEvaluation";
import { QuizErrorBoundary } from "@/components/quiz/QuizErrorBoundary";
import { useAuth } from "@/contexts/AuthContext";

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { quiz, loading, error } = useQuizData(quizId);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showingResults, setShowingResults] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const { userRole } = useAuth();
  
  // Check if we're in embed mode
  const searchParams = new URLSearchParams(location.search);
  const isEmbedded = searchParams.get('embed') === 'true';
  
  // Get shareable link
  const getShareableLink = () => {
    const url = new URL(window.location.href);
    url.search = '';  // Remove any existing query parameters
    return url.toString();
  };
  
  const copyShareableLink = () => {
    navigator.clipboard.writeText(getShareableLink());
    toast.success("Link copiado para a área de transferência!");
  };
  
  // Notify parent window about height changes
  useEffect(() => {
    if (isEmbedded) {
      const sendHeight = () => {
        const height = document.body.scrollHeight;
        window.parent.postMessage({ 
          type: 'quiz-height',
          height: height 
        }, '*');
      };
      
      // Send initial height
      sendHeight();
      
      // Set up observer for height changes
      const resizeObserver = new ResizeObserver(sendHeight);
      resizeObserver.observe(document.body);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [isEmbedded, showingResults]);
  
  const handleCompleteQuiz = async (quizResponses: QuizResponse[], userDataInput: UserData) => {
    if (!quiz) return;
    
    setResponses(quizResponses);
    setUserData(userDataInput);
    
    const result = calculateQuizResult(quiz, quizResponses, userDataInput);
    
    try {
      await saveQuizResponses(
        quiz,
        quizResponses,
        userDataInput,
        result.score,
        quiz.profileRanges.find(range => 
          result.score >= range.min && result.score <= range.max
        )
      );
      console.log("Quiz responses saved successfully");
    } catch (err) {
      console.error("Error saving quiz responses:", err);
      toast.error("Erro ao salvar as respostas. Por favor, tente novamente.");
    }
    
    setQuizResult(result);
    setShowingResults(true);
  };
  
  const handleSendEmail = () => {
    toast.info(translations.quiz.emailFunctionInfo);
  };
  
  const handleUpgrade = () => {
    // Only admins and viewers can upgrade to premium
    if (userRole === 'anonymous') {
      toast.error("É necessário fazer login para acessar recursos premium");
      return;
    }
    
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
    return (
      <QuizErrorBoundary>
        <div className="container mx-auto p-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Quiz não encontrado</h2>
            <p>O questionário solicitado não está disponível.</p>
            {!isEmbedded && (
              <Button 
                onClick={() => navigate('/')}
                className="mt-4"
              >
                {translations.common.backToHome}
              </Button>
            )}
          </div>
        </div>
      </QuizErrorBoundary>
    );
  }
  
  return (
    <QuizErrorBoundary>
      <div className={`container mx-auto p-4 ${isEmbedded ? '' : 'pt-16'}`}>
        {!showingResults ? (
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              {!isEmbedded && (
                <div className="flex justify-between items-center mb-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {translations.common.backToHome}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={copyShareableLink}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar Quiz
                  </Button>
                </div>
              )}
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{quiz?.title || 'Untitled Quiz'}</h1>
                <p className="text-gray-600">{quiz?.description || ''}</p>
              </div>
            </div>
            <QuizForm quiz={quiz} onComplete={handleCompleteQuiz} />
          </div>
        ) : (
          <>
            {quizResult && (
              <>
                <div className="mb-4">
                  {!isEmbedded && (
                    <div className="flex justify-between items-center">
                      <Button 
                        variant="ghost" 
                        onClick={handleRetakeQuiz}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {translations.quiz.retakeQuiz}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={copyShareableLink}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Compartilhar Quiz
                      </Button>
                    </div>
                  )}
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
