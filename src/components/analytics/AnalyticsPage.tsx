
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Download, FileSpreadsheet, Users, BarChart3, TrendingUp } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useExcelExport } from '@/hooks/useExcelExport';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AnalyticsData {
  totalResponses: number;
  totalQuizzes: number;
  averageScore: number;
  recentResponses: Array<{
    id: string;
    user_name: string | null;
    user_email: string | null;
    user_phone: string | null;
    score: number | null;
    profile: string | null;
    completed_at: string | null;
    quiz_title: string;
  }>;
}

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalResponses: 0,
    totalQuizzes: 0,
    averageScore: 0,
    recentResponses: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { exportAllResponses, isExporting } = useExcelExport();

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Buscar dados dos questionários do usuário
      const { data: quizzes, error: quizzesError } = await supabase
        .from('quizzes')
        .select('id')
        .eq('user_id', user?.id);

      if (quizzesError) throw quizzesError;

      const quizIds = quizzes?.map(q => q.id) || [];
      
      if (quizIds.length === 0) {
        setAnalytics({
          totalResponses: 0,
          totalQuizzes: 0,
          averageScore: 0,
          recentResponses: []
        });
        return;
      }

      // Buscar respostas dos questionários
      const { data: responses, error: responsesError } = await supabase
        .from('quiz_responses')
        .select(`
          id,
          user_name,
          user_email,
          user_phone,
          score,
          profile,
          completed_at,
          quizzes!inner(
            title
          )
        `)
        .in('quiz_id', quizIds)
        .order('completed_at', { ascending: false })
        .limit(50);

      if (responsesError) throw responsesError;

      // Calcular estatísticas
      const totalResponses = responses?.length || 0;
      const totalQuizzes = quizzes?.length || 0;
      const validScores = responses?.filter(r => r.score !== null).map(r => r.score!) || [];
      const averageScore = validScores.length > 0 
        ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
        : 0;

      // Formatar respostas recentes
      const recentResponses = responses?.slice(0, 20).map((response: any) => ({
        id: response.id,
        user_name: response.user_name,
        user_email: response.user_email,
        user_phone: response.user_phone,
        score: response.score,
        profile: response.profile,
        completed_at: response.completed_at,
        quiz_title: response.quizzes?.title || 'Quiz sem título'
      })) || [];

      setAnalytics({
        totalResponses,
        totalQuizzes,
        averageScore,
        recentResponses
      });

    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Erro ao carregar dados de analytics");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <Button 
          onClick={exportAllResponses}
          disabled={isExporting || analytics.totalResponses === 0}
          className="flex items-center gap-2"
        >
          {isExporting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
          ) : (
            <FileSpreadsheet className="h-4 w-4" />
          )}
          {isExporting ? 'Exportando...' : 'Exportar Excel'}
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Respostas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalResponses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questionários Ativos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalQuizzes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageScore}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalQuizzes > 0 
                ? Math.round((analytics.totalResponses / analytics.totalQuizzes) * 100) / 100
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de respostas recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Respostas Recentes</CardTitle>
          <CardDescription>
            Últimas {analytics.recentResponses.length} respostas recebidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentResponses.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Questionário</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.recentResponses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell className="font-medium">
                        {response.quiz_title}
                      </TableCell>
                      <TableCell>{response.user_name || 'N/A'}</TableCell>
                      <TableCell>{response.user_email || 'N/A'}</TableCell>
                      <TableCell>{response.user_phone || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {response.score || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>{response.profile || 'N/A'}</TableCell>
                      <TableCell>
                        {response.completed_at 
                          ? format(new Date(response.completed_at), 'dd/MM/yyyy HH:mm')
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhuma resposta encontrada ainda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
