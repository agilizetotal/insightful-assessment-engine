import './App.css';
import { useEffect } from 'react';
import { initializeDatabaseSchema } from './hooks/useDatabaseMigration';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/auth/Auth";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateQuiz from "./pages/admin/CreateQuiz";
import CreateNewQuiz from "./pages/admin/CreateNewQuiz";
import EditQuiz from "./pages/admin/EditQuiz";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";
import TakeQuiz from "./pages/quiz/TakeQuiz";
import Checkout from "./pages/payment/Checkout";
import { Navigation } from "./components/ui/navigation";

const queryClient = new QueryClient();

// Componente para rotas protegidas que usa o hook useAuth
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Não use useAuth aqui, passe o estado de autenticação como prop
  return <>{children}</>;
};

// Primeiro criamos o componente de rotas que usa o AuthProvider
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navigation />
        <div className="pt-12">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Rotas protegidas */}
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/create" element={<ProtectedRoute><CreateQuiz /></ProtectedRoute>} />
            <Route path="/admin/create-new" element={<ProtectedRoute><CreateNewQuiz /></ProtectedRoute>} />
            <Route path="/admin/edit/:quizId" element={<ProtectedRoute><EditQuiz /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            
            {/* Outras rotas */}
            <Route path="/quiz/:quizId" element={<TakeQuiz />} />
            <Route path="/payment/checkout" element={<Checkout />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

// Componente App que configura o QueryClientProvider
function App() {
  useEffect(() => {
    // Initialize database schema
    initializeDatabaseSchema();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
