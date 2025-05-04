
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Question } from '@/types/quiz';
import { translations } from '@/locales/pt-BR';
import QuestionContent from './QuestionContent';

interface QuestionCardProps {
  question: Question;
  response: string | string[];
  onResponseChange: (questionId: string, answer: string | string[]) => void;
  onPreviousClick: () => void;
  onNextClick: () => void;
  isNextDisabled: boolean;
  isLastQuestion: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  response,
  onResponseChange,
  onPreviousClick,
  onNextClick,
  isNextDisabled,
  isLastQuestion
}) => {
  const handleResponseChange = (answer: string | string[]) => {
    onResponseChange(question.id, answer);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{question.text || 'Pergunta sem texto'}</CardTitle>
        {question.required && (
          <CardDescription>Esta questão é obrigatória</CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <QuestionContent
          question={question}
          response={response}
          onResponseChange={handleResponseChange}
        />
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPreviousClick}
        >
          {translations.common.previous}
        </Button>
        <Button
          onClick={onNextClick}
          disabled={isNextDisabled}
        >
          {isLastQuestion ? translations.common.complete : translations.common.next}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuestionCard;
