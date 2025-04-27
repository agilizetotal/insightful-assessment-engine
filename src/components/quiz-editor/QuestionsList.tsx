import { Question, Option, QuestionType } from '@/types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowDown, ArrowUp, Copy, Trash, Plus } from 'lucide-react';
import { translations } from '@/locales/pt-BR';
import { QuestionConditions } from './QuestionConditions';
import { defaultQuestion, defaultOption } from './defaults';

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
  onRemoveOption
}: QuestionsListProps) => {
  const handleUpdateCondition = (questionIndex: number, conditionIndex: number, condition: Condition) => {
    const question = questions[questionIndex];
    const updatedConditions = [...(question.conditions || [])];
    updatedConditions[conditionIndex] = condition;
    
    onUpdateQuestion(questionIndex, {
      ...question,
      conditions: updatedConditions
    });
  };

  return (
    <div className="space-y-4">
      {questions.map((question, questionIndex) => (
        <Card key={question.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-lg">{translations.quiz.question} {questionIndex + 1}</CardTitle>
              <div className="flex space-x-1">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onMoveQuestion(questionIndex, 'up')}
                  disabled={questionIndex === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onMoveQuestion(questionIndex, 'down')}
                  disabled={questionIndex === questions.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onDuplicateQuestion(questionIndex)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-red-500 hover:text-red-700"
                  onClick={() => onRemoveQuestion(questionIndex)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="space-y-2">
              <Label htmlFor={`question-${questionIndex}`}>{translations.quiz.questionText}</Label>
              <Textarea 
                id={`question-${questionIndex}`} 
                value={question.text} 
                onChange={(e) => onUpdateQuestion(questionIndex, {
                  ...question, 
                  text: e.target.value
                })}
                placeholder={translations.quiz.questionPlaceholder}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`question-type-${questionIndex}`}>{translations.quiz.questionType}</Label>
                <Select 
                  value={question.type} 
                  onValueChange={(value: QuestionType) => onUpdateQuestion(questionIndex, {
                    ...question, 
                    type: value
                  })}
                >
                  <SelectTrigger id={`question-type-${questionIndex}`}>
                    <SelectValue placeholder={translations.quiz.selectQuestionType} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">{translations.quiz.multipleChoice}</SelectItem>
                    <SelectItem value="checkbox">{translations.quiz.checkboxes}</SelectItem>
                    <SelectItem value="open-ended">{translations.quiz.openEnded}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 pt-8">
                <Switch 
                  id={`required-${questionIndex}`} 
                  checked={question.required}
                  onCheckedChange={(checked) => onUpdateQuestion(questionIndex, {
                    ...question, 
                    required: checked
                  })}
                />
                <Label htmlFor={`required-${questionIndex}`}>{translations.quiz.requiredQuestion}</Label>
              </div>
            </div>
            
            {question.type !== 'open-ended' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>{translations.quiz.options}</Label>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onAddOption(questionIndex)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {translations.quiz.addOption}
                  </Button>
                </div>
                
                {question.options?.map((option, optionIndex) => (
                  <div key={option.id} className="flex space-x-2">
                    <div className="flex-grow">
                      <Input 
                        value={option.text} 
                        onChange={(e) => onUpdateOption(questionIndex, optionIndex, {
                          ...option, 
                          text: e.target.value
                        })}
                        placeholder={`${translations.quiz.option} ${optionIndex + 1}`}
                      />
                    </div>
                    <div className="w-24">
                      <Input 
                        type="number" 
                        value={option.weight} 
                        onChange={(e) => onUpdateOption(questionIndex, optionIndex, {
                          ...option, 
                          weight: parseInt(e.target.value) || 0
                        })}
                        placeholder={translations.quiz.weight}
                      />
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => onRemoveOption(questionIndex, optionIndex)}
                      disabled={question.options?.length === 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="conditions">
                <AccordionTrigger>{translations.quiz.conditionalLogic}</AccordionTrigger>
                <AccordionContent>
                  <QuestionConditions
                    question={question}
                    questionIndex={questionIndex}
                    previousQuestions={questions.slice(0, questionIndex)}
                    onUpdateCondition={handleUpdateCondition}
                    onAddCondition={() => {}}
                    onRemoveCondition={() => {}}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      ))}
      
      <Button onClick={onAddQuestion} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        {translations.quiz.addQuestion}
      </Button>
    </div>
  );
};
