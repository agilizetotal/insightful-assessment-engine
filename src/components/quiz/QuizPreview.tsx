
import { Quiz, QuizResponse, QuizResult } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import QuizForm from '@/components/QuizForm';
import ResultsSummary from '@/components/ResultsSummary';
import { translations } from '@/locales/pt-BR';
import { toast } from 'sonner';

interface QuizPreviewProps {
  quiz: Quiz;
  previewMode: 'take' | 'results';
  quizResult: QuizResult | null;
  onBackToEdit: () => void;
  onComplete: (responses: QuizResponse[]) => void;
}

export const QuizPreview = ({ 
  quiz, 
  previewMode, 
  quizResult, 
  onBackToEdit, 
  onComplete 
}: QuizPreviewProps) => {
  return (
    <>
      <Button 
        variant="outline" 
        onClick={onBackToEdit} 
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {translations.common.back}
      </Button>
      
      {previewMode === 'take' && (
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
            <p className="text-gray-600">{quiz.description}</p>
          </div>
          <QuizForm quiz={quiz} onComplete={onComplete} />
        </div>
      )}
      
      {previewMode === 'results' && quizResult && (
        <ResultsSummary 
          quiz={quiz} 
          result={quizResult} 
          onSendEmail={() => toast.info(translations.quiz.emailFunctionInfo)} 
          onUpgrade={() => {
            toast.info(translations.quiz.upgradingInfo);
          }} 
        />
      )}
    </>
  );
};
