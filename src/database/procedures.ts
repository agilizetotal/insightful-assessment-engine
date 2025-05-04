
import { supabase } from '@/integrations/supabase/client';

// Helper function to set up database procedures for question groups
export const setupQuestionGroupsProcedures = async (): Promise<void> => {
  try {
    // Check if question_groups table exists
    const { error: checkError } = await supabase.rpc('create_question_groups_table_if_not_exists');
    
    if (checkError) {
      console.error("Error setting up question groups table:", checkError);
    }
  } catch (error) {
    console.error("Error setting up database procedures:", error);
  }
};

// Initialize database procedures
export const initDatabaseProcedures = async (): Promise<void> => {
  await setupQuestionGroupsProcedures();
};
