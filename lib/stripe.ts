/**
 * Stripe billing integration.
 *
 * Provides helpers for customer management, Checkout sessions,
 * Customer Portal sessions, and subscription status queries.
 *
 * Server-side only -- never import this from client components.
 */

import Stripe from "stripe"

// ---------------------------------------------------------------------------
// Stripe client (server-side only)
// ---------------------------------------------------------------------------

let _stripe: Stripe | null = null

/** Lazily initialised Stripe client – avoids crashing at build time when env vars aren't set. */
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set")
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
    })
  }
  return _stripe
}

/** @deprecated Use getStripe() instead. Kept for existing imports. */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

// ---------------------------------------------------------------------------
// Price ID helpers
// ---------------------------------------------------------------------------

export type PlanName = "free" | "pro" | "fleet"

/** Returns the set of known price IDs from environment variables. */
export function getPriceIds() {
  return {
    pro: process.env.STRIPE_PRO_PRICE_ID ?? null,
    fleetStarter: process.env.STRIPE_FLEET_STARTER_PRICE_ID ?? null,
    fleetPro: process.env.STRIPE_FLEET_PRO_PRICE_ID ?? null,
    fleetEnterprise: process.env.STRIPE_FLEET_ENTERPRISE_PRICE_ID ?? null,
  }
}

/** Returns all configured price IDs as a flat array (excludes unset ones). */
export function getAllowedPriceIds(): string[] {
  const ids = getPriceIds()
  return [ids.pro, ids.fleetStarter, ids.fleetPro, ids.fleetEnterprise].filter(
    (id): id is string => id !== null,
  )
}

/** Maps a Stripe Price ID back to the application plan name. */
export function planFromPriceId(priceId: string): PlanName {
  const ids = getPriceIds()

  if (priceId === ids.pro) return "pro"

  if (
    priceId === ids.fleetStarter ||
    priceId === ids.fleetPro ||
    priceId === ids.fleetEnterprise
  ) {
    return "fleet"
  }

  return "free"
}

// ---------------------------------------------------------------------------
// Customer helpers
// ---------------------------------------------------------------------------

/**
 * Finds an existing Stripe customer by Supabase user ID (stored in metadata),
 * or creates a new one if none exists.
 */
export async function getOrCreateCustomer(
  userId: string,
  email: string,
): Promise<Stripe.Customer> {
  // Search by metadata first -- this is the most reliable link.
  const existing = await stripe.customers.search({
    query: `metadata["supabase_user_id"]:"${userId}"`,
  })

  if (existing.data.length > 0) {
    return existing.data[0]
  }

  // Create a new customer.
  const customer = await stripe.customers.create({
    email,
    metadata: { supabase_user_id: userId },
  })

  return customer
}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

/**
 * Creates a Stripe Checkout session in `subscription` mode.
 *
 * @param userId  - Supabase user ID, stored in subscription metadata.
 * @param email   - User email, used to find or create the Stripe customer.
 * @param priceId - Stripe price ID for the chosen plan.
 * @param plan    - Application plan name (stored in metadata for convenience).
 * @returns The full Checkout Session object (caller typically needs `.url`).
 */
export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string,
  plan: PlanName = planFromPriceId(priceId),
): Promise<Stripe.Checkout.Session> {
  const customer = await getOrCreateCustomer(userId, email)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL environment variable is not set")
  }

  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/account?checkout=success`,
    cancel_url: `${appUrl}/account?checkout=cancelled`,
    subscription_data: {
      metadata: { supabase_user_id: userId, plan },
    },
    metadata: { supabase_user_id: userId, plan },
  })

  return session
}

// ---------------------------------------------------------------------------
// Customer Portal
// ---------------------------------------------------------------------------

/**
 * Creates a Stripe Customer Portal session so the user can manage their
 * subscription (upgrade, downgrade, cancel, update payment method).
 */
export async function createPortalSession(
  customerId: string,
): Promise<Stripe.BillingPortal.Session> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL environment variable is not set")
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/account`,
  })

  return session
}

// ---------------------------------------------------------------------------
// Subscription status
// ---------------------------------------------------------------------------

export interface SubscriptionStatus {
  active: boolean
  priceId: string | null
  plan: PlanName
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
}

/**
 * Returns the first active (or trialing) subscription for a customer,
 * or a default "free" status when none exists.
 */
export async function getSubscriptionStatus(
  customerId: string,
): Promise<SubscriptionStatus> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 1,
    expand: ["data.items.data.price"],
  })

  if (subscriptions.data.length === 0) {
    // Also check for trialing subscriptions.
    const trialing = await stripe.subscriptions.list({
      customer: customerId,
      status: "trialing",
      limit: 1,
      expand: ["data.items.data.price"],
    })

    if (trialing.data.length === 0) {
      return {
        active: false,
        priceId: null,
        plan: "free",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      }
    }

    subscriptions.data = trialing.data
  }

  const sub = subscriptions.data[0]
  const firstItem = sub.items.data[0]
  const priceId = firstItem?.price?.id ?? null
  const plan = priceId ? planFromPriceId(priceId) : "free"
  const periodEnd = firstItem?.current_period_end
    ? new Date(firstItem.current_period_end * 1000)
    : null

  return {
    active: true,
    priceId,
    plan,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  }
}
