
import { Question, Option, QuestionType, Condition } from '@/types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowDown, ArrowUp, Copy, Trash } from 'lucide-react';
import { translations } from '@/locales/pt-BR';
import { QuestionConditions } from './QuestionConditions';
import { QuestionOptions } from './QuestionOptions';

interface QuestionItemProps {
  question: Question;
  questionIndex: number;
  isFirst: boolean;
  isLast: boolean;
  previousQuestions: Question[];
  onUpdateQuestion: (updatedQuestion: Question) => void;
  onRemoveQuestion: () => void;
  onMoveQuestion: (direction: 'up' | 'down') => void;
  onDuplicateQuestion: () => void;
  onAddOption: () => void;
  onUpdateOption: (optionIndex: number, updatedOption: Option) => void;
  onRemoveOption: (optionIndex: number) => void;
  onAddCondition: () => void;
  onUpdateCondition: (conditionIndex: number, condition: Condition) => void;
  onRemoveCondition: (conditionIndex: number) => void;
}

export const QuestionItem = ({
  question,
  questionIndex,
  isFirst,
  isLast,
  previousQuestions,
  onUpdateQuestion,
  onRemoveQuestion,
  onMoveQuestion,
  onDuplicateQuestion,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  onAddCondition,
  onUpdateCondition,
  onRemoveCondition
}: QuestionItemProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <CardTitle className="text-lg">{translations.quiz.question} {questionIndex + 1}</CardTitle>
          <div className="flex space-x-1">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onMoveQuestion('up')}
              disabled={isFirst}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onMoveQuestion('down')}
              disabled={isLast}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onDuplicateQuestion}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-red-500 hover:text-red-700"
              onClick={onRemoveQuestion}
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
            onChange={(e) => onUpdateQuestion({
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
              onValueChange={(value: QuestionType) => onUpdateQuestion({
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
              onCheckedChange={(checked) => onUpdateQuestion({
                ...question, 
                required: checked
              })}
            />
            <Label htmlFor={`required-${questionIndex}`}>{translations.quiz.requiredQuestion}</Label>
          </div>
        </div>
        
        {question.type !== 'open-ended' && (
          <QuestionOptions
            options={question.options}
            onAddOption={onAddOption}
            onUpdateOption={onUpdateOption}
            onRemoveOption={onRemoveOption}
          />
        )}
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="conditions">
            <AccordionTrigger>{translations.quiz.conditionalLogic}</AccordionTrigger>
            <AccordionContent>
              <QuestionConditions
                question={question}
                questionIndex={questionIndex}
                previousQuestions={previousQuestions}
                onUpdateCondition={(questionIdx, conditionIndex, condition) => {
                  onUpdateCondition(conditionIndex, condition);
                }}
                onAddCondition={() => onAddCondition()}
                onRemoveCondition={(questionIdx, conditionIndex) => onRemoveCondition(conditionIndex)}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
