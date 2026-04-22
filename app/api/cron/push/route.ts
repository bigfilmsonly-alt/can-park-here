import { apiSuccess, withErrorHandler } from "@/lib/api-utils"

// ---------------------------------------------------------------------------
// GET /api/cron/push – process due scheduled push notifications
// ---------------------------------------------------------------------------

export const GET = withErrorHandler(async (_req: Request) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return apiSuccess({ processed: 0 })
  }

  const { createAdminClient } = await import("@/lib/supabase/admin")
  const supabase = createAdminClient()

  // Fetch all due, unsent notifications
  const { data: pending, error: fetchError } = await supabase
    .from("scheduled_push")
    .select("id, user_id, title, body")
    .eq("sent", false)
    .lte("send_at", new Date().toISOString())
    .limit(100)

  if (fetchError) {
    throw fetchError
  }

  if (!pending || pending.length === 0) {
    return apiSuccess({ processed: 0 })
  }

  let sent = 0

  // Try to use sendPushToUser from lib/push.ts
  let sendPush: ((userId: string, payload: { title: string; body: string }) => Promise<number>) | null = null
  try {
    const pushModule = await import("@/lib/push")
    sendPush = pushModule.sendPushToUser
  } catch {
    // Push module not available (e.g. web-push not installed)
  }

  const processedIds: string[] = []

  for (const row of pending) {
    try {
      if (sendPush) {
        await sendPush(row.user_id, {
          title: row.title,
          body: row.body,
        })
      }
      sent++
    } catch (err) {
      console.error(`Failed to send push ${row.id}:`, err)
    }
    processedIds.push(row.id)
  }

  // Mark all processed rows as sent
  if (processedIds.length > 0) {
    const { error: updateError } = await supabase
      .from("scheduled_push")
      .update({ sent: true })
      .in("id", processedIds)

    if (updateError) {
      console.error("Failed to mark notifications as sent:", updateError)
    }
  }

  return apiSuccess({ processed: processedIds.length, sent })
})
