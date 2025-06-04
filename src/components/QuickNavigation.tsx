
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Settings, FileText } from 'lucide-react';

const QuickNavigation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Se o usuário está logado, navegar automaticamente para admin após 2 segundos
    if (user) {
      const timer = setTimeout(() => {
        navigate('/admin');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-center text-green-600">
          Login realizado com sucesso!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-gray-600">
          Redirecionando para o painel administrativo...
        </p>
        
        <div className="flex flex-col space-y-2">
          <Button 
            onClick={() => navigate('/admin')}
            className="w-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            Ir para Admin
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <Button 
            onClick={() => navigate('/admin/create-scarf-quiz')}
            variant="outline"
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-2" />
            Criar Quiz SCARF
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickNavigation;
