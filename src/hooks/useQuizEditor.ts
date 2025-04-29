
import { useState } from 'react';
import { Quiz } from '@/types/quiz';
import { useQuestions } from './useQuestions';
import { useQuizSave } from './useQuizSave';

export const useQuizEditor = (
  initialQuiz: Quiz,
  onSave: (quiz: Quiz) => void,
  onPreview: (quiz: Quiz) => void
) => {
  const [quiz, setQuiz] = useState<Quiz>(initialQuiz);
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
    removeOption
  } = useQuestions(quiz, setQuiz);

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
    addQuestion,
    updateQuestion,
    removeQuestion,
    moveQuestion,
    duplicateQuestion,
    addOption,
    updateOption,
    removeOption,
    handleSave,
    handlePreview
  };
};
