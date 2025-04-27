
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuizForm from "@/components/QuizForm";
import ResultsSummary from "@/components/ResultsSummary";
import { Quiz, QuizResponse, QuizResult, UserData } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { translations } from "@/locales/pt-BR";

// Removed demo quiz data - will be loaded from database

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showingResults, setShowingResults] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        
        if (!quizId) {
          setError(translations.quiz.invalidQuizId);
          setLoading(false);
          return;
        }
        
        // Fetch quiz data from Supabase
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single();
          
        if (quizError) {
          throw quizError;
        }
        
        // Fetch questions for the quiz
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quizId)
          .order('order_index', { ascending: true });
        
        if (questionsError) {
          throw questionsError;
        }
        
        // For each question, fetch its options
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
          
          // Fetch conditions for the question
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
              operator: cond.operator as any,
              value: cond.value,
              logicalOperator: cond.logical_operator as 'AND' | 'OR'
            })) : []
          };
        }));
        
        // Fetch profile ranges for the quiz
        const { data: rangesData, error: rangesError } = await supabase
          .from('profile_ranges')
          .select('*')
          .eq('quiz_id', quizId);
        
        if (rangesError) {
          console.error("Erro ao carregar faixas de perfil:", rangesError);
        }
        
        // Create the complete quiz object
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
  
  const handleCompleteQuiz = async (quizResponses: QuizResponse[], userDataInput: UserData) => {
    setResponses(quizResponses);
    setUserData(userDataInput);
    
    if (!quiz) return;
    
    // Calculate score based on responses
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
    
    // Determine profile based on score
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
      userData: userDataInput
    };
    
    // Save results to Supabase
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

      // Save individual question responses
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
    
    setQuizResult(result);
    setShowingResults(true);
  };
  
  const handleSendEmail = () => {
    toast.info(translations.quiz.emailFunctionInfo);
  };
  
  const handleUpgrade = () => {
    toast.info(translations.quiz.upgradingInfo);
    
    // Simulate upgrade to premium
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse text-lg">{translations.common.loading}</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md mx-auto">
          <h2 className="text-red-800 text-lg font-medium mb-2">{translations.common.error}</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={() => navigate('/')}>
            {translations.common.backToHome}
          </Button>
        </div>
      </div>
    );
  }
  
  if (!quiz) {
    return null;
  }
  
  return (
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
  );
};

export default TakeQuiz;
