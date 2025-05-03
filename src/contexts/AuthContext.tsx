
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Define user roles
export type UserRole = 'admin' | 'viewer' | 'anonymous';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  userRole: UserRole;
  checkUserRole: () => Promise<UserRole>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  userRole: 'anonymous',
  checkUserRole: async () => 'anonymous',
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('anonymous');
  const navigate = useNavigate();

  // Function to check user's role
  const checkUserRole = async (): Promise<UserRole> => {
    if (!user) return 'anonymous';
    
    try {
      // Check if user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
        
      if (adminData) {
        setUserRole('admin');
        return 'admin';
      }
      
      // If not admin, check if user is a viewer
      const { data: viewerData, error: viewerError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'viewer')
        .maybeSingle();
        
      if (viewerData) {
        setUserRole('viewer');
        return 'viewer';
      }
      
      // Default to anonymous role
      setUserRole('anonymous');
      return 'anonymous';
    } catch (error) {
      console.error("Error checking user role:", error);
      setUserRole('anonymous');
      return 'anonymous';
    }
  };

  // Function to log out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logout realizado com sucesso");
      setUserRole('anonymous');
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  useEffect(() => {
    // Configure auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Evento de autenticação:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check user role when auth state changes
        if (session?.user) {
          setTimeout(() => {
            checkUserRole();
          }, 0);
        } else {
          setUserRole('anonymous');
        }
        
        setLoading(false);
        
        // Redirect based on auth event
        if (event === 'SIGNED_IN') {
          // Use setTimeout to avoid recursion issues
          setTimeout(() => {
            const currentPath = window.location.pathname;
            if (currentPath === '/auth') {
              navigate('/admin', { replace: true });
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          // Redirect to login when signed out
          setTimeout(() => {
            navigate('/auth', { replace: true });
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserRole();
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut, userRole, checkUserRole }}>
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
