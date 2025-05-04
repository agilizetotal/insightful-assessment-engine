
import { useState } from 'react';
import { Quiz, Condition, QuestionGroup } from '@/types/quiz';
import { useQuestions } from './useQuestions';
import { useQuizSave } from './useQuizSave';

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
    const newGroup: QuestionGroup = {
      id: crypto.randomUUID(),
      title: `Grupo ${quiz.questionGroups.length + 1}`,
      description: '',
      weight: 1,
      order: quiz.questionGroups.length
    };
    
    const updatedQuiz = {
      ...quiz,
      questionGroups: [...quiz.questionGroups, newGroup]
    };
    
    setQuiz(updatedQuiz);
  };
  
  const updateQuestionGroup = (index: number, updatedGroup: QuestionGroup) => {
    const updatedGroups = [...quiz.questionGroups];
    updatedGroups[index] = updatedGroup;
    
    const updatedQuiz = {
      ...quiz,
      questionGroups: updatedGroups
    };
    
    setQuiz(updatedQuiz);
  };
  
  const removeQuestionGroup = (index: number) => {
    const groupId = quiz.questionGroups[index].id;
    
    // Remove group association from any questions
    const updatedQuestions = quiz.questions.map(q => {
      if (q.groupId === groupId) {
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
  };

  const handleSave = async () => {
    const updatedQuiz = await saveToSupabase(quiz);
    if (updatedQuiz) {
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
