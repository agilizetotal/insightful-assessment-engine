
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizEditor from '@/components/QuizEditor';
import { Quiz } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CreateNewQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Create a completely new empty quiz template
  const emptyQuiz: Quiz = {
    id: crypto.randomUUID(),
    title: 'Novo Questionário',
    description: 'Descreva o propósito deste questionário',
    questions: [],
    questionGroups: [], // Add empty questionGroups
    profileRanges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const handleSaveQuiz = async (savedQuiz: Quiz) => {
    if (user) {
      toast.success("Questionário salvo com sucesso!");
      navigate(`/admin/edit/${savedQuiz.id}`);
    }
  };
  
  const handlePreviewQuiz = (previewQuiz: Quiz) => {
    // Since this is a completely new quiz, we'll save it first and then navigate
    if (previewQuiz.questions.length === 0) {
      toast.error("Adicione pelo menos uma questão para visualizar");
      return;
    }
    
    navigate(`/quiz/${previewQuiz.id}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Carregando...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 pt-16">
      <h1 className="text-2xl font-bold mb-6">Criar Novo Questionário</h1>
      <QuizEditor 
        initialQuiz={emptyQuiz} 
        onSave={handleSaveQuiz} 
        onPreview={handlePreviewQuiz}
        isNewQuiz={true}
      />
    </div>
  );
};

export default CreateNewQuiz;
