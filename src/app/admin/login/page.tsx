import type { Metadata } from "next";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

const MESSAGES: Record<string, string> = {
  missing_env:
    "This site isn't connected to Supabase yet. Add your project URL and anon key to .env.local to enable the admin area.",
  not_admin:
    "That account doesn't have admin access. Promote it in Supabase by setting its profiles.role to 'admin'.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = error ? MESSAGES[error] : undefined;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-16">
      <div className="text-center">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-neutral-900"
        >
          Blog
        </Link>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-neutral-900">
          Admin sign in
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Only accounts with the admin role can get in.
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        {isSupabaseConfigured ? (
          <LoginForm message={message} />
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-900">
            {MESSAGES.missing_env}
          </div>
        )}
      </div>

      <Link
        href="/"
        className="mt-6 text-center text-sm text-neutral-500 hover:text-neutral-700"
      >
        ← Back to the site
      </Link>
    </div>
  );
}