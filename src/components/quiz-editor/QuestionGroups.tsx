
import { useState } from 'react';
import { QuestionGroup } from '@/types/quiz';
import { toast } from 'sonner';
import { 
  EmptyGroupsState,
  QuestionGroupCard,
  QuestionGroupHeader 
} from './question-groups';

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

  const toggleDebug = () => {
    setDebug(!debug);
    console.log("Current question groups:", questionGroups);
  };

  return (
    <div className="space-y-4">
      <QuestionGroupHeader 
        onAddGroup={handleAddGroup}
        toggleDebug={toggleDebug}
        debugEnabled={debug}
      />

      {questionGroups.length === 0 && <EmptyGroupsState />}

      {questionGroups.map((group, index) => (
        <QuestionGroupCard
          key={group.id}
          group={group}
          index={index}
          isFirst={index === 0}
          isLast={index === questionGroups.length - 1}
          debug={debug}
          onUpdateGroup={(updatedGroup) => handleUpdateGroup(index, updatedGroup)}
          onMoveUp={() => moveGroupUp(index)}
          onMoveDown={() => moveGroupDown(index)}
          onRemove={() => handleRemoveGroup(index)}
        />
      ))}
    </div>
  );
};
