import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Trash, 
  MoveUp, 
  MoveDown, 
  CopyPlus, 
  Save, 
  Play
} from "lucide-react";
import { Quiz, Question, Option, ProfileRange, QuestionType } from "@/types/quiz";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface QuizEditorProps {
  initialQuiz?: Quiz;
  onSave: (quiz: Quiz) => void;
  onPreview: (quiz: Quiz) => void;
}

const defaultQuestion: Question = {
  id: '',
  text: '',
  type: 'multiple-choice',
  options: [],
  required: true,
  conditions: []
};

const defaultOption: Option = {
  id: '',
  text: '',
  weight: 0
};

const defaultProfileRange: ProfileRange = {
  min: 0,
  max: 0,
  profile: '',
  description: ''
};

const QuizEditor: React.FC<QuizEditorProps> = ({ initialQuiz, onSave, onPreview }) => {
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
  
  const addProfileRange = () => {
    setQuiz({
      ...quiz,
      profileRanges: [...quiz.profileRanges, {
        ...defaultProfileRange,
        min: quiz.profileRanges.length > 0 
          ? quiz.profileRanges[quiz.profileRanges.length - 1].max + 1 
          : 0,
        max: quiz.profileRanges.length > 0 
          ? quiz.profileRanges[quiz.profileRanges.length - 1].max + 10 
          : 10,
        profile: `Profile ${quiz.profileRanges.length + 1}`
      }]
    });
  };
  
  const updateProfileRange = (index: number, updatedRange: ProfileRange) => {
    const updatedRanges = [...quiz.profileRanges];
    updatedRanges[index] = updatedRange;
    
    setQuiz({
      ...quiz,
      profileRanges: updatedRanges
    });
  };
  
  const removeProfileRange = (index: number) => {
    const updatedRanges = quiz.profileRanges.filter((_, i) => i !== index);
    
    setQuiz({
      ...quiz,
      profileRanges: updatedRanges
    });
  };

  const saveToSupabase = async (quizData: Quiz) => {
    if (!user) {
      toast.error("Você precisa estar logado para salvar um quiz");
      return null;
    }

    setIsSaving(true);
    try {
      const updatedQuizData = {
        ...quizData,
        updatedAt: new Date().toISOString(),
      };

      const { data: quizData, error: quizError } = await supabase
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
        quiz_id: quizData.id,
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
          .eq('quiz_id', quizData.id);

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
        }
      }

      if (updatedQuizData.profileRanges.length > 0) {
        await supabase
          .from('profile_ranges')
          .delete()
          .eq('quiz_id', quizData.id);

        const rangesToInsert = updatedQuizData.profileRanges.map(range => ({
          id: crypto.randomUUID(),
          quiz_id: quizData.id,
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

      toast.success("Quiz salvo com sucesso!");
      return updatedQuizData;
    } catch (error) {
      console.error("Erro ao salvar quiz:", error);
      toast.error("Erro ao salvar quiz. Tente novamente.");
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
  
  const handlePreview = () => {
    onPreview(quiz);
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Editor de Quiz</h1>
        <div className="space-x-2">
          <Button onClick={handlePreview} variant="outline" disabled={isSaving}>
            <Play className="h-4 w-4 mr-2" />
            Visualizar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Quiz"}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="questions">Perguntas</TabsTrigger>
          <TabsTrigger value="profiles">Definições de Perfil</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Quiz</CardTitle>
              <CardDescription>Configure as configurações básicas para o seu quiz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Quiz</Label>
                <Input 
                  id="title" 
                  value={quiz.title} 
                  onChange={(e) => setQuiz({...quiz, title: e.target.value})}
                  placeholder="Digite um título descritivo para o seu quiz"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  value={quiz.description} 
                  onChange={(e) => setQuiz({...quiz, description: e.target.value})}
                  placeholder="Forneça instruções ou contexto para os participantes do quiz"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="questions">
          <div className="space-y-4">
            {quiz.questions.map((question, questionIndex) => (
              <Card key={question.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-lg">Pergunta {questionIndex + 1}</CardTitle>
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => moveQuestion(questionIndex, 'up')}
                        disabled={questionIndex === 0}
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => moveQuestion(questionIndex, 'down')}
                        disabled={questionIndex === quiz.questions.length - 1}
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => duplicateQuestion(questionIndex)}
                      >
                        <CopyPlus className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeQuestion(questionIndex)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-2">
                    <Label htmlFor={`question-${questionIndex}`}>Texto da pergunta</Label>
                    <Textarea 
                      id={`question-${questionIndex}`} 
                      value={question.text} 
                      onChange={(e) => updateQuestion(questionIndex, {
                        ...question, 
                        text: e.target.value
                      })}
                      placeholder="Digite sua pergunta aqui"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`question-type-${questionIndex}`}>Tipo de Pergunta</Label>
                      <Select 
                        value={question.type} 
                        onValueChange={(value: QuestionType) => updateQuestion(questionIndex, {
                          ...question, 
                          type: value
                        })}
                      >
                        <SelectTrigger id={`question-type-${questionIndex}`}>
                          <SelectValue placeholder="Selecione o tipo de pergunta" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple-choice">Múltipla Escolha</SelectItem>
                          <SelectItem value="checkbox">Caixas de Seleção</SelectItem>
                          <SelectItem value="open-ended">Resposta Aberta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-8">
                      <Switch 
                        id={`required-${questionIndex}`} 
                        checked={question.required}
                        onCheckedChange={(checked) => updateQuestion(questionIndex, {
                          ...question, 
                          required: checked
                        })}
                      />
                      <Label htmlFor={`required-${questionIndex}`}>Pergunta Obrigatória</Label>
                    </div>
                  </div>
                  
                  {question.type !== 'open-ended' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Opções</Label>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => addOption(questionIndex)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar Opção
                        </Button>
                      </div>
                      
                      {question.options?.map((option, optionIndex) => (
                        <div key={option.id} className="flex space-x-2">
                          <div className="flex-grow">
                            <Input 
                              value={option.text} 
                              onChange={(e) => updateOption(questionIndex, optionIndex, {
                                ...option, 
                                text: e.target.value
                              })}
                              placeholder={`Opção ${optionIndex + 1}`}
                            />
                          </div>
                          <div className="w-24">
                            <Input 
                              type="number" 
                              value={option.weight} 
                              onChange={(e) => updateOption(questionIndex, optionIndex, {
                                ...option, 
                                weight: parseInt(e.target.value) || 0
                              })}
                              placeholder="Peso"
                            />
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeOption(questionIndex, optionIndex)}
                            disabled={question.options?.length === 1}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="conditions">
                      <AccordionTrigger>Lógica Condicional</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <div className="text-sm text-gray-500">
                            Defina quando esta pergunta deve aparecer com base nas respostas anteriores.
                            Se nenhuma condição for definida, a pergunta sempre aparecerá.
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-md">
                            <div className="text-center text-sm text-gray-500">
                              A edição avançada de condições estará disponível em uma atualização futura.
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ))}
            
            <Button onClick={addQuestion} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Pergunta
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="profiles">
          <Card>
            <CardHeader>
              <CardTitle>Definições de Perfil</CardTitle>
              <CardDescription>
                Defina faixas de pontuação e perfis correspondentes para os resultados do quiz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quiz.profileRanges.map((range, index) => (
                <div key={index} className="p-4 border rounded-md space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Perfil {index + 1}</h3>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeProfileRange(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`min-${index}`}>Pontuação Mínima</Label>
                      <Input 
                        id={`min-${index}`} 
                        type="number" 
                        value={range.min} 
                        onChange={(e) => updateProfileRange(index, {
                          ...range, 
                          min: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`max-${index}`}>Pontuação Máxima</Label>
                      <Input 
                        id={`max-${index}`} 
                        type="number" 
                        value={range.max} 
                        onChange={(e) => updateProfileRange(index, {
                          ...range, 
                          max: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`profile-${index}`}>Nome do Perfil</Label>
                    <Input 
                      id={`profile-${index}`} 
                      value={range.profile} 
                      onChange={(e) => updateProfileRange(index, {
                        ...range, 
                        profile: e.target.value
                      })}
                      placeholder="ex., Tipo de Liderança A"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`description-${index}`}>Descrição do Perfil</Label>
                    <Textarea 
                      id={`description-${index}`} 
                      value={range.description} 
                      onChange={(e) => updateProfileRange(index, {
                        ...range, 
                        description: e.target.value
                      })}
                      placeholder="Descreva as características deste perfil"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
              
              <Button onClick={addProfileRange} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Faixa de Perfil
              </Button>
            </CardContent>
            <CardFooter className="bg-gray-50 text-sm text-gray-500">
              <p>
                O sistema calculará uma pontuação total com base nos pesos atribuídos a cada opção selecionada.
                Em seguida, ele fará a correspondência da pontuação com a faixa de perfil apropriada definida aqui.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuizEditor;
