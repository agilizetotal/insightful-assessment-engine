
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDatabaseMigration = () => {
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);

  useEffect(() => {
    const runMigration = async () => {
      try {
        // Create the functions needed for question_groups operations
        const { error } = await supabase.rpc('create_question_groups_functions');
        
        if (error) {
          throw error;
        }
        
        setMigrationComplete(true);
      } catch (error) {
        console.error('Migration error:', error);
        setMigrationError('Failed to run database migration');
      }
    };

    runMigration();
  }, []);

  return { migrationComplete, migrationError };
};

// Execute this function early in the application lifecycle
export const initializeDatabaseSchema = async () => {
  try {
    // Create the base tables and functions if they don't exist
    const { error: tableError } = await supabase.rpc('create_question_groups_table_if_not_exists');
    
    if (tableError) {
      console.error('Schema initialization error (tables):', tableError);
      return false;
    }
    
    const { error: functionsError } = await supabase.rpc('create_question_groups_functions');
    
    if (functionsError) {
      console.error('Schema initialization error (functions):', functionsError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Schema initialization error:', error);
    return false;
  }
};
