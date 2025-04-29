
import { Question, Condition } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash, Plus } from 'lucide-react';
import { translations } from '@/locales/pt-BR';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

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
                  const globalIndex = question.conditions?.findIndex(c => 
                    c.questionId === condition.questionId && 
                    c.operator === condition.operator && 
                    c.value === condition.value
                  ) || 0;
                  
                  return (
                    <div key={conditionIndex} className="space-y-3 border p-3 rounded-md mb-3">
                      <div className="flex justify-between items-center">
                        <Label>{translations.quiz.condition} {conditionIndex + 1}</Label>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => onRemoveCondition(questionIndex, globalIndex)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {conditionIndex > 0 && (
                        <div className="mb-2">
                          <RadioGroup
                            value={condition.logical_operator || 'AND'}
                            onValueChange={(value) => onUpdateCondition(questionIndex, globalIndex, {
                              ...condition,
                              logical_operator: value as 'AND' | 'OR'
                            })}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="AND" id={`and-${groupName}-${conditionIndex}`} />
                              <Label htmlFor={`and-${groupName}-${conditionIndex}`}>{translations.quiz.and}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="OR" id={`or-${groupName}-${conditionIndex}`} />
                              <Label htmlFor={`or-${groupName}-${conditionIndex}`}>{translations.quiz.or}</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="mb-1 block text-xs">{translations.quiz.whenQuestion}</Label>
                          <Select 
                            value={condition.questionId}
                            onValueChange={(value) => onUpdateCondition(questionIndex, globalIndex, {
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
                            onValueChange={(value: any) => onUpdateCondition(questionIndex, globalIndex, {
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
                          {dependentQuestion?.type === 'multiple-choice' ? (
                            <Select 
                              value={condition.value}
                              onValueChange={(value) => onUpdateCondition(questionIndex, globalIndex, {
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
                              onValueChange={(value) => onUpdateCondition(questionIndex, globalIndex, {
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
                              onChange={(e) => onUpdateCondition(questionIndex, globalIndex, {
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {question.conditions.length === 0 && questionIndex > 0 && (
        <div className="text-center p-6 border rounded-md bg-gray-50">
          <p className="text-gray-500">
            {translations.quiz.noConditionsYet}
          </p>
        </div>
      )}
      
      {questionIndex === 0 && (
        <div className="text-center p-6 border rounded-md bg-gray-50">
          <p className="text-gray-500">
            {translations.quiz.firstQuestionNoConditions}
          </p>
        </div>
      )}
    </div>
  );
};
