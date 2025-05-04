
import { useState } from 'react';
import { Quiz } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useQuizSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const saveToSupabase = async (quiz: Quiz): Promise<Quiz | null> => {
    if (!user) {
      toast.error("Você precisa estar logado para salvar questionários");
      return null;
    }

    setIsSaving(true);
    try {
      // Update or insert quiz
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .upsert({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          user_id: user.id,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (quizError) {
        throw quizError;
      }
      
      // Save question groups
      if (quiz.questionGroups && quiz.questionGroups.length > 0) {
        // Get existing groups to determine which ones to delete
        const { data: existingGroups } = await supabase
          .from('question_groups')
          .select('id')
          .eq('quiz_id', quiz.id);
          
        const existingGroupIds = existingGroups?.map(g => g.id) || [];
        const newGroupIds = quiz.questionGroups.map(g => g.id);
        
        // Delete groups that are no longer present
        const groupsToDelete = existingGroupIds.filter(id => !newGroupIds.includes(id));
        if (groupsToDelete.length > 0) {
          await supabase
            .from('question_groups')
            .delete()
            .in('id', groupsToDelete);
        }
        
        // Update or insert groups
        const groupsToUpsert = quiz.questionGroups.map((group, index) => ({
          id: group.id,
          quiz_id: quiz.id,
          title: group.title,
          description: group.description,
          weight: group.weight,
          order_index: index
        }));
        
        const { error: groupsError } = await supabase
          .from('question_groups')
          .upsert(groupsToUpsert);
          
        if (groupsError) {
          console.error("Error saving question groups:", groupsError);
        }
      }
      
      // Save questions
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        
        // Save questions
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .upsert({
            id: question.id,
            quiz_id: quiz.id,
            text: question.text,
            type: question.type,
            required: question.required,
            order_index: i,
            image_url: question.imageUrl, // Save image URL
            group_id: question.groupId // Save group ID
          })
          .select()
          .single();
          
        if (questionError) {
          console.error(`Error saving question ${i}:`, questionError);
          continue;
        }
        
        // Get existing options to determine which ones to delete
        const { data: existingOptions } = await supabase
          .from('question_options')
          .select('id')
          .eq('question_id', question.id);
          
        const existingOptionIds = existingOptions?.map(opt => opt.id) || [];
        const newOptionIds = question.options?.map(opt => opt.id) || [];
        
        // Delete options that are no longer present
        const optionsToDelete = existingOptionIds.filter(id => !newOptionIds.includes(id));
        if (optionsToDelete.length > 0) {
          await supabase
            .from('question_options')
            .delete()
            .in('id', optionsToDelete);
        }
        
        // Save options
        if (question.options && question.options.length > 0) {
          const optionsToUpsert = question.options.map((option, index) => ({
            id: option.id,
            question_id: question.id,
            text: option.text,
            weight: option.weight,
            order_index: index
          }));
          
          const { error: optionsError } = await supabase
            .from('question_options')
            .upsert(optionsToUpsert);
            
          if (optionsError) {
            console.error(`Error saving options for question ${i}:`, optionsError);
          }
        }
        
        // Handle conditions - first get existing conditions
        const { data: existingConditions } = await supabase
          .from('question_conditions')
          .select('id')
          .eq('dependent_question_id', question.id);
          
        const existingConditionIds = existingConditions?.map(c => c.id) || [];
        const newConditionIds = question.conditions?.map(c => c.id).filter(id => id) || [];
        
        // Delete conditions that are no longer present
        const conditionsToDelete = existingConditionIds.filter(id => !newConditionIds.includes(id));
        if (conditionsToDelete.length > 0) {
          await supabase
            .from('question_conditions')
            .delete()
            .in('id', conditionsToDelete);
        }
        
        // Save conditions
        if (question.conditions && question.conditions.length > 0) {
          const conditionsToUpsert = question.conditions.map((condition) => ({
            id: condition.id,
            dependent_question_id: question.id,
            question_id: condition.questionId,
            operator: condition.operator,
            value: condition.value,
            logical_operator: condition.logical_operator
          }));
          
          const { error: conditionsError } = await supabase
            .from('question_conditions')
            .upsert(conditionsToUpsert);
            
          if (conditionsError) {
            console.error(`Error saving conditions for question ${i}:`, conditionsError);
          }
        }
      }
      
      // Get existing questions to determine which ones to delete
      const { data: existingQuestions } = await supabase
        .from('questions')
        .select('id')
        .eq('quiz_id', quiz.id);
        
      const existingQuestionIds = existingQuestions?.map(q => q.id) || [];
      const newQuestionIds = quiz.questions.map(q => q.id);
      
      // Delete questions that are no longer present
      const questionsToDelete = existingQuestionIds.filter(id => !newQuestionIds.includes(id));
      if (questionsToDelete.length > 0) {
        await supabase
          .from('questions')
          .delete()
          .in('id', questionsToDelete);
      }
      
      // Save profile ranges
      if (quiz.profileRanges && quiz.profileRanges.length > 0) {
        // Get existing ranges to determine which ones to delete
        const { data: existingRanges } = await supabase
          .from('profile_ranges')
          .select('id')
          .eq('quiz_id', quiz.id);
          
        const existingRangeIds = existingRanges?.map(r => r.id) || [];
        
        // Delete all existing ranges since they don't have stable IDs
        if (existingRangeIds.length > 0) {
          await supabase
            .from('profile_ranges')
            .delete()
            .in('id', existingRangeIds);
        }
        
        // Create new ranges
        const rangesToInsert = quiz.profileRanges.map(range => ({
          quiz_id: quiz.id,
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
        }
      }
      
      // Return the updated quiz
      const updatedQuiz: Quiz = {
        ...quiz,
        updatedAt: new Date().toISOString()
      };
      
      return updatedQuiz;
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.error("Erro ao salvar questionário");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveToSupabase
  };
};
