
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Save, Play } from "lucide-react";
import { Quiz } from "@/types/quiz";
import { useAuth } from "@/contexts/AuthContext";
import { translations } from "@/locales/pt-BR";
import { GeneralSettings } from "./quiz-editor/GeneralSettings";
import { ProfileRanges } from "./quiz-editor/ProfileRanges";
import { QuestionsList } from "./quiz-editor/QuestionsList";
import { useQuestions } from "@/hooks/useQuestions";
import { useQuizSave } from "@/hooks/useQuizSave";

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
  
  const { user } = useAuth();
  const { isSaving, saveToSupabase } = useQuizSave();
  
  const {
    questions,
    addQuestion,
    updateQuestion,
    removeQuestion,
    moveQuestion,
    duplicateQuestion,
    addOption,
    updateOption,
    removeOption
  } = useQuestions(quiz, setQuiz);
  
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
            questions={questions}
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
