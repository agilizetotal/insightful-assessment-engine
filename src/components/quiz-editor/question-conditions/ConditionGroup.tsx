
import { Condition, Question } from '@/types/quiz';
import { Card, CardContent } from '@/components/ui/card';
import { translations } from '@/locales/pt-BR';
import { ConditionItem } from './ConditionItem';

interface ConditionGroupProps {
  groupName: string;
  groupIndex: number;
  conditions: Condition[];
  previousQuestions: Question[];
  questionIndex: number;
  onUpdateCondition: (questionIndex: number, conditionIndex: number, condition: Condition) => void;
  onRemoveCondition: (questionIndex: number, conditionIndex: number) => void;
}

export const ConditionGroup = ({
  groupName,
  groupIndex,
  conditions,
  previousQuestions,
  questionIndex,
  onUpdateCondition,
  onRemoveCondition
}: ConditionGroupProps) => {
  return (
    <Card key={groupName}>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">{translations.quiz.conditionGroup} {groupIndex + 1}</h3>
          {groupIndex > 0 && (
            <div className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
              {translations.quiz.or}
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mb-4">
          {translations.quiz.groupConditionsExplanation}
        </p>
        
        {conditions.map((condition, conditionIndex) => {
          const dependentQuestion = previousQuestions.find(q => q.id === condition.questionId);
          const globalIndex = condition.id ? 
            previousQuestions
              .find(q => q.id === questionIndex.toString())
              ?.conditions
              ?.findIndex(c => c.id === condition.id) || conditionIndex : conditionIndex;
          
          return (
            <ConditionItem
              key={conditionIndex}
              condition={condition}
              conditionIndex={conditionIndex}
              groupName={groupName}
              dependentQuestion={dependentQuestion}
              previousQuestions={previousQuestions}
              onUpdateCondition={(updatedCondition) => {
                onUpdateCondition(questionIndex, globalIndex, updatedCondition);
              }}
              onRemoveCondition={() => onRemoveCondition(questionIndex, globalIndex)}
              showLogicalOperator={conditionIndex > 0}
            />
          );
        })}
      </CardContent>
    </Card>
  );
};
