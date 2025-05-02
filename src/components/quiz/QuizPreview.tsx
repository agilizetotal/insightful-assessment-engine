
import { Quiz, QuizResponse, QuizResult } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import QuizForm from '@/components/QuizForm';
import ResultsSummary from '@/components/ResultsSummary';
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
  // Safety check for quiz object
  if (!quiz) {
    return (
      <div className="p-4">
        <Button 
          variant="outline" 
          onClick={onBackToEdit} 
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="text-center">
          <p>Dados do questionário não disponíveis. Por favor, tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Button 
        variant="outline" 
        onClick={onBackToEdit} 
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>
      
      {previewMode === 'take' && (
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">{quiz?.title || 'Questionário sem título'}</h1>
            <p className="text-gray-600">{quiz?.description || ''}</p>
          </div>
          <QuizForm quiz={quiz} onComplete={onComplete} />
        </div>
      )}
      
      {previewMode === 'results' && quizResult && (
        <ResultsSummary 
          quiz={quiz} 
          result={quizResult} 
          onSendEmail={() => toast.info("Funcionalidade de envio de e-mail disponível na versão premium")} 
          onUpgrade={() => {
            toast.info("Atualizando para o relatório premium...");
          }} 
        />
      )}
    </>
  );
};
