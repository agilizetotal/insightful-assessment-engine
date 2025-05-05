
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Quiz } from '@/types/quiz';
import { QuizMetadata } from '@/components/quiz-editor/QuizMetadata';
import { QuizEditorContent } from '@/components/quiz-editor/QuizEditorContent';
import { useLoadQuiz } from '@/hooks/useLoadQuiz';
import { toast } from 'sonner';

const EditQuiz = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { isLoading, quiz, setQuiz } = useLoadQuiz(quizId);

  const handleSaveQuiz = (savedQuiz: Quiz) => {
    setQuiz(savedQuiz);
    toast.success("Questionário atualizado com sucesso!");
  };
  
  const handlePreview = () => {
    if (quiz) {
      navigate(`/quiz/${quiz.id}`);
    }
  };
  
  return (
    <div className="container mx-auto p-4 pt-16">
      <QuizMetadata 
        quiz={quiz} 
        isLoading={isLoading} 
        onSave={handleSaveQuiz} 
        onPreview={handlePreview} 
      />
      
      <QuizEditorContent
        quiz={quiz}
        isLoading={isLoading}
        onSave={handleSaveQuiz}
        onPreview={handlePreview}
      />
    </div>
  );
};

export default EditQuiz;
