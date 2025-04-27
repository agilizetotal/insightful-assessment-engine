
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Função para fazer logout
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth', { replace: true });
      toast.success("Logout realizado com sucesso");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  useEffect(() => {
    // Configurar o listener de alteração de estado de autenticação PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Evento de autenticação:", event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Redirecionar com base no evento de autenticação
        if (event === 'SIGNED_IN') {
          // Usar setTimeout para evitar possíveis problemas de recursão
          setTimeout(() => {
            const currentPath = window.location.pathname;
            if (currentPath === '/auth') {
              navigate('/admin', { replace: true });
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          // Redirecionar para login quando desconectado
          setTimeout(() => {
            navigate('/auth', { replace: true });
          }, 0);
        }
      }
    );

    // DEPOIS verificar a sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
