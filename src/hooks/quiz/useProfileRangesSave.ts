
import { ProfileRange } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';

export const saveProfileRanges = async (quizId: string, profileRanges: ProfileRange[]) => {
  if (!profileRanges || profileRanges.length === 0) return;
  
  try {
    // Get existing ranges to determine which ones to delete
    const { data: existingRanges } = await supabase
      .from('profile_ranges')
      .select('id')
      .eq('quiz_id', quizId);
      
    const existingRangeIds = existingRanges?.map(r => r.id) || [];
    
    // Delete all existing ranges since they don't have stable IDs
    if (existingRangeIds.length > 0) {
      await supabase
        .from('profile_ranges')
        .delete()
        .in('id', existingRangeIds);
    }
    
    // Create new ranges
    const rangesToInsert = profileRanges.map(range => ({
      quiz_id: quizId,
      min_score: range.min,
      max_score: range.max,
      profile: range.profile,
      description: range.description
    }));
    
    const { error: rangesError } = await supabase
      .from('profile_ranges')
      .insert(rangesToInsert);
      
    if (rangesError) {
      console.error("Error saving profile ranges:", rangesError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in saveProfileRanges:", error);
    return false;
  }
};
