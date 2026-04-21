/**
 * Server-side push notification helpers using web-push.
 * Manages subscriptions in Supabase and sends notifications via VAPID.
 */

import * as webPush from "web-push"
import { createAdminClient } from "@/lib/supabase/admin"

// ---------------------------------------------------------------------------
// VAPID setup
// ---------------------------------------------------------------------------

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? ""
const VAPID_EMAIL = process.env.VAPID_EMAIL ?? "mailto:support@canparkhere.com"

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

// ---------------------------------------------------------------------------
// Subscription management
// ---------------------------------------------------------------------------

export type PushSubscriptionInput = {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

/** Save (or refresh) a push subscription for a user. */
export async function subscribePush(
  userId: string,
  subscription: PushSubscriptionInput,
): Promise<void> {
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh_key: subscription.keys.p256dh,
        auth_key: subscription.keys.auth,
        updated_at: now,
      },
      { onConflict: "user_id,endpoint" },
    )

  if (error) throw new Error(`Failed to save push subscription: ${error.message}`)
}

/** Remove a push subscription for a user by endpoint. */
export async function unsubscribePush(
  userId: string,
  endpoint: string,
): Promise<void> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", userId)
    .eq("endpoint", endpoint)

  if (error) throw new Error(`Failed to remove push subscription: ${error.message}`)
}

// ---------------------------------------------------------------------------
// Sending notifications
// ---------------------------------------------------------------------------

export type PushPayload = {
  title: string
  body: string
  icon?: string
  url?: string
  data?: Record<string, unknown>
}

/**
 * Send a push notification to all of a user's subscribed devices.
 * Returns the number of successfully delivered notifications.
 * Stale subscriptions (410 Gone) are automatically cleaned up.
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
): Promise<number> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn("VAPID keys not configured -- skipping push notification")
    return 0
  }

  const supabase = createAdminClient()
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh_key, auth_key")
    .eq("user_id", userId)

  if (error) throw new Error(`Failed to fetch push subscriptions: ${error.message}`)
  if (!subscriptions || subscriptions.length === 0) return 0

  const jsonPayload = JSON.stringify(payload)
  let delivered = 0
  const staleIds: string[] = []

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh_key,
              auth: sub.auth_key,
            },
          },
          jsonPayload,
        )
        delivered++
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          // Subscription no longer valid -- mark for cleanup
          staleIds.push(sub.id as string)
        } else {
          console.error(`Push failed for ${sub.endpoint}:`, err)
        }
      }
    }),
  )

  // Clean up stale subscriptions
  if (staleIds.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("id", staleIds)
  }

  return delivered
}
