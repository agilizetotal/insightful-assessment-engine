
import { useEffect, useState } from "react";
import { Question, QuizResponse, Quiz, DisplayQuestionGroup } from "@/types/quiz";
import { evaluateConditionsWithLogic } from "@/utils/conditionEvaluator";

export const useActiveQuestions = (
  quiz: Quiz | null | undefined,
  responses: QuizResponse[],
  currentQuestionIndex: number
) => {
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [questionGroups, setQuestionGroups] = useState<DisplayQuestionGroup[]>([]);

  useEffect(() => {
    // Only run this when we've moved past the user data form
    if (!quiz || !quiz.questions || currentQuestionIndex < 0) {
      return;
    }
    
    // Filter questions based on conditional logic
    const filteredQuestions = quiz.questions.filter(question => 
      evaluateConditionsWithLogic(question.conditions, responses)
    );
    setActiveQuestions(filteredQuestions);
    
    // Organize questions into groups based on question groups defined in the quiz
    const displayGroups: DisplayQuestionGroup[] = [];
    
    // First, create a map of group IDs to their details
    const groupMap = new Map();
    (quiz.questionGroups || []).forEach(group => {
      groupMap.set(group.id, {
        title: group.title,
        description: group.description,
        weight: group.weight
      });
    });
    
    // Create a group for questions without a group
    const ungroupedQuestions = filteredQuestions.filter(q => !q.groupId);
    if (ungroupedQuestions.length > 0) {
      displayGroups.push({
        title: "Perguntas Gerais",
        questions: ungroupedQuestions
      });
    }
    
    // Group questions by their groupId
    const groupedQuestions = new Map<string, Question[]>();
    
    filteredQuestions.filter(q => q.groupId).forEach(question => {
      if (!groupedQuestions.has(question.groupId!)) {
        groupedQuestions.set(question.groupId!, []);
      }
      groupedQuestions.get(question.groupId!)?.push(question);
    });
    
    // Add groups with their questions to displayGroups
    groupedQuestions.forEach((questions, groupId) => {
      const groupDetails = groupMap.get(groupId);
      if (groupDetails && questions.length > 0) {
        displayGroups.push({
          title: groupDetails.title,
          description: groupDetails.description,
          weight: groupDetails.weight,
          questions
        });
      }
    });
    
    setQuestionGroups(displayGroups);
  }, [quiz?.questions, quiz?.questionGroups, responses, currentQuestionIndex]);

  return { activeQuestions, questionGroups };
};
