
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, BookOpen, User, Settings, BarChart4 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { translations } from "@/locales/pt-BR";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Se não estiver carregando e o usuário não estiver logado, redirecionar para a página de login
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-quiz-primary to-quiz-secondary">
            {translations.index.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {translations.index.subtitle}
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard 
            title={translations.index.createQuizzes}
            description={translations.index.createQuizzesDescription}
            icon={<BookOpen className="h-10 w-10 text-quiz-accent" />}
            link="/admin/create"
          />
          
          {!user && (
            <FeatureCard 
              title={translations.index.takeAssessment}
              description={translations.index.takeAssessmentDescription}
              icon={<User className="h-10 w-10 text-quiz-accent" />}
              link="/quiz/demo"
            />
          )}
          
          <FeatureCard 
            title={translations.index.viewAnalytics}
            description={translations.index.viewAnalyticsDescription}
            icon={<BarChart4 className="h-10 w-10 text-quiz-accent" />}
            link="/admin/analytics"
          />
          
          <FeatureCard 
            title={translations.index.adminPanel}
            description={translations.index.adminPanelDescription}
            icon={<Home className="h-10 w-10 text-quiz-accent" />}
            link="/admin"
            className={`md:col-span-2 lg:col-span-${user ? 2 : 1}`}
          />
          
          <FeatureCard 
            title={translations.index.settings}
            description={translations.index.settingsDescription}
            icon={<Settings className="h-10 w-10 text-quiz-accent" />}
            link="/admin/settings"
            className="md:col-span-2 lg:col-span-2"
          />
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">{translations.index.getStarted}</h2>
          <div className="flex justify-center gap-4">
            <Button asChild className="bg-quiz-primary hover:bg-quiz-secondary">
              <Link to="/admin/create-new">{translations.index.createQuiz}</Link>
            </Button>
            {!user && (
              <Button asChild variant="outline" className="border-quiz-primary text-quiz-primary hover:bg-quiz-light">
                <Link to="/quiz/demo">{translations.index.tryDemo}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, description, icon, link, className = "" }) => {
  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader>
        <div className="flex items-center space-x-3">
          {icon}
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" className="w-full text-quiz-primary hover:text-quiz-secondary hover:bg-quiz-light">
          <Link to={link}>{translations.common.edit}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Index;
