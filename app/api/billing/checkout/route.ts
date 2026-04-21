import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createCheckoutSession, getAllowedPriceIds } from "@/lib/stripe"
import type { PlanName } from "@/lib/stripe"

const BodySchema = z.object({
  priceId: z.string().min(1, "priceId is required"),
  plan: z.enum(["pro", "fleet"]).optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = BodySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { priceId, plan } = parsed.data

    // Validate that the priceId is one of our known prices.
    const allowedPriceIds = getAllowedPriceIds()
    if (!allowedPriceIds.includes(priceId)) {
      return NextResponse.json(
        { error: "Invalid price ID" },
        { status: 400 },
      )
    }

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

    const session = await createCheckoutSession(
      user.id,
      user.email,
      priceId,
      plan as PlanName | undefined,
    )

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 },
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Billing checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    )
  }
}
