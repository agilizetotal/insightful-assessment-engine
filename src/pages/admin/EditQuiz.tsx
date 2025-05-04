
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuizEditor from '@/components/QuizEditor';
import { Quiz } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { EmbedCodeGenerator } from '@/components/EmbedCodeGenerator';
import { translations } from '@/locales/pt-BR';

const EditQuiz = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    if (user && quizId) {
      loadQuiz();
    }
  }, [user, quizId]);

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .eq('user_id', user?.id)
        .single();
      
      if (quizError) {
        throw quizError;
      }
      
      // Buscar perguntas para o quiz
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true });
      
      if (questionsError) {
        throw questionsError;
      }
      
      // Para cada questão, buscar suas opções
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
        
        // Get conditions for this question
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
          imageUrl: question.image_url, // Add support for image URL
          groupId: question.group_id, // Add support for group ID
          options: optionsData.map(opt => ({
            id: opt.id,
            text: opt.text,
            weight: opt.weight
          })),
          conditions: conditionsData ? conditionsData.map(cond => ({
            id: cond.id,
            questionId: cond.question_id,
            operator: cond.operator,
            value: cond.value,
            logical_operator: cond.logical_operator
          })) : []
        };
      }));
      
      // Buscar faixas de perfil para o quiz
      const { data: rangesData, error: rangesError } = await supabase
        .from('profile_ranges')
        .select('*')
        .eq('quiz_id', quizId);
      
      if (rangesError) {
        console.error("Erro ao carregar faixas de perfil:", rangesError);
      }
      
      // Buscar grupos de perguntas para o quiz
      const { data: groupsData, error: groupsError } = await supabase
        .from('question_groups')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true });
        
      if (groupsError) {
        console.error("Erro ao carregar grupos de perguntas:", groupsError);
      }
      
      // Montar o objeto quiz completo
      const loadedQuiz: Quiz = {
        id: quizData.id,
        title: quizData.title,
        description: quizData.description || '',
        questions: questionsWithOptions,
        questionGroups: groupsData ? groupsData.map(group => ({
          id: group.id,
          title: group.title,
          description: group.description || '',
          weight: group.weight || 1,
          order: group.order_index || 0
        })) : [],
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
    } catch (error) {
      console.error("Erro ao carregar questionário:", error);
      toast.error("Erro ao carregar questionário");
      navigate('/admin');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveQuiz = (savedQuiz: Quiz) => {
    setQuiz(savedQuiz);
    toast.success("Questionário atualizado com sucesso!");
  };
  
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
    <div className="container mx-auto p-4 pt-16">
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
      
      <QuizEditor 
        initialQuiz={quiz} 
        onSave={handleSaveQuiz} 
        onPreview={() => navigate(`/quiz/${quiz.id}`)} 
      />
      
      <EmbedCodeGenerator quizId={quiz.id} />
    </div>
  );
};

export default EditQuiz;
