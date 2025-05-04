
import { useState } from 'react';
import { QuestionGroup } from '@/types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

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
  const [debug, setDebug] = useState(false);
  
  const handleAddGroup = () => {
    console.log("Adding new group");
    onAddGroup();
    toast.success("Novo grupo adicionado");
  };
  
  const handleUpdateGroup = (index: number, updatedGroup: QuestionGroup) => {
    console.log("Updating group at index", index, "with data:", updatedGroup);
    onUpdateGroup(index, updatedGroup);
  };
  
  const handleRemoveGroup = (index: number) => {
    console.log("Removing group at index", index);
    onRemoveGroup(index);
    toast.success("Grupo removido");
  };
  
  const moveGroupUp = (index: number) => {
    if (index > 0) {
      console.log("Moving group up:", index);
      const updatedGroups = [...questionGroups];
      const temp = updatedGroups[index];
      updatedGroups[index] = updatedGroups[index - 1];
      updatedGroups[index - 1] = temp;
      
      // Update order values
      updatedGroups[index].order = index;
      updatedGroups[index - 1].order = index - 1;
      
      handleUpdateGroup(index, updatedGroups[index]);
      handleUpdateGroup(index - 1, updatedGroups[index - 1]);
      toast.success("Grupo movido para cima");
    }
  };
  
  const moveGroupDown = (index: number) => {
    if (index < questionGroups.length - 1) {
      console.log("Moving group down:", index);
      const updatedGroups = [...questionGroups];
      const temp = updatedGroups[index];
      updatedGroups[index] = updatedGroups[index + 1];
      updatedGroups[index + 1] = temp;
      
      // Update order values
      updatedGroups[index].order = index;
      updatedGroups[index + 1].order = index + 1;
      
      handleUpdateGroup(index, updatedGroups[index]);
      handleUpdateGroup(index + 1, updatedGroups[index + 1]);
      toast.success("Grupo movido para baixo");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Grupos de Perguntas</h2>
        <div className="space-x-2">
          <Button onClick={handleAddGroup}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Grupo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDebug(!debug);
              console.log("Current question groups:", questionGroups);
            }}
          >
            Debug
          </Button>
        </div>
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
                  onClick={() => moveGroupUp(index)}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveGroupDown(index)}
                  disabled={index === questionGroups.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveGroup(index)}
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
                  handleUpdateGroup(index, {
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
                  handleUpdateGroup(index, {
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
                  handleUpdateGroup(index, {
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
