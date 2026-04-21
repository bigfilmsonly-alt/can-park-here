import { NextResponse } from "next/server"
import { z } from "zod"
import webPush from "web-push"
import { createClient } from "@/lib/supabase/server"

// ---------------------------------------------------------------------------
// Configure web-push with VAPID credentials
// ---------------------------------------------------------------------------

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_EMAIL = process.env.VAPID_EMAIL

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && VAPID_EMAIL) {
  webPush.setVapidDetails(
    `mailto:${VAPID_EMAIL}`,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const SendSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(500),
  url: z.string().optional().default("/"),
  tag: z.string().optional(),
})

// ---------------------------------------------------------------------------
// POST: send a push notification to a specific user
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    // Validate that VAPID is configured
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_EMAIL) {
      return NextResponse.json(
        { error: "Push notifications are not configured" },
        { status: 503 }
      )
    }

    const body = await request.json()
    const parsed = SendSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { userId, title, body: notifBody, url, tag } = parsed.data

    // Look up all push subscriptions for this user
    const supabase = await createClient()
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh_key, auth_key")
      .eq("user_id", userId)

    if (error) {
      console.error("Failed to look up subscriptions:", error)
      return NextResponse.json(
        { error: "Failed to look up subscriptions" },
        { status: 500 }
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No push subscriptions found for user", sent: 0 },
        { status: 404 }
      )
    }

    const payload = JSON.stringify({ title, body: notifBody, url, tag })

    // Send to all registered devices; collect results
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSub = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh_key,
            auth: sub.auth_key,
          },
        }

        try {
          await webPush.sendNotification(pushSub, payload)
          return { id: sub.id, success: true }
        } catch (err: unknown) {
          const statusCode =
            err && typeof err === "object" && "statusCode" in err
              ? (err as { statusCode: number }).statusCode
              : undefined

          // 404 or 410 means the subscription is no longer valid
          if (statusCode === 404 || statusCode === 410) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("id", sub.id)
            return { id: sub.id, success: false, expired: true }
          }

          console.error(`Push to ${sub.endpoint} failed:`, err)
          return { id: sub.id, success: false, expired: false }
        }
      })
    )

    const sent = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length
    const expired = results.filter(
      (r) => r.status === "fulfilled" && r.value.expired
    ).length

    return NextResponse.json({
      sent,
      expired,
      total: subscriptions.length,
    })
  } catch (error) {
    console.error("Push send error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
