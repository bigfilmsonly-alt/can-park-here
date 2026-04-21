import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { subscribePush, unsubscribePush } from "@/lib/push"

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const SubscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
})

const UnsubscribeSchema = z.object({
  endpoint: z.string().url(),
})

// ---------------------------------------------------------------------------
// POST -- save a push subscription
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = SubscribeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await subscribePush(user.id, parsed.data)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Push subscribe POST error:", e)
    return NextResponse.json(
      { error: "Failed to save push subscription" },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// DELETE -- remove a push subscription
// ---------------------------------------------------------------------------

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const parsed = UnsubscribeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await unsubscribePush(user.id, parsed.data.endpoint)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Push subscribe DELETE error:", e)
    return NextResponse.json(
      { error: "Failed to remove push subscription" },
      { status: 500 },
    )
  }
}
