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
      createdAt
    }
  }
`;
