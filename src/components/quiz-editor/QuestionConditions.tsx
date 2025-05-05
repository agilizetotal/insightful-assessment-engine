
import { Question, Condition } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { translations } from '@/locales/pt-BR';
import { Plus } from 'lucide-react';
import { 
  ConditionGroup, 
  EmptyConditionsState 
} from './question-conditions';

interface QuestionConditionsProps {
  question: Question;
  questionIndex: number;
  previousQuestions: Question[];
  onUpdateCondition: (questionIndex: number, conditionIndex: number, condition: Condition) => void;
  onAddCondition: (questionIndex: number) => void;
  onRemoveCondition: (questionIndex: number, conditionIndex: number) => void;
}

export const QuestionConditions = ({
  question,
  questionIndex,
  previousQuestions,
  onUpdateCondition,
  onAddCondition,
  onRemoveCondition
}: QuestionConditionsProps) => {
  if (!question.conditions) {
    question.conditions = [];
  }
  
  const groupedConditions: { [key: string]: Condition[] } = {};
  
  // Group conditions by logical operator
  if (question.conditions && question.conditions.length > 0) {
    let currentGroup = 'group-1';
    
    question.conditions.forEach((condition, index) => {
      if (index === 0 || condition.logical_operator === 'OR') {
        // Start a new group on OR operator
        if (condition.logical_operator === 'OR') {
          currentGroup = `group-${index + 1}`;
        }
      }
      
      if (!groupedConditions[currentGroup]) {
        groupedConditions[currentGroup] = [];
      }
      
      groupedConditions[currentGroup].push(condition);
    });
  }
  
  return (
    <div className="space-y-4 pt-2">
      <div className="text-sm text-gray-500 mb-4">
        <p>{translations.quiz.conditionalDescription}</p>
        <p className="mt-2 font-medium">{translations.quiz.groupLogicExplanation}</p>
      </div>
      
      {questionIndex > 0 && (
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onAddCondition(questionIndex)}
          className="mb-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          {translations.quiz.addCondition}
        </Button>
      )}
      
      {Object.keys(groupedConditions).length > 0 && (
        <div className="space-y-4">
          {Object.entries(groupedConditions).map(([groupName, conditions], groupIndex) => (
            <ConditionGroup
              key={groupName}
              groupName={groupName}
              groupIndex={groupIndex}
              conditions={conditions}
              previousQuestions={previousQuestions}
              questionIndex={questionIndex}
              onUpdateCondition={onUpdateCondition}
              onRemoveCondition={onRemoveCondition}
            />
          ))}
        </div>
      )}
      
      <EmptyConditionsState
        isFirstQuestion={questionIndex === 0}
        hasNoConditions={question.conditions.length === 0 && questionIndex > 0}
      />
    </div>
  );
};
