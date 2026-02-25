"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { RoleBadge } from "@/components/role-badge";
import { CreateUserModal } from "@/components/members/create-user-modal";
import { ChangePasswordModal } from "./change-password-modal";
import { DeleteUserModal } from "./delete-user-modal";
import { useTenantUsers } from "@/hooks/use-tenant-users";
import { useAuthContext } from "@/providers/auth-provider";
import { Role, type User } from "@/types/auth";

interface MembersSectionProps {
  title?: string;
  description?: string;
  onUpgradeClick?: () => void;
}

export function MembersSection({
  title = "Admins & Members",
  description = "Manage your team's access.",
  onUpgradeClick,
}: MembersSectionProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isMembersRoute =
    pathname === "/members" || pathname.startsWith("/members/");
  const { user, permissions, refreshUsage } = useAuthContext();
  const {
    users,
    loading,
    error,
    createUser,
    deleteUser,
    changeUserPassword,
    creating,
    deleting,
    changingPassword,
    createError,
    deleteError,
    changePasswordError,
  } = useTenantUsers();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const currentUserRole = user?.role;
  const canManageUsers = currentUserRole === Role.OWNER || currentUserRole === Role.ADMIN;
  const showMembersLimitState =
    canManageUsers && isMembersRoute && permissions.userLimitReached;

  const canManageTargetUser = (targetRole: Role) => {
    if (currentUserRole === Role.OWNER) {
      return targetRole !== Role.OWNER;
    }
    if (currentUserRole === Role.ADMIN) {
      return targetRole === Role.MEMBER;
    }
    return false;
  };

  const sortedUsers = useMemo(() => {
    const roleOrder: Record<Role, number> = {
      [Role.OWNER]: 0,
      [Role.ADMIN]: 1,
      [Role.MEMBER]: 2,
    };
    return [...users].sort((a, b) => {
      const byRole = roleOrder[a.role] - roleOrder[b.role];
      if (byRole !== 0) return byRole;
      return a.email.localeCompare(b.email);
    });
  }, [users]);

  const submitErrorMessage = createError?.message ?? undefined;

  const handleCreateUser = async (input: {
    email: string;
    password: string;
    role?: Role;
  }) => {
    try {
      await createUser(input);
      toast.success(`User ${input.email} added`);
      await refreshUsage();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add user");
      throw err;
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    const userEmail = deleteTarget.email;
    try {
      await deleteUser({ userId: deleteTarget.id });
      toast.success(`User ${userEmail} deleted`);
      setDeleteTarget(null);
      await refreshUsage();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
      throw err;
    }
  };

  const handleChangePassword = async (newPassword: string) => {
    if (!passwordTarget) return;
    const userEmail = passwordTarget.email;
    await changeUserPassword({
      userId: passwordTarget.id,
      newPassword,
    });
    toast.success(`Password updated for ${userEmail}`);
    setPasswordTarget(null);
  };

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
      return;
    }

    if (isMembersRoute) {
      router.push("/dashboard?upgrade=true");
    }
  };

  return (
    <>
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              {title}
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          </div>
          {canManageUsers &&
            (showMembersLimitState ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled
                  className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                  title="User limit reached"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Admin / Member
                </button>
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={!permissions.canChangePlan}
                  title={
                    permissions.canChangePlan
                      ? undefined
                      : "Only owners can change plans"
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-violet-300 bg-violet-50 px-4 py-2.5 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-violet-700 dark:bg-violet-900/20 dark:text-violet-300 dark:hover:bg-violet-900/40"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  Upgrade Plan
                </button>
              </div>
            ) : permissions.canCreateUser ? (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Admin / Member
              </button>
            ) : (
              <span
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                title={
                  permissions.planExpired
                    ? "Subscription expired"
                    : permissions.userLimitReached
                      ? "User limit reached"
                      : "Only owners/admins can create users"
                }
              >
                New Admin / Member
              </span>
            ))}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error.message}
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            <div className="h-10 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-10 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-10 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    User
                  </th>
                  <th className="py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Role
                  </th>
                  <th className="py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Joined
                  </th>
                  {canManageUsers && (
                    <th className="py-2 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sortedUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canManageUsers ? 4 : 3}
                      className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400"
                    >
                      No users found for this tenant.
                    </td>
                  </tr>
                ) : (
                  sortedUsers.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-zinc-100 last:border-none dark:border-zinc-800"
                    >
                      <td className="py-3 text-sm text-zinc-900 dark:text-zinc-100">
                        {member.email}
                      </td>
                      <td className="py-3">
                        <RoleBadge role={member.role} />
                      </td>
                      <td className="py-3 text-sm text-zinc-500 dark:text-zinc-400">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      {canManageUsers && (
                        <td className="py-3 text-right">
                          {permissions.canDeleteUser &&
                          canManageTargetUser(member.role) ? (
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setPasswordTarget(member)}
                                disabled={changingPassword}
                                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                              >
                                Change Password
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(member)}
                                disabled={deleting}
                                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400 dark:text-zinc-500">
                              -
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {(deleteError || changePasswordError) && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {deleteError?.message || changePasswordError?.message}
          </div>
        )}
      </section>

      <CreateUserModal
        open={showCreateModal}
        loading={creating}
        submitError={submitErrorMessage}
        currentUserRole={currentUserRole}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
      />
      <ChangePasswordModal
        open={!!passwordTarget}
        loading={changingPassword}
        submitError={changePasswordError?.message}
        userEmail={passwordTarget?.email}
        onClose={() => setPasswordTarget(null)}
        onSubmit={handleChangePassword}
      />
      <DeleteUserModal
        open={!!deleteTarget}
        loading={deleting}
        submitError={deleteError?.message}
        userEmail={deleteTarget?.email}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteUser}
      />
    </>
  );
}
