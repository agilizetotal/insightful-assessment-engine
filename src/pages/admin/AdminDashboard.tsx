
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { AreaChart } from '@/components/AreaChart';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { translations } from '@/locales/pt-BR';

interface Response {
  id: string;
  quizTitle: string;
  date: string;
  profile: string;
  name: string;
  email: string;
  phone: string;
}

interface DatabaseResponse {
  id: string;
  quiz_id: string;
  score: number;
  profile: string;
  completed_at: string;
  user_data: {
    name: string;
    email: string;
    phone: string;
  } | null;
  quizzes: {
    title: string;
  } | null;
}

const AdminDashboard = () => {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(true);
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<{ date: string; responses: number; }[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    if (user) {
      loadResponses();
      loadAnalytics();
    }
  }, [user]);

  const loadResponses = async () => {
    setLoadingResponses(true);
    try {
      // Fetch recent responses with quiz titles
      const { data: responseData, error } = await supabase
        .from('quiz_responses')
        .select(`
        id, 
        quiz_id,
        score,
        profile,
        completed_at,
        user_data,
        quizzes:quiz_id (title)
      `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error loading responses:", error);
        toast.error("Erro ao carregar respostas");
        setResponses([]);
        return;
      }

      // Safely map the data with type checking
      const formattedResponses = (responseData || []).map((item: DatabaseResponse) => {
        // Safe way to handle potentially missing data
        return {
          id: item?.id || '',
          quizTitle: item?.quizzes?.title || 'Quiz desconhecido',
          date: item?.completed_at ? new Date(item.completed_at).toLocaleDateString() : '-',
          profile: item?.profile || 'Perfil desconhecido',
          // Safely access potentially missing user_data
          name: item?.user_data?.name || 'Usuário anônimo',
          email: item?.user_data?.email || '-',
          phone: item?.user_data?.phone || '-',
        };
      });

      setResponses(formattedResponses);
    } catch (err) {
      console.error("Error in loadResponses:", err);
      toast.error("Erro ao processar respostas");
      setResponses([]);
    } finally {
      setLoadingResponses(false);
    }
  };

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      // Fetch quiz responses grouped by date
      const { data, error } = await supabase
        .from('quiz_responses')
        .select('completed_at')
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      if (!data) {
        setAnalyticsData([]);
        return;
      }

      // Process the data to count responses per day
      const dailyCounts = data.reduce((acc: Record<string, number>, item) => {
        if (item.completed_at) {
          const date = format(new Date(item.completed_at), 'yyyy-MM-dd');
          acc[date] = (acc[date] || 0) + 1;
        }
        return acc;
      }, {});

      // Convert the processed data into the format required by AreaChart
      const analyticsData = Object.entries(dailyCounts).map(([date, responses]) => ({
        date,
        responses: responses as number,
      }));

      setAnalyticsData(analyticsData);
    } catch (error) {
      console.error("Erro ao carregar dados de análise:", error);
      toast.error("Erro ao carregar dados de análise");
      setAnalyticsData([]);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  return (
    <div className="container mx-auto p-4 pt-16">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{translations.dashboard.welcomeBack}, {user?.email}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            {translations.dashboard.createNewQuiz}{' '}
            <Link to="/admin/create-new" className="text-blue-500 hover:underline">
              {translations.common.edit}
            </Link>
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{translations.dashboard.recentResponses}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingResponses ? (
              <p>{translations.common.loading}</p>
            ) : responses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left">{translations.quiz.title}</th>
                      <th className="text-left">Data</th>
                      <th className="text-left">Perfil</th>
                      <th className="text-left">Nome</th>
                      <th className="text-left">Email</th>
                      <th className="text-left">Telefone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((response) => (
                      <tr key={response.id}>
                        <td>{response.quizTitle}</td>
                        <td>{response.date}</td>
                        <td>{response.profile}</td>
                        <td>{response.name}</td>
                        <td>{response.email}</td>
                        <td>{response.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Nenhuma resposta recente encontrada.</p>
            )}
            <Button asChild variant="link" className="mt-4">
              <Link to="/admin">{translations.dashboard.seeAll}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{translations.dashboard.stats.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAnalytics ? (
              <p>{translations.common.loading}</p>
            ) : (
              <AreaChart data={analyticsData} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
