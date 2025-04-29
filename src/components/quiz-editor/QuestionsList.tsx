
import { Question, Option, Condition } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { translations } from '@/locales/pt-BR';
import { QuestionItem } from './QuestionItem';

interface QuestionsListProps {
  questions: Question[];
  onUpdateQuestion: (index: number, updatedQuestion: Question) => void;
  onRemoveQuestion: (index: number) => void;
  onMoveQuestion: (index: number, direction: 'up' | 'down') => void;
  onDuplicateQuestion: (index: number) => void;
  onAddQuestion: () => void;
  onAddOption: (questionIndex: number) => void;
  onUpdateOption: (questionIndex: number, optionIndex: number, updatedOption: Option) => void;
  onRemoveOption: (questionIndex: number, optionIndex: number) => void;
  onAddCondition: (questionIndex: number) => void;
  onUpdateCondition: (questionIndex: number, conditionIndex: number, condition: Condition) => void;
  onRemoveCondition: (questionIndex: number, conditionIndex: number) => void;
}

export const QuestionsList = ({
  questions,
  onUpdateQuestion,
  onRemoveQuestion,
  onMoveQuestion,
  onDuplicateQuestion,
  onAddQuestion,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  onAddCondition,
  onUpdateCondition,
  onRemoveCondition
}: QuestionsListProps) => {
  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <QuestionItem
          key={question.id}
          question={question}
          questionIndex={index}
          isFirst={index === 0}
          isLast={index === questions.length - 1}
          previousQuestions={questions.slice(0, index)}
          onUpdateQuestion={(updatedQuestion) => onUpdateQuestion(index, updatedQuestion)}
          onRemoveQuestion={() => onRemoveQuestion(index)}
          onMoveQuestion={(direction) => onMoveQuestion(index, direction)}
          onDuplicateQuestion={() => onDuplicateQuestion(index)}
          onAddOption={() => onAddOption(index)}
          onUpdateOption={(optionIndex, updatedOption) => onUpdateOption(index, optionIndex, updatedOption)}
          onRemoveOption={(optionIndex) => onRemoveOption(index, optionIndex)}
          onAddCondition={() => onAddCondition(index)}
          onUpdateCondition={(conditionIndex, condition) => onUpdateCondition(index, conditionIndex, condition)}
          onRemoveCondition={(conditionIndex) => onRemoveCondition(index, conditionIndex)}
        />
      ))}
      
      <Button onClick={onAddQuestion} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        {translations.quiz.addQuestion}
      </Button>
    </div>
  );
};
