import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-50 font-sans dark:bg-zinc-950">
      <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
        Fullstack Boilerplate
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Apollo auth with login, register, and protected dashboard
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="rounded-lg border border-zinc-300 px-6 py-2 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Sign up
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-zinc-300 px-6 py-2 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
