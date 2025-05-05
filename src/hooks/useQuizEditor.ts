
import { useState } from 'react';
import { Quiz, Condition, QuestionGroup } from '@/types/quiz';
import { useQuestions } from './useQuestions';
import { useQuizSave } from './useQuizSave';
import { toast } from 'sonner';

export const useQuizEditor = (
  initialQuiz: Quiz,
  onSave: (quiz: Quiz) => void,
  onPreview: (quiz: Quiz) => void
) => {
  // Initialize with empty question groups if none exist
  const initializedQuiz = {
    ...initialQuiz,
    questionGroups: initialQuiz.questionGroups || []
  };
  
  const [quiz, setQuiz] = useState<Quiz>(initializedQuiz);
  const { isSaving, saveToSupabase } = useQuizSave();
  
  const {
    questions,
    addQuestion,
    updateQuestion,
    removeQuestion,
    moveQuestion,
    duplicateQuestion,
    addOption,
    updateOption,
    removeOption,
    addCondition,
    updateCondition,
    removeCondition
  } = useQuestions(quiz, setQuiz);

  const addQuestionGroup = () => {
    const newGroupId = crypto.randomUUID();
    const newGroup: QuestionGroup = {
      id: newGroupId,
      title: `Grupo ${quiz.questionGroups.length + 1}`,
      description: '',
      weight: 1,
      order: quiz.questionGroups.length
    };
    
    console.log("Adding new question group:", newGroup);
    
    const updatedQuiz = {
      ...quiz,
      questionGroups: [...quiz.questionGroups, newGroup]
    };
    
    setQuiz(updatedQuiz);
    toast.success(`Grupo "${newGroup.title}" adicionado`);
  };
  
  const updateQuestionGroup = (index: number, updatedGroup: QuestionGroup) => {
    const updatedGroups = [...quiz.questionGroups];
    console.log(`Updating group at index ${index}:`, updatedGroup);
    
    updatedGroups[index] = updatedGroup;
    
    const updatedQuiz = {
      ...quiz,
      questionGroups: updatedGroups
    };
    
    setQuiz(updatedQuiz);
  };
  
  const removeQuestionGroup = (index: number) => {
    const groupId = quiz.questionGroups[index].id;
    const groupTitle = quiz.questionGroups[index].title;
    
    console.log(`Removing group at index ${index} with ID ${groupId}`);
    
    // Remove group association from any questions
    const updatedQuestions = quiz.questions.map(q => {
      if (q.groupId === groupId) {
        console.log(`Removing group association from question ${q.id}`);
        return {
          ...q,
          groupId: undefined
        };
      }
      return q;
    });
    
    const updatedQuiz = {
      ...quiz,
      questionGroups: quiz.questionGroups.filter((_, i) => i !== index),
      questions: updatedQuestions
    };
    
    setQuiz(updatedQuiz);
    toast.success(`Grupo "${groupTitle}" removido`);
  };

  const handleSave = async () => {
    console.log("Saving quiz with question groups:", quiz.questionGroups);
    const updatedQuiz = await saveToSupabase(quiz);
    if (updatedQuiz) {
      toast.success("Questionário salvo com sucesso!");
      onSave(updatedQuiz);
    }
  };
  
  const handlePreview = () => {
    onPreview(quiz);
  };

  return {
    quiz,
    setQuiz,
    isSaving,
    questions,
    questionGroups: quiz.questionGroups || [],
    addQuestion,
    updateQuestion,
    removeQuestion,
    moveQuestion,
    duplicateQuestion,
    addOption,
    updateOption,
    removeOption,
    addCondition,
    updateCondition,
    removeCondition,
    addQuestionGroup,
    updateQuestionGroup,
    removeQuestionGroup,
    handleSave,
    handlePreview
  };
};
