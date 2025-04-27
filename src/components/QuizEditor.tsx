
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
import { Quiz, Question, Option, ProfileRange, QuestionType, Condition } from "@/types/quiz";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { translations } from "@/locales/pt-BR";

interface QuizEditorProps {
  initialQuiz?: Quiz;
  onSave: (quiz: Quiz) => void;
  onPreview: (quiz: Quiz) => void;
  isNewQuiz?: boolean;
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

const defaultCondition: Condition = {
  questionId: '',
  operator: 'equals',
  value: '',
  logicalOperator: 'AND'
};

const defaultProfileRange: ProfileRange = {
  min: 0,
  max: 0,
  profile: '',
  description: ''
};

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
  
  const addCondition = (questionIndex: number) => {
    const question = quiz.questions[questionIndex];
    const previousQuestions = quiz.questions.slice(0, questionIndex);
    
    if (previousQuestions.length === 0) {
      toast.error(translations.quiz.noConditionsAvailable);
      return;
    }
    
    const newCondition: Condition = {
      ...defaultCondition,
      questionId: previousQuestions[0].id,
      value: previousQuestions[0].type === 'multiple-choice' && previousQuestions[0].options 
        ? previousQuestions[0].options[0].id 
        : ''
    };
    
    const updatedConditions = [...(question.conditions || []), newCondition];
    
    updateQuestion(questionIndex, {
      ...question,
      conditions: updatedConditions
    });
  };
  
  const updateCondition = (questionIndex: number, conditionIndex: number, updatedCondition: Condition) => {
    const question = quiz.questions[questionIndex];
    const updatedConditions = [...(question.conditions || [])];
    updatedConditions[conditionIndex] = updatedCondition;
    
    updateQuestion(questionIndex, {
      ...question,
      conditions: updatedConditions
    });
  };
  
