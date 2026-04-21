import { NextResponse } from "next/server"

/**
 * GET /api/health
 *
 * Lightweight liveness / readiness probe.  Returns service status and
 * whether Supabase is configured (the only integration that affects
 * runtime feature availability).
 *
 * Intentionally does NOT:
 *   - reveal which third-party API keys are configured (information disclosure)
 *   - perform a live Supabase query (too heavy for a liveness probe)
 *   - expose internal version numbers
 */
export async function GET() {
  const supabaseConfigured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        supabase: supabaseConfigured ? "configured" : "not_configured",
      },
    },
    {
      headers: {
        // Prevent caching so monitoring always gets a fresh probe.
        "Cache-Control": "no-store",
      },
    },
  )
}
