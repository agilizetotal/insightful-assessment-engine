
import { useState, useEffect } from 'react';
import { Quiz, Question, QuizResponse, UserData, DisplayQuestionGroup, Condition } from '@/types/quiz';
import UserDataForm from './quiz/UserDataForm';
import QuestionCard from './quiz/QuestionCard';
import QuestionHeader from './quiz/QuestionHeader';
import NoQuestionsDisplay from './quiz/NoQuestionsDisplay';

interface QuizFormProps {
  quiz: Quiz;
  onComplete: (responses: QuizResponse[], userData: UserData) => void;
}

const QuizForm: React.FC<QuizFormProps> = ({ quiz, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1); // -1 represents user data form
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [questionGroups, setQuestionGroups] = useState<DisplayQuestionGroup[]>([]);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: ''
  });

  // Safety check for quiz
  if (!quiz || !quiz.questions) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center">
        <div>
          <h2 className="text-xl font-semibold">Erro ao carregar o questionário</h2>
          <p className="text-gray-500 mt-2">Não foi possível carregar o questionário. Por favor, tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

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
  
  // Function to evaluate conditions based on logical operators
  const evaluateConditionsWithLogic = (question: Question): boolean => {
    if (!question.conditions || question.conditions.length === 0) {
      return true;
    }
    
    // Group conditions by logical operator
    const conditionGroups: Array<Condition[]> = [];
    let currentGroup: Condition[] = [];
    
    question.conditions.forEach((condition, index) => {
      if (index === 0) {
        currentGroup.push(condition);
      } else if (condition.logical_operator === 'OR') {
        conditionGroups.push([...currentGroup]);
        currentGroup = [condition];
      } else {
        currentGroup.push(condition);
      }
    });
    
    // Add the last group
    if (currentGroup.length > 0) {
      conditionGroups.push(currentGroup);
    }
    
    // Check if any group's conditions are all met (OR between groups)
    return conditionGroups.some(group => 
      // All conditions in a group must be met (AND within group)
      group.every(condition => evaluateCondition(condition))
    );
  };
  
  useEffect(() => {
    // Only run this when we've moved past the user data form
    if (currentQuestionIndex >= 0) {
      // Filter questions based on conditional logic
      const filteredQuestions = (quiz?.questions || []).filter(evaluateConditionsWithLogic);
      setActiveQuestions(filteredQuestions);
      
      // Organize questions into groups based on question groups defined in the quiz
      const displayGroups: DisplayQuestionGroup[] = [];
      
      // First, create a map of group IDs to their details
      const groupMap = new Map();
      (quiz?.questionGroups || []).forEach(group => {
        groupMap.set(group.id, {
          title: group.title,
          description: group.description,
          weight: group.weight
        });
      });
      
      // Create a group for questions without a group
      const ungroupedQuestions = filteredQuestions.filter(q => !q.groupId);
      if (ungroupedQuestions.length > 0) {
        displayGroups.push({
          title: "Perguntas Gerais",
          questions: ungroupedQuestions
        });
      }
      
      // Group questions by their groupId
      const groupedQuestions = new Map<string, Question[]>();
      
      filteredQuestions.filter(q => q.groupId).forEach(question => {
        if (!groupedQuestions.has(question.groupId!)) {
          groupedQuestions.set(question.groupId!, []);
        }
        groupedQuestions.get(question.groupId!)?.push(question);
      });
      
      // Add groups with their questions to displayGroups
      groupedQuestions.forEach((questions, groupId) => {
        const groupDetails = groupMap.get(groupId);
        if (groupDetails && questions.length > 0) {
          displayGroups.push({
            title: groupDetails.title,
            description: groupDetails.description,
            weight: groupDetails.weight,
            questions
          });
        }
      });
      
      setQuestionGroups(displayGroups);
    }
  }, [quiz?.questions, quiz?.questionGroups, responses, currentQuestionIndex]);
  
  const currentQuestion = currentQuestionIndex >= 0 && activeQuestions.length > 0 ? 
    activeQuestions[currentQuestionIndex < activeQuestions.length ? currentQuestionIndex : 0] : null;
    
  const progress = 
    currentQuestionIndex < 0 ? 0 :
    activeQuestions.length === 0 ? 100 :
    (currentQuestionIndex / Math.max(1, activeQuestions.length - 1)) * 100;
  
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

  // Find which group the current question belongs to
  const currentGroupIndex = currentQuestion ? questionGroups.findIndex(group =>
    group.questions.some(q => q.id === currentQuestion.id)
  ) : -1;
  
  // Find the group details
  const currentGroup = currentGroupIndex > -1 ? questionGroups[currentGroupIndex] : null;
  
  // User data form
  if (currentQuestionIndex < 0) {
    return (
      <UserDataForm 
        userData={userData} 
        onUserDataChange={setUserData}
        onStartQuiz={handleStartQuiz}
      />
    );
  }
  
  if (!currentQuestion) {
    return (
      <NoQuestionsDisplay
        activeQuestionsCount={activeQuestions.length}
        onComplete={onComplete}
        responses={responses}
        userData={userData}
      />
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto py-8">
      <QuestionHeader
        progress={progress}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={activeQuestions.length}
        currentGroup={currentGroup}
      />
      
      <QuestionCard
        question={currentQuestion}
        response={responses.find(r => r.questionId === currentQuestion.id)?.answer || (currentQuestion.type === 'checkbox' ? [] : '')}
        onResponseChange={handleResponseChange}
        onPreviousClick={handlePreviousQuestion}
        onNextClick={handleNextQuestion}
        isNextDisabled={isNextDisabled()}
        isLastQuestion={currentQuestionIndex === activeQuestions.length - 1}
      />
    </div>
  );
};

export default QuizForm;
