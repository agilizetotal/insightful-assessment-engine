
import { Quiz } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';

export const saveQuizBasicInfo = async (quiz: Quiz, userId: string) => {
  if (!userId) {
    throw new Error("User ID is required to save quiz basic info");
  }
  
  console.log("Saving quiz basic info with user ID:", userId);
  
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
    console.error("Error saving quiz basic info:", quizError);
    throw quizError;
  }
  
  console.log("Quiz basic info saved successfully:", quizData);
  return quizData;
};
