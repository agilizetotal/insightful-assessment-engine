
import { QuestionGroup } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';

// Helper function to validate that question_groups table exists
const checkQuestionGroupsTable = async (): Promise<boolean> => {
  try {
    // Attempt to check if the table exists using the RPC function
    const { data, error } = await supabase.rpc('question_groups_exists');
    
    if (error) {
      console.error("Error checking question_groups table:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Error checking question_groups table:", error);
    return false;
  }
};

export const saveQuestionGroups = async (quizId: string, groups: QuestionGroup[]): Promise<boolean> => {
  try {
    // Se não houver grupos, considere como sucesso
    if (!groups || groups.length === 0) {
      console.log("No question groups to save.");
      return true;
    }
    
    console.log("Saving question groups:", groups);
    
    // Verificar se a tabela existe
    const tableExists = await checkQuestionGroupsTable();
    if (!tableExists) {
      console.error("Question groups table doesn't exist yet");
      return false;
    }
    
    // Use RPC function to get existing groups
    const { data: existingGroups, error: fetchError } = await supabase.rpc(
      'get_question_groups_by_quiz',
      { quiz_id_param: quizId }
    );
      
    if (fetchError) {
      console.error("Error fetching question groups:", fetchError);
      return false;
    }
    
    console.log("Existing groups:", existingGroups);
    const existingGroupIds = existingGroups?.map((g: any) => g.id) || [];
    const newGroupIds = groups.map(g => g.id);
    
    // Delete groups that are no longer present using RPC
    const groupsToDelete = existingGroupIds.filter(id => !newGroupIds.includes(id));
    if (groupsToDelete.length > 0) {
      console.log("Deleting groups:", groupsToDelete);
      const { error: deleteError } = await supabase.rpc(
        'delete_question_groups', 
        { group_ids: groupsToDelete }
      );
      
      if (deleteError) {
        console.error("Error deleting question groups:", deleteError);
        return false;
      }
    }
    
    // Save groups using RPC one by one with verification
    for (const group of groups) {
      console.log("Upserting group:", group);
      
      // Garantir que todos os campos obrigatórios estejam presentes
      if (!group.title) {
        console.warn(`Group ${group.id} has no title, setting default title`);
        group.title = `Grupo ${group.id.substring(0,4)}`;
      }
      
      const { error: upsertError } = await supabase.rpc(
        'upsert_question_group',
        {
          group_id: group.id,
          quiz_id_param: quizId,
          title_param: group.title,
          description_param: group.description || '',
          weight_param: group.weight || 1,
          order_index_param: group.order || 0
        }
      );
      
      if (upsertError) {
        console.error(`Error upserting question group ${group.id}:`, upsertError);
        return false;
      }
    }
    
    // Verify that groups were saved correctly by fetching them again
    const { data: verifiedGroups, error: verifyError } = await supabase.rpc(
      'get_question_groups_by_quiz',
      { quiz_id_param: quizId }
    );
    
    if (verifyError) {
      console.error("Error verifying saved groups:", verifyError);
      return false;
    } else {
      console.log("Verified saved groups:", verifiedGroups?.length || 0);
      if (verifiedGroups?.length !== groups.length) {
        console.warn(`Expected ${groups.length} groups but found ${verifiedGroups?.length || 0}`);
      }
    }
    
    console.log("Question groups saved successfully");
    return true;
  } catch (error) {
    console.error("Error saving question groups:", error);
    return false;
  }
};
