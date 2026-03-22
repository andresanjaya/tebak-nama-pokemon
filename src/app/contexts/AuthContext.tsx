import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, authService } from '../services/supabaseClient';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user already logged in
    authService
      .getSession()
      .then((session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          });
        }
      })
      .catch((error) => console.error('Auth check failed:', error))
      .finally(() => setLoading(false));

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    await authService.login(email, password);
  };

  const register = async (email: string, password: string) => {
    await authService.register(email, password);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
