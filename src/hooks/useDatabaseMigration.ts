
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDatabaseMigration = () => {
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);

  useEffect(() => {
    const runMigration = async () => {
      try {
        // Create the functions needed for question_groups operations
        await supabase.rpc('create_question_groups_functions');
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
    await supabase.rpc('create_question_groups_table_if_not_exists');
    await supabase.rpc('create_question_groups_functions');
    return true;
  } catch (error) {
    console.error('Schema initialization error:', error);
    return false;
  }
};
