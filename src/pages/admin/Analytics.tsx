
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Calendar,
  Filter
} from "lucide-react";
import ResultsChart from "@/components/ResultsChart";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { translations } from "@/locales/pt-BR";

const Analytics = () => {
  const [dateRange, setDateRange] = useState("30");
  const [quizFilter, setQuizFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState({
    totalCompletions: 0,
    avgCompletionTime: "0:00",
    premiumConversion: 0
  });
  const [responses, setResponses] = useState([]);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch quizzes for filter dropdown
        const { data: quizzesData, error: quizzesError } = await supabase
          .from('quizzes')
          .select('id, title')
          .order('created_at', { ascending: false });
          
        if (quizzesError) throw quizzesError;
        
        // Fetch quiz responses
        const { data: responsesData, error: responsesError } = await supabase
          .from('quiz_responses')
          .select(`
            id, 
            score, 
            profile, 
            is_premium, 
            completed_at,
            quizzes (
              id,
              title
            )
          `)
          .order('completed_at', { ascending: false });
          
        if (responsesError) throw responsesError;
        
        // Calculate statistics
        const totalCompletions = responsesData?.length || 0;
        const premiumCount = responsesData?.filter(r => r.is_premium)?.length || 0;
        const premiumPercentage = totalCompletions > 0 
          ? Math.round((premiumCount / totalCompletions) * 100) 
          : 0;
          
        setQuizzes(quizzesData || []);
        setResponses(responsesData || []);
        setStats({
          totalCompletions,
          avgCompletionTime: calculateAverageTime(responsesData),
          premiumConversion: premiumPercentage
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast.error("Erro ao carregar dados analíticos");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, dateRange, quizFilter]);
  
  const calculateAverageTime = (data) => {
    if (!data || data.length === 0) return "0:00";
    // Em uma implementação real, isto calcularia o tempo médio
    // com base nos timestamps de início e conclusão
    return "7:24"; // Valor de exemplo
  };
  
  const getProfileDistribution = () => {
    if (!responses || responses.length === 0) {
      return { 
        labels: ["Sem dados"], 
        values: [100] 
      };
    }
    
    const profiles = {};
    responses.forEach(response => {
      if (response.profile) {
        profiles[response.profile] = (profiles[response.profile] || 0) + 1;
      }
    });
    
    return {
      labels: Object.keys(profiles),
      values: Object.values(profiles)
    };
  };
  
  const getCompletionsData = () => {
    // Em uma implementação real, isto agregaria dados por mês
    // com base nas respostas reais
    if (!responses || responses.length === 0) {
      return { 
        labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"], 
        values: [0, 0, 0, 0, 0, 0] 
      };
    }
    
    return {
      labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
      values: [responses.length * 0.1, responses.length * 0.15, 
               responses.length * 0.2, responses.length * 0.15, 
               responses.length * 0.25, responses.length * 0.15]
    };
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">{translations.common.loading}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-500">Gain insights from your assessment data</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={quizFilter} onValueChange={setQuizFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by quiz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quizzes</SelectItem>
                {quizzes.map(quiz => (
                  <SelectItem key={quiz.id} value={quiz.id}>
                    {quiz.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Completions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCompletions}</div>
            <div className="flex items-center text-sm mt-1">
              <span className="text-gray-500">Total de respostas</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Avg. Completion Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgCompletionTime}</div>
            <div className="flex items-center text-sm mt-1">
              <span className="text-gray-500">Tempo médio estimado</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Premium Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.premiumConversion}%</div>
            <div className="flex items-center text-sm mt-1">
              <span className="text-gray-500">Conversão para premium</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profiles">Profile Distribution</TabsTrigger>
          <TabsTrigger value="questions">Question Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Completions Over Time</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResultsChart
                  type="line"
                  title="Completions"
                  data={getCompletionsData()}
                  downloadFileName="completions-trend"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Profile Distribution</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResultsChart
                  type="pie"
                  title="Leadership Profiles"
                  data={getProfileDistribution()}
                  downloadFileName="profile-distribution"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="profiles" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Leadership Profile Distribution</CardTitle>
              <CardDescription>
                Breakdown of assessment results by leadership profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResultsChart
                  type="pie"
                  title="Profile Distribution"
                  data={getProfileDistribution()}
                  downloadFileName="profile-distribution"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="questions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Question Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of responses for each question
              </CardDescription>
            </CardHeader>
            <CardContent>
              {responses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Ainda não há dados de respostas para analisar
                </div>
              ) : (
                <div className="text-center py-8">
                  Implementação futura: Análise detalhada por questão
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Trend Analysis</CardTitle>
              <CardDescription>
                Identify patterns and changes over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {responses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Ainda não há dados suficientes para análise de tendências
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResultsChart
                    type="line"
                    title="Average Scores Over Time"
                    data={getCompletionsData()}
                    downloadFileName="score-trends"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Quiz Submissions</CardTitle>
          <CardDescription>
            View the latest quiz completions and results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {responses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Ainda não há submissões de questionários registradas
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quiz
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscription
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {responses.slice(0, 5).map((submission, index) => (
                    <tr key={submission.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(submission.completed_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {submission.quizzes?.title || "Desconhecido"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {submission.score}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {submission.profile || "Desconhecido"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          submission.is_premium 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {submission.is_premium ? "Premium" : "Free"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {responses.length > 5 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Mostrando 5 de {responses.length} submissões
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
