import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Save, Play } from "lucide-react";
import { Quiz, Question, Option, Condition } from "@/types/quiz";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { translations } from "@/locales/pt-BR";
import { GeneralSettings } from "./quiz-editor/GeneralSettings";
import { ProfileRanges } from "./quiz-editor/ProfileRanges";
import { QuestionsList } from "./quiz-editor/QuestionsList";
import { defaultQuestion, defaultOption } from "./quiz-editor/defaults";

interface QuizEditorProps {
  initialQuiz?: Quiz;
  onSave: (quiz: Quiz) => void;
  onPreview: (quiz: Quiz) => void;
  isNewQuiz?: boolean;
}

const QuizEditor: React.FC<QuizEditorProps> = ({ initialQuiz, onSave, onPreview, isNewQuiz = false }) => {
  const [quiz, setQuiz] = useState<Quiz>(initialQuiz || {
    id: crypto.randomUUID(),
    title: '',
    description: '',
    questions: [],
    profileRanges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const addQuestion = () => {
    const newQuestion = {
      ...defaultQuestion,
      id: crypto.randomUUID(),
      options: [
        { ...defaultOption, id: crypto.randomUUID(), text: 'Option 1' },
        { ...defaultOption, id: crypto.randomUUID(), text: 'Option 2' }
      ]
    };
    
    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQuestion]
    });
  };
  
  const updateQuestion = (index: number, updatedQuestion: Question) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[index] = updatedQuestion;
    
    setQuiz({
      ...quiz,
      questions: updatedQuestions
    });
  };
  
  const removeQuestion = (index: number) => {
    const updatedQuestions = quiz.questions.filter((_, i) => i !== index);
    
    setQuiz({
      ...quiz,
      questions: updatedQuestions
    });
  };
  
  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === quiz.questions.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedQuestions = [...quiz.questions];
    [updatedQuestions[index], updatedQuestions[newIndex]] = 
      [updatedQuestions[newIndex], updatedQuestions[index]];
    
    setQuiz({
      ...quiz,
      questions: updatedQuestions
    });
  };
  
  const duplicateQuestion = (index: number) => {
    const questionToDuplicate = quiz.questions[index];
    const duplicatedQuestion = {
      ...questionToDuplicate,
      id: crypto.randomUUID(),
      options: questionToDuplicate.options?.map(option => ({
        ...option,
        id: crypto.randomUUID()
      }))
    };
    
    const updatedQuestions = [...quiz.questions];
    updatedQuestions.splice(index + 1, 0, duplicatedQuestion);
    
    setQuiz({
      ...quiz,
      questions: updatedQuestions
    });
  };
  
  const addOption = (questionIndex: number) => {
    const question = quiz.questions[questionIndex];
    const updatedOptions = [...(question.options || []), {
      ...defaultOption,
      id: crypto.randomUUID(),
      text: `Option ${(question.options?.length || 0) + 1}`
    }];
    
    updateQuestion(questionIndex, {
      ...question,
      options: updatedOptions
    });
  };
  
  const updateOption = (questionIndex: number, optionIndex: number, updatedOption: Option) => {
    const question = quiz.questions[questionIndex];
    const updatedOptions = [...(question.options || [])];
    updatedOptions[optionIndex] = updatedOption;
    
    updateQuestion(questionIndex, {
      ...question,
      options: updatedOptions
    });
  };
  
  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = quiz.questions[questionIndex];
    const updatedOptions = (question.options || []).filter((_, i) => i !== optionIndex);
    
    updateQuestion(questionIndex, {
      ...question,
      options: updatedOptions
    });
  };
  
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
                  logical_operator: condition.logicalOperator || 'AND'
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
      console.error("Erro ao salvar quiz:", error);
      toast.error(translations.quiz.saveError);
      return null;
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSave = async () => {
    const updatedQuiz = await saveToSupabase(quiz);
    if (updatedQuiz) {
      onSave(updatedQuiz);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{translations.quiz.editor}</h1>
        <div className="space-x-2">
          <Button onClick={() => onPreview(quiz)} variant="outline" disabled={isSaving}>
            <Play className="h-4 w-4 mr-2" />
            {translations.common.preview}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? translations.common.saving : translations.common.saveQuiz}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">{translations.quiz.general}</TabsTrigger>
          <TabsTrigger value="questions">{translations.quiz.questions}</TabsTrigger>
          <TabsTrigger value="profiles">{translations.quiz.profiles}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <GeneralSettings quiz={quiz} onUpdate={setQuiz} />
        </TabsContent>
        
        <TabsContent value="questions">
          <QuestionsList
            questions={quiz.questions}
            onUpdateQuestion={updateQuestion}
            onRemoveQuestion={removeQuestion}
            onMoveQuestion={moveQuestion}
            onDuplicateQuestion={duplicateQuestion}
            onAddQuestion={addQuestion}
            onAddOption={addOption}
            onUpdateOption={updateOption}
            onRemoveOption={removeOption}
          />
        </TabsContent>
        
        <TabsContent value="profiles">
          <ProfileRanges quiz={quiz} onUpdate={setQuiz} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuizEditor;
