
import { Question } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';
import { saveQuestionOptions } from './useQuestionOptionsSave';
import { saveQuestionConditions } from './useQuestionConditionsSave';

export const saveQuestions = async (quizId: string, questions: Question[]) => {
  try {
    console.log(`Saving ${questions.length} questions for quiz ${quizId}`);
    console.log("Questions with groups:", questions.map(q => ({
      id: q.id, 
      text: q.text.substring(0, 20), 
      groupId: q.groupId
    })));
    
    // Save questions one by one
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      // Format data for upsert
      const questionData = {
        id: question.id,
        quiz_id: quizId,
        text: question.text,
        type: question.type,
        required: question.required,
        order_index: i,
        image_url: question.imageUrl,
        group_id: question.groupId
      };
      
      console.log(`Upserting question ${i} with data:`, questionData);
      
      // Save questions
      const { data: questionData_, error: questionError } = await supabase
        .from('questions')
        .upsert(questionData)
        .select();
        
      if (questionError) {
        console.error(`Error saving question ${i}:`, questionError);
        console.error(`Data that failed:`, questionData);
        continue;
      }
      
      console.log(`Question ${question.id} saved successfully`);
      
      // Save options and conditions
      await Promise.all([
        saveQuestionOptions(question.id, question.options),
        saveQuestionConditions(question.id, question.conditions)
      ]);
    }
    
    // Get existing questions to determine which ones to delete
    const { data: existingQuestions } = await supabase
      .from('questions')
      .select('id')
      .eq('quiz_id', quizId);
      
    const existingQuestionIds = existingQuestions?.map(q => q.id) || [];
    const newQuestionIds = questions.map(q => q.id);
    
    // Delete questions that are no longer present
    const questionsToDelete = existingQuestionIds.filter(id => !newQuestionIds.includes(id));
    if (questionsToDelete.length > 0) {
      console.log(`Deleting ${questionsToDelete.length} questions that are no longer present`);
      
      await supabase
        .from('questions')
        .delete()
        .in('id', questionsToDelete);
    }
    
    console.log("All questions saved successfully");
    return true;
  } catch (error) {
    console.error("Error in saveQuestions:", error);
    return false;
  }
};
