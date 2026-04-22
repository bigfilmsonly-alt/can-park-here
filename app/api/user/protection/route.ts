import {
  apiSuccess,
  apiError,
  withErrorHandler,
  rateLimit,
  getClientIp,
} from "@/lib/api-utils"

// ---------------------------------------------------------------------------
// GET /api/user/protection – read the user's protection / tier status
// ---------------------------------------------------------------------------

export const GET = withErrorHandler(async (request: Request) => {
  const ip = getClientIp(request)
  const limit = rateLimit(`user-protection:${ip}`, 60, 60_000)
  if (!limit.allowed) {
    return apiError("Too many requests. Please try again later.", 429)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // Not authenticated – return default free tier
      return apiSuccess({ protection: getDefaultProtection() })
    }

    const { data, error } = await supabase
      .from("users")
      .select("tier, checks_used, checks_reset_at")
      .eq("id", user.id)
      .single()

    if (error || !data) {
      // Row missing or error – return free defaults
      return apiSuccess({ protection: getDefaultProtection() })
    }

    const tier = (data.tier as "free" | "pro") ?? "free"
    const protection = {
      tier,
      checksThisMonth: data.checks_used ?? 0,
      checksLimit: tier === "pro" ? -1 : 10,
      claimsThisYear: 0,
      claimsLimit: tier === "pro" ? 3 : 0,
      maxClaimAmount: tier === "pro" ? 100 : 0,
    }

    return apiSuccess({ protection })
  }

  // No Supabase configured – return default free tier
  return apiSuccess({ protection: getDefaultProtection() })
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDefaultProtection() {
  return {
    tier: "free" as const,
    checksThisMonth: 0,
    checksLimit: 10,
    claimsThisYear: 0,
    claimsLimit: 0,
    maxClaimAmount: 0,
  }
}
