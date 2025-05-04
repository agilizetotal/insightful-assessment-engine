
import { Option } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';

export const saveQuestionOptions = async (questionId: string, options: Option[] | undefined) => {
  if (!options || options.length === 0) return true;
  
  try {
    // Get existing options to determine which ones to delete
    const { data: existingOptions } = await supabase
      .from('question_options')
      .select('id')
      .eq('question_id', questionId);
      
    const existingOptionIds = existingOptions?.map(opt => opt.id) || [];
    const newOptionIds = options.map(opt => opt.id);
    
    // Delete options that are no longer present
    const optionsToDelete = existingOptionIds.filter(id => !newOptionIds.includes(id));
    if (optionsToDelete.length > 0) {
      await supabase
        .from('question_options')
        .delete()
        .in('id', optionsToDelete);
    }
    
    // Save options
    const optionsToUpsert = options.map((option, index) => ({
      id: option.id,
      question_id: questionId,
      text: option.text,
      weight: option.weight,
      order_index: index
    }));
    
    const { error: optionsError } = await supabase
      .from('question_options')
      .upsert(optionsToUpsert);
      
    if (optionsError) {
      console.error(`Error saving options for question ${questionId}:`, optionsError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error saving options for question ${questionId}:`, error);
    return false;
  }
};
