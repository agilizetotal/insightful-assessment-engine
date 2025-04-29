
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Quiz, Question, QuizResponse, UserData, Condition } from '@/types/quiz';
import { translations } from '@/locales/pt-BR';

interface QuizFormProps {
  quiz: Quiz;
  onComplete: (responses: QuizResponse[], userData: UserData) => void;
}

const QuizForm: React.FC<QuizFormProps> = ({ quiz, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1); // -1 represents user data form
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: ''
  });
  
  // Function to evaluate if a condition is met
  const evaluateCondition = (condition: Condition): boolean => {
    const response = responses.find(r => r.questionId === condition.questionId);
    if (!response) return false;
    
    switch(condition.operator) {
      case 'equals':
        if (Array.isArray(response.answer)) {
          return response.answer.includes(condition.value);
        }
        return response.answer === condition.value;
      
      case 'not-equals':
        if (Array.isArray(response.answer)) {
          return !response.answer.includes(condition.value);
        }
        return response.answer !== condition.value;
      
      case 'greater-than':
        const numResponse = Number(response.answer);
        const numValue = Number(condition.value);
        return !isNaN(numResponse) && !isNaN(numValue) && numResponse > numValue;
      
      case 'less-than':
        const numResp = Number(response.answer);
        const numVal = Number(condition.value);
        return !isNaN(numResp) && !isNaN(numVal) && numResp < numVal;
      
      case 'contains':
        if (Array.isArray(response.answer)) {
          return response.answer.includes(condition.value);
        }
        return String(response.answer).includes(condition.value);
      
      default:
        return false;
    }
  };
  
  // Function to evaluate if a question should be shown based on its conditions
  const shouldShowQuestion = (question: Question): boolean => {
    if (!question.conditions || question.conditions.length === 0) {
      return true;
    }
    
    // Group conditions by logical operator
    let andConditions: boolean[] = [];
    let orConditions: boolean[] = [];
    
    question.conditions.forEach((condition, index) => {
      const conditionMet = evaluateCondition(condition);
      
      if (index === 0 || condition.logical_operator === 'AND') {
        andConditions.push(conditionMet);
      } else if (condition.logical_operator === 'OR') {
        orConditions.push(conditionMet);
      }
    });
    
    // All AND conditions must be met
    const andResult = andConditions.length === 0 || andConditions.every(c => c);
    
    // At least one OR condition must be met (if any)
    const orResult = orConditions.length === 0 || orConditions.some(c => c);
    
    return andResult && orResult;
  };
  
  useEffect(() => {
    // Only run this when we've moved past the user data form
    if (currentQuestionIndex >= 0) {
      // Filter questions based on conditional logic
      const filteredQuestions = quiz.questions.filter(shouldShowQuestion);
      setActiveQuestions(filteredQuestions);
    }
  }, [quiz.questions, responses, currentQuestionIndex]);
  
  const currentQuestion = currentQuestionIndex >= 0 && activeQuestions.length > 0 ? 
    activeQuestions[currentQuestionIndex] : null;
    
  const progress = 
    currentQuestionIndex < 0 ? 0 :
    activeQuestions.length === 0 ? 100 :
    (currentQuestionIndex / (activeQuestions.length - 1)) * 100;
  
  const handleStartQuiz = () => {
    if (!userData.name || !userData.email) {
      return;
    }
    
    setCurrentQuestionIndex(0);
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete(responses, userData);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentQuestionIndex === 0) {
      setCurrentQuestionIndex(-1); // Go back to user data form
    }
  };
  
  const handleResponseChange = (questionId: string, answer: string | string[]) => {
    const newResponses = [...responses];
    const existingIndex = newResponses.findIndex(r => r.questionId === questionId);
    
    if (existingIndex >= 0) {
      newResponses[existingIndex] = { questionId, answer };
    } else {
      newResponses.push({ questionId, answer });
    }
    
    setResponses(newResponses);
  };
  
  const isNextDisabled = () => {
    if (currentQuestionIndex < 0) {
      return !userData.name || !userData.email;
    }
    
    if (!currentQuestion) return true;
    if (!currentQuestion.required) return false;
    
    const response = responses.find(r => r.questionId === currentQuestion.id);
    if (!response) return true;
    
    if (Array.isArray(response.answer)) {
      return response.answer.length === 0;
    }
    
    return !response.answer;
  };
  
  // User data form
  if (currentQuestionIndex < 0) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Seus dados</CardTitle>
            <CardDescription>Preencha seus dados para iniciar o questionário</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input
                id="name"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                placeholder="Digite seu nome completo"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                placeholder="Digite seu e-mail"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                placeholder="Digite seu telefone"
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={handleStartQuiz}
              disabled={!userData.name || !userData.email}
              className="w-full"
            >
              Iniciar questionário
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center">
        {activeQuestions.length === 0 ? (
          <div>
            <h2 className="text-xl font-semibold mb-2">Nenhuma questão disponível</h2>
            <p className="text-gray-500 mb-4">Não existem questões que atendam aos critérios atuais</p>
            <Button onClick={() => onComplete(responses, userData)}>
              Finalizar mesmo assim
            </Button>
          </div>
        ) : (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-20 bg-gray-200 rounded w-full mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <Progress value={progress} className="h-2" />
        <div className="text-right text-sm text-gray-500 mt-1">
          Questão {currentQuestionIndex + 1} de {activeQuestions.length}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
          {currentQuestion.required && (
            <CardDescription>Esta questão é obrigatória</CardDescription>
          )}
        </CardHeader>
        
        <CardContent>
          {currentQuestion.type === 'multiple-choice' && (
            <RadioGroup
              onValueChange={(value) => 
                handleResponseChange(currentQuestion.id, value)
              }
              value={
                responses.find(r => r.questionId === currentQuestion.id)?.answer as string || ''
              }
            >
              {currentQuestion.options?.map(option => (
                <div key={option.id} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
          
          {currentQuestion.type === 'checkbox' && (
            <div className="space-y-2">
              {currentQuestion.options?.map(option => {
                const currentResponses = responses.find(
                  r => r.questionId === currentQuestion.id
                )?.answer as string[] || [];
                
                return (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={currentResponses.includes(option.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleResponseChange(
                            currentQuestion.id, 
                            [...currentResponses, option.id]
                          );
                        } else {
                          handleResponseChange(
                            currentQuestion.id,
                            currentResponses.filter(id => id !== option.id)
                          );
                        }
                      }}
                    />
                    <Label htmlFor={option.id} className="cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                );
              })}
            </div>
          )}
          
          {currentQuestion.type === 'open-ended' && (
            <Textarea
              placeholder="Digite sua resposta aqui..."
              value={
                responses.find(r => r.questionId === currentQuestion.id)?.answer as string || ''
              }
              onChange={(e) => 
                handleResponseChange(currentQuestion.id, e.target.value)
              }
              className="min-h-[120px]"
            />
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
          >
            {translations.common.previous}
          </Button>
          <Button
            onClick={handleNextQuestion}
            disabled={isNextDisabled()}
          >
            {currentQuestionIndex === activeQuestions.length - 1 ? translations.common.complete : translations.common.next}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizForm;
