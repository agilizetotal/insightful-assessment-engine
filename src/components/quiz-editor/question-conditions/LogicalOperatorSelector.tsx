
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { translations } from '@/locales/pt-BR';

interface LogicalOperatorSelectorProps {
  value: 'AND' | 'OR';
  onValueChange: (value: 'AND' | 'OR') => void;
  groupName: string;
  conditionIndex: number;
}

export const LogicalOperatorSelector = ({
  value,
  onValueChange,
  groupName,
  conditionIndex
}: LogicalOperatorSelectorProps) => {
  return (
    <div className="mb-2">
      <RadioGroup
        value={value || 'AND'}
        onValueChange={(value) => onValueChange(value as 'AND' | 'OR')}
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
  );
};
