
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Play } from "lucide-react";
import { Quiz } from "@/types/quiz";
import { translations } from "@/locales/pt-BR";
import { GeneralSettings } from "./quiz-editor/GeneralSettings";
import { ProfileRanges } from "./quiz-editor/ProfileRanges";
import { QuestionsList } from "./quiz-editor/QuestionsList";
import { useQuizEditor } from "@/hooks/useQuizEditor";

interface QuizEditorProps {
  initialQuiz: Quiz;
  onSave: (quiz: Quiz) => void;
  onPreview: (quiz: Quiz) => void;
  isNewQuiz?: boolean;
}

const QuizEditor = ({ initialQuiz, onSave, onPreview, isNewQuiz = false }: QuizEditorProps) => {
  const {
    quiz,
    setQuiz,
    isSaving,
    questions,
    addQuestion,
    updateQuestion,
    removeQuestion,
    moveQuestion,
    duplicateQuestion,
    addOption,
    updateOption,
    removeOption,
    addCondition,
    updateCondition,
    removeCondition,
    handleSave,
    handlePreview
  } = useQuizEditor(initialQuiz, onSave, onPreview);
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{translations.quiz.editor}</h1>
        <div className="space-x-2">
          <Button onClick={handlePreview} variant="outline" disabled={isSaving}>
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
            onAddCondition={addCondition}
            onUpdateCondition={updateCondition}
            onRemoveCondition={removeCondition}
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
