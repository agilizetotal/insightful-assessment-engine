
import React from 'react';
import { Button } from "@/components/ui/button";
import { UserData, QuizResponse } from '@/types/quiz';

interface NoQuestionsDisplayProps {
  activeQuestionsCount: number;
  onComplete: (responses: QuizResponse[], userData: UserData) => void;
  responses: QuizResponse[];
  userData: UserData;
}

const NoQuestionsDisplay: React.FC<NoQuestionsDisplayProps> = ({
  activeQuestionsCount,
  onComplete,
  responses,
  userData
}) => {
  return (
    <div className="max-w-2xl mx-auto py-8 text-center">
      {activeQuestionsCount === 0 ? (
        <div>
          <h2 className="text-xl font-semibold mb-2">Nenhuma questão disponível</h2>
          <p className="text-gray-500 mb-4">Não existem questões que atendam aos critérios atuais</p>
          <Button onClick={() => onComplete(responses, userData)}>
            Finalizar mesmo assim
          </Button>
        </div>
      ) : (
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-20 bg-gray-200 rounded w-full mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      )}
    </div>
  );
};

export default NoQuestionsDisplay;
