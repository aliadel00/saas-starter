"use client";

import { useEffect, useState } from "react";
import { Role, type CreateUserInput } from "@/types/auth";

interface CreateUserModalProps {
  open: boolean;
  loading?: boolean;
  submitError?: string;
  currentUserRole?: Role;
  onClose: () => void;
  onSubmit: (input: CreateUserInput) => Promise<void>;
}

export function CreateUserModal({
  open,
  loading,
  submitError,
  currentUserRole,
  onClose,
  onSubmit,
}: CreateUserModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(Role.MEMBER);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      // Reset form state every time the modal opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("");
      setEmail("");
      setPassword("");
      setRole(Role.MEMBER);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      await onSubmit({
        email: email.trim(),
        password,
        role,
      });
      onClose();
    } catch {
      // Error is shown via submitError from mutation state.
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            New Admin or Member
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="new-user-email"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="new-user-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label
              htmlFor="new-user-password"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="new-user-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Use at least 8 characters.
            </p>
          </div>

          <div>
            <label
              htmlFor="new-user-role"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Role
            </label>
            <select
              id="new-user-role"
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {currentUserRole === Role.OWNER && (
                <option value={Role.ADMIN}>Admin</option>
              )}
              <option value={Role.MEMBER}>Member</option>
            </select>
          </div>

          {(error || submitError) && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {error || submitError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
