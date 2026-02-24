export enum Role {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export enum SubscriptionPlan {
  FREE = "FREE",
  PRO = "PRO",
  ENTERPRISE = "ENTERPRISE",
}

export interface User {
  id: string;
  email: string;
  role: Role;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  plan: SubscriptionPlan;
  maxUsers: number;
  maxTasks: number;
  expiresAt: string | null;
  createdAt: string;
}

export interface TenantUsage {
  userCount: number;
  taskCount: number;
  maxUsers: number;
  maxTasks: number;
}

export interface CreateUserInput {
  email: string;
  password: string;
  role?: Role;
}

export interface DeleteTenantUserInput {
  userId: string;
}

export interface ChangeTenantUserPasswordInput {
  userId: string;
  newPassword: string;
}
