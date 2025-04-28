
import { Option } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Plus, Trash } from 'lucide-react';
import { translations } from '@/locales/pt-BR';

interface QuestionOptionsProps {
  options?: Option[];
  onAddOption: () => void;
  onUpdateOption: (optionIndex: number, updatedOption: Option) => void;
  onRemoveOption: (optionIndex: number) => void;
}

export const QuestionOptions = ({
  options,
  onAddOption,
  onUpdateOption,
  onRemoveOption
}: QuestionOptionsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>{translations.quiz.options}</Label>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onAddOption}
        >
          <Plus className="h-4 w-4 mr-1" />
          {translations.quiz.addOption}
        </Button>
      </div>
      
      {options?.map((option, optionIndex) => (
        <div key={option.id} className="flex space-x-2">
          <div className="flex-grow">
            <Input 
              value={option.text} 
              onChange={(e) => onUpdateOption(optionIndex, {
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
              onChange={(e) => onUpdateOption(optionIndex, {
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
            onClick={() => onRemoveOption(optionIndex)}
            disabled={options.length === 1}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};
