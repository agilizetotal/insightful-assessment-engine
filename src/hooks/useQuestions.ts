
import { useState } from "react";
import { Quiz, Question, Option } from "@/types/quiz";
import { defaultQuestion, defaultOption } from "@/components/quiz-editor/defaults";

export const useQuestions = (initialQuiz: Quiz, onQuizUpdate: (updatedQuiz: Quiz) => void) => {
  const [quiz, setQuiz] = useState<Quiz>(initialQuiz);

  const addQuestion = () => {
    const newQuestion = {
      ...defaultQuestion,
      id: crypto.randomUUID(),
      options: [
        { ...defaultOption, id: crypto.randomUUID(), text: 'Option 1' },
        { ...defaultOption, id: crypto.randomUUID(), text: 'Option 2' }
      ]
    };
    
    const updatedQuiz = {
      ...quiz,
      questions: [...quiz.questions, newQuestion]
    };
    
    setQuiz(updatedQuiz);
    onQuizUpdate(updatedQuiz);
  };
  
  const updateQuestion = (index: number, updatedQuestion: Question) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[index] = updatedQuestion;
    
    const updatedQuiz = {
      ...quiz,
      questions: updatedQuestions
    };
    
    setQuiz(updatedQuiz);
    onQuizUpdate(updatedQuiz);
  };
  
  const removeQuestion = (index: number) => {
    const updatedQuestions = quiz.questions.filter((_, i) => i !== index);
    
    const updatedQuiz = {
      ...quiz,
      questions: updatedQuestions
    };
    
    setQuiz(updatedQuiz);
    onQuizUpdate(updatedQuiz);
  };
  
  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === quiz.questions.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedQuestions = [...quiz.questions];
    [updatedQuestions[index], updatedQuestions[newIndex]] = 
      [updatedQuestions[newIndex], updatedQuestions[index]];
    
    const updatedQuiz = {
      ...quiz,
      questions: updatedQuestions
    };
    
    setQuiz(updatedQuiz);
    onQuizUpdate(updatedQuiz);
  };
  
  const duplicateQuestion = (index: number) => {
    const questionToDuplicate = quiz.questions[index];
    const duplicatedQuestion = {
      ...questionToDuplicate,
      id: crypto.randomUUID(),
      options: questionToDuplicate.options?.map(option => ({
        ...option,
        id: crypto.randomUUID()
      }))
    };
    
    const updatedQuestions = [...quiz.questions];
    updatedQuestions.splice(index + 1, 0, duplicatedQuestion);
    
    const updatedQuiz = {
      ...quiz,
      questions: updatedQuestions
    };
    
    setQuiz(updatedQuiz);
    onQuizUpdate(updatedQuiz);
  };
  
  const addOption = (questionIndex: number) => {
    const question = quiz.questions[questionIndex];
    const updatedOptions = [...(question.options || []), {
      ...defaultOption,
      id: crypto.randomUUID(),
      text: `Option ${(question.options?.length || 0) + 1}`
    }];
    
    updateQuestion(questionIndex, {
      ...question,
      options: updatedOptions
    });
  };
  
  const updateOption = (questionIndex: number, optionIndex: number, updatedOption: Option) => {
    const question = quiz.questions[questionIndex];
    const updatedOptions = [...(question.options || [])];
    updatedOptions[optionIndex] = updatedOption;
    
    updateQuestion(questionIndex, {
      ...question,
      options: updatedOptions
    });
  };
  
  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = quiz.questions[questionIndex];
    const updatedOptions = (question.options || []).filter((_, i) => i !== optionIndex);
    
    updateQuestion(questionIndex, {
      ...question,
      options: updatedOptions
    });
  };

  return {
    questions: quiz.questions,
    addQuestion,
    updateQuestion,
    removeQuestion,
    moveQuestion,
    duplicateQuestion,
    addOption,
    updateOption,
    removeOption
  };
};
