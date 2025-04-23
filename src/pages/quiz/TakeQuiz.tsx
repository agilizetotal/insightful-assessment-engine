
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuizForm from "@/components/QuizForm";
import ResultsSummary from "@/components/ResultsSummary";
import { Quiz, QuizResponse, QuizResult } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock demo quiz data
const demoQuiz: Quiz = {
  id: "demo-quiz",
  title: "Leadership Style Assessment",
  description: "Discover your leadership style and strengths with this comprehensive assessment.",
  questions: [
    {
      id: "q1",
      text: "When leading a team project, I prefer to:",
      type: "multiple-choice",
      required: true,
      options: [
        { id: "q1a1", text: "Provide detailed instructions and closely monitor progress", weight: 1 },
        { id: "q1a2", text: "Set clear goals and give team members autonomy to achieve them", weight: 5 },
        { id: "q1a3", text: "Facilitate group discussions to build consensus on approach", weight: 3 },
        { id: "q1a4", text: "Adapt my style based on the specific situation and team members involved", weight: 4 }
      ]
    },
    {
      id: "q2",
      text: "When facing a challenge, I typically:",
      type: "multiple-choice",
      required: true,
      options: [
        { id: "q2a1", text: "Analyze all available data before making a decision", weight: 3 },
        { id: "q2a2", text: "Trust my intuition and experience", weight: 4 },
        { id: "q2a3", text: "Consult with team members and seek diverse perspectives", weight: 5 },
        { id: "q2a4", text: "Follow established protocols and procedures", weight: 2 }
      ]
    },
    {
      id: "q3",
      text: "Which leadership qualities do you believe are most important? (Select all that apply)",
      type: "checkbox",
      required: true,
      options: [
        { id: "q3a1", text: "Strategic vision and planning", weight: 3 },
        { id: "q3a2", text: "Empathy and emotional intelligence", weight: 4 },
        { id: "q3a3", text: "Technical expertise and knowledge", weight: 2 },
        { id: "q3a4", text: "Communication and transparency", weight: 3 },
        { id: "q3a5", text: "Decisiveness and confidence", weight: 3 }
      ]
    },
    {
      id: "q4",
      text: "How do you prefer to communicate with your team?",
      type: "multiple-choice",
      required: true,
      options: [
        { id: "q4a1", text: "Formal, structured meetings and written updates", weight: 2 },
        { id: "q4a2", text: "Regular informal check-ins and open-door policy", weight: 4 },
        { id: "q4a3", text: "Digital tools like Slack, email, and project management software", weight: 3 },
        { id: "q4a4", text: "A mix of channels depending on the context and urgency", weight: 5 }
      ]
    },
    {
      id: "q5",
      text: "When a team member is underperforming, I:",
      type: "multiple-choice",
      required: true,
      options: [
        { id: "q5a1", text: "Address the issue directly with clear expectations for improvement", weight: 4 },
        { id: "q5a2", text: "Arrange a private conversation to understand underlying issues", weight: 5 },
        { id: "q5a3", text: "Reassign their tasks to someone more capable", weight: 1 },
        { id: "q5a4", text: "Provide additional training and resources", weight: 3 }
      ]
    },
    {
      id: "q6",
      text: "Describe a situation where you demonstrated effective leadership. What was the context, what actions did you take, and what was the outcome?",
      type: "open-ended",
      required: false
    }
  ],
  profileRanges: [
    {
      min: 0,
      max: 10,
      profile: "Directive Leader",
      description: "You tend to provide clear instructions and maintain control. You excel in situations requiring quick decisions and precise execution. Consider developing more collaborative approaches for complex problems."
    },
    {
      min: 11,
      max: 17,
      profile: "Procedural Leader",
      description: "You value structure, consistency, and careful analysis. You excel at implementing systems and ensuring compliance. To grow, consider embracing more flexibility and fostering innovation."
    },
    {
      min: 18,
      max: 23,
      profile: "Collaborative Leader",
      description: "You value team input and build consensus. Your inclusive approach creates strong team cohesion. Consider developing more decisive action in time-sensitive situations."
    },
    {
      min: 24,
      max: 50,
      profile: "Adaptive Leader",
      description: "You skillfully balance different leadership approaches based on context. Your versatility and emotional intelligence allow you to be effective across various situations. Continue developing strategic thinking to complement your adaptive skills."
    }
  ],
  createdAt: "2023-04-01T00:00:00Z",
  updatedAt: "2023-04-01T00:00:00Z"
};

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showingResults, setShowingResults] = useState(false);
  
  useEffect(() => {
    // In a real application, this would fetch the quiz from your API
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (quizId === 'demo') {
          setQuiz(demoQuiz);
        } else {
          // In a real app, you would fetch from your API
          // const response = await fetch(`/api/quizzes/${quizId}`);
          // const data = await response.json();
          // setQuiz(data);
          setError("Quiz not found. Try the demo quiz instead.");
        }
      } catch (err) {
        setError("Failed to load quiz. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuiz();
  }, [quizId]);
  
  const handleCompleteQuiz = (quizResponses: QuizResponse[]) => {
    setResponses(quizResponses);
    
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
      profile: profileRange?.profile || 'Unknown',
      completedAt: new Date().toISOString(),
      isPremium: false
    };
    
    setQuizResult(result);
    setShowingResults(true);
    
    // In a real app, you would save the result to your database
    // saveResult(result);
  };
  
  const handleSendEmail = () => {
    toast({
      title: "Email Sent",
      description: "Your results have been sent to your email address.",
    });
  };
  
  const handleUpgrade = () => {
    toast({
      title: "Upgrade Available",
      description: "Redirecting to payment page...",
    });
    
    // In a real app, this would redirect to your payment gateway
    setTimeout(() => {
      if (quizResult) {
        setQuizResult({
          ...quizResult,
          isPremium: true
        });
        toast({
          title: "Upgrade Complete",
          description: "You now have access to the full report.",
        });
      }
    }, 2000);
  };
  
  const handleRetakeQuiz = () => {
    setResponses([]);
    setQuizResult(null);
    setShowingResults(false);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse text-lg">Loading quiz...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md mx-auto">
          <h2 className="text-red-800 text-lg font-medium mb-2">Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={() => navigate('/quiz/demo')}>
            Try Demo Quiz
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
              Back to Home
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
                  Retake Quiz
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
