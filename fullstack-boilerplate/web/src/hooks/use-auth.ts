"use client";

import { useMutation } from "@apollo/client";
import { useAuthContext } from "@/providers/auth-provider";
import { LOGIN_MUTATION, REGISTER_MUTATION } from "@/graphql/mutations";

export function useAuth() {
  const {
    user,
    tenant,
    usage,
    permissions,
    loading,
    login,
    register,
    logout,
    refreshUsage,
  } = useAuthContext();

  const [loginMutation, { loading: loginLoading, error: loginError }] =
    useMutation(LOGIN_MUTATION, {
      onCompleted: (data) => {
        login(data.login.token, data.login.user);
      },
    });

  const [registerMutation, { loading: registerLoading, error: registerError }] =
    useMutation(REGISTER_MUTATION, {
      onCompleted: (data) => {
        register(data.register.token);
      },
    });

  const handleLogin = (email: string, password: string) => {
    return loginMutation({
      variables: { input: { email, password } },
    });
  };

  const handleRegister = (
    email: string,
    password: string,
    tenantName?: string,
  ) => {
    return registerMutation({
      variables: { input: { email, password, tenantName } },
    });
  };

  return {
    user,
    tenant,
    usage,
    permissions,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout,
    refreshUsage,
    loginLoading,
    registerLoading,
    loginError,
    registerError,
  };
}
