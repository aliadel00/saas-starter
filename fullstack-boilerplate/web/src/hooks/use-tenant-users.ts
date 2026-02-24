"use client";

import { useMutation, useQuery } from "@apollo/client";
import {
  CHANGE_TENANT_USER_PASSWORD_MUTATION,
  CREATE_USER_MUTATION,
  DELETE_TENANT_USER_MUTATION,
} from "@/graphql/mutations";
import { TENANT_USAGE_QUERY, TENANT_USERS_QUERY } from "@/graphql/queries";
import {
  Role,
  type ChangeTenantUserPasswordInput,
  type CreateUserInput,
  type DeleteTenantUserInput,
  type User,
} from "@/types/auth";

interface TenantUsersQueryData {
  tenantUsers: User[];
}

interface CreateUserMutationData {
  createUser: User;
}

interface CreateUserMutationVariables {
  input: CreateUserInput;
}

interface DeleteUserMutationData {
  deleteTenantUser: User;
}

interface DeleteUserMutationVariables {
  input: DeleteTenantUserInput;
}

interface ChangeUserPasswordMutationData {
  changeTenantUserPassword: User;
}

interface ChangeUserPasswordMutationVariables {
  input: ChangeTenantUserPasswordInput;
}

export function useTenantUsers() {
  const { data, loading, error, refetch } = useQuery<TenantUsersQueryData>(
    TENANT_USERS_QUERY,
    {
      fetchPolicy: "cache-and-network",
    },
  );

  const [createUserMutation, { loading: creating, error: createError }] =
    useMutation<CreateUserMutationData, CreateUserMutationVariables>(
      CREATE_USER_MUTATION,
      {
        refetchQueries: [TENANT_USERS_QUERY, TENANT_USAGE_QUERY],
        awaitRefetchQueries: true,
      },
    );

  const [deleteUserMutation, { loading: deleting, error: deleteError }] =
    useMutation<DeleteUserMutationData, DeleteUserMutationVariables>(
      DELETE_TENANT_USER_MUTATION,
      {
        refetchQueries: [TENANT_USERS_QUERY, TENANT_USAGE_QUERY],
        awaitRefetchQueries: true,
      },
    );

  const [
    changePasswordMutation,
    { loading: changingPassword, error: changePasswordError },
  ] = useMutation<
    ChangeUserPasswordMutationData,
    ChangeUserPasswordMutationVariables
  >(CHANGE_TENANT_USER_PASSWORD_MUTATION, {
    refetchQueries: [TENANT_USERS_QUERY],
    awaitRefetchQueries: true,
  });

  const createUser = async (input: CreateUserInput) => {
    const role = input.role ?? Role.MEMBER;
    return createUserMutation({
      variables: {
        input: {
          email: input.email,
          password: input.password,
          role,
        },
      },
    });
  };

  const deleteUser = async (input: DeleteTenantUserInput) => {
    return deleteUserMutation({
      variables: { input },
    });
  };

  const changeUserPassword = async (input: ChangeTenantUserPasswordInput) => {
    return changePasswordMutation({
      variables: { input },
    });
  };

  return {
    users: data?.tenantUsers ?? [],
    loading,
    error,
    refetch,
    createUser,
    deleteUser,
    changeUserPassword,
    creating,
    deleting,
    changingPassword,
    createError,
    deleteError,
    changePasswordError,
  };
}
