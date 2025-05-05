
import { Quiz } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';

export const saveQuizBasicInfo = async (quiz: Quiz, userId: string) => {
  const { data: quizData, error: quizError } = await supabase
    .from('quizzes')
    .upsert({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      user_id: userId,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (quizError) {
    throw quizError;
  }
  
  return quizData;
};
