import { useState } from "react";
import { Quiz, Question, Option, Condition } from "@/types/quiz";
import { defaultQuestion, defaultOption, defaultCondition } from "@/components/quiz-editor/defaults";

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
    // Log the update operation for debugging
    console.log("Updating question:", {
      index,
      before: quiz.questions[index],
      after: updatedQuestion
    });
    
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
      })),
      conditions: questionToDuplicate.conditions?.map(condition => ({
        ...condition,
        id: crypto.randomUUID()
      })),
      // Preserve the group association when duplicating
      groupId: questionToDuplicate.groupId
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
    
    // Preserve groupId when updating
    updateQuestion(questionIndex, {
      ...question,
      options: updatedOptions
    });
  };
  
  const updateOption = (questionIndex: number, optionIndex: number, updatedOption: Option) => {
    const question = quiz.questions[questionIndex];
    const updatedOptions = [...(question.options || [])];
    updatedOptions[optionIndex] = updatedOption;
    
    // Preserve groupId when updating
    updateQuestion(questionIndex, {
      ...question,
      options: updatedOptions
    });
  };
  
  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = quiz.questions[questionIndex];
    const updatedOptions = (question.options || []).filter((_, i) => i !== optionIndex);
    
    // Preserve groupId when updating
    updateQuestion(questionIndex, {
      ...question,
      options: updatedOptions
    });
  };
  
  // New functions for handling conditions
  const addCondition = (questionIndex: number) => {
    const question = quiz.questions[questionIndex];
    const newCondition: Condition = {
      ...defaultCondition,
      questionId: question.id !== quiz.questions[0].id ? quiz.questions[0].id : '',
      logical_operator: question.conditions && question.conditions.length > 0 ? 'AND' : undefined
    };
    
    const updatedConditions = [...(question.conditions || []), newCondition];
    
    // Preserve groupId when updating
    updateQuestion(questionIndex, {
      ...question,
      conditions: updatedConditions
    });
  };
  
  const updateCondition = (questionIndex: number, conditionIndex: number, updatedCondition: Condition) => {
    const question = quiz.questions[questionIndex];
    const updatedConditions = [...(question.conditions || [])];
    updatedConditions[conditionIndex] = updatedCondition;
    
    // Preserve groupId when updating
    updateQuestion(questionIndex, {
      ...question,
      conditions: updatedConditions
    });
  };
  
  const removeCondition = (questionIndex: number, conditionIndex: number) => {
    const question = quiz.questions[questionIndex];
    const updatedConditions = (question.conditions || []).filter((_, i) => i !== conditionIndex);
    
    // Preserve groupId when updating
    updateQuestion(questionIndex, {
      ...question,
      conditions: updatedConditions
    });
  };

  return {
    questions: quiz.questions,
    addQuestion,
    updateQuestion,
    removeQuestion: (index) => {
      const updatedQuestions = quiz.questions.filter((_, i) => i !== index);
      const updatedQuiz = {
        ...quiz,
        questions: updatedQuestions
      };
      setQuiz(updatedQuiz);
      onQuizUpdate(updatedQuiz);
    },
    moveQuestion: (index, direction) => {
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
    },
    duplicateQuestion: (index) => {
      const questionToDuplicate = quiz.questions[index];
      const duplicatedQuestion = {
        ...questionToDuplicate,
        id: crypto.randomUUID(),
        options: questionToDuplicate.options?.map(option => ({
          ...option,
          id: crypto.randomUUID()
        })),
        conditions: questionToDuplicate.conditions?.map(condition => ({
          ...condition,
          id: crypto.randomUUID()
        })),
        // Preserve the group association when duplicating
        groupId: questionToDuplicate.groupId
      };
      
      const updatedQuestions = [...quiz.questions];
      updatedQuestions.splice(index + 1, 0, duplicatedQuestion);
      
      const updatedQuiz = {
        ...quiz,
        questions: updatedQuestions
      };
      
      setQuiz(updatedQuiz);
      onQuizUpdate(updatedQuiz);
    },
    addOption,
    updateOption,
    removeOption,
    addCondition,
    updateCondition,
    removeCondition
  };
};
