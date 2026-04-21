import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { stripe, planFromPriceId } from "@/lib/stripe"
import type { PlanName } from "@/lib/stripe"

function getSupabaseAdmin() {
  return createAdminClient()
}

// ---------------------------------------------------------------------------
// Plan updater
// ---------------------------------------------------------------------------

async function updateUserPlan(
  supabaseUserId: string,
  plan: PlanName,
  stripeCustomerId: string,
  stripeSubscriptionId: string | null,
  periodEnd: Date | null,
): Promise<void> {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from("profiles")
    .update({
      plan,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      plan_expires_at: periodEnd ? periodEnd.toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", supabaseUserId)

  if (error) {
    console.error(
      `Failed to update plan for user ${supabaseUserId}:`,
      error.message,
    )
    throw error
  }

  console.log(
    `Updated user ${supabaseUserId} to plan "${plan}" ` +
      `(customer ${stripeCustomerId}, subscription ${stripeSubscriptionId ?? "none"})`,
  )
}

// ---------------------------------------------------------------------------
// Resolve Supabase user ID from Stripe objects
// ---------------------------------------------------------------------------

function resolveUserId(
  metadata: Stripe.Metadata | null | undefined,
): string | null {
  return metadata?.supabase_user_id ?? null
}

async function resolveUserIdFromCustomer(
  customerId: string,
): Promise<string | null> {
  const customer = await stripe.customers.retrieve(customerId)
  if (customer.deleted) return null
  return resolveUserId(customer.metadata)
}

// ---------------------------------------------------------------------------
// Webhook handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set")
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    )
  }

  // Read the raw body for signature verification.
  const rawBody = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`Webhook signature verification failed: ${message}`)
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 },
    )
  }

  try {
    switch (event.type) {
      // -----------------------------------------------------------------
      // Checkout completed -- user just subscribed
      // -----------------------------------------------------------------
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode !== "subscription" || !session.subscription) {
          break
        }

        const userId = resolveUserId(session.metadata)
        if (!userId) {
          console.error(
            "checkout.session.completed: no supabase_user_id in metadata",
          )
          break
        }

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id

        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId,
          { expand: ["items.data.price"] },
        )

        const firstItem = subscription.items.data[0]
        const priceId = firstItem?.price?.id
        const plan = priceId ? planFromPriceId(priceId) : "free"
        const periodEnd = firstItem
          ? new Date(firstItem.current_period_end * 1000)
          : null

        await updateUserPlan(
          userId,
          plan,
          session.customer as string,
          subscription.id,
          periodEnd,
        )
        break
      }

      // -----------------------------------------------------------------
      // Subscription updated (upgrade, downgrade, renewal)
      // -----------------------------------------------------------------
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        const userId =
          resolveUserId(subscription.metadata) ??
          (await resolveUserIdFromCustomer(subscription.customer as string))

        if (!userId) {
          console.error(
            "customer.subscription.updated: could not resolve supabase_user_id",
          )
          break
        }

        const status = subscription.status
        if (status === "active" || status === "trialing") {
          const subItem = subscription.items.data[0]
          const priceId = subItem?.price?.id
          const plan = priceId ? planFromPriceId(priceId) : "free"
          const periodEnd = subItem
            ? new Date(subItem.current_period_end * 1000)
            : null

          await updateUserPlan(
            userId,
            plan,
            subscription.customer as string,
            subscription.id,
            periodEnd,
          )
        } else if (
          status === "canceled" ||
          status === "unpaid" ||
          status === "past_due"
        ) {
          // Downgrade to free when subscription is no longer active.
          await updateUserPlan(
            userId,
            "free",
            subscription.customer as string,
            subscription.id,
            null,
          )
        }
        break
      }

      // -----------------------------------------------------------------
      // Subscription deleted (cancelled and period ended)
      // -----------------------------------------------------------------
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        const userId =
          resolveUserId(subscription.metadata) ??
          (await resolveUserIdFromCustomer(subscription.customer as string))

        if (!userId) {
          console.error(
            "customer.subscription.deleted: could not resolve supabase_user_id",
          )
          break
        }

        await updateUserPlan(
          userId,
          "free",
          subscription.customer as string,
          null,
          null,
        )
        break
      }

      // -----------------------------------------------------------------
      // Payment failed -- log for monitoring; the subscription.updated
      // event will handle the status change.
      // -----------------------------------------------------------------
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice

        // In the dahlia API version, the subscription reference lives under
        // invoice.parent.subscription_details.subscription.
        const subRef =
          invoice.parent?.subscription_details?.subscription ?? null
        const subscriptionId =
          typeof subRef === "string" ? subRef : subRef?.id ?? null

        const userId = subscriptionId
          ? await (async () => {
              const sub = await stripe.subscriptions.retrieve(subscriptionId)
              return (
                resolveUserId(sub.metadata) ??
                (await resolveUserIdFromCustomer(
                  invoice.customer as string,
                ))
              )
            })()
          : null

        console.error(
          `Payment failed for customer ${invoice.customer as string}` +
            (userId ? ` (user ${userId})` : "") +
            `: invoice ${invoice.id}`,
        )
        break
      }

      default:
        // Unhandled event type -- acknowledge receipt.
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`Error processing webhook event ${event.type}:`, error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    )
  }
}
