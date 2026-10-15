import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Supabase client bound to the request's cookies.
 *
 * Same export name as the browser factory in `./client` so both
 * sides of the app can `createClient()` without caring which one
 * they imported.
 */

/** How long a single Supabase request may take before we give up. */
const SUPABASE_TIMEOUT_MS = 5000;

/**
 * How long to stop calling Supabase after a network failure.
 *
 * Without this, every page load pays the full timeout once per query
 * (the homepage fires seven). A single failure is enough to know the
 * project is unreachable, so subsequent calls fail immediately and the
 * page falls back to demo content straight away.
 */
const CIRCUIT_COOLDOWN_MS = 30_000;

/** Timestamp of the last network-level failure, shared per process. */
const circuitState = globalThis as typeof globalThis & {
  __supabaseCircuitOpenedAt?: number;
};

function isCircuitOpen(): boolean {
  const openedAt = circuitState.__supabaseCircuitOpenedAt ?? 0;
  return Date.now() - openedAt < CIRCUIT_COOLDOWN_MS;
}

/**
 * Build an error that supabase-js will not retry.
 *
 * supabase-js wraps every request in `fetchWithRetry`, which retries
 * idempotent methods (GET/HEAD/OPTIONS) on rejection with exponential
 * backoff (1s, 2s, 4s — 7s per request). It makes one exception:
 * `AbortError` propagates untouched. Tagging our fast-fail error as an
 * abort skips that backoff, which is the difference between a 14s page
 * and an instant one when the project is unreachable.
 */
function unreachableError(): Error {
  const error = new Error("Supabase unreachable; request skipped");
  error.name = "AbortError";
  (error as Error & { code?: string }).code = "ABORT_ERR";
  return error;
}

/**
 * Fetch with a hard timeout and a failure cooldown.
 *
 * Only network-level failures (DNS, connection, timeout) trip the
 * breaker. HTTP errors such as 404 or 500 resolve normally, so a
 * healthy-but-erroring project is never treated as offline.
 */
const fetchWithTimeout = async (
  input: Parameters<typeof fetch>[0],
  init?: RequestInit
) => {
  if (isCircuitOpen()) {
    throw unreachableError();
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    // `globalThis` so the cooldown survives dev-mode module reloads.
    circuitState.__supabaseCircuitOpenedAt = Date.now();
    // A timeout surfaces as a native AbortError, which is already
    // exempt from retries; leave it intact.
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database, "public">(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: fetchWithTimeout },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components can't set cookies. Only Route
            // Handlers and Server Actions can, and they do.
          }
        },
      },
    }
  );
}

export async function getSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Network-verified user. Prefer this over `getSession()` for auth checks. */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);