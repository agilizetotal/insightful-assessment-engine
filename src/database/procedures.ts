
// This file contains the SQL statements that would be run to create the necessary database procedures
// These procedures would be executed via Supabase migrations, but since we're working in a frontend-only context
// we'll use RPC functions from supabase client to handle this

export const CREATE_QUESTION_GROUPS_TABLE = `
CREATE TABLE IF NOT EXISTS public.question_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id),
  title TEXT NOT NULL,
  description TEXT,
  weight NUMERIC DEFAULT 1,
  order_index INTEGER NOT NULL
);
`;

export const CREATE_QUESTION_GROUPS_IF_NOT_EXISTS_FUNCTION = `
CREATE OR REPLACE FUNCTION create_question_groups_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'question_groups') THEN
    EXECUTE '
      CREATE TABLE public.question_groups (
        id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        quiz_id UUID REFERENCES public.quizzes(id),
        title TEXT NOT NULL,
        description TEXT,
        weight NUMERIC DEFAULT 1,
        order_index INTEGER NOT NULL
      );
      
      ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS image_url TEXT;
      ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.question_groups(id);
    ';
  END IF;
END;
$$ LANGUAGE plpgsql;
`;

export const DELETE_QUESTION_GROUPS_FUNCTION = `
CREATE OR REPLACE FUNCTION delete_question_groups(group_ids UUID[])
RETURNS void AS $$
BEGIN
  DELETE FROM public.question_groups WHERE id = ANY(group_ids);
END;
$$ LANGUAGE plpgsql;
`;

export const UPSERT_QUESTION_GROUPS_FUNCTION = `
CREATE OR REPLACE FUNCTION upsert_question_groups(groups_data jsonb[])
RETURNS void AS $$
DECLARE
  group_data jsonb;
BEGIN
  FOREACH group_data IN ARRAY groups_data
  LOOP
    INSERT INTO public.question_groups (
      id, quiz_id, title, description, weight, order_index
    )
    VALUES (
      (group_data->>'id')::uuid,
      (group_data->>'quiz_id')::uuid,
      group_data->>'title',
      group_data->>'description',
      (group_data->>'weight')::numeric,
      (group_data->>'order_index')::integer
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      weight = EXCLUDED.weight,
      order_index = EXCLUDED.order_index;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
`;

export const GET_QUESTION_GROUPS_FUNCTION = `
CREATE OR REPLACE FUNCTION get_question_groups(quiz_id_param UUID)
RETURNS TABLE (
  id UUID,
  quiz_id UUID,
  title TEXT,
  description TEXT,
  weight NUMERIC,
  order_index INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT qg.id, qg.quiz_id, qg.title, qg.description, qg.weight, qg.order_index
  FROM public.question_groups qg
  WHERE qg.quiz_id = quiz_id_param;
END;
$$ LANGUAGE plpgsql;
`;

// Note: These functions would need to be created in the database via migrations
// For now, we're just defining them here for reference
