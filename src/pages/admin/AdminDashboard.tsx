
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizList } from "@/components/QuizList";
import { useAuth } from "@/contexts/AuthContext";
import { translations } from "@/locales/pt-BR";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [recentResponses, setRecentResponses] = useState([]);

  useEffect(() => {
    if (user) {
      setUserName(user.email || "");
      loadRecentResponses();
      setIsLoading(false);
    }
  }, [user]);

  const loadRecentResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_responses')
        .select(`
          id,
          quiz_id,
          created_at,
          profile,
          user_name,
          quizzes!inner(title, user_id)
        `)
        .eq('quizzes.user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      setRecentResponses(data || []);
    } catch (error) {
      console.error("Error loading recent responses:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">{translations.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {translations.dashboard.welcomeBack}, <span className="text-blue-600">{userName}</span>
        </h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{translations.dashboard.title}</h2>
        <Button asChild>
          <Link to="/admin/create-new">
            <Plus className="h-5 w-5 mr-2" />
            {translations.dashboard.createNewQuiz}
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="quizzes" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="quizzes">{translations.quiz.questions}</TabsTrigger>
          <TabsTrigger value="responses">{translations.dashboard.recentResponses}</TabsTrigger>
          <TabsTrigger value="analytics">{translations.dashboard.viewAnalytics}</TabsTrigger>
        </TabsList>

        <TabsContent value="quizzes">
          <QuizList />
        </TabsContent>

        <TabsContent value="responses">
          <Card>
            <CardHeader>
              <CardTitle>{translations.dashboard.recentResponses}</CardTitle>
              <CardDescription>Últimas respostas recebidas nos seus questionários</CardDescription>
            </CardHeader>
            <CardContent>
              {recentResponses.length > 0 ? (
                <div className="space-y-4">
                  {recentResponses.map((response: any) => (
                    <div key={response.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium">{response.quizzes?.title}</h4>
                      <p className="text-sm text-gray-600">
                        Respondido por: {response.user_name || 'Anônimo'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(response.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {translations.dashboard.noQuizzes}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Análises</CardTitle>
              <CardDescription>Estatísticas e insights sobre seus questionários</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                As análises estarão disponíveis quando você tiver respostas em seus questionários.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
