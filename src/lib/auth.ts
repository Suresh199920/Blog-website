import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export type AdminUser = {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
};

/**
 * Resolve the signed-in admin, or redirect to the login page.
 *
 * Call this inside every Server Action and admin page rather than
 * trusting the route guard alone: `proxy.ts` only improves the UX
 * for browser navigation, and Server Actions are POSTs that never
 * pass through it.
 */
export async function requireAdmin(): Promise<AdminUser | null> {
  if (!isSupabaseConfigured) {
    redirect("/admin/login?error=missing_env");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    redirect("/admin/login?error=not_admin");
  }

  return {
    id: user.id,
    email: user.email ?? "",
    displayName: (profile as Pick<Profile, "display_name">).display_name,
    role: profile.role,
  };
}

/** Same check, but returns `null` instead of redirecting. */
export async function getAdmin(): Promise<AdminUser | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") return null;

  return {
    id: user.id,
    email: user.email ?? "",
    displayName: (profile as Pick<Profile, "display_name">).display_name,
    role: profile.role,
  };
}