  const removeCondition = (questionIndex: number, conditionIndex: number) => {
    const question = quiz.questions[questionIndex];
    const updatedConditions = (question.conditions || []).filter((_, i) => i !== conditionIndex);
    
    updateQuestion(questionIndex, {
      ...question,
      conditions: updatedConditions
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
          
          // Save conditions for questions
          if (question.conditions && question.conditions.length > 0) {
            await supabase
              .from('question_conditions')
              .delete()
              .eq('dependent_question_id', question.id);
              
            const conditionsToInsert = question.conditions.map((condition, index) => ({
              id: crypto.randomUUID(),
              question_id: condition.questionId,
              dependent_question_id: question.id,
              operator: condition.operator,
              value: condition.value,
              logical_operator: condition.logicalOperator || 'AND'
            }));
            
            const { error: conditionsError } = await supabase
              .from('question_conditions')
              .insert(conditionsToInsert);
              
            if (conditionsError) {
              throw conditionsError;
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
  
  const handlePreview = () => {
    onPreview(quiz);
  };
  
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
          <Card>
            <CardHeader>
              <CardTitle>{translations.quiz.settings}</CardTitle>
              <CardDescription>{translations.quiz.settingsDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{translations.quiz.titleLabel}</Label>
                <Input 
                  id="title" 
                  value={quiz.title} 
                  onChange={(e) => setQuiz({...quiz, title: e.target.value})}
                  placeholder={translations.quiz.titlePlaceholder}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">{translations.quiz.descriptionLabel}</Label>
                <Textarea 
                  id="description" 
                  value={quiz.description} 
                  onChange={(e) => setQuiz({...quiz, description: e.target.value})}
                  placeholder={translations.quiz.descriptionPlaceholder}
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
                    <CardTitle className="text-lg">{translations.quiz.question} {questionIndex + 1}</CardTitle>
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
                    <Label htmlFor={`question-${questionIndex}`}>{translations.quiz.questionText}</Label>
                    <Textarea 
                      id={`question-${questionIndex}`} 
                      value={question.text} 
                      onChange={(e) => updateQuestion(questionIndex, {
                        ...question, 
                        text: e.target.value
                      })}
                      placeholder={translations.quiz.questionPlaceholder}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`question-type-${questionIndex}`}>{translations.quiz.questionType}</Label>
                      <Select 
                        value={question.type} 
                        onValueChange={(value: QuestionType) => updateQuestion(questionIndex, {
                          ...question, 
                          type: value
                        })}
                      >
                        <SelectTrigger id={`question-type-${questionIndex}`}>
                          <SelectValue placeholder={translations.quiz.selectQuestionType} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple-choice">{translations.quiz.multipleChoice}</SelectItem>
                          <SelectItem value="checkbox">{translations.quiz.checkboxes}</SelectItem>
                          <SelectItem value="open-ended">{translations.quiz.openEnded}</SelectItem>
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
                      <Label htmlFor={`required-${questionIndex}`}>{translations.quiz.requiredQuestion}</Label>
                    </div>
                  </div>
                  
                  {question.type !== 'open-ended' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>{translations.quiz.options}</Label>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => addOption(questionIndex)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {translations.quiz.addOption}
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
                              placeholder={`${translations.quiz.option} ${optionIndex + 1}`}
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
                              placeholder={translations.quiz.weight}
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
                      <AccordionTrigger>{translations.quiz.conditionalLogic}</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <div className="text-sm text-gray-500">
                            {translations.quiz.conditionalDescription}
                          </div>
                          
                          {questionIndex > 0 && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => addCondition(questionIndex)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              {translations.quiz.addCondition}
                            </Button>
                          )}
                          
                          {question.conditions && question.conditions.length > 0 ? (
                            <div className="space-y-4">
                              {question.conditions.map((condition, conditionIndex) => {
                                const dependentQuestion = quiz.questions.find(q => q.id === condition.questionId);
                                
                                return (
                                  <div key={conditionIndex} className="space-y-2 border p-3 rounded-md">
                                    <div className="flex justify-between items-center">
                                      <Label>{translations.quiz.condition} {conditionIndex + 1}</Label>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => removeCondition(questionIndex, conditionIndex)}
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    
                                    {conditionIndex > 0 && (
                                      <div className="mb-2">
                                        <Select
                                          value={condition.logicalOperator || 'AND'}
                                          onValueChange={(value) => updateCondition(questionIndex, conditionIndex, {
                                            ...condition,
                                            logicalOperator: value as 'AND' | 'OR'
                                          })}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder={translations.quiz.selectOperator} />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="AND">{translations.quiz.and}</SelectItem>
                                            <SelectItem value="OR">{translations.quiz.or}</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    )}
                                    
                                    <div className="grid grid-cols-3 gap-2">
                                      <div>
                                        <Select 
                                          value={condition.questionId}
                                          onValueChange={(value) => updateCondition(questionIndex, conditionIndex, {
                                            ...condition,
                                            questionId: value,
                                            value: ''
                                          })}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder={translations.quiz.selectQuestion} />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {quiz.questions.slice(0, questionIndex).map((q, i) => (
                                              <SelectItem key={q.id} value={q.id}>
                                                {translations.quiz.question} {i + 1}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      
                                      <div>
                                        <Select 
                                          value={condition.operator}
                                          onValueChange={(value: any) => updateCondition(questionIndex, conditionIndex, {
                                            ...condition,
                                            operator: value
                                          })}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder={translations.quiz.selectOperator} />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="equals">{translations.quiz.equals}</SelectItem>
                                            <SelectItem value="not-equals">{translations.quiz.notEquals}</SelectItem>
                                            <SelectItem value="contains">{translations.quiz.contains}</SelectItem>
                                            <SelectItem value="greater-than">{translations.quiz.greaterThan}</SelectItem>
                                            <SelectItem value="less-than">{translations.quiz.lessThan}</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      
                                      <div>
                                        {dependentQuestion?.type === 'multiple-choice' ? (
                                          <Select 
                                            value={condition.value}
                                            onValueChange={(value) => updateCondition(questionIndex, conditionIndex, {
                                              ...condition,
                                              value: value
                                            })}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder={translations.quiz.selectValue} />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {dependentQuestion.options?.map(option => (
                                                <SelectItem key={option.id} value={option.id}>
                                                  {option.text}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        ) : dependentQuestion?.type === 'checkbox' ? (
                                          <Select 
                                            value={condition.value}
                                            onValueChange={(value) => updateCondition(questionIndex, conditionIndex, {
                                              ...condition,
                                              value: value
                                            })}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder={translations.quiz.selectValue} />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {dependentQuestion.options?.map(option => (
                                                <SelectItem key={option.id} value={option.id}>
                                                  {option.text}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        ) : (
                                          <Input 
                                            value={condition.value}
                                            onChange={(e) => updateCondition(questionIndex, conditionIndex, {
                                              ...condition,
                                              value: e.target.value
                                            })}
                                            placeholder={translations.quiz.enterValue}
                                          />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="bg-gray-50 p-3 rounded-md">
                              <div className="text-center text-sm text-gray-500">
                                {translations.quiz.noConditions}
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ))}
            
            <Button onClick={addQuestion} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              {translations.quiz.addQuestion}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="profiles">
          <Card>
            <CardHeader>
              <CardTitle>{translations.quiz.profileDefinitions}</CardTitle>
              <CardDescription>
                {translations.quiz.profileDefinitionsDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quiz.profileRanges.map((range, index) => (
                <div key={index} className="p-4 border rounded-md space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{translations.quiz.profile} {index + 1}</h3>
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
                      <Label htmlFor={`min-${index}`}>{translations.quiz.minScore}</Label>
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
                      <Label htmlFor={`max-${index}`}>{translations.quiz.maxScore}</Label>
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
                    <Label htmlFor={`profile-${index}`}>{translations.quiz.profileName}</Label>
                    <Input 
                      id={`profile-${index}`} 
                      value={range.profile} 
                      onChange={(e) => updateProfileRange(index, {
                        ...range, 
                        profile: e.target.value
                      })}
                      placeholder={translations.quiz.profileNamePlaceholder}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`description-${index}`}>{translations.quiz.profileDescription}</Label>
                    <Textarea 
                      id={`description-${index}`} 
                      value={range.description} 
                      onChange={(e) => updateProfileRange(index, {
                        ...range, 
                        description: e.target.value
                      })}
                      placeholder={translations.quiz.profileDescriptionPlaceholder}
                      rows={3}
                    />
                  </div>
                </div>
              ))}
              
              <Button onClick={addProfileRange} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {translations.quiz.addProfileRange}
              </Button>
            </CardContent>
            <CardFooter className="bg-gray-50 text-sm text-gray-500">
              <p>
                {translations.quiz.profileRangeExplanation}
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuizEditor;
