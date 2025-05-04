
import { QuestionGroup } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';

export const saveQuestionGroups = async (quizId: string, groups: QuestionGroup[]) => {
  if (!groups || groups.length === 0) return true;
  
  try {
    // Get existing groups to determine which ones to delete
    const { data: existingGroups } = await supabase
      .from('question_groups')
      .select('id')
      .eq('quiz_id', quizId);
      
    const existingGroupIds = existingGroups?.map(g => g.id) || [];
    const newGroupIds = groups.map(g => g.id);
    
    // Delete groups that are no longer present
    const groupsToDelete = existingGroupIds.filter(id => !newGroupIds.includes(id));
    if (groupsToDelete.length > 0) {
      await supabase
        .from('question_groups')
        .delete()
        .in('id', groupsToDelete);
    }
    
    // Save groups
    const groupsToUpsert = groups.map((group, index) => ({
      id: group.id,
      quiz_id: quizId,
      title: group.title,
      description: group.description || '',
      weight: group.weight,
      order_index: group.order || index
    }));
    
    const { error: groupsError } = await supabase
      .from('question_groups')
      .upsert(groupsToUpsert);
      
    if (groupsError) {
      console.error("Error saving question groups:", groupsError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error saving question groups:", error);
    return false;
  }
};
