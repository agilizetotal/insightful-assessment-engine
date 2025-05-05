
import { Condition, QuizResponse } from "@/types/quiz";

export const evaluateCondition = (condition: Condition, responses: QuizResponse[]): boolean => {
  const response = responses.find(r => r.questionId === condition.questionId);
  if (!response) return false;
  
  switch(condition.operator) {
    case 'equals':
      if (Array.isArray(response.answer)) {
        return response.answer.includes(condition.value);
      }
      return response.answer === condition.value;
    
    case 'not-equals':
      if (Array.isArray(response.answer)) {
        return !response.answer.includes(condition.value);
      }
      return response.answer !== condition.value;
    
    case 'greater-than':
      const numResponse = Number(response.answer);
      const numValue = Number(condition.value);
      return !isNaN(numResponse) && !isNaN(numValue) && numResponse > numValue;
    
    case 'less-than':
      const numResp = Number(response.answer);
      const numVal = Number(condition.value);
      return !isNaN(numResp) && !isNaN(numVal) && numResp < numVal;
    
    case 'contains':
      if (Array.isArray(response.answer)) {
        return response.answer.includes(condition.value);
      }
      return String(response.answer).includes(condition.value);
    
    default:
      return false;
  }
};

export const evaluateConditionsWithLogic = (
  conditions: Condition[] | undefined, 
  responses: QuizResponse[]
): boolean => {
  if (!conditions || conditions.length === 0) {
    return true;
  }
  
  // Group conditions by logical operator
  const conditionGroups: Array<Condition[]> = [];
  let currentGroup: Condition[] = [];
  
  conditions.forEach((condition, index) => {
    if (index === 0) {
      currentGroup.push(condition);
    } else if (condition.logical_operator === 'OR') {
      conditionGroups.push([...currentGroup]);
      currentGroup = [condition];
    } else {
      currentGroup.push(condition);
    }
  });
  
  // Add the last group
  if (currentGroup.length > 0) {
    conditionGroups.push(currentGroup);
  }
  
  // Check if any group's conditions are all met (OR between groups)
  return conditionGroups.some(group => 
    // All conditions in a group must be met (AND within group)
    group.every(condition => evaluateCondition(condition, responses))
  );
};
