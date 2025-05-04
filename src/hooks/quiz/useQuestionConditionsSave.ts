
import { Condition } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';

export const saveQuestionConditions = async (questionId: string, conditions: Condition[] | undefined) => {
  if (!conditions || conditions.length === 0) return true;
  
  try {
    // Handle conditions - first get existing conditions
    const { data: existingConditions } = await supabase
      .from('question_conditions')
      .select('id')
      .eq('dependent_question_id', questionId);
      
    const existingConditionIds = existingConditions?.map(c => c.id) || [];
    const newConditionIds = conditions.map(c => c.id).filter(id => id) as string[];
    
    // Delete conditions that are no longer present
    const conditionsToDelete = existingConditionIds.filter(id => !newConditionIds.includes(id));
    if (conditionsToDelete.length > 0) {
      await supabase
        .from('question_conditions')
        .delete()
        .in('id', conditionsToDelete);
    }
    
    // Save conditions
    const conditionsToUpsert = conditions.map((condition) => ({
      id: condition.id,
      dependent_question_id: questionId,
      question_id: condition.questionId,
      operator: condition.operator,
      value: condition.value,
      logical_operator: condition.logical_operator
    }));
    
    const { error: conditionsError } = await supabase
      .from('question_conditions')
      .upsert(conditionsToUpsert);
      
    if (conditionsError) {
      console.error(`Error saving conditions for question ${questionId}:`, conditionsError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error saving conditions for question ${questionId}:`, error);
    return false;
  }
};
