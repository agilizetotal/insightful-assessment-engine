
import { Question, Condition } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash, Plus } from 'lucide-react';
import { translations } from '@/locales/pt-BR';
import { defaultCondition } from './defaults';

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
  
  return (
    <div className="space-y-4 pt-2">
      <div className="text-sm text-gray-500">
        {translations.quiz.conditionalDescription}
      </div>
      
      {questionIndex > 0 && (
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onAddCondition(questionIndex)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {translations.quiz.addCondition}
        </Button>
      )}
      
      {question.conditions && question.conditions.map((condition, conditionIndex) => {
        const dependentQuestion = previousQuestions.find(q => q.id === condition.questionId);
        
        return (
          <div key={conditionIndex} className="space-y-2 border p-3 rounded-md">
            <div className="flex justify-between items-center">
              <Label>{translations.quiz.condition} {conditionIndex + 1}</Label>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-red-500 hover:text-red-700"
                onClick={() => onRemoveCondition(questionIndex, conditionIndex)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            
            {conditionIndex > 0 && (
              <div className="mb-2">
                <Select
                  value={condition.logical_operator || 'AND'}
                  onValueChange={(value) => onUpdateCondition(questionIndex, conditionIndex, {
                    ...condition,
                    logical_operator: value as 'AND' | 'OR'
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={translations.quiz.selectOperator} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">{translations.quiz.and}</SelectItem>
                    <SelectItem value="OR">{translations.quiz.or}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Select 
                  value={condition.questionId}
                  onValueChange={(value) => onUpdateCondition(questionIndex, conditionIndex, {
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
                <Select 
                  value={condition.operator}
                  onValueChange={(value: any) => onUpdateCondition(questionIndex, conditionIndex, {
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
                {dependentQuestion?.type === 'multiple-choice' ? (
                  <Select 
                    value={condition.value}
                    onValueChange={(value) => onUpdateCondition(questionIndex, conditionIndex, {
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
                ) : dependentQuestion?.type === 'checkbox' ? (
                  <Select 
                    value={condition.value}
                    onValueChange={(value) => onUpdateCondition(questionIndex, conditionIndex, {
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
                    onChange={(e) => onUpdateCondition(questionIndex, conditionIndex, {
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
      })}
    </div>
  );
};
