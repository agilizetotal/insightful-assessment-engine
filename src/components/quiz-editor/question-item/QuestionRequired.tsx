
import { Question } from '@/types/quiz';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { translations } from '@/locales/pt-BR';

interface QuestionRequiredProps {
  question: Question;
  onUpdateQuestion: (updatedQuestion: Question) => void;
}

export const QuestionRequired = ({
  question,
  onUpdateQuestion
}: QuestionRequiredProps) => {
  return (
    <div className="flex items-center space-x-2 pt-2">
      <Switch 
        id="required-question" 
        checked={question.required}
        onCheckedChange={(checked) => onUpdateQuestion({
          ...question, 
          required: checked
        })}
      />
      <Label htmlFor="required-question">{translations.quiz.requiredQuestion}</Label>
    </div>
  );
};
