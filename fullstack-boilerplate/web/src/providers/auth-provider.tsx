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
import { ME_QUERY, MY_TENANT_QUERY, TENANT_USAGE_QUERY } from "@/graphql/queries";
import { usePermissions, type Permissions } from "@/hooks/use-permissions";
import type { User, Tenant, TenantUsage } from "@/types/auth";

const AUTH_TOKEN_KEY = "auth-token";

interface AuthContextValue {
  user: User | null;
  tenant: Tenant | null;
  usage: TenantUsage | null;
  permissions: Permissions;
  loading: boolean;
  login: (token: string, userData?: User) => Promise<void>;
  register: (token: string) => void;
  logout: () => void;
  refreshUsage: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [usage, setUsage] = useState<TenantUsage | null>(null);
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

  const [fetchUsage] = useLazyQuery(TENANT_USAGE_QUERY, {
    fetchPolicy: "network-only",
  });

  const loadTenantAndUsage = useCallback(async () => {
    try {
      const [tenantResult, usageResult] = await Promise.all([
        fetchTenant(),
        fetchUsage(),
      ]);
      setTenant(tenantResult.data?.myTenant ?? null);
      setUsage(usageResult.data?.tenantUsage ?? null);
    } catch {
      setTenant(null);
      setUsage(null);
    }
  }, [fetchTenant, fetchUsage]);

  const refreshUsage = useCallback(async () => {
    try {
      const [tenantResult, usageResult] = await Promise.all([
        fetchTenant(),
        fetchUsage(),
      ]);
      setTenant(tenantResult.data?.myTenant ?? null);
      setUsage(usageResult.data?.tenantUsage ?? null);
    } catch {
      /* keep current values */
    }
  }, [fetchTenant, fetchUsage]);

  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setUser(null);
      setTenant(null);
      setUsage(null);
      return;
    }

    setVerifying(true);
    try {
      const { data } = await fetchMe();
      setUser(data?.me ?? null);
      if (!data?.me) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      } else {
        await loadTenantAndUsage();
      }
    } catch {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setUser(null);
      setTenant(null);
      setUsage(null);
    } finally {
      setVerifying(false);
    }
  }, [fetchMe, loadTenantAndUsage]);

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
      await loadTenantAndUsage();
      router.push("/dashboard");
    },
    [client, router, fetchMe, loadTenantAndUsage],
  );

  const register = useCallback(() => {
    router.push("/login");
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    setTenant(null);
    setUsage(null);
    client.resetStore().catch(() => {});
    router.push("/login");
  }, [client, router]);

  const loading = !hydrated || verifying;
  const permissions = usePermissions(user, tenant, usage);

  const value: AuthContextValue = {
    user,
    tenant,
    usage,
    permissions,
    loading,
    login,
    register,
    logout,
    refreshUsage,
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
