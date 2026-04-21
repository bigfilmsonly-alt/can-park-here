import { createClient } from "@/lib/supabase/server"
import {
  apiSuccess,
  apiError,
  withErrorHandler,
  rateLimit,
  getClientIp,
} from "@/lib/api-utils"

/** Columns returned to the client. */
const BADGE_COLUMNS = "id, user_id, badge_id, earned_at" as const

// ---------------------------------------------------------------------------
// GET /api/badges
// ---------------------------------------------------------------------------

export const GET = withErrorHandler(async (request: Request) => {
  const ip = getClientIp(request)
  const limit = rateLimit(`badges-get:${ip}`, 60, 60_000)
  if (!limit.allowed) {
    return apiError("Too many requests. Please try again later.", 429)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return apiError("Unauthorized", 401)
  }

  const { data, error } = await supabase
    .from("badges_earned")
    .select(BADGE_COLUMNS)
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false })

  if (error) {
    throw error
  }

  return apiSuccess({ badges: data ?? [] })
})
