
import { QuestionGroup } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';

// Helper function to validate that question_groups table exists
const checkQuestionGroupsTable = async (): Promise<boolean> => {
  try {
    // Attempt to get schema information using raw SQL query instead
    const { data, error } = await supabase.rpc('question_groups_exists');
    
    if (error) {
      console.error("Error checking question_groups table:", error);
      return false;
    }
    
    return data;
  } catch (error) {
    console.error("Error checking question_groups table:", error);
    return false;
  }
};

export const saveQuestionGroups = async (quizId: string, groups: QuestionGroup[]) => {
  if (!groups || groups.length === 0) return true;
  
  try {
    const tableExists = await checkQuestionGroupsTable();
    if (!tableExists) {
      console.error("Question groups table doesn't exist yet");
      return false;
    }
    
    // We'll use raw SQL for operations to avoid type issues
    // Get existing groups to determine which ones to delete
    const { data: existingGroups, error: fetchError } = await supabase.rpc(
      'get_question_groups_by_quiz',
      { quiz_id_param: quizId }
    );
      
    if (fetchError) {
      console.error("Error fetching question groups:", fetchError);
      return false;
    }
    
    const existingGroupIds = existingGroups?.map(g => g.id) || [];
    const newGroupIds = groups.map(g => g.id);
    
    // Delete groups that are no longer present
    const groupsToDelete = existingGroupIds.filter(id => !newGroupIds.includes(id));
    if (groupsToDelete.length > 0) {
      const { error: deleteError } = await supabase.rpc(
        'delete_question_groups', 
        { group_ids: groupsToDelete }
      );
      
      if (deleteError) {
        console.error("Error deleting question groups:", deleteError);
        return false;
      }
    }
    
    // Save groups using RPC
    for (const group of groups) {
      const { error: upsertError } = await supabase.rpc(
        'upsert_question_group',
        {
          group_id: group.id,
          quiz_id_param: quizId,
          title_param: group.title,
          description_param: group.description || '',
          weight_param: group.weight,
          order_index_param: group.order || 0
        }
      );
      
      if (upsertError) {
        console.error(`Error upserting question group ${group.id}:`, upsertError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error saving question groups:", error);
    return false;
  }
};
