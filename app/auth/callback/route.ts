import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

/**
 * OAuth / magic-link callback handler for Supabase Auth.
 *
 * After a user authenticates via an external provider (Google, GitHub, etc.)
 * or clicks a magic-link / email-confirmation link, Supabase redirects them
 * to this route with a `code` query parameter. We exchange that code for a
 * session, then redirect the user into the app.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Called from a Server Component context; ignore.
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successful exchange — redirect to the intended destination.
      const forwardUrl = request.nextUrl.clone()
      forwardUrl.pathname = next
      forwardUrl.searchParams.delete("code")
      forwardUrl.searchParams.delete("next")
      return NextResponse.redirect(forwardUrl)
    }
  }

  // If there's no code or the exchange failed, redirect to sign-in with an
  // error indicator so the UI can show a message.
  const errorUrl = request.nextUrl.clone()
  errorUrl.pathname = "/signin"
  errorUrl.searchParams.set("error", "auth_callback_failed")
  return NextResponse.redirect(errorUrl)
}
