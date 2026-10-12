
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { authApi } from '../../api/api';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('flow_token'),
  );

  const logout = () => {
    localStorage.removeItem('flow_token');
    setToken(null);
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
    };

    window.addEventListener('flow:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener(
        'flow:unauthorized',
        handleUnauthorized,
      );
    };
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);

    localStorage.setItem('flow_token', response.access_token);
    setToken(response.access_token);
  };

  const register = async (email: string, password: string) => {
    await authApi.register(email, password);
    await login(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: Boolean(token),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth musi działać wewnątrz AuthProvider');
  }

  return context;
}
