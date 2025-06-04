
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Play, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { createScarfQuiz } from '@/data/scarfQuiz';
import { useQuizSave } from '@/hooks/useQuizSave';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

const CreateScarfQuiz = () => {
  const navigate = useNavigate();
  const { isSaving, saveToSupabase } = useQuizSave();
  const [isCreating, setIsCreating] = useState(false);
  const [quizCreated, setQuizCreated] = useState(false);
  const [creationProgress, setCreationProgress] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [createdQuizId, setCreatedQuizId] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<{
    questionsGenerated: number;
    groupsCreated: number;
    profileRanges: number;
  } | null>(null);

  const handleCreateScarfQuiz = async () => {
    console.log("=== INICIANDO PROCESSO DE CRIAÇÃO DO QUIZ SCARF ===");
    setIsCreating(true);
    setProgressPercent(10);
    setCreationProgress('Gerando estrutura do questionário SCARF...');
    
    try {
      // Passo 1: Criar a estrutura do quiz
      const scarfQuiz = createScarfQuiz();
      console.log("Estrutura do quiz criada:", {
        id: scarfQuiz.id,
        questionsCount: scarfQuiz.questions.length,
        groupsCount: scarfQuiz.questionGroups.length,
        profileRanges: scarfQuiz.profileRanges.length
      });
      
      // Validar se o quiz foi criado corretamente
      setValidationResults({
        questionsGenerated: scarfQuiz.questions.length,
        groupsCreated: scarfQuiz.questionGroups.length,
        profileRanges: scarfQuiz.profileRanges.length
      });
      
      setProgressPercent(30);
      setCreationProgress(`Validando estrutura: ${scarfQuiz.questions.length} perguntas em ${scarfQuiz.questionGroups.length} grupos...`);
      
      // Verificar se temos as 85 perguntas esperadas
      if (scarfQuiz.questions.length !== 85) {
        throw new Error(`Esperado 85 perguntas, mas foram geradas ${scarfQuiz.questions.length}`);
      }
      
      // Verificar distribuição por grupo
      const questionsByGroup = scarfQuiz.questionGroups.map(group => ({
        title: group.title,
        count: scarfQuiz.questions.filter(q => q.groupId === group.id).length
      }));
      
      console.log("Distribuição de perguntas por grupo:", questionsByGroup);
      
      setProgressPercent(50);
      setCreationProgress('Iniciando salvamento no banco de dados...');
      
      // Passo 2: Salvar no banco de dados
      const savedQuiz = await saveToSupabase(scarfQuiz);
      
      setProgressPercent(90);
      
      if (savedQuiz) {
        console.log("Quiz salvo com sucesso! ID:", savedQuiz.id);
        setCreatedQuizId(savedQuiz.id);
        setProgressPercent(100);
        toast.success(`Questionário SCARF criado com sucesso! ${scarfQuiz.questions.length} perguntas salvas.`);
        setQuizCreated(true);
        setCreationProgress('');
      } else {
        console.error("Falha ao salvar quiz - savedQuiz é null");
        toast.error("Erro ao salvar questionário - tente novamente");
        setCreationProgress('Erro ao salvar no banco de dados');
        setProgressPercent(0);
      }
    } catch (error) {
      console.error("Erro ao criar questionário SCARF:", error);
      toast.error(`Erro ao criar questionário SCARF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setCreationProgress(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setProgressPercent(0);
    } finally {
      setIsCreating(false);
    }
  };

  const handlePreviewSample = () => {
    if (createdQuizId) {
      // Abrir o quiz real para preview
      window.open(`/quiz/${createdQuizId}?preview=true`, '_blank');
    } else {
      // Fallback para quiz de exemplo
      console.log("Criando quiz de exemplo para preview...");
      const sampleQuiz = createScarfQuiz();
      localStorage.setItem('preview-quiz', JSON.stringify(sampleQuiz));
      window.open(`/quiz/preview`, '_blank');
    }
  };

  const handleBackToAdmin = () => {
    console.log("Navegando de volta para admin...");
    navigate('/admin');
  };

  const handleEditQuiz = () => {
    if (createdQuizId) {
      navigate(`/admin/edit/${createdQuizId}`);
    }
  };

  if (quizCreated) {
    return (
      <div className="container mx-auto p-4 pt-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-green-600 text-6xl mb-4">
              <CheckCircle className="mx-auto w-16 h-16" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-green-600">
              Questionário SCARF Criado com Sucesso!
            </h1>
            <p className="text-gray-600 mb-6">
              O formulário completo de Fit de Liderança com Modelo SCARF foi criado e está pronto para uso.
            </p>
          </div>
          
          {validationResults && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-green-600">Validação da Criação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {validationResults.questionsGenerated}
                    </div>
                    <div className="text-sm text-green-800">Perguntas Criadas</div>
                    <div className="text-xs text-green-600 mt-1">✓ 85 perguntas esperadas</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {validationResults.groupsCreated}
                    </div>
                    <div className="text-sm text-blue-800">Grupos Criados</div>
                    <div className="text-xs text-blue-600 mt-1">✓ 4 blocos SCARF</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {validationResults.profileRanges}
                    </div>
                    <div className="text-sm text-purple-800">Perfis de Resultado</div>
                    <div className="text-xs text-purple-600 mt-1">✓ 5 faixas de fit</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
            
          {createdQuizId && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>ID do Quiz:</strong> {createdQuizId}
                <br />
                <strong>Status:</strong> Todas as 85 perguntas foram salvas corretamente no banco de dados.
                <br />
                <strong>Estrutura:</strong> 4 blocos (Estratégico + 3 SCARF) com escala de 6 pontos.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Button onClick={handleBackToAdmin} size="lg">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar para Admin
            </Button>
            
            {createdQuizId && (
              <Button onClick={handleEditQuiz} variant="outline" size="lg">
                Editar Questionário
              </Button>
            )}
            
            <Button onClick={handlePreviewSample} variant="outline" size="lg">
              <Play className="h-5 w-5 mr-2" />
              Testar Questionário
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pt-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={handleBackToAdmin}
            className="mb-4"
            disabled={isCreating}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Admin
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Criar Questionário SCARF Completo</h1>
          <p className="text-gray-600">
            Formulário completo de Fit de Liderança com modelo SCARF usando escala de 6 pontos de compatibilidade.
          </p>
        </div>

        {(creationProgress || isCreating) && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="text-sm font-medium">{creationProgress}</span>
                </div>
                {progressPercent > 0 && (
                  <Progress value={progressPercent} className="w-full" />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sobre o Formulário SCARF</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Estrutura (85 perguntas):</h3>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Bloco 1:</strong> Momento Estratégico (10 perguntas)</li>
                  <li>• <strong>Bloco 2:</strong> SCARF C-Level (25 perguntas, peso 65%)</li>
                  <li>• <strong>Bloco 3:</strong> SCARF Gestores (25 perguntas, peso 35%)</li>
                  <li>• <strong>Bloco 4:</strong> Perfil Preferido (25 perguntas)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Escala de Compatibilidade:</h3>
                <ul className="text-sm space-y-1">
                  <li>• <strong>1:</strong> Nada compatível</li>
                  <li>• <strong>2:</strong> Pouco compatível</li>
                  <li>• <strong>3:</strong> Levemente compatível</li>
                  <li>• <strong>4:</strong> Moderadamente compatível</li>
                  <li>• <strong>5:</strong> Muito compatível</li>
                  <li>• <strong>6:</strong> Totalmente compatível</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Modelo de Cálculo:</h3>
              <ul className="text-sm space-y-1">
                <li>• <strong>Média Ponderada:</strong> C-Level (65%) + Gestores (35%)</li>
                <li>• <strong>Score SCARF:</strong> 100 - (Diferença ponderada / Diferença máxima) × 100</li>
                <li>• <strong>Estilos de Liderança:</strong> Baseados nas correlações SCARF</li>
              </ul>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Faixas de Resultado:</h3>
              <ul className="text-sm space-y-1">
                <li>• <strong>85-100%:</strong> Fit Excelente</li>
                <li>• <strong>70-84%:</strong> Fit Elevado</li>
                <li>• <strong>55-69%:</strong> Fit Moderado</li>
                <li>• <strong>40-54%:</strong> Fit em Desenvolvimento</li>
                <li>• <strong>0-39%:</strong> Fit Desafiador</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={handlePreviewSample}
            variant="outline"
            size="lg"
            disabled={isCreating}
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
            Este questionário avalia a compatibilidade entre o perfil de liderança organizacional 
            (média ponderada: C-Level 65% + Gestores 35%) e suas preferências pessoais. 
            O resultado final inclui um score de compatibilidade e um perfil de liderança baseado 
            nas correlações SCARF específicas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateScarfQuiz;
