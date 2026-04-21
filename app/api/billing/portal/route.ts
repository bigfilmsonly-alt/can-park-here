import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getOrCreateCustomer, createPortalSession } from "@/lib/stripe"

export async function POST() {
  try {
    // Authenticate the user via Supabase server-side client.
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      )
    }

    // Look up the user's stripe_customer_id from their profile first.
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single()

    let customerId: string

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id as string
    } else {
      // Fallback: find or create the customer via Stripe API.
      const customer = await getOrCreateCustomer(user.id, user.email)
      customerId = customer.id
    }

    const session = await createPortalSession(customerId)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Billing portal error:", error)
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 },
    )
  }
}
