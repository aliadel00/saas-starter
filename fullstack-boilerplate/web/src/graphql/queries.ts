import { gql } from "@apollo/client";

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      role
      tenantId
      createdAt
      updatedAt
    }
  }
`;

export const MY_TENANT_QUERY = gql`
  query MyTenant {
    myTenant {
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

export const TENANT_USAGE_QUERY = gql`
  query TenantUsage {
    tenantUsage {
      userCount
      taskCount
      maxUsers
      maxTasks
    }
  }
`;

export const TENANT_USERS_QUERY = gql`
  query TenantUsers {
    tenantUsers {
      id
      email
      role
      tenantId
      createdAt
      updatedAt
    }
  }
`;
