
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface QuestionHeaderProps {
  progress: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentGroup: {
    title: string;
    description?: string;
    weight?: number;
  } | null;
}

const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  progress,
  currentQuestionIndex,
  totalQuestions,
  currentGroup
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between text-sm text-gray-500 mb-2">
        <span>Questão {currentQuestionIndex + 1} de {totalQuestions}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      
      <Progress value={progress} className="h-2 mb-4" />
      
      {currentGroup && (
        <div className="mb-4">
          <h2 className="text-lg font-medium">{currentGroup.title}</h2>
          {currentGroup.description && (
            <p className="text-gray-500 text-sm">{currentGroup.description}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionHeader;
