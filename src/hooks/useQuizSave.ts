
import { useState } from "react";
import { Quiz } from "@/types/quiz";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { translations } from "@/locales/pt-BR";

export const useQuizSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const saveToSupabase = async (quizData: Quiz) => {
    if (!user) {
      toast.error(translations.auth.loginRequired);
      return null;
    }

    setIsSaving(true);
    try {
      const updatedQuizData = {
        ...quizData,
        updatedAt: new Date().toISOString(),
      };

      const { data: savedQuizData, error: quizError } = await supabase
        .from('quizzes')
        .upsert({
          id: updatedQuizData.id,
          title: updatedQuizData.title,
          description: updatedQuizData.description,
          user_id: user.id,
          updated_at: new Date().toISOString(),
          created_at: updatedQuizData.createdAt
        })
        .select('id')
        .single();

      if (quizError) {
        throw quizError;
      }

      const questionsToInsert = updatedQuizData.questions.map((question, index) => ({
        id: question.id,
        quiz_id: savedQuizData.id,
        text: question.text,
        type: question.type,
        required: question.required,
        order_index: index,
        updated_at: new Date().toISOString()
      }));

      if (questionsToInsert.length > 0) {
        await supabase
          .from('questions')
          .delete()
          .eq('quiz_id', savedQuizData.id);

        const { error: questionsError } = await supabase
          .from('questions')
          .insert(questionsToInsert);

        if (questionsError) {
          throw questionsError;
        }

        for (const question of updatedQuizData.questions) {
          if (question.options && question.options.length > 0) {
            await supabase
              .from('question_options')
              .delete()
              .eq('question_id', question.id);

            const optionsToInsert = question.options.map((option, index) => ({
              id: option.id,
              question_id: question.id,
              text: option.text,
              weight: option.weight,
              order_index: index
            }));

            const { error: optionsError } = await supabase
              .from('question_options')
              .insert(optionsToInsert);

            if (optionsError) {
              throw optionsError;
            }
          }
          
          if (question.conditions && question.conditions.length > 0) {
            await supabase
              .from('question_conditions')
              .delete()
              .eq('dependent_question_id', question.id);
              
            for (const condition of question.conditions) {
              const { error: conditionError } = await supabase
                .from('question_conditions')
                .insert({
                  id: crypto.randomUUID(),
                  question_id: condition.questionId,
                  dependent_question_id: question.id,
                  operator: condition.operator,
                  value: String(condition.value),
                  logical_operator: condition.logical_operator || 'AND'
                });
                
              if (conditionError) {
                throw conditionError;
              }
            }
          }
        }
      }

      if (updatedQuizData.profileRanges.length > 0) {
        await supabase
          .from('profile_ranges')
          .delete()
          .eq('quiz_id', savedQuizData.id);

        const rangesToInsert = updatedQuizData.profileRanges.map(range => ({
          id: crypto.randomUUID(),
          quiz_id: savedQuizData.id,
          min_score: range.min,
          max_score: range.max,
          profile: range.profile,
          description: range.description
        }));

        const { error: rangesError } = await supabase
          .from('profile_ranges')
          .insert(rangesToInsert);

        if (rangesError) {
          throw rangesError;
        }
      }

      toast.success(translations.quiz.saveSuccess);
      return updatedQuizData;
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.error(translations.quiz.saveError);
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
