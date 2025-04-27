
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizEditor from '@/components/QuizEditor';
import QuizForm from '@/components/QuizForm';
import ResultsSummary from '@/components/ResultsSummary';
import { Quiz, QuizResponse, QuizResult } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CreateQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [previewMode, setPreviewMode] = useState<'edit' | 'take' | 'results'>('edit');
  const [isLoading, setIsLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz>({
    id: crypto.randomUUID(),
    title: 'Avaliação de Liderança',
    description: 'Avalie seu estilo de liderança e identifique áreas para crescimento.',
    questions: [
      {
        id: crypto.randomUUID(),
        text: 'Como você normalmente aborda a tomada de decisões?',
        type: 'multiple-choice',
        required: true,
        options: [
          { id: crypto.randomUUID(), text: 'Tomo decisões rapidamente com base na intuição', weight: 5 },
          { id: crypto.randomUUID(), text: 'Reúno todos os dados disponíveis antes de decidir', weight: 3 },
          { id: crypto.randomUUID(), text: 'Consulto membros da equipe para construir consenso', weight: 4 },
          { id: crypto.randomUUID(), text: 'Recorro a especialistas ou autoridades', weight: 1 }
        ]
      },
      {
        id: crypto.randomUUID(),
        text: 'Quais qualidades de liderança você mais valoriza?',
        type: 'checkbox',
        required: true,
        options: [
          { id: crypto.randomUUID(), text: 'Pensamento estratégico', weight: 4 },
          { id: crypto.randomUUID(), text: 'Empatia e inteligência emocional', weight: 5 },
          { id: crypto.randomUUID(), text: 'Expertise técnica', weight: 3 },
          { id: crypto.randomUUID(), text: 'Habilidades de comunicação', weight: 4 }
        ]
      },
      {
        id: crypto.randomUUID(),
        text: 'Descreva uma situação em que você teve que liderar durante uma crise ou mudança significativa.',
        type: 'open-ended',
        required: false
      }
    ],
    profileRanges: [
      {
        min: 0,
        max: 5,
        profile: 'Líder Emergente',
        description: 'Você está nos estágios iniciais da sua jornada de liderança. Concentre-se em desenvolver habilidades básicas de liderança e buscar oportunidades de mentoria.'
      },
      {
        min: 6,
        max: 10,
        profile: 'Líder Tático',
        description: 'Você se destaca na implementação de planos e no gerenciamento de operações diárias. Considere desenvolver mais habilidades de pensamento estratégico.'
      },
      {
        min: 11,
        max: 15,
        profile: 'Líder Estratégico',
        description: 'Você demonstra forte pensamento estratégico e visão. Você pode se beneficiar ao melhorar sua inteligência emocional e habilidades de gestão de pessoas.'
      },
      {
        min: 16,
        max: 99,
        profile: 'Líder Transformacional',
        description: 'Você inspira e motiva outras pessoas por meio de uma visão convincente. Você equilibra o pensamento estratégico com a inteligência emocional e adapta sua abordagem conforme necessário.'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  
  useEffect(() => {
    if (user) {
      loadUserQuizzes();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadUserQuizzes = async () => {
    try {
      setIsLoading(true);
      
      // Buscar o quiz mais recente do usuário
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (quizError) {
        if (quizError.code !== 'PGRST116') { // Não encontrado
          console.error("Erro ao carregar quiz:", quizError);
          toast.error("Erro ao carregar quiz");
        }
        setIsLoading(false);
        return;
      }
      
      if (quizData) {
        // Buscar perguntas para o quiz
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quizData.id)
          .order('order_index', { ascending: true });
        
        if (questionsError) {
          console.error("Erro ao carregar perguntas:", questionsError);
          toast.error("Erro ao carregar perguntas do quiz");
          setIsLoading(false);
          return;
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
          
          return {
            id: question.id,
            text: question.text,
            type: question.type as any,
            required: question.required,
            options: optionsData.map(opt => ({
              id: opt.id,
              text: opt.text,
              weight: opt.weight
            }))
          };
        }));
        
        // Buscar faixas de perfil para o quiz
        const { data: rangesData, error: rangesError } = await supabase
          .from('profile_ranges')
          .select('*')
          .eq('quiz_id', quizData.id);
        
        if (rangesError) {
          console.error("Erro ao carregar faixas de perfil:", rangesError);
        }
        
        // Montar o objeto quiz completo
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
        toast.success("Quiz carregado com sucesso");
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados do quiz");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveQuiz = (savedQuiz: Quiz) => {
    setQuiz(savedQuiz);
    // O salvamento no banco de dados agora é feito diretamente no QuizEditor
  };
  
  const handlePreviewQuiz = (previewQuiz: Quiz) => {
    setQuiz(previewQuiz);
    setPreviewMode('take');
  };
  
  const handleCompleteQuiz = async (quizResponses: QuizResponse[]) => {
    setResponses(quizResponses);
    
    // Calcular pontuação com base nas respostas
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
    
    // Determinar perfil com base na pontuação
    const profileRange = quiz.profileRanges.find(range => 
      totalScore >= range.min && totalScore <= range.max
    );
    
    // Criar objeto de resultado
    const result: QuizResult = {
      quizId: quiz.id,
      responses: quizResponses,
      score: totalScore,
      profile: profileRange?.profile || 'Desconhecido',
      completedAt: new Date().toISOString(),
      isPremium: false
    };

    // Salvar a resposta no banco de dados
    try {
      const { data: responseData, error: responseError } = await supabase
        .from('quiz_responses')
        .insert({
          quiz_id: quiz.id,
          user_id: user?.id,
          score: totalScore,
          profile: profileRange?.profile || 'Desconhecido',
          is_premium: false
        })
        .select('id')
        .single();

      if (responseError) {
        throw responseError;
      }

      // Salvar respostas individuais
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

      toast.success("Respostas salvas com sucesso");
    } catch (error) {
      console.error("Erro ao salvar respostas:", error);
      toast.error("Erro ao salvar respostas");
    }
    
    setQuizResult(result);
    setPreviewMode('results');
  };
  
  const handleBackToEdit = () => {
    setPreviewMode('edit');
    setResponses([]);
    setQuizResult(null);
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
    <div className="container mx-auto p-4">
      {previewMode !== 'edit' && (
        <Button 
          variant="outline" 
          onClick={handleBackToEdit} 
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para o Editor
        </Button>
      )}
      
      {previewMode === 'edit' && (
        <QuizEditor 
          initialQuiz={quiz} 
          onSave={handleSaveQuiz} 
          onPreview={handlePreviewQuiz} 
        />
      )}
      
      {previewMode === 'take' && (
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
            <p className="text-gray-600">{quiz.description}</p>
          </div>
          <QuizForm quiz={quiz} onComplete={handleCompleteQuiz} />
        </div>
      )}
      
      {previewMode === 'results' && quizResult && (
        <ResultsSummary 
          quiz={quiz} 
          result={quizResult} 
          onSendEmail={() => toast.info('A função de envio de email seria implementada aqui')} 
          onUpgrade={() => {
            // Simular upgrade para premium
            setQuizResult({
              ...quizResult,
              isPremium: true
            });
            toast.info('Em um aplicativo real, isso mostraria o fluxo de pagamento');
          }} 
        />
      )}
    </div>
  );
};

export default CreateQuiz;
