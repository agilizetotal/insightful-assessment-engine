
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, Copy, Trash } from 'lucide-react';

interface QuestionActionsProps {
  isFirst: boolean;
  isLast: boolean;
  onMoveQuestion: (direction: 'up' | 'down') => void;
  onDuplicateQuestion: () => void;
  onRemoveQuestion: () => void;
}

export const QuestionActions = ({
  isFirst,
  isLast,
  onMoveQuestion,
  onDuplicateQuestion,
  onRemoveQuestion
}: QuestionActionsProps) => {
  return (
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
  );
};
