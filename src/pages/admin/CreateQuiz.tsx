
import React, { useState } from 'react';
import { Quiz } from '@/types/quiz';
import QuizEditor from '@/components/QuizEditor';
import { QuizLoading } from '@/components/quiz/QuizLoading';
import { QuizPreview } from '@/components/quiz/QuizPreview';
import { useQuizResponse } from '@/hooks/useQuizResponse';
import { EmbedCodeGenerator } from '@/components/EmbedCodeGenerator';
import { useAuth } from '@/contexts/AuthContext';

const CreateQuiz: React.FC = () => {
  const { user } = useAuth();
  const [previewMode, setPreviewMode] = useState<'edit' | 'take' | 'results'>('edit');
  const [isLoading, setIsLoading] = useState(false);
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

  const { quizResult, handleQuizComplete } = useQuizResponse(quiz);

  if (isLoading) {
    return <QuizLoading />;
  }
  
  return (
    <div className="container mx-auto p-4 pt-16">
      {previewMode === 'edit' ? (
        <>
          <QuizEditor 
            initialQuiz={quiz} 
            onSave={setQuiz} 
            onPreview={(previewQuiz) => {
              setQuiz(previewQuiz);
              setPreviewMode('take');
            }} 
          />
          
          {quiz.id && <EmbedCodeGenerator quizId={quiz.id} />}
        </>
      ) : (
        <QuizPreview 
          quiz={quiz}
          previewMode={previewMode}
          quizResult={quizResult}
          onBackToEdit={() => {
            setPreviewMode('edit');
          }}
          onComplete={(responses) => {
            handleQuizComplete(responses);
            setPreviewMode('results');
          }}
        />
      )}
    </div>
  );
};

export default CreateQuiz;
