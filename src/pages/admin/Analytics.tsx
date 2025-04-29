
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Quiz } from "@/types/quiz";
import { AreaChart } from "@/components/AreaChart";
import ResultsChart from "@/components/ResultsChart";
import ResultsSummary from "@/components/ResultsSummary";

const Analytics = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [responseData, setResponseData] = useState<any[]>([]);
  const [completionsChart, setCompletionsChart] = useState<{ labels: string[], values: number[] }>({ labels: [], values: [] });
  const [profilesChart, setProfilesChart] = useState<{ labels: string[], values: number[] }>({ labels: [], values: [] });
  
  useEffect(() => {
    if (user) {
      loadQuizzes();
    }
  }, [user]);
  
  useEffect(() => {
    if (selectedQuizId) {
      loadResponseData();
    }
  }, [selectedQuizId]);
  
  const loadQuizzes = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Quick fetch of quiz questions and profile ranges
      const enrichedQuizzes = await Promise.all(data.map(async (quiz) => {
        const { data: questionsData } = await supabase
          .from('questions')
          .select('id, text, type')
          .eq('quiz_id', quiz.id);
          
        const { data: profileRangesData } = await supabase
          .from('profile_ranges')
          .select('*')
          .eq('quiz_id', quiz.id);
          
        return {
          ...quiz,
          questions: questionsData || [],
          profileRanges: profileRangesData ? profileRangesData.map((range: any) => ({
            min: range.min_score,
            max: range.max_score,
            profile: range.profile,
            description: range.description || ''
          })) : []
        } as Quiz;
      }));
      
      setQuizzes(enrichedQuizzes);
      
      if (enrichedQuizzes.length > 0) {
        setSelectedQuizId(enrichedQuizzes[0].id);
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadResponseData = async () => {
    try {
      // Load responses for selected quiz
      const { data: responses, error } = await supabase
        .from('quiz_responses')
        .select('*, question_answers(question_id, answer)')
        .eq('quiz_id', selectedQuizId);
      
      if (error) throw error;
      
      setResponseData(responses || []);
      
      // Process data for charts
      processChartData(responses || []);
    } catch (error) {
      console.error('Error loading response data:', error);
    }
  };
  
  const processChartData = (responses: any[]) => {
    // Process completions by date
    const dateGroups = responses.reduce((acc: Record<string, number>, response) => {
      const date = new Date(response.completed_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    const sortedDates = Object.keys(dateGroups).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });
    
    setCompletionsChart({
      labels: sortedDates,
      values: sortedDates.map(date => dateGroups[date])
    });
    
    // Process profile distributions
    const profileGroups = responses.reduce((acc: Record<string, number>, response) => {
      const profile = response.profile || 'Desconhecido';
      acc[profile] = (acc[profile] || 0) + 1;
      return acc;
    }, {});
    
    setProfilesChart({
      labels: Object.keys(profileGroups),
      values: Object.values(profileGroups) as number[]
    });
  };
  
  const selectedQuiz = quizzes.find(quiz => quiz.id === selectedQuizId);
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 pt-16">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (quizzes.length === 0) {
    return (
      <div className="container mx-auto p-4 pt-16">
        <Card>
          <CardHeader>
            <CardTitle>Análise</CardTitle>
            <CardDescription>Você ainda não criou nenhum questionário para analisar.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Crie seu primeiro questionário para começar a coletar respostas e analisar os resultados.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 pt-16">
      <h1 className="text-2xl font-bold mb-6">Análise</h1>
      
      <div className="mb-6">
        <Select
          value={selectedQuizId}
          onValueChange={setSelectedQuizId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um questionário" />
          </SelectTrigger>
          <SelectContent>
            {quizzes.map(quiz => (
              <SelectItem key={quiz.id} value={quiz.id}>
                {quiz.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total de Respostas</CardTitle>
            <CardDescription>Número total de respostas coletadas</CardDescription>
          </CardHeader>
          <CardContent className="text-4xl font-bold">
            {responseData.length}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Conclusão</CardTitle>
            <CardDescription>Porcentagem de usuários que completaram o questionário</CardDescription>
          </CardHeader>
          <CardContent className="text-4xl font-bold">
            100%
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="summary" className="mt-6">
        <TabsList>
          <TabsTrigger value="summary">Resumo</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="responses">Respostas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo das Respostas</CardTitle>
                <CardDescription>Visão geral dos resultados</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedQuiz && responseData.length > 0 ? (
                  <ResultsSummary 
                    quiz={selectedQuiz} 
                    responses={responseData.map(response => ({
                      profile: response.profile,
                      score: response.score,
                      completedAt: response.completed_at
                    }))} 
                  />
                ) : (
                  <p>Não há dados disponíveis para este questionário ainda.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="charts">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Respostas ao Longo do Tempo</CardTitle>
                <CardDescription>Número de respostas coletadas por dia</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {responseData.length > 0 ? (
                  <AreaChart 
                    data={{
                      labels: completionsChart.labels,
                      values: completionsChart.values
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>Não há dados disponíveis para este questionário ainda.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Perfis</CardTitle>
                <CardDescription>Distribuição dos perfis com base nas respostas</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {responseData.length > 0 ? (
                  <ResultsChart 
                    data={{
                      labels: profilesChart.labels,
                      values: profilesChart.values
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>Não há dados disponíveis para este questionário ainda.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="responses">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Respostas Individuais</CardTitle>
                <CardDescription>Lista de todas as respostas recebidas</CardDescription>
              </CardHeader>
              <CardContent>
                {responseData.length > 0 ? (
                  <div className="space-y-4">
                    {responseData.map((response, index) => (
                      <div key={response.id} className="p-4 border rounded-md">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">Resposta #{index + 1}</p>
                            <p className="text-gray-500 text-sm">
                              {new Date(response.completed_at).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Perfil: {response.profile}</p>
                            <p className="text-gray-500 text-sm">
                              Pontuação: {response.score}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Não há respostas disponíveis para este questionário ainda.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
