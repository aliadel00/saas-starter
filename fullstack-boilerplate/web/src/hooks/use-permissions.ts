"use client";

import { useMemo } from "react";
import { Role } from "@/types/auth";
import type { User, Tenant, TenantUsage } from "@/types/auth";

export interface Permissions {
  canCreateUser: boolean;
  canDeleteUser: boolean;
  canCreateTask: boolean;
  canDeleteTask: boolean;
  canChangePlan: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  taskLimitReached: boolean;
  userLimitReached: boolean;
  planExpired: boolean;
}

function isAdminOrAbove(role: Role): boolean {
  return role === Role.OWNER || role === Role.ADMIN;
}

export function usePermissions(
  user: User | null,
  tenant: Tenant | null,
  usage: TenantUsage | null,
): Permissions {
  return useMemo(() => {
    if (!user || !tenant) {
      return {
        canCreateUser: false,
        canDeleteUser: false,
        canCreateTask: false,
        canDeleteTask: false,
        canChangePlan: false,
        isAdmin: false,
        isOwner: false,
        taskLimitReached: false,
        userLimitReached: false,
        planExpired: false,
      };
    }

    const expired = tenant.expiresAt
      ? new Date(tenant.expiresAt) < new Date()
      : false;

    const taskLimitReached =
      tenant.maxTasks !== -1 && !!usage && usage.taskCount >= tenant.maxTasks;

    const userLimitReached =
      tenant.maxUsers !== -1 && !!usage && usage.userCount >= tenant.maxUsers;

    const isOwner = user.role === Role.OWNER;
    const isAdmin = isAdminOrAbove(user.role);

    return {
      canCreateUser: isAdmin && !userLimitReached && !expired,
      canDeleteUser: isOwner,
      canCreateTask: !taskLimitReached && !expired,
      canDeleteTask: isAdmin,
      canChangePlan: isOwner,
      isAdmin,
      isOwner,
      taskLimitReached,
      userLimitReached,
      planExpired: expired,
    };
  }, [user, tenant, usage]);
}
