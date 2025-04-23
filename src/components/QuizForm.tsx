
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Quiz, Question, QuizResponse } from '@/types/quiz';

interface QuizFormProps {
  quiz: Quiz;
  onComplete: (responses: QuizResponse[]) => void;
}

const QuizForm: React.FC<QuizFormProps> = ({ quiz, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  
  useEffect(() => {
    // Initial filtering of questions based on conditions
    const filteredQuestions = quiz.questions.filter(question => {
      if (!question.conditions || question.conditions.length === 0) {
        return true;
      }
      
      return question.conditions.every(condition => {
        const response = responses.find(r => r.questionId === condition.questionId);
        if (!response) return false;
        
        switch(condition.operator) {
          case 'equals':
            return response.answer === condition.value;
          case 'not-equals':
            return response.answer !== condition.value;
          case 'greater-than':
            return Number(response.answer) > Number(condition.value);
          case 'less-than':
            return Number(response.answer) < Number(condition.value);
          case 'contains':
            return Array.isArray(response.answer) && 
              response.answer.includes(condition.value.toString());
          default:
            return false;
        }
      });
    });
    
    setActiveQuestions(filteredQuestions);
  }, [quiz.questions, responses]);
  
  const currentQuestion = activeQuestions[currentQuestionIndex];
  const progress = (currentQuestionIndex / (activeQuestions.length - 1)) * 100;
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete(responses);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
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
    if (!currentQuestion) return true;
    if (!currentQuestion.required) return false;
    
    const response = responses.find(r => r.questionId === currentQuestion.id);
    if (!response) return true;
    
    if (Array.isArray(response.answer)) {
      return response.answer.length === 0;
    }
    
    return !response.answer;
  };
  
  if (!currentQuestion) {
    return <div>Loading quiz questions...</div>;
  }
  
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <Progress value={progress} className="h-2" />
        <div className="text-right text-sm text-gray-500 mt-1">
          Question {currentQuestionIndex + 1} of {activeQuestions.length}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
          {currentQuestion.required && (
            <CardDescription>This question is required</CardDescription>
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
              placeholder="Enter your answer here..."
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
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <Button
            onClick={handleNextQuestion}
            disabled={isNextDisabled()}
          >
            {currentQuestionIndex === activeQuestions.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizForm;
