
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { DisplayQuestionGroup } from '@/types/quiz';

interface QuestionHeaderProps {
  progress: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentGroup: DisplayQuestionGroup | null;
}

const QuestionHeader: React.FC<QuestionHeaderProps> = ({ 
  progress, 
  currentQuestionIndex, 
  totalQuestions, 
  currentGroup 
}) => {
  return (
    <div className="mb-6">
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between text-sm text-gray-500 mt-1">
        <div>
          {currentGroup && currentGroup.title && (
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
              {currentGroup.title}
            </span>
          )}
        </div>
        <div>
          Questão {currentQuestionIndex + 1} de {totalQuestions}
        </div>
      </div>
    </div>
  );
};

export default QuestionHeader;
