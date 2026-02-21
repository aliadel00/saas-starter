"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useApolloClient, useLazyQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { ME_QUERY, MY_TENANT_QUERY } from "@/graphql/queries";

const AUTH_TOKEN_KEY = "auth-token";

export interface User {
  id: string;
  email: string;
  role: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  createdAt: string;
}

interface AuthContextValue {
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  login: (token: string, userData?: User) => Promise<void>;
  register: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const client = useApolloClient();
  const router = useRouter();

  const [fetchMe] = useLazyQuery(ME_QUERY, {
    fetchPolicy: "network-only",
  });

  const [fetchTenant] = useLazyQuery(MY_TENANT_QUERY, {
    fetchPolicy: "network-only",
  });

  const loadTenant = useCallback(async () => {
    try {
      const { data } = await fetchTenant();
      setTenant(data?.myTenant ?? null);
    } catch {
      setTenant(null);
    }
  }, [fetchTenant]);

  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setUser(null);
      setTenant(null);
      return;
    }

    setVerifying(true);
    try {
      const { data } = await fetchMe();
      setUser(data?.me ?? null);
      if (!data?.me) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      } else {
        await loadTenant();
      }
    } catch {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setUser(null);
      setTenant(null);
    } finally {
      setVerifying(false);
    }
  }, [fetchMe, loadTenant]);

  useEffect(() => {
    verifyToken().then(() => setHydrated(true));
  }, [verifyToken]);

  const login = useCallback(
    async (newToken: string, userData?: User) => {
      localStorage.setItem(AUTH_TOKEN_KEY, newToken);
      await client.clearStore().catch(() => {});
      if (userData) {
        setUser(userData);
      } else {
        const { data } = await fetchMe();
        setUser(data?.me ?? null);
      }
      await loadTenant();
      router.push("/dashboard");
    },
    [client, router, fetchMe, loadTenant],
  );

  const register = useCallback(() => {
    router.push("/login");
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    setTenant(null);
    client.resetStore().catch(() => {});
    router.push("/login");
  }, [client, router]);

  const loading = !hydrated || verifying;

  const value: AuthContextValue = {
    user,
    tenant,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
