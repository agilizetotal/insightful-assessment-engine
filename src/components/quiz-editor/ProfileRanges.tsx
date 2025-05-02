
import { Quiz, ProfileRange } from '@/types/quiz';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash, Plus } from 'lucide-react';
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
      profile: `Perfil ${quiz.profileRanges.length + 1}`
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
        <CardTitle>Definição de Perfis</CardTitle>
        <CardDescription>Configure os perfis e suas faixas de pontuação</CardDescription>
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
                placeholder="Nome do perfil"
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
        <p>As faixas de pontuação determinam qual perfil será atribuído com base na pontuação final.</p>
      </CardFooter>
    </Card>
  );
};
