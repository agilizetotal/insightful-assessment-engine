
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface QuestionGroupHeaderProps {
  onAddGroup: () => void;
  toggleDebug: () => void;
  debugEnabled: boolean;
}

export const QuestionGroupHeader = ({
  onAddGroup,
  toggleDebug,
  debugEnabled
}: QuestionGroupHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-medium">Grupos de Perguntas</h2>
      <div className="space-x-2">
        <Button onClick={onAddGroup}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Grupo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleDebug}
        >
          Debug
        </Button>
      </div>
    </div>
  );
};
