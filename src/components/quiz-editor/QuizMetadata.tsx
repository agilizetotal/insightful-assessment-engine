
import { Quiz } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { translations } from '@/locales/pt-BR';

interface QuizMetadataProps {
  quiz: Quiz;
  isLoading: boolean;
  onSave: (savedQuiz: Quiz) => void;
  onPreview: () => void;
}

export const QuizMetadata = ({ quiz, isLoading, onSave, onPreview }: QuizMetadataProps) => {
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">{translations.common.loading}</p>
        </div>
      </div>
    );
  }
  
  if (!quiz) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <p>Questionário não encontrado ou você não tem permissão para editá-lo.</p>
          <Button 
            onClick={() => navigate('/admin')}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {translations.common.backToHome}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {translations.common.back}
        </Button>
        <h1 className="text-2xl font-bold">{translations.quiz.editQuiz}</h1>
      </div>
    </>
  );
};
