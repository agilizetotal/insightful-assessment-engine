
import { QuestionGroup } from "@/types/quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash, ArrowUp, ArrowDown } from "lucide-react";

interface QuestionGroupCardProps {
  group: QuestionGroup;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  debug: boolean;
  onUpdateGroup: (updatedGroup: QuestionGroup) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export const QuestionGroupCard = ({
  group,
  index,
  isFirst,
  isLast,
  debug,
  onUpdateGroup,
  onMoveUp,
  onMoveDown,
  onRemove
}: QuestionGroupCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <CardTitle className="text-lg">Grupo {index + 1}</CardTitle>
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onMoveUp}
              disabled={isFirst}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onMoveDown}
              disabled={isLast}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-500 hover:text-red-700"
              onClick={onRemove}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {debug && (
          <div className="p-2 bg-gray-100 rounded text-xs overflow-auto">
            <pre>{JSON.stringify(group, null, 2)}</pre>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor={`group-title-${index}`}>Título do Grupo</Label>
          <Input
            id={`group-title-${index}`}
            value={group.title}
            onChange={(e) =>
              onUpdateGroup({
                ...group,
                title: e.target.value,
              })
            }
            placeholder="Ex: Conhecimentos Técnicos"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`group-desc-${index}`}>Descrição (opcional)</Label>
          <Textarea
            id={`group-desc-${index}`}
            value={group.description || ''}
            onChange={(e) =>
              onUpdateGroup({
                ...group,
                description: e.target.value,
              })
            }
            placeholder="Descreva o objetivo deste grupo de perguntas"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`group-weight-${index}`}>
            Peso do Grupo (multiplicador de pontuação)
          </Label>
          <Input
            id={`group-weight-${index}`}
            type="number"
            min="1"
            step="0.1"
            value={group.weight}
            onChange={(e) =>
              onUpdateGroup({
                ...group,
                weight: parseFloat(e.target.value) || 1,
              })
            }
          />
          <p className="text-sm text-muted-foreground">
            Este valor multiplica a pontuação das perguntas neste grupo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
