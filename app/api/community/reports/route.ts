import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

const ReportSchema = z.object({
  type: z.enum(["enforcement", "meter", "issue"]),
  subtype: z.string().min(1),
  coordinates_lat: z.number().min(-90).max(90),
  coordinates_lng: z.number().min(-180).max(180),
  address: z.string().optional(),
  description: z.string().optional(),
  expires_at: z.string().datetime().optional(),
})

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ reports: [] })
  }
  try {
    const { searchParams } = new URL(request.url)
    const lat = Number(searchParams.get("lat"))
    const lng = Number(searchParams.get("lng"))
    const radius = Number(searchParams.get("radius") ?? 1)

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return NextResponse.json({ error: "lat and lng required" }, { status: 400 })
    }

    const supabase = await createClient()
    const latDelta = radius / 111
    const lngDelta = radius / (111 * Math.cos((lat * Math.PI) / 180))
    const { data, error } = await supabase
      .from("community_reports")
      .select("*")
      .gte("coordinates_lat", lat - latDelta)
      .lte("coordinates_lat", lat + latDelta)
      .gte("coordinates_lng", lng - lngDelta)
      .lte("coordinates_lng", lng + lngDelta)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json({ reports: data ?? [] })
  } catch (e) {
    console.error("Community reports GET error:", e)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 501 })
  }
  try {
    const body = await request.json()
    const parsed = ReportSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("community_reports")
      .insert({
        user_id: user.id,
        type: parsed.data.type,
        subtype: parsed.data.subtype,
        coordinates_lat: parsed.data.coordinates_lat,
        coordinates_lng: parsed.data.coordinates_lng,
        address: parsed.data.address,
        description: parsed.data.description,
        expires_at: parsed.data.expires_at,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ report: data })
  } catch (e) {
    console.error("Community reports POST error:", e)
    return NextResponse.json({ error: "Failed to add report" }, { status: 500 })
  }
}
