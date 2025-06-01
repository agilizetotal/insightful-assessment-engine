
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navigation } from "@/components/ui/navigation";
import Index from "./pages/Index";
import TakeQuiz from "./pages/quiz/TakeQuiz";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateQuiz from "./pages/admin/CreateQuiz";
import CreateNewQuiz from "./pages/admin/CreateNewQuiz";
import CreateScarfQuiz from "./pages/admin/CreateScarfQuiz";
import EditQuiz from "./pages/admin/EditQuiz";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";
import Auth from "./pages/auth/Auth";
import Checkout from "./pages/payment/Checkout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Navigation />
            <main>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/quiz/:quizId" element={<TakeQuiz />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/create" element={<CreateQuiz />} />
                <Route path="/admin/create-new" element={<CreateNewQuiz />} />
                <Route path="/admin/create-scarf" element={<CreateScarfQuiz />} />
                <Route path="/admin/edit-quiz/:quizId" element={<EditQuiz />} />
                <Route path="/admin/analytics" element={<Analytics />} />
                <Route path="/admin/settings" element={<Settings />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </main>
          </div>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
