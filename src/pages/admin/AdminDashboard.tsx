
import { QuizList } from "@/components/QuizList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus, BarChart, Calendar, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { translations } from "@/locales/pt-BR";

const AdminDashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto p-4 pt-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{translations.dashboard.title}</h1>
          <p className="text-gray-500">{translations.dashboard.subtitle}</p>
        </div>
        <Button asChild className="mt-4 md:mt-0 bg-quiz-primary hover:bg-quiz-secondary">
          <Link to="/admin/create">
            <FilePlus className="h-4 w-4 mr-2" />
            {translations.dashboard.createQuiz}
          </Link>
        </Button>
      </div>
      
      <div className="mb-6">
        <QuizList />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{translations.dashboard.quickActions}</CardTitle>
            <CardDescription>{translations.dashboard.commonTasks}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button asChild variant="outline" className="justify-start">
                <Link to="/admin/create">
                  <FilePlus className="h-4 w-4 mr-2" />
                  {translations.quiz.createNew}
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start">
                <Link to="/admin/analytics">
                  <BarChart className="h-4 w-4 mr-2" />
                  {translations.index.viewAnalytics}
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start">
                <Link to="/admin/responses">
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Respostas
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start">
                <Link to="/admin/settings">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Relatórios
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
