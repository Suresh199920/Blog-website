import { NextResponse, type NextRequest } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * Keeps the Supabase auth cookie fresh and bounces unauthenticated
 * visitors away from /admin.
 *
 * Only `/admin` touches auth. `getUser()` is a network round-trip, so
 * running it for public pages would put Supabase's latency (and any
 * outage retries) in front of every request. Public content reads from
 * the database directly, so it doesn't need it.
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === "/admin/login";

  if (!isSupabaseConfigured) {
    // Nothing can authenticate yet, so let /admin/login explain the setup.
    return NextResponse.next();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isLoginPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isLoginPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}