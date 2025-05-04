
import { QuestionGroup } from '@/types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash, ArrowUp, ArrowDown } from 'lucide-react';

interface QuestionGroupsProps {
  questionGroups: QuestionGroup[];
  onAddGroup: () => void;
  onUpdateGroup: (index: number, updatedGroup: QuestionGroup) => void;
  onRemoveGroup: (index: number) => void;
}

export const QuestionGroups = ({
  questionGroups,
  onAddGroup,
  onUpdateGroup,
  onRemoveGroup,
}: QuestionGroupsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Grupos de Perguntas</h2>
        <Button onClick={onAddGroup}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Grupo
        </Button>
      </div>

      {questionGroups.length === 0 && (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground">
            Nenhum grupo criado. Adicione grupos para organizar suas perguntas.
          </p>
        </div>
      )}

      {questionGroups.map((group, index) => (
        <Card key={group.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-lg">Grupo {index + 1}</CardTitle>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (index > 0) {
                      const updatedGroups = [...questionGroups];
                      const temp = updatedGroups[index];
                      updatedGroups[index] = updatedGroups[index - 1];
                      updatedGroups[index - 1] = temp;
                      
                      // Update order values
                      updatedGroups[index].order = index;
                      updatedGroups[index - 1].order = index - 1;
                      
                      onUpdateGroup(index, updatedGroups[index]);
                      onUpdateGroup(index - 1, updatedGroups[index - 1]);
                    }
                  }}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (index < questionGroups.length - 1) {
                      const updatedGroups = [...questionGroups];
                      const temp = updatedGroups[index];
                      updatedGroups[index] = updatedGroups[index + 1];
                      updatedGroups[index + 1] = temp;
                      
                      // Update order values
                      updatedGroups[index].order = index;
                      updatedGroups[index + 1].order = index + 1;
                      
                      onUpdateGroup(index, updatedGroups[index]);
                      onUpdateGroup(index + 1, updatedGroups[index + 1]);
                    }
                  }}
                  disabled={index === questionGroups.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => onRemoveGroup(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`group-title-${index}`}>Título do Grupo</Label>
              <Input
                id={`group-title-${index}`}
                value={group.title}
                onChange={(e) =>
                  onUpdateGroup(index, {
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
                  onUpdateGroup(index, {
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
                  onUpdateGroup(index, {
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
      ))}
    </div>
  );
};
