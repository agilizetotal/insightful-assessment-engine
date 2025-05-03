
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const CreateQuiz = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!title) {
      toast.error('Por favor, insira um título para o questionário.');
      return;
    }
    
    if (!user) {
      toast.error('Você precisa estar logado para criar um questionário.');
      navigate('/auth');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create a new quiz
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title,
          description,
          user_id: user.id,
        })
        .select('id')
        .single();
      
      if (quizError) {
        throw quizError;
      }
      
      // Create a default profile range
      const { error: rangeError } = await supabase
        .from('profile_ranges')
        .insert({
          quiz_id: quizData.id,
          min_score: 0,
          max_score: 100,
          profile: 'Perfil Padrão',
          description: 'Este é o perfil padrão para este questionário.',
        });
      
      if (rangeError) {
        throw rangeError;
      }
      
      toast.success('Questionário criado com sucesso!');
      navigate(`/admin/edit/${quizData.id}`);
    } catch (error) {
      console.error('Erro ao criar questionário:', error);
      toast.error('Erro ao criar questionário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Criar Novo Questionário</h1>
        
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título do questionário"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Digite uma descrição (opcional)"
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => navigate('/admin')}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Questionário'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateQuiz;
