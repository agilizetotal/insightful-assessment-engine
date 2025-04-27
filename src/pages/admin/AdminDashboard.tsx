
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, ArrowRight, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';
import { translations } from '@/locales/pt-BR';

type Quiz = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  response_count: number;
};

type Response = {
  id: string;
  quiz_title: string;
  created_at: string;
  profile: string;
  user_data: {
    name: string;
    email: string;
    phone?: string;
  }
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [statsData, setStatsData] = useState({
    quizCount: 0,
    responseCount: 0,
    completionRate: 0
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's quizzes
      const { data: quizzesData, error: quizError } = await supabase
        .from('quizzes')
        .select('id, title, created_at, updated_at')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });
      
      if (quizError) throw quizError;
      
      // Count responses for each quiz
      const quizzesWithCounts = await Promise.all(quizzesData.map(async (quiz) => {
        const { count, error: countError } = await supabase
          .from('quiz_responses')
          .select('*', { count: 'exact', head: true })
          .eq('quiz_id', quiz.id);
          
        return {
          ...quiz,
          response_count: count || 0
        };
      }));
      
      setQuizzes(quizzesWithCounts);
      
      // Fetch recent responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('quiz_responses')
        .select(`
          id,
          created_at: completed_at,
          profile,
          user_data,
          quizzes(title)
        `)
        .eq('quizzes.user_id', user?.id)
        .order('completed_at', { ascending: false })
        .limit(10);
      
      if (responsesError) throw responsesError;
      
      const formattedResponses = responsesData.map(response => ({
        id: response.id,
        quiz_title: response.quizzes?.title || 'Quiz Desconhecido',
        created_at: response.created_at,
        profile: response.profile,
        user_data: response.user_data || { name: 'Anônimo', email: 'N/A' }
      }));
      
      setResponses(formattedResponses);
      
      // Calculate stats
      const totalQuizzes = quizzesWithCounts.length;
      const totalResponses = quizzesWithCounts.reduce((sum, quiz) => sum + quiz.response_count, 0);
      const avgCompletionRate = totalQuizzes > 0 ? (totalResponses / totalQuizzes) : 0;
      
      setStatsData({
        quizCount: totalQuizzes,
        responseCount: totalResponses,
        completionRate: avgCompletionRate
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteQuiz = async (quizId: string) => {
    try {
      // Delete the quiz
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);
      
      if (error) throw error;
      
      // Update the local state
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      setQuizToDelete(null);
      
      toast.success(translations.quiz.deleteSuccess);
    } catch (error) {
      console.error('Erro ao excluir quiz:', error);
      toast.error(translations.quiz.deleteError);
    }
  };

  if (loading) {
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{translations.dashboard.title}</h1>
        <Button asChild>
          <Link to="/admin/create-new">
            <Plus className="h-4 w-4 mr-2" />
            {translations.dashboard.createNewQuiz}
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{translations.dashboard.stats.quizzes}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statsData.quizCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{translations.dashboard.stats.responses}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statsData.responseCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{translations.dashboard.stats.completionRate}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statsData.completionRate.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quizzes List */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{translations.dashboard.recentQuizzes}</CardTitle>
          <CardDescription>{translations.quiz.title}</CardDescription>
        </CardHeader>
        <CardContent>
          {quizzes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{translations.quiz.title}</TableHead>
                  <TableHead className="hidden md:table-cell">{translations.common.create}</TableHead>
                  <TableHead className="hidden md:table-cell">{translations.common.update}</TableHead>
                  <TableHead>{translations.dashboard.recentResponses}</TableHead>
                  <TableHead className="text-right">{translations.common.edit}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizzes.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(quiz.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(quiz.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{quiz.response_count}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/edit/${quiz.id}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Dialog open={quizToDelete === quiz.id} onOpenChange={() => setQuizToDelete(null)}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-700"
                              onClick={() => setQuizToDelete(quiz.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{translations.quiz.deleteConfirm}</DialogTitle>
                              <DialogDescription>
                                Esta ação não pode ser desfeita. Isto excluirá permanentemente o questionário "{quiz.title}" e todos os seus dados.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setQuizToDelete(null)}>
                                {translations.common.cancel}
                              </Button>
                              <Button variant="destructive" onClick={() => handleDeleteQuiz(quiz.id)}>
                                {translations.common.delete}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">Você ainda não criou nenhum questionário</p>
              <Button asChild>
                <Link to="/admin/create-new">
                  <Plus className="h-4 w-4 mr-2" />
                  {translations.dashboard.createNewQuiz}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Responses */}
      <Card>
        <CardHeader>
          <CardTitle>{translations.dashboard.recentResponses}</CardTitle>
          <CardDescription>Respostas mais recentes dos seus questionários</CardDescription>
        </CardHeader>
        <CardContent>
          {responses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Questionário</TableHead>
                  <TableHead className="hidden md:table-cell">Data</TableHead>
                  <TableHead>Perfil</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="font-medium">{response.user_data.name}</TableCell>
                    <TableCell>{response.user_data.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{response.quiz_title}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(response.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{response.profile}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">Sem respostas ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
