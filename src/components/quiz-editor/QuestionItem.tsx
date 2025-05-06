
import { Question, Option, Condition, QuestionGroup } from '@/types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { translations } from '@/locales/pt-BR';
import { QuestionConditions } from './QuestionConditions';
import { QuestionOptions } from './QuestionOptions';
import { QuestionActions } from './question-item/QuestionActions';
import { QuestionTypeGroup } from './question-item/QuestionTypeGroup';
import { QuestionRequired } from './question-item/QuestionRequired';
import { QuestionImage } from './question-item/QuestionImage';
import { useEffect } from 'react';

interface QuestionItemProps {
  question: Question;
  questionIndex: number;
  isFirst: boolean;
  isLast: boolean;
  previousQuestions: Question[];
  questionGroups: QuestionGroup[];
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
  questionGroups,
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
  // Log for debugging
  useEffect(() => {
    console.log(`QuestionItem ${questionIndex+1}:`, {
      id: question.id,
      text: question.text.substring(0, 20),
      groupId: question.groupId,
      availableGroups: questionGroups.map(g => ({ id: g.id, title: g.title }))
    });
  }, [question, questionIndex, questionGroups]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <CardTitle className="text-lg">{translations.quiz.question} {questionIndex + 1}</CardTitle>
          <QuestionActions 
            isFirst={isFirst}
            isLast={isLast}
            onMoveQuestion={onMoveQuestion}
            onDuplicateQuestion={onDuplicateQuestion}
            onRemoveQuestion={onRemoveQuestion}
          />
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
        
        <QuestionImage 
          imageUrl={question.imageUrl} 
          onImageChange={(url) => onUpdateQuestion({
            ...question, 
            imageUrl: url
          })}
        />
        
        <QuestionTypeGroup 
          question={question}
          questionGroups={questionGroups}
          onUpdateQuestion={onUpdateQuestion}
        />
        
        <QuestionRequired 
          question={question}
          onUpdateQuestion={onUpdateQuestion}
        />
        
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
