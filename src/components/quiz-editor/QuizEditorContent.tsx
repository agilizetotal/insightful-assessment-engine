
import { Quiz } from '@/types/quiz';
import QuizEditor from '@/components/QuizEditor';
import { EmbedCodeGenerator } from '@/components/EmbedCodeGenerator';

interface QuizEditorContentProps {
  quiz: Quiz;
  isLoading: boolean;
  onSave: (savedQuiz: Quiz) => void;
  onPreview: () => void;
}

export const QuizEditorContent = ({ 
  quiz, 
  isLoading, 
  onSave, 
  onPreview 
}: QuizEditorContentProps) => {
  if (isLoading || !quiz) {
    return null;
  }

  return (
    <>
      <QuizEditor 
        initialQuiz={quiz} 
        onSave={onSave} 
        onPreview={onPreview} 
      />
      
      <EmbedCodeGenerator quizId={quiz.id} />
    </>
  );
};
