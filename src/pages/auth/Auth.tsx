
import { AuthCard } from "@/components/auth/AuthCard";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Auth = () => {
  const { user } = useAuth();
  
  // Se o usuário já estiver logado, redirecionar para a página inicial
  if (user) {
    return <Navigate to="/admin" replace />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-quiz-primary to-quiz-secondary">
          Sistema de Avaliação Inteligente
        </h1>
        <AuthCard />
      </div>
    </div>
  );
};

export default Auth;
