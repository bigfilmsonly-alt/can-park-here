import { checkParkingV2 as checkParking } from "@/lib/parking-engine"
import { ParkingCheckBodySchema } from "@/lib/validation"
import {
  apiSuccess,
  apiError,
  withErrorHandler,
  validateBody,
  rateLimit,
  getClientIp,
} from "@/lib/api-utils"

const FREE_CHECK_LIMIT = 10

/**
 * POST /api/parking/check
 *
 * Accepts { latitude, longitude, accessibility? } and returns a
 * ParkingResult describing whether parking is allowed at that location.
 *
 * When Supabase is configured and the user is authenticated, enforces
 * server-side free-tier check limits (resets monthly).
 */
export const POST = withErrorHandler(async (request: Request) => {
  // Rate limit: 30 requests per minute per IP
  const ip = getClientIp(request)
  const limit = rateLimit(`parking-check:${ip}`, 30, 60_000)
  if (!limit.allowed) {
    return apiError("Too many requests. Please try again later.", 429)
  }

  const { latitude, longitude, accessibility, street, city } = await validateBody(
    request,
    ParkingCheckBodySchema,
  )

  // ---------------------------------------------------------------------------
  // Server-side free check limit enforcement
  // ---------------------------------------------------------------------------

  let userId: string | null = null
  let checksUsed = 0
  let remainingChecks: number | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let supabase: any = null

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    try {
      const { createClient } = await import("@/lib/supabase/server")
      supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        userId = user.id

        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("tier, checks_used, checks_reset_at")
          .eq("id", userId)
          .single()

        if (!profileError && profile) {
          checksUsed = profile.checks_used ?? 0
          const resetAt = profile.checks_reset_at
            ? new Date(profile.checks_reset_at)
            : null

          // Reset counter if checks_reset_at is from a previous calendar month
          const now = new Date()
          if (
            !resetAt ||
            resetAt.getFullYear() !== now.getFullYear() ||
            resetAt.getMonth() !== now.getMonth()
          ) {
            checksUsed = 0
            await supabase
              .from("users")
              .update({
                checks_used: 0,
                checks_reset_at: now.toISOString(),
              })
              .eq("id", userId)
          }

          // Enforce limit for free tier
          if (profile.tier === "free" && checksUsed >= FREE_CHECK_LIMIT) {
            return apiError("Free check limit reached", 402, {
              upgrade: true,
              remaining: 0,
            })
          }

          // Calculate remaining checks (unlimited for paid tiers)
          remainingChecks =
            profile.tier === "free"
              ? FREE_CHECK_LIMIT - checksUsed - 1
              : null
        }
      }
    } catch {
      // Supabase unavailable – fall through to demo mode
    }
  }

  // ---------------------------------------------------------------------------
  // Perform the parking check
  // ---------------------------------------------------------------------------

  const result = checkParking(latitude, longitude, accessibility ?? undefined, street, city)

  // ---------------------------------------------------------------------------
  // Increment checks_used for authenticated users
  // ---------------------------------------------------------------------------

  if (userId && supabase) {
    try {
      await supabase
        .from("users")
        .update({ checks_used: checksUsed + 1 })
        .eq("id", userId)
    } catch {
      // Non-critical – don't fail the request
    }
  }

  // Include remaining_checks when we know the user
  if (remainingChecks !== null) {
    return apiSuccess({ ...result, remaining_checks: remainingChecks })
  }

  return apiSuccess(result)
})
