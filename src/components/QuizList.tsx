
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Edit, 
  Eye, 
  BarChart, 
  Trash, 
  Search,
  Copy
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { translations } from "@/locales/pt-BR";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadQuizzes();
    }
  }, [user]);

  const loadQuizzes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*, quiz_responses(count)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedData = data.map(quiz => ({
        ...quiz,
        responses: quiz.quiz_responses?.[0]?.count || 0,
        status: 'active'
      }));

      setQuizzes(formattedData);
    } catch (error) {
      console.error("Erro ao carregar questionários:", error);
      toast.error("Erro ao carregar seus questionários");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuiz = async (id) => {
    try {
      await supabase.from('quiz_responses').delete().eq('quiz_id', id);
      await supabase.from('profile_ranges').delete().eq('quiz_id', id);
      
      const { data: questions } = await supabase
        .from('questions')
        .select('id')
        .eq('quiz_id', id);
      
      if (questions && questions.length > 0) {
        const questionIds = questions.map(q => q.id);
        
        await supabase.from('question_options').delete().in('question_id', questionIds);
        
        await supabase.from('questions').delete().eq('quiz_id', id);
      }
      
      const { error } = await supabase.from('quizzes').delete().eq('id', id);
      
      if (error) throw error;
      
      toast.success("Questionário excluído com sucesso");
      
      setQuizzes(quizzes.filter(quiz => quiz.id !== id));
    } catch (error) {
      console.error("Erro ao excluir questionário:", error);
      toast.error("Erro ao excluir questionário");
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h3 className="text-lg font-medium">Seus Questionários</h3>
          <div className="relative mt-2 md:mt-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar questionários"
              className="pl-8 w-full md:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableCaption>Lista dos seus questionários e estatísticas</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Data de criação</TableHead>
                <TableHead>Total de respostas</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuizzes.length > 0 ? (
                filteredQuizzes.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>
                      {format(new Date(quiz.created_at), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>{quiz.responses}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button size="sm" variant="ghost" asChild>
                          <Link to={`/admin/edit/${quiz.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost" asChild>
                          <Link to={`/quiz/${quiz.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deleteQuiz(quiz.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                    {searchQuery ? "Nenhum questionário encontrado com esta busca." : "Você ainda não criou questionários."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
