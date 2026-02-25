"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationPopover } from "@/components/notifications/notification-popover";
import { useAuth } from "@/hooks/use-auth";
import { SubscriptionBadge } from "@/components/subscription-badge";
import { RoleBadge } from "@/components/role-badge";
import type { Role, SubscriptionPlan } from "@/types/auth";

function AccountPopover({
  email,
  role,
  tenantName,
  tenantPlan,
  onLogout,
}: {
  email: string;
  role: Role;
  tenantName?: string;
  tenantPlan?: SubscriptionPlan;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initial = email.charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onScroll() {
      setOpen(false);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-white text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {initial}
      </button>

      {open && (
        <div className="fixed left-0 right-0 top-14 z-50 w-full max-w-none overflow-hidden border border-zinc-200 bg-white shadow-lg md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:w-[min(22rem,calc(100vw-2rem))] md:rounded-xl dark:border-zinc-700 dark:bg-zinc-900">
          <div className="space-y-4 border-b border-zinc-100 px-4 py-4 dark:border-zinc-800">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Email
                </p>
                <RoleBadge role={role} />
              </div>
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {email}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Subscription
              </p>
              {tenantPlan ? (
                <div>
                  <SubscriptionBadge plan={tenantPlan} />
                </div>
              ) : (
                <p className="text-sm text-zinc-600 dark:text-zinc-300">No active plan</p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Tenant
              </p>
              {tenantName ? (
                <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {tenantName}
                </div>
              ) : (
                <p className="text-sm text-zinc-600 dark:text-zinc-300">No tenant assigned</p>
              )}
            </div>
          </div>
          <div className="p-3">
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppHeader() {
  const { user, tenant, logout } = useAuth();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/tasks", label: "Tasks" },
    { href: "/members", label: "Admins & Members" },
  ];

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300 text-zinc-700 transition-colors hover:bg-zinc-100 md:hidden dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((prev) => !prev)}
          >
            <span
              className={`text-lg leading-none transition-transform duration-300 ${
                mobileNavOpen ? "rotate-90" : "rotate-0"
              }`}
            >
              {mobileNavOpen ? "\u00d7" : "\u2630"}
            </span>
          </button>
          <nav className="hidden items-center gap-2 md:flex">
            {navLinks.map(({ href, label }) => {
              const isActive =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center justify-end gap-2">
            <NotificationPopover />
            <ThemeToggle />
            {user && (
              <AccountPopover
                email={user.email}
                role={user.role}
                tenantName={tenant?.name}
                tenantPlan={tenant?.plan}
                onLogout={logout}
              />
            )}
          </div>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
            mobileNavOpen
              ? "mt-3 max-h-64 opacity-100"
              : "mt-0 max-h-0 opacity-0"
          }`}
          aria-hidden={!mobileNavOpen}
        >
          <nav
            className={`space-y-2 border-t border-zinc-200 pt-3 transition-transform duration-300 ease-in-out dark:border-zinc-700 ${
              mobileNavOpen ? "translate-y-0" : "-translate-y-1"
            }`}
          >
            {navLinks.map(({ href, label }) => {
              const isActive =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
