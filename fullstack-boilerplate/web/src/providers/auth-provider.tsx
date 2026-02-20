'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useApolloClient, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { ME_QUERY } from '@/graphql/queries';

const AUTH_TOKEN_KEY = 'auth-token';

export interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  register: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null
  );
  const client = useApolloClient();
  const router = useRouter();

  const { data, loading: meLoading, error: meError } = useQuery(ME_QUERY, {
    skip: !token,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (meError) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      client.clearStore();
    }
  }, [meError, client]);

  const user = meError ? null : (data?.me ?? null);

  const login = useCallback(
    (newToken: string) => {
      localStorage.setItem(AUTH_TOKEN_KEY, newToken);
      setToken(newToken);
      client.resetStore();
      router.push('/dashboard');
    },
    [client, router]
  );

  const register = useCallback(
    () => {
      router.push('/login');
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    client.clearStore();
    router.push('/login');
  }, [client, router]);

  const loading = !!token && (meLoading || (!user && !meError));

  const value: AuthContextValue = {
    user: token ? user : null,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
