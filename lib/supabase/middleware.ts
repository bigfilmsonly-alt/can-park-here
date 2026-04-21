import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"

/**
 * Creates a Supabase client suitable for use in Next.js middleware.
 *
 * Unlike the server client (which reads cookies via next/headers), the
 * middleware client operates on the request/response cookie pair directly.
 * This lets us refresh the auth session and write updated tokens back into
 * the response before it reaches the browser.
 *
 * IMPORTANT: Always call `getResponse()` *after* any Supabase auth calls
 * (e.g. `getUser()`) to ensure you return the response that carries the
 * refreshed cookie values. The internal `supabaseResponse` reference is
 * reassigned inside `setAll`, so a plain property captured at creation
 * time would go stale.
 */
export function createMiddlewareClient(request: NextRequest) {
  // Start with a pass-through response that inherits the request headers.
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 1. Mirror every cookie onto the *request* so downstream Server
          //    Components / Route Handlers see the refreshed values.
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          // 2. Recreate the response so it carries the updated request
          //    cookies forward (Next.js infers request cookies from the
          //    response when they diverge).
          supabaseResponse = NextResponse.next({ request })

          // 3. Set the cookies on the outgoing *response* so the browser
          //    stores the refreshed tokens.
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  // Return a getter so the caller always receives the *latest* response
  // reference, even after setAll has reassigned it during token refresh.
  return {
    supabase,
    getResponse: () => supabaseResponse,
  }
}
