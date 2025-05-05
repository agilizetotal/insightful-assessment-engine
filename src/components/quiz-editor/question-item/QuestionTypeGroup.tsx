
import { Question, QuestionType, QuestionGroup } from '@/types/quiz';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { translations } from '@/locales/pt-BR';

interface QuestionTypeGroupProps {
  question: Question;
  questionGroups: QuestionGroup[];
  onUpdateQuestion: (updatedQuestion: Question) => void;
}

export const QuestionTypeGroup = ({
  question,
  questionGroups,
  onUpdateQuestion
}: QuestionTypeGroupProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="question-type">{translations.quiz.questionType}</Label>
        <Select 
          value={question.type} 
          onValueChange={(value: QuestionType) => onUpdateQuestion({
            ...question, 
            type: value
          })}
        >
          <SelectTrigger id="question-type">
            <SelectValue placeholder={translations.quiz.selectQuestionType} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multiple-choice">{translations.quiz.multipleChoice}</SelectItem>
            <SelectItem value="checkbox">{translations.quiz.checkboxes}</SelectItem>
            <SelectItem value="open-ended">{translations.quiz.openEnded}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="question-group">Grupo de Perguntas</Label>
        <Select 
          value={question.groupId || 'no-group'} 
          onValueChange={(value) => onUpdateQuestion({
            ...question, 
            groupId: value === 'no-group' ? undefined : value
          })}
        >
          <SelectTrigger id="question-group">
            <SelectValue placeholder="Selecione um grupo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-group">Sem grupo</SelectItem>
            {questionGroups.map(group => (
              <SelectItem key={group.id} value={group.id}>{group.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
