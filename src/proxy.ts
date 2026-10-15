import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/proxy";

/**
 * Next.js 16 renamed `middleware` to `proxy`. This file is a thin
 * delegate; the logic lives in `src/lib/proxy.ts`.
 *
 * Proxy only improves the UX for browser navigation. Server Actions
 * are POSTs that bypass it entirely, so every action re-checks
 * authorization itself via `requireAdmin()`.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};