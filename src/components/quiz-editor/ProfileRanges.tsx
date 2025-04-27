import { Quiz, ProfileRange } from '@/types/quiz';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash, Plus } from 'lucide-react';
import { translations } from '@/locales/pt-BR';
import { defaultProfileRange } from './defaults';

interface ProfileRangesProps {
  quiz: Quiz;
  onUpdate: (updatedQuiz: Quiz) => void;
}

export const ProfileRanges = ({ quiz, onUpdate }: ProfileRangesProps) => {
  const addProfileRange = () => {
    const updatedRanges = [...quiz.profileRanges, {
      ...defaultProfileRange,
      min: quiz.profileRanges.length > 0 
        ? quiz.profileRanges[quiz.profileRanges.length - 1].max + 1 
        : 0,
      max: quiz.profileRanges.length > 0 
        ? quiz.profileRanges[quiz.profileRanges.length - 1].max + 10 
        : 10,
      profile: `Profile ${quiz.profileRanges.length + 1}`
    }];
    
    onUpdate({
      ...quiz,
      profileRanges: updatedRanges
    });
  };

  const updateProfileRange = (index: number, updatedRange: ProfileRange) => {
    const updatedRanges = [...quiz.profileRanges];
    updatedRanges[index] = updatedRange;
    
    onUpdate({
      ...quiz,
      profileRanges: updatedRanges
    });
  };

  const removeProfileRange = (index: number) => {
    const updatedRanges = quiz.profileRanges.filter((_, i) => i !== index);
    
    onUpdate({
      ...quiz,
      profileRanges: updatedRanges
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{translations.quiz.profileDefinitions}</CardTitle>
        <CardDescription>{translations.quiz.profileDefinitionsDescription}</CardDescription>
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
        <p>{translations.quiz.profileRangeExplanation}</p>
      </CardFooter>
    </Card>
  );
};
