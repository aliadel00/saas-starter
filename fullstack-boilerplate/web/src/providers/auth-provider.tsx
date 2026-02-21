'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useApolloClient, useLazyQuery } from '@apollo/client';
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
  login: (token: string, userData?: User) => void;
  register: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const client = useApolloClient();
  const router = useRouter();

  const [fetchMe] = useLazyQuery(ME_QUERY, {
    fetchPolicy: 'network-only',
  });

  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setUser(null);
      return;
    }

    setVerifying(true);
    try {
      const { data } = await fetchMe();
      setUser(data?.me ?? null);
      if (!data?.me) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    } catch {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setUser(null);
    } finally {
      setVerifying(false);
    }
  }, [fetchMe]);

  useEffect(() => {
    verifyToken().then(() => setHydrated(true));
  }, [verifyToken]);

  const login = useCallback(
    (newToken: string, userData?: User) => {
      localStorage.setItem(AUTH_TOKEN_KEY, newToken);
      client.clearStore().catch(() => {});
      if (userData) {
        setUser(userData);
        router.push('/dashboard');
      } else {
        fetchMe()
          .then(({ data }) => {
            setUser(data?.me ?? null);
            router.push('/dashboard');
          })
          .catch(() => {});
      }
    },
    [client, router, fetchMe]
  );

  const register = useCallback(
    () => {
      router.push('/login');
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    client.resetStore().catch(() => {});
    router.push('/login');
  }, [client, router]);

  const loading = !hydrated || verifying;

  const value: AuthContextValue = {
    user,
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
