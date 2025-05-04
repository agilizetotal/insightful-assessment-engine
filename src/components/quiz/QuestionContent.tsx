
import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Question } from '@/types/quiz';

interface QuestionContentProps {
  question: Question;
  response: string | string[];
  onResponseChange: (answer: string | string[]) => void;
}

const QuestionContent: React.FC<QuestionContentProps> = ({
  question,
  response,
  onResponseChange
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
    console.error("Erro ao carregar imagem da questão");
  };

  return (
    <div className="space-y-4">
      {question.imageUrl && (
        <div className="mb-4 rounded-md overflow-hidden border">
          {!imageError ? (
            <img 
              src={question.imageUrl} 
              alt="Imagem da questão" 
              className="w-full h-auto max-h-80 object-contain"
              onError={handleImageError}
            />
          ) : (
            <div className="bg-gray-100 p-4 text-center text-gray-500">
              Não foi possível carregar a imagem
            </div>
          )}
        </div>
      )}
    
      {question.type === 'multiple-choice' && (
        <RadioGroup
          onValueChange={(value) => onResponseChange(value)}
          value={response as string || ''}
        >
          {question.options?.map(option => (
            <div key={option.id} className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value={option.id} id={option.id} />
              <Label htmlFor={option.id} className="cursor-pointer">
                {option.text || 'Opção sem texto'}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}
      
      {question.type === 'checkbox' && (
        <div className="space-y-2">
          {question.options?.map(option => {
            const currentResponses = response as string[] || [];
            
            return (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={currentResponses.includes(option.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onResponseChange([...currentResponses, option.id]);
                    } else {
                      onResponseChange(currentResponses.filter(id => id !== option.id));
                    }
                  }}
                />
                <Label htmlFor={option.id} className="cursor-pointer">
                  {option.text || 'Opção sem texto'}
                </Label>
              </div>
            );
          })}
        </div>
      )}
      
      {question.type === 'open-ended' && (
        <Textarea
          placeholder="Digite sua resposta aqui..."
          value={response as string || ''}
          onChange={(e) => onResponseChange(e.target.value)}
          className="min-h-[120px]"
        />
      )}
    </div>
  );
};

export default QuestionContent;
