
import { Question, Condition } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash } from 'lucide-react';
import { translations } from '@/locales/pt-BR';
import { LogicalOperatorSelector } from './LogicalOperatorSelector';

interface ConditionItemProps {
  condition: Condition;
  conditionIndex: number;
  groupName: string;
  dependentQuestion?: Question;
  previousQuestions: Question[];
  onUpdateCondition: (condition: Condition) => void;
  onRemoveCondition: () => void;
  showLogicalOperator: boolean;
}

export const ConditionItem = ({
  condition,
  conditionIndex,
  groupName,
  dependentQuestion,
  previousQuestions,
  onUpdateCondition,
  onRemoveCondition,
  showLogicalOperator
}: ConditionItemProps) => {
  return (
    <div className="space-y-3 border p-3 rounded-md mb-3">
      <div className="flex justify-between items-center">
        <Label>{translations.quiz.condition} {conditionIndex + 1}</Label>
        <Button 
          size="sm" 
          variant="ghost" 
          className="text-red-500 hover:text-red-700"
          onClick={onRemoveCondition}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      
      {showLogicalOperator && (
        <LogicalOperatorSelector
          value={condition.logical_operator || 'AND'}
          onValueChange={(value) => onUpdateCondition({
            ...condition,
            logical_operator: value
          })}
          groupName={groupName}
          conditionIndex={conditionIndex}
        />
      )}
      
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="mb-1 block text-xs">{translations.quiz.whenQuestion}</Label>
          <Select 
            value={condition.questionId}
            onValueChange={(value) => onUpdateCondition({
              ...condition,
              questionId: value,
              value: ''
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder={translations.quiz.selectQuestion} />
            </SelectTrigger>
            <SelectContent>
              {previousQuestions.map((q, i) => (
                <SelectItem key={q.id} value={q.id}>
                  {translations.quiz.question} {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="mb-1 block text-xs">{translations.quiz.operator}</Label>
          <Select 
            value={condition.operator}
            onValueChange={(value: any) => onUpdateCondition({
              ...condition,
              operator: value
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder={translations.quiz.selectOperator} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">{translations.quiz.equals}</SelectItem>
              <SelectItem value="not-equals">{translations.quiz.notEquals}</SelectItem>
              <SelectItem value="contains">{translations.quiz.contains}</SelectItem>
              <SelectItem value="greater-than">{translations.quiz.greaterThan}</SelectItem>
              <SelectItem value="less-than">{translations.quiz.lessThan}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="mb-1 block text-xs">{translations.quiz.value}</Label>
          {dependentQuestion?.type === 'multiple-choice' || dependentQuestion?.type === 'checkbox' ? (
            <Select 
              value={condition.value}
              onValueChange={(value) => onUpdateCondition({
                ...condition,
                value: value
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder={translations.quiz.selectValue} />
              </SelectTrigger>
              <SelectContent>
                {dependentQuestion.options?.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input 
              value={condition.value}
              onChange={(e) => onUpdateCondition({
                ...condition,
                value: e.target.value
              })}
              placeholder={translations.quiz.enterValue}
            />
          )}
        </div>
      </div>
    </div>
  );
};
