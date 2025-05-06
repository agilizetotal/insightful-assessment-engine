
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
    
    // Usar código mais simples e direto para salvar os grupos
    for (const group of groups) {
      console.log("Saving group:", group);
      
      // Garantir que todos os campos obrigatórios estejam presentes
      if (!group.title) {
        console.warn(`Group ${group.id} has no title, setting default title`);
        group.title = `Grupo ${group.id.substring(0,4)}`;
      }
      
      // Usar upsert diretamente na tabela em vez de RPC
      const { error: upsertError } = await supabase
        .from('question_groups')
        .upsert({
          id: group.id,
          quiz_id: quizId,
          title: group.title,
          description: group.description || '',
          weight: group.weight || 1,
          order_index: group.order || 0
        });
      
      if (upsertError) {
        console.error(`Error saving question group ${group.id}:`, upsertError);
        return false;
      }
    }
    
    // Excluir grupos que não estão mais presentes
    // Primeiro, recupere todos os grupos existentes
    const { data: existingGroups } = await supabase
      .from('question_groups')
      .select('id')
      .eq('quiz_id', quizId);
    
    if (existingGroups) {
      const existingIds = existingGroups.map(g => g.id);
      const currentIds = groups.map(g => g.id);
      
      // Identificar grupos para excluir
      const idsToDelete = existingIds.filter(id => !currentIds.includes(id));
      
      if (idsToDelete.length > 0) {
        console.log("Deleting groups:", idsToDelete);
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
    
    console.log("Question groups saved successfully");
    return true;
  } catch (error) {
    console.error("Error saving question groups:", error);
    return false;
  }
};
