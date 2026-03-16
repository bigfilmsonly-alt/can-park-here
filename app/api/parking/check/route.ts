import { NextResponse } from "next/server"
import { z } from "zod"
import { checkParking } from "@/lib/parking-rules"

const BodySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accessibility: z
    .object({
      hasHandicapPlacard: z.boolean(),
      placardType: z.enum(["permanent", "temporary", "disabled-veteran"]).optional(),
      placardExpiry: z.string().optional(),
    })
    .optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = BodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { latitude, longitude, accessibility } = parsed.data
    const result = checkParking(latitude, longitude, accessibility ?? undefined)
    return NextResponse.json(result)
  } catch (e) {
    console.error("Parking check error:", e)
    return NextResponse.json({ error: "Failed to check parking" }, { status: 500 })
  }
}
