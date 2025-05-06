
import { QuestionGroup } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';

export const saveQuestionGroups = async (quizId: string, groups: QuestionGroup[]): Promise<boolean> => {
  try {
    // If there are no groups, consider it a success
    if (!groups || groups.length === 0) {
      console.log("No question groups to save.");
      return true;
    }
    
    console.log(`Saving ${groups.length} question groups for quiz ${quizId}`);
    
    // Direct upsert to question_groups table for each group
    for (const group of groups) {
      console.log(`Upserting group: ${group.id}, title: ${group.title}, order: ${group.order}`);
      
      // Format data for upsert
      const { error } = await supabase
        .from('question_groups')
        .upsert({
          id: group.id,
          quiz_id: quizId,
          title: group.title || `Grupo ${group.id.substring(0,4)}`,
          description: group.description || '',
          weight: group.weight || 1,
          order_index: group.order
        });
      
      if (error) {
        console.error(`Error saving question group ${group.id}:`, error);
        return false;
      }
      
      console.log(`Group ${group.id} saved successfully`);
    }
    
    // Get existing groups for this quiz
    const { data: existingGroups, error: fetchError } = await supabase
      .from('question_groups')
      .select('id')
      .eq('quiz_id', quizId);
    
    if (fetchError) {
      console.error("Error fetching existing groups:", fetchError);
      return false;
    }
    
    // Identify groups to delete (groups that exist in DB but not in current collection)
    if (existingGroups && existingGroups.length > 0) {
      const currentGroupIds = groups.map(g => g.id);
      const idsToDelete = existingGroups
        .map(g => g.id)
        .filter(id => !currentGroupIds.includes(id));
      
      // Delete groups that are no longer present
      if (idsToDelete.length > 0) {
        console.log(`Deleting ${idsToDelete.length} groups that are no longer present:`, idsToDelete);
        
        const { error: deleteError } = await supabase
          .from('question_groups')
          .delete()
          .in('id', idsToDelete);
        
        if (deleteError) {
          console.error("Error deleting groups:", deleteError);
          return false;
        }
      }
    }
    
    console.log("All question groups saved successfully");
    return true;
  } catch (error) {
    console.error("Error in saveQuestionGroups:", error);
    return false;
  }
};
