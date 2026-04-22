import { z } from "zod"
import {
  apiSuccess,
  apiError,
  withAuth,
  validateBody,
  rateLimit,
  getClientIp,
} from "@/lib/api-utils"

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const NotificationSchema = z.object({
  minutesBefore: z.number().min(0),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(500),
})

const ScheduleBodySchema = z.object({
  minutes: z.number().min(0),
  notifications: z.array(NotificationSchema).min(1).max(20),
})

const DeleteBodySchema = z.object({
  timer_id: z.string().optional(),
})

// ---------------------------------------------------------------------------
// POST /api/push/schedule – schedule push notifications for a timer
// ---------------------------------------------------------------------------

export const POST = withAuth(async (req: Request, userId: string) => {
  const ip = getClientIp(req)
  const limit = rateLimit(`push-schedule:${ip}`, 20, 60_000)
  if (!limit.allowed) {
    return apiError("Too many requests. Please try again later.", 429)
  }

  const body = await validateBody(req, ScheduleBodySchema)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (supabaseUrl && supabaseServiceKey) {
    const { createAdminClient } = await import("@/lib/supabase/admin")
    const supabase = createAdminClient()

    const rows = body.notifications.map((n) => ({
      user_id: userId,
      title: n.title,
      body: n.body,
      send_at: new Date(
        Date.now() + (body.minutes - n.minutesBefore) * 60_000,
      ).toISOString(),
      sent: false,
    }))

    const { data, error } = await supabase
      .from("scheduled_push")
      .insert(rows)
      .select("id")

    if (error) {
      throw error
    }

    const ids = data?.map((row: { id: string }) => row.id) ?? []
    return apiSuccess({ scheduled: ids })
  }

  // No Supabase – return empty list (client-side fallback handles it)
  return apiSuccess({ scheduled: [] })
})

// ---------------------------------------------------------------------------
// DELETE /api/push/schedule – cancel pending scheduled notifications
// ---------------------------------------------------------------------------

export const DELETE = withAuth(async (req: Request, userId: string) => {
  const ip = getClientIp(req)
  const limit = rateLimit(`push-schedule-del:${ip}`, 20, 60_000)
  if (!limit.allowed) {
    return apiError("Too many requests. Please try again later.", 429)
  }

  const body = await validateBody(req, DeleteBodySchema)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (supabaseUrl && supabaseServiceKey) {
    const { createAdminClient } = await import("@/lib/supabase/admin")
    const supabase = createAdminClient()

    let query = supabase
      .from("scheduled_push")
      .update({ sent: true })
      .eq("user_id", userId)
      .eq("sent", false)

    if (body.timer_id) {
      query = query.eq("id", body.timer_id)
    }

    const { error } = await query

    if (error) {
      throw error
    }

    return apiSuccess({ cancelled: true })
  }

  return apiSuccess({ cancelled: true })
})
