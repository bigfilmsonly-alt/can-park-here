import { NextRequest, NextResponse } from "next/server"
import { createMiddlewareClient } from "@/lib/supabase/middleware"

// ---------------------------------------------------------------------------
// Route classification
// ---------------------------------------------------------------------------

/**
 * Public paths that never require authentication.
 *
 * Route-group parentheses (e.g. `(auth)`) are stripped from the URL by
 * Next.js, so `/signin` is the real pathname, not `/(auth)/signin`.
 */
const PUBLIC_PATHS = [
  "/",
  "/download",
  "/partners",
  "/widget",
  "/auth/callback",
  "/offline",
]

/** Auth-flow pages — authenticated users should be redirected away. */
const AUTH_PATHS = ["/signin", "/onboarding", "/permissions"]

/**
 * Protected app routes (under the (app) route group) plus top-level
 * protected pages like /fleet and /insurance.
 */
const APP_PATHS = [
  "/home",
  "/account",
  "/community",
  "/history",
  "/map",
  "/predictions",
  "/rewards",
  "/settings",
  "/status",
  "/fleet",
  "/insurance",
  "/accessibility",
  "/saved",
  "/insights",
]

/** API routes that are accessible without a session. */
const PUBLIC_API_PATHS = ["/api/health"]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function matchesPrefix(pathname: string, paths: string[]): boolean {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ----------------------------------------------------------------
  // Local / demo mode: when Supabase is not configured the entire app
  // runs with localStorage auth only. Let every request pass through.
  // ----------------------------------------------------------------
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next()
  }

  // ----------------------------------------------------------------
  // Create the Supabase middleware client and refresh the session.
  // `getUser()` sends the refresh-token request when needed and writes
  // updated cookies via the `setAll` callback.
  // ----------------------------------------------------------------
  const { supabase, getResponse } = createMiddlewareClient(request)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ----------------------------------------------------------------
  // 1. Public pages — always accessible, no auth check needed.
  // ----------------------------------------------------------------
  if (matchesPrefix(pathname, PUBLIC_PATHS)) {
    return getResponse()
  }

  // ----------------------------------------------------------------
  // 2. API routes — return 401 JSON for unauthenticated callers
  //    (except explicitly public endpoints like /api/health).
  // ----------------------------------------------------------------
  if (pathname.startsWith("/api/")) {
    if (!user && !matchesPrefix(pathname, PUBLIC_API_PATHS)) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      )
    }
    return getResponse()
  }

  // ----------------------------------------------------------------
  // 3. Auth pages — if the user is already authenticated, redirect
  //    them to the app home instead of showing sign-in / onboarding.
  // ----------------------------------------------------------------
  if (matchesPrefix(pathname, AUTH_PATHS)) {
    if (user) {
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = "/"
      homeUrl.search = ""
      return NextResponse.redirect(homeUrl)
    }
    // Not authenticated — allow access to the auth page.
    return getResponse()
  }

  // ----------------------------------------------------------------
  // 4. Protected app routes — redirect unauthenticated visitors to
  //    the sign-in page, preserving the originally-requested URL so
  //    we can redirect back after a successful login.
  // ----------------------------------------------------------------
  if (!user) {
    const signInUrl = request.nextUrl.clone()
    signInUrl.pathname = "/signin"
    signInUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // ----------------------------------------------------------------
  // 5. Onboarding redirect — if the authenticated user has not yet
  //    completed onboarding (no display name set), nudge them to the
  //    onboarding flow. Skip this check for the onboarding page itself
  //    to avoid a redirect loop.
  // ----------------------------------------------------------------
  if (matchesPrefix(pathname, APP_PATHS)) {
    const hasCompletedOnboarding =
      user.user_metadata?.display_name ||
      user.user_metadata?.onboarding_complete
    if (!hasCompletedOnboarding && pathname !== "/onboarding") {
      const onboardingUrl = request.nextUrl.clone()
      onboardingUrl.pathname = "/onboarding"
      onboardingUrl.search = ""
      return NextResponse.redirect(onboardingUrl)
    }
  }

  // ----------------------------------------------------------------
  // Authenticated and onboarded — allow through.
  // ----------------------------------------------------------------
  return getResponse()
}

// ---------------------------------------------------------------------------
// Matcher — limits the middleware to relevant routes, skipping static assets,
// Next.js internals, and common image/font files.
// ---------------------------------------------------------------------------
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *  - _next/static  (static files)
     *  - _next/image   (image optimisation)
     *  - favicon.ico   (browser favourite icon)
     *  - Common static asset extensions served from /public
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
}
