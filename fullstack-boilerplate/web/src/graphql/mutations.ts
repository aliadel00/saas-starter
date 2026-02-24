import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        role
        tenantId
        createdAt
        updatedAt
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        role
        tenantId
        createdAt
        updatedAt
      }
    }
  }
`;

export const CHANGE_PLAN_MUTATION = gql`
  mutation ChangePlan($input: ChangePlanInput!) {
    changePlan(input: $input) {
      id
      name
      plan
      maxUsers
      maxTasks
      expiresAt
      createdAt
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
      role
      tenantId
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_TENANT_USER_MUTATION = gql`
  mutation DeleteTenantUser($input: DeleteTenantUserInput!) {
    deleteTenantUser(input: $input) {
      id
      email
      role
      tenantId
      createdAt
      updatedAt
    }
  }
`;

export const CHANGE_TENANT_USER_PASSWORD_MUTATION = gql`
  mutation ChangeTenantUserPassword($input: ChangeTenantUserPasswordInput!) {
    changeTenantUserPassword(input: $input) {
      id
      email
      role
      tenantId
      createdAt
      updatedAt
    }
  }
`;
