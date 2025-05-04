
import { QuestionGroup } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';

export const saveQuestionGroups = async (quizId: string, questionGroups: QuestionGroup[]) => {
  if (!questionGroups || questionGroups.length === 0) return;
  
  try {
    // Create the table if it doesn't exist (first use of the system)
    const { error: tableCheckError } = await supabase.rpc('create_question_groups_if_not_exists');
    if (tableCheckError) {
      console.error("Error checking question_groups table:", tableCheckError);
    }
    
    // Get existing groups to determine which ones to delete
    const { data: existingGroups } = await supabase.rpc('get_question_groups', { quiz_id_param: quizId });
      
    const existingGroupIds = existingGroups?.map(g => g.id) || [];
    const newGroupIds = questionGroups.map(g => g.id);
    
    // Delete groups that are no longer present
    const groupsToDelete = existingGroupIds.filter(id => !newGroupIds.includes(id));
    if (groupsToDelete.length > 0) {
      await supabase.rpc('delete_question_groups', { group_ids: groupsToDelete });
    }
    
    // Update or insert groups
    const groupsToUpsert = questionGroups.map((group, index) => ({
      id: group.id,
      quiz_id: quizId,
      title: group.title,
      description: group.description,
      weight: group.weight,
      order_index: index
    }));
    
    const { error: groupsError } = await supabase.rpc('upsert_question_groups', { 
      groups_data: groupsToUpsert 
    });
      
    if (groupsError) {
      console.error("Error saving question groups:", groupsError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in saveQuestionGroups:", error);
    return false;
  }
};
