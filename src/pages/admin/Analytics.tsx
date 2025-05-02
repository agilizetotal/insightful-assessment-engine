import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AreaChart } from "@/components/AreaChart";
import { ResultsChart } from "@/components/ResultsChart";
import ResultsSummary from "@/components/ResultsSummary";
import { Quiz, QuizResult } from '@/types/quiz';
import { translations } from '@/locales/pt-BR';

type ResponseData = {
  id: string;
  profile: string;
  score: number;
  completed_at: string;
  quiz_id: string;
};

type QuizData = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
};

const Analytics = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [quizResponses, setQuizResponses] = useState<ResponseData[]>([]);
  const [responsesByDate, setResponsesByDate] = useState<{date: string; responses: number}[]>([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        setQuizzes(data || []);
        if (data && data.length > 0) {
          setSelectedQuiz(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuizzes();
  }, [user]);

  useEffect(() => {
    const fetchSelectedQuizData = async () => {
      if (!selectedQuiz) return;
      
      try {
        // Fetch the complete quiz with questions and profile ranges
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', selectedQuiz)
          .single();
          
        if (quizError) throw quizError;
        
        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', selectedQuiz);
          
        if (questionsError) throw questionsError;
        
        // Fetch profile ranges
        const { data: profileRangesData, error: profileRangesError } = await supabase
          .from('profile_ranges')
          .select('*')
          .eq('quiz_id', selectedQuiz);
          
        if (profileRangesError) throw profileRangesError;
        
        // Fetch responses for this quiz
        const { data: responsesData, error: responsesError } = await supabase
          .from('quiz_responses')
          .select('*')
          .eq('quiz_id', selectedQuiz)
          .order('completed_at', { ascending: false });
          
        if (responsesError) throw responsesError;
        
        setQuizResponses(responsesData || []);
        
        // Calculate responses by date
        const dateMap = new Map<string, number>();
        responsesData?.forEach(response => {
          const date = new Date(response.completed_at).toISOString().split('T')[0];
          dateMap.set(date, (dateMap.get(date) || 0) + 1);
        });
        
        // Convert to array for chart
        const responsesByDateArray = Array.from(dateMap).map(([date, count]) => ({
          date,
          responses: count
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setResponsesByDate(responsesByDateArray);
        
        // Create formatted quiz object
        const formattedQuiz: Quiz = {
          id: quizData.id,
          title: quizData.title,
          description: quizData.description || '',
          questions: questionsData.map(q => ({
            id: q.id,
            text: q.text,
            type: q.type,
            required: q.required !== undefined ? q.required : true // Add required property
          })),
          profileRanges: profileRangesData.map(p => ({
            min: p.min_score,
            max: p.max_score,
            profile: p.profile,
            description: p.description || ''
          })),
          createdAt: quizData.created_at,
          updatedAt: quizData.updated_at
        };
      } catch (error) {
        console.error("Error fetching selected quiz data:", error);
      }
    };
    
    fetchSelectedQuizData();
  }, [selectedQuiz]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="my-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="ml-2">{translations.common.loading}</p>
        </div>
      </div>
    );
  }

  const getSelectedQuiz = () => {
    return quizzes.find(quiz => quiz.id === selectedQuiz) || null;
  };

  const getAverageScore = () => {
    if (quizResponses.length === 0) return 0;
    const totalScore = quizResponses.reduce((sum, response) => sum + (response.score || 0), 0);
    return Math.round((totalScore / quizResponses.length) * 10) / 10;
  };

  const getProfileDistribution = () => {
    if (quizResponses.length === 0) return { labels: [], values: [] };
    
    const profilesCount: Record<string, number> = {};
    quizResponses.forEach(response => {
      const profile = response.profile || 'Unknown';
      profilesCount[profile] = (profilesCount[profile] || 0) + 1;
    });
    
    const labels = Object.keys(profilesCount);
    const values = labels.map(label => profilesCount[label]);
    
    return { labels, values };
  };

  // Format responses for ResultsSummary component
  const formattedResponses = quizResponses.map(response => ({
    profile: response.profile,
    score: response.score,
    completedAt: response.completed_at
  }));
  
  const currentQuiz = getSelectedQuiz();
  
  return (
    <div className="container mx-auto p-4 pt-16">
      <h1 className="text-2xl font-bold mb-6">{translations.analytics.title}</h1>
      
      {quizzes.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{translations.analytics.noQuizzes}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{translations.analytics.createQuizPrompt}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              {translations.analytics.selectQuiz}
            </label>
            <select 
              value={selectedQuiz || ''}
              onChange={e => setSelectedQuiz(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {quizzes.map(quiz => (
                <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
              ))}
            </select>
          </div>
          
          {currentQuiz && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      {translations.analytics.totalResponses}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{quizResponses.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      {translations.analytics.averageScore}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{getAverageScore()}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      {translations.analytics.mostCommonProfile}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {quizResponses.length > 0 
                        ? getProfileDistribution().labels[0] || translations.common.noData
                        : translations.common.noData}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">{translations.analytics.overview}</TabsTrigger>
                  <TabsTrigger value="responses">{translations.analytics.responses}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>{translations.analytics.responsesOverTime}</CardTitle>
                      </CardHeader>
                      <CardContent className="h-80">
                        {responsesByDate.length > 0 ? (
                          <AreaChart data={responsesByDate} />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">{translations.common.noData}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>{translations.analytics.profileDistribution}</CardTitle>
                      </CardHeader>
                      <CardContent className="h-80">
                        {quizResponses.length > 0 ? (
                          <ResultsChart 
                            data={getProfileDistribution()}
                            type="doughnut"
                            title={translations.analytics.profileDistribution}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">{translations.common.noData}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="responses">
                  {quizResponses.length > 0 ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>{translations.analytics.latestResponses}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {quizResponses.slice(0, 10).map((response) => (
                            <div key={response.id} className="border-b pb-4">
                              <div className="flex justify-between mb-1">
                                <p className="font-medium">{response.profile}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(response.completed_at).toLocaleString()}
                                </p>
                              </div>
                              <p>Score: {response.score}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="text-center p-6">
                      <p>{translations.analytics.noResponses}</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;
