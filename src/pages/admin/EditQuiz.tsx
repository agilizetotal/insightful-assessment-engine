
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuizEditor from '@/components/QuizEditor';
import { Quiz, QuestionGroup } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { EmbedCodeGenerator } from '@/components/EmbedCodeGenerator';
import { QuizMetadata } from '@/components/quiz-editor/QuizMetadata';

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
            logical_operator: cond.logical_operator || 'AND'
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
      
      // Get question groups for the quiz
      let questionGroups: QuestionGroup[] = [];
      try {
        const { data: groupsData, error: groupsError } = await supabase
          .from('question_groups')
          .select('*')
          .eq('quiz_id', quizId)
          .order('order_index', { ascending: true });
          
        if (groupsError) {
          throw groupsError;
        }
        
        questionGroups = groupsData ? groupsData.map(group => ({
          id: group.id,
          title: group.title,
          description: group.description || '',
          weight: group.weight || 1,
          order: group.order_index || 0
        })) : [];
      } catch (error) {
        console.error("Erro ao carregar grupos de perguntas:", error);
        questionGroups = [];
      }
      
      // Build the complete quiz object
      const loadedQuiz: Quiz = {
        id: quizData.id,
        title: quizData.title,
        description: quizData.description || '',
        questions: questionsWithOptions,
        questionGroups: questionGroups,
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
  
  return (
    <div className="container mx-auto p-4 pt-16">
      <QuizMetadata 
        quiz={quiz} 
        isLoading={isLoading} 
        onSave={handleSaveQuiz} 
        onPreview={() => navigate(`/quiz/${quiz?.id}`)} 
      />
      
      {!isLoading && quiz && (
        <>
          <QuizEditor 
            initialQuiz={quiz} 
            onSave={handleSaveQuiz} 
            onPreview={() => navigate(`/quiz/${quiz.id}`)} 
          />
          
          <EmbedCodeGenerator quizId={quiz.id} />
        </>
      )}
    </div>
  );
};

export default EditQuiz;
