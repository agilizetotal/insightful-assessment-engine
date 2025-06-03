
import { Question } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';
import { saveQuestionOptions } from './useQuestionOptionsSave';
import { saveQuestionConditions } from './useQuestionConditionsSave';

export const saveQuestions = async (quizId: string, questions: Question[]) => {
  try {
    console.log(`=== SAVING ${questions.length} QUESTIONS FOR QUIZ ${quizId} ===`);
    
    // Log detailed question information
    questions.forEach((q, index) => {
      console.log(`Question ${index + 1}:`, {
        id: q.id,
        text: q.text.substring(0, 50) + '...',
        type: q.type,
        groupId: q.groupId,
        optionsCount: q.options?.length || 0,
        required: q.required
      });
    });
    
    // Save questions in batches to avoid timeouts
    const batchSize = 10;
    let savedCount = 0;
    
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(questions.length/batchSize)}`);
      
      for (let j = 0; j < batch.length; j++) {
        const question = batch[j];
        const questionIndex = i + j;
        
        // Format data for upsert
        const questionData = {
          id: question.id,
          quiz_id: quizId,
          text: question.text,
          type: question.type,
          required: question.required,
          order_index: questionIndex,
          image_url: question.imageUrl,
          group_id: question.groupId
        };
        
        console.log(`Saving question ${questionIndex + 1}/${questions.length}:`, {
          id: question.id,
          text_preview: question.text.substring(0, 30),
          group_id: question.groupId
        });
        
        // Save question
        const { error: questionError } = await supabase
          .from('questions')
          .upsert(questionData);
          
        if (questionError) {
          console.error(`Error saving question ${questionIndex + 1}:`, questionError);
          console.error(`Failed question data:`, questionData);
          throw new Error(`Falha ao salvar pergunta ${questionIndex + 1}: ${questionError.message}`);
        }
        
        console.log(`✓ Question ${questionIndex + 1} saved successfully`);
        savedCount++;
        
        // Save options and conditions in parallel
        const optionsPromise = saveQuestionOptions(question.id, question.options);
        const conditionsPromise = saveQuestionConditions(question.id, question.conditions);
        
        const [optionsSaved, conditionsSaved] = await Promise.all([optionsPromise, conditionsPromise]);
        
        if (!optionsSaved) {
          console.error(`Failed to save options for question ${questionIndex + 1}`);
        }
        
        if (!conditionsSaved) {
          console.error(`Failed to save conditions for question ${questionIndex + 1}`);
        }
      }
      
      // Small delay between batches to prevent overwhelming the database
      if (i + batchSize < questions.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`=== SAVED ${savedCount}/${questions.length} QUESTIONS SUCCESSFULLY ===`);
    
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
    
    console.log("=== ALL QUESTIONS PROCESSING COMPLETED ===");
    return true;
  } catch (error) {
    console.error("=== ERROR IN SAVE QUESTIONS ===", error);
    return false;
  }
};
