"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; ok?: boolean };

const credentialsSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function signInAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Deliberately vague, so this can't be used to probe for accounts.
    return { error: "Email or password is incorrect" };
  }

  // Credentials are valid. Confirm the account actually has the admin
  // role before letting the client redirect into /admin, otherwise a
  // signed-in non-admin would land on an error page with no way back.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    // Navigation is left to the client. A `redirect()` thrown from
    // inside a `useActionState` action gets serialised as a plain action
    // result, so React never sees the redirect and the browser throws
    // "An unexpected response was received from the server".
    if (profile?.role === "admin") return { ok: true };

    // Signed in, but not an admin. End the session so the login form
    // is usable again, and explain why.
    await supabase.auth.signOut();
    return {
      error: "That account doesn't have admin access. Ask the site owner to promote it.",
    };
  }

  return {};
}