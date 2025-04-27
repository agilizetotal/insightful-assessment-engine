
import { Quiz } from '@/types/quiz';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { translations } from '@/locales/pt-BR';

interface GeneralSettingsProps {
  quiz: Quiz;
  onUpdate: (quiz: Quiz) => void;
}

export const GeneralSettings = ({ quiz, onUpdate }: GeneralSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{translations.quiz.settings}</CardTitle>
        <CardDescription>{translations.quiz.settingsDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">{translations.quiz.titleLabel}</Label>
          <Input 
            id="title" 
            value={quiz.title} 
            onChange={(e) => onUpdate({...quiz, title: e.target.value})}
            placeholder={translations.quiz.titlePlaceholder}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">{translations.quiz.descriptionLabel}</Label>
          <Textarea 
            id="description" 
            value={quiz.description} 
            onChange={(e) => onUpdate({...quiz, description: e.target.value})}
            placeholder={translations.quiz.descriptionPlaceholder}
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
};
