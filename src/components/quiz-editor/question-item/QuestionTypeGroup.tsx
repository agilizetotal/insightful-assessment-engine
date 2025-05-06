
import { Question, QuestionType, QuestionGroup } from '@/types/quiz';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { translations } from '@/locales/pt-BR';
import { useEffect, useState } from 'react';

interface QuestionTypeGroupProps {
  question: Question;
  questionGroups: QuestionGroup[];
  onUpdateQuestion: (updatedQuestion: Question) => void;
}

export const QuestionTypeGroup = ({
  question,
  questionGroups,
  onUpdateQuestion
}: QuestionTypeGroupProps) => {
  // Use local state to track selection and sync with question
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(question.groupId);
  
  // Update local state when question prop changes
  useEffect(() => {
    console.log("QuestionTypeGroup - question.groupId changed:", question.groupId);
    setSelectedGroupId(question.groupId);
  }, [question.groupId]);
  
  // Debug logging
  useEffect(() => {
    console.log("QuestionTypeGroup - Available groups:", questionGroups);
    console.log("QuestionTypeGroup - Current question:", question.id);
    console.log("QuestionTypeGroup - Selected group ID:", selectedGroupId);
  }, [questionGroups, question.id, selectedGroupId]);

  const handleTypeChange = (value: QuestionType) => {
    onUpdateQuestion({
      ...question,
      type: value
    });
  };

  const handleGroupChange = (value: string) => {
    console.log("Group selection changed to:", value);
    
    const newGroupId = value === 'no-group' ? undefined : value;
    
    // Update local state
    setSelectedGroupId(newGroupId);
    
    // Update parent component with full question object
    onUpdateQuestion({
      ...question,
      groupId: newGroupId
    });
    
    // Extra logging to debug
    console.log("Updated question with new groupId:", newGroupId);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="question-type">{translations.quiz.questionType}</Label>
        <Select 
          value={question.type} 
          onValueChange={handleTypeChange}
        >
          <SelectTrigger id="question-type">
            <SelectValue placeholder={translations.quiz.selectQuestionType} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multiple-choice">{translations.quiz.multipleChoice}</SelectItem>
            <SelectItem value="checkbox">{translations.quiz.checkboxes}</SelectItem>
            <SelectItem value="open-ended">{translations.quiz.openEnded}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="question-group">Grupo de Perguntas</Label>
        <Select 
          value={selectedGroupId || 'no-group'} 
          onValueChange={handleGroupChange}
          defaultValue="no-group"
        >
          <SelectTrigger id="question-group" className="bg-white">
            <SelectValue placeholder="Selecione um grupo" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="no-group">Sem grupo</SelectItem>
            {questionGroups.map(group => (
              <SelectItem key={group.id} value={group.id}>
                {group.title || `Grupo ${group.id.substring(0,4)}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
