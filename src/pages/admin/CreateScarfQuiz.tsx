
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Play } from 'lucide-react';
import { createScarfQuiz } from '@/data/scarfQuiz';
import { useQuizSave } from '@/hooks/useQuizSave';
import { toast } from 'sonner';

const CreateScarfQuiz = () => {
  const navigate = useNavigate();
  const { isSaving, saveToSupabase } = useQuizSave();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateScarfQuiz = async () => {
    setIsCreating(true);
    
    try {
      const scarfQuiz = createScarfQuiz();
      console.log("Created SCARF quiz:", scarfQuiz);
      
      const savedQuiz = await saveToSupabase(scarfQuiz);
      
      if (savedQuiz) {
        toast.success("Questionário SCARF criado com sucesso!");
        navigate(`/admin/edit-quiz/${savedQuiz.id}`);
      }
    } catch (error) {
      console.error("Error creating SCARF quiz:", error);
      toast.error("Erro ao criar questionário SCARF");
    } finally {
      setIsCreating(false);
    }
  };

  const handlePreviewSample = () => {
    // Criar um quiz temporário para preview
    const sampleQuiz = createScarfQuiz();
    
    // Salvar no localStorage temporariamente para preview
    localStorage.setItem('preview-quiz', JSON.stringify(sampleQuiz));
    
    // Abrir em nova aba para preview
    window.open(`/quiz/preview`, '_blank');
  };

  return (
    <div className="container mx-auto p-4 pt-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Criar Questionário SCARF</h1>
          <p className="text-gray-600">
            Crie um questionário de avaliação SCARF de liderança completo com 85 perguntas organizadas em 4 blocos.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sobre o Questionário SCARF</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Estrutura:</h3>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Bloco 1:</strong> Diagnóstico Organizacional (10 perguntas)</li>
                  <li>• <strong>Bloco 2:</strong> SCARF C-Level (25 perguntas, peso 2)</li>
                  <li>• <strong>Bloco 3:</strong> SCARF Gestores (25 perguntas, peso 1)</li>
                  <li>• <strong>Bloco 4:</strong> Perfil do Usuário (25 perguntas)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Dimensões SCARF:</h3>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Status:</strong> Senso de importância</li>
                  <li>• <strong>Certainty:</strong> Clareza e previsibilidade</li>
                  <li>• <strong>Autonomy:</strong> Controle e liberdade</li>
                  <li>• <strong>Relatedness:</strong> Conexão social</li>
                  <li>• <strong>Fairness:</strong> Senso de justiça</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Resultados:</h3>
              <ul className="text-sm space-y-1">
                <li>• <strong>Score de Compatibilidade (FIT):</strong> 0-100%</li>
                <li>• <strong>Faixas:</strong> Elevado (80-100%), Moderado (60-79%), Em Desenvolvimento (40-59%), Desafiador (0-39%)</li>
                <li>• <strong>Perfil de Liderança:</strong> Baseado nas duas dimensões SCARF dominantes</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={handlePreviewSample}
            variant="outline"
            size="lg"
          >
            <Play className="h-5 w-5 mr-2" />
            Visualizar Exemplo
          </Button>
          
          <Button
            onClick={handleCreateScarfQuiz}
            disabled={isCreating || isSaving}
            size="lg"
          >
            <Save className="h-5 w-5 mr-2" />
            {isCreating || isSaving ? 'Criando...' : 'Criar Questionário SCARF'}
          </Button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Como funciona?</h3>
          <p className="text-blue-800 text-sm">
            O questionário SCARF avalia a compatibilidade entre o perfil de liderança da organização 
            (baseado nas respostas do C-Level e Gestores) e o perfil preferido do usuário. 
            O cálculo considera pesos diferenciados: C-Level tem peso 2, Gestores peso 1. 
            O resultado final é um score de compatibilidade e um perfil de liderança personalizado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateScarfQuiz;
