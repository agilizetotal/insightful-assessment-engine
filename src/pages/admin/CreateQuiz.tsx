
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizEditor from '@/components/QuizEditor';
import QuizForm from '@/components/QuizForm';
import ResultsSummary from '@/components/ResultsSummary';
import { Quiz, QuizResponse, QuizResult } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CreateQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [previewMode, setPreviewMode] = useState<'edit' | 'take' | 'results'>('edit');
  const [quiz, setQuiz] = useState<Quiz>({
    id: crypto.randomUUID(),
    title: 'Leadership Assessment',
    description: 'Evaluate your leadership style and identify areas for growth.',
    questions: [
      {
        id: crypto.randomUUID(),
        text: 'How do you typically approach decision making?',
        type: 'multiple-choice',
        required: true,
        options: [
          { id: crypto.randomUUID(), text: 'I make decisions quickly based on intuition', weight: 5 },
          { id: crypto.randomUUID(), text: 'I gather all available data before deciding', weight: 3 },
          { id: crypto.randomUUID(), text: 'I consult with team members to build consensus', weight: 4 },
          { id: crypto.randomUUID(), text: 'I defer to experts or authorities', weight: 1 }
        ]
      },
      {
        id: crypto.randomUUID(),
        text: 'Which leadership qualities do you value most?',
        type: 'checkbox',
        required: true,
        options: [
          { id: crypto.randomUUID(), text: 'Strategic thinking', weight: 4 },
          { id: crypto.randomUUID(), text: 'Empathy and emotional intelligence', weight: 5 },
          { id: crypto.randomUUID(), text: 'Technical expertise', weight: 3 },
          { id: crypto.randomUUID(), text: 'Communication skills', weight: 4 }
        ]
      },
      {
        id: crypto.randomUUID(),
        text: 'Describe a situation where you had to lead through a crisis or significant change.',
        type: 'open-ended',
        required: false
      }
    ],
    profileRanges: [
      {
        min: 0,
        max: 5,
        profile: 'Emergent Leader',
        description: 'You are in the early stages of your leadership journey. Focus on building core leadership skills and seeking mentorship opportunities.'
      },
      {
        min: 6,
        max: 10,
        profile: 'Tactical Leader',
        description: 'You excel at implementing plans and managing day-to-day operations. Consider developing more strategic thinking skills.'
      },
      {
        min: 11,
        max: 15,
        profile: 'Strategic Leader',
        description: 'You demonstrate strong strategic thinking and vision. You may benefit from enhancing your emotional intelligence and people management skills.'
      },
      {
        min: 16,
        max: 99,
        profile: 'Transformational Leader',
        description: 'You inspire and motivate others through a compelling vision. You balance strategic thinking with emotional intelligence and adapt your approach as needed.'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  
  const handleSaveQuiz = (savedQuiz: Quiz) => {
    setQuiz(savedQuiz);
    // In a real application, you would save this to your database
    alert('Quiz saved successfully!');
  };
  
  const handlePreviewQuiz = (previewQuiz: Quiz) => {
    setQuiz(previewQuiz);
    setPreviewMode('take');
  };
  
  const handleCompleteQuiz = (quizResponses: QuizResponse[]) => {
    setResponses(quizResponses);
    
    // Calculate score based on responses
    let totalScore = 0;
    
    quizResponses.forEach(response => {
      const question = quiz.questions.find(q => q.id === response.questionId);
      if (!question || question.type === 'open-ended') return;
      
      if (question.type === 'multiple-choice') {
        const selectedOption = question.options?.find(opt => opt.id === response.answer);
        if (selectedOption) {
          totalScore += selectedOption.weight;
        }
      } else if (question.type === 'checkbox') {
        const selectedOptionIds = response.answer as string[];
        const selectedOptions = question.options?.filter(opt => selectedOptionIds.includes(opt.id));
        if (selectedOptions) {
          selectedOptions.forEach(opt => {
            totalScore += opt.weight;
          });
        }
      }
    });
    
    // Determine profile based on score
    const profileRange = quiz.profileRanges.find(range => 
      totalScore >= range.min && totalScore <= range.max
    );
    
    // Create result object
    const result: QuizResult = {
      quizId: quiz.id,
      responses: quizResponses,
      score: totalScore,
      profile: profileRange?.profile || 'Unknown',
      completedAt: new Date().toISOString(),
      isPremium: false
    };
    
    setQuizResult(result);
    setPreviewMode('results');
  };
  
  const handleBackToEdit = () => {
    setPreviewMode('edit');
    setResponses([]);
    setQuizResult(null);
  };
  
  return (
    <div className="container mx-auto p-4">
      {previewMode !== 'edit' && (
        <Button 
          variant="outline" 
          onClick={handleBackToEdit} 
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Editor
        </Button>
      )}
      
      {previewMode === 'edit' && (
        <QuizEditor 
          initialQuiz={quiz} 
          onSave={handleSaveQuiz} 
          onPreview={handlePreviewQuiz} 
        />
      )}
      
      {previewMode === 'take' && (
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
            <p className="text-gray-600">{quiz.description}</p>
          </div>
          <QuizForm quiz={quiz} onComplete={handleCompleteQuiz} />
        </div>
      )}
      
      {previewMode === 'results' && quizResult && (
        <ResultsSummary 
          quiz={quiz} 
          result={quizResult} 
          onSendEmail={() => alert('Email sending feature would be implemented here')} 
          onUpgrade={() => {
            // Simulate upgrading to premium
            setQuizResult({
              ...quizResult,
              isPremium: true
            });
            alert('In a real app, this would show the payment flow');
          }} 
        />
      )}
    </div>
  );
};

export default CreateQuiz;
