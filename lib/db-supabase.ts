/**
 * Supabase implementation of the database layer.
 * Used when NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.
 */

import { createClient } from "@/lib/supabase/client"
import type {
  DBUser,
  DBParkingSession,
  DBHistoryItem,
  DBSavedLocation,
  DBCommunityReport,
  DBPhotoEvidence,
} from "./db-types"

type ProfileRow = {
  id: string
  email: string
  name: string
  plan: string
  plan_expires_at: string | null
  stats: { checks: number; tickets_avoided: number; money_saved: number }
  preferences: Record<string, unknown>
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

function profileToDBUser(p: ProfileRow): DBUser {
  return {
    id: p.id,
    email: p.email,
    name: p.name,
    created_at: p.created_at,
    updated_at: p.updated_at,
    plan: p.plan as "free" | "pro" | "fleet",
    plan_expires_at: p.plan_expires_at ?? undefined,
    stats: p.stats,
    preferences: {
      notifications_enabled: (p.preferences?.notifications_enabled as boolean) ?? true,
      city: (p.preferences?.city as string) ?? "",
      handicap_enabled: (p.preferences?.handicap_enabled as boolean) ?? false,
      handicap_placard_type: p.preferences?.handicap_placard_type as string | undefined,
      biometric_enabled: (p.preferences?.biometric_enabled as boolean) ?? false,
    },
  }
}

const ONBOARDING_CACHE_KEY = "park_onboarding_complete"

export async function getSupabaseUser(): Promise<DBUser | null> {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single()

  if (!profile) return null
  const row = profile as ProfileRow
  if (typeof window !== "undefined" && row.onboarding_complete) {
    try { localStorage.setItem(ONBOARDING_CACHE_KEY, "1") } catch { /* ignore */ }
  }
  return profileToDBUser(row)
}

export async function updateSupabaseUser(updates: Partial<DBUser>): Promise<DBUser | null> {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (updates.name) payload.name = updates.name
  if (updates.plan) payload.plan = updates.plan
  if (updates.stats) payload.stats = updates.stats
  if (updates.preferences) payload.preferences = updates.preferences
  if (updates.plan_expires_at !== undefined) payload.plan_expires_at = updates.plan_expires_at

  const { data } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", authUser.id)
    .select()
    .single()

  return data ? profileToDBUser(data as ProfileRow) : null
}

export async function updateSupabaseUserStats(stat: keyof DBUser["stats"], increment: number = 1): Promise<void> {
  const user = await getSupabaseUser()
  if (!user) return
  const stats = { ...user.stats, [stat]: user.stats[stat] + increment }
  await updateSupabaseUser({ stats })
}

export async function updateSupabaseUserPreferences(prefs: Partial<DBUser["preferences"]>): Promise<void> {
  const user = await getSupabaseUser()
  if (!user) return
  await updateSupabaseUser({ preferences: { ...user.preferences, ...prefs } })
}

export async function getSupabaseActiveSessions(): Promise<DBParkingSession[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("parking_sessions")
    .select("*")
    .eq("user_id", user.id)
    .is("ended_at", null)
    .order("started_at", { ascending: false })

  return (data ?? []) as DBParkingSession[]
}

export async function getSupabaseActiveSession(): Promise<DBParkingSession | null> {
  const sessions = await getSupabaseActiveSessions()
  return sessions[0] ?? null
}

export async function createSupabaseSession(
  session: Omit<DBParkingSession, "id" | "user_id">
): Promise<DBParkingSession> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Sign in required to start a parking session")

  const { data, error } = await supabase
    .from("parking_sessions")
    .insert({
      user_id: user.id,
      location_address: session.location_address,
      location_street: session.location_street,
      coordinates_lat: session.coordinates_lat,
      coordinates_lng: session.coordinates_lng,
      status: session.status,
      started_at: session.started_at,
      time_limit_minutes: session.time_limit_minutes,
      is_protected: session.is_protected,
      reminder_set: session.reminder_set,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return mapSessionRow(data)
}

function mapSessionRow(row: Record<string, unknown>): DBParkingSession {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    location_address: row.location_address as string,
    location_street: row.location_street as string,
    coordinates_lat: row.coordinates_lat as number,
    coordinates_lng: row.coordinates_lng as number,
    status: row.status as "allowed" | "restricted" | "prohibited",
    started_at: row.started_at as string,
    ended_at: (row.ended_at as string) ?? undefined,
    time_limit_minutes: row.time_limit_minutes as number | undefined,
    is_protected: (row.is_protected as boolean) ?? false,
    reminder_set: (row.reminder_set as boolean) ?? false,
  }
}

export async function endSupabaseSession(sessionId: string): Promise<void> {
  const supabase = createClient()
  await supabase
    .from("parking_sessions")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", sessionId)
}

export async function updateSupabaseSession(
  sessionId: string,
  updates: Partial<DBParkingSession>
): Promise<void> {
  const supabase = createClient()
  await supabase.from("parking_sessions").update(updates).eq("id", sessionId)
}

export async function getSupabaseHistory(limit: number = 20): Promise<DBHistoryItem[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("history")
    .select("*")
    .eq("user_id", user.id)
    .order("checked_at", { ascending: false })
    .limit(limit)

  return (data ?? []).map(mapHistoryRow) as DBHistoryItem[]
}

function mapHistoryRow(row: Record<string, unknown>): DBHistoryItem {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    location_address: row.location_address as string,
    location_street: row.location_street as string,
    coordinates_lat: row.coordinates_lat as number,
    coordinates_lng: row.coordinates_lng as number,
    status: row.status as "allowed" | "restricted" | "prohibited",
    checked_at: row.checked_at as string,
    result_json: row.result_json as string,
  }
}

export async function addSupabaseHistoryItem(
  item: Omit<DBHistoryItem, "id" | "user_id">
): Promise<DBHistoryItem> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Sign in required")

  const { data, error } = await supabase
    .from("history")
    .insert({
      user_id: user.id,
      location_address: item.location_address,
      location_street: item.location_street,
      coordinates_lat: item.coordinates_lat,
      coordinates_lng: item.coordinates_lng,
      status: item.status,
      checked_at: item.checked_at,
      result_json: item.result_json,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return mapHistoryRow(data)
}

export async function clearSupabaseHistory(): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from("history").delete().eq("user_id", user.id)
}

export async function getSupabaseSavedLocations(): Promise<DBSavedLocation[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("saved_locations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    user_id: row.user_id as string,
    name: row.name as string,
    address: row.address as string,
    coordinates_lat: row.coordinates_lat as number,
    coordinates_lng: row.coordinates_lng as number,
    created_at: row.created_at as string,
  }))
}

export async function saveSupabaseLocation(
  location: Omit<DBSavedLocation, "id" | "user_id" | "created_at">
): Promise<DBSavedLocation> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Sign in required")

  const { data, error } = await supabase
    .from("saved_locations")
    .insert({
      user_id: user.id,
      name: location.name,
      address: location.address,
      coordinates_lat: location.coordinates_lat,
      coordinates_lng: location.coordinates_lng,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as DBSavedLocation
}

export async function removeSupabaseSavedLocation(locationId: string): Promise<void> {
  const supabase = createClient()
  await supabase.from("saved_locations").delete().eq("id", locationId)
}

export async function getSupabaseCommunityReports(
  lat: number,
  lng: number,
  radiusKm: number = 1
): Promise<DBCommunityReport[]> {
  const supabase = createClient()
  const latDelta = radiusKm / 111
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180))
  const { data } = await supabase
    .from("community_reports")
    .select("*")
    .gte("coordinates_lat", lat - latDelta)
    .lte("coordinates_lat", lat + latDelta)
    .gte("coordinates_lng", lng - lngDelta)
    .lte("coordinates_lng", lng + lngDelta)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order("created_at", { ascending: false })

  return (data ?? []).map(mapReportRow) as DBCommunityReport[]
}

function mapReportRow(row: Record<string, unknown>): DBCommunityReport {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    type: row.type as "enforcement" | "meter" | "issue",
    subtype: row.subtype as string,
    coordinates_lat: row.coordinates_lat as number,
    coordinates_lng: row.coordinates_lng as number,
    address: row.address as string | undefined,
    description: row.description as string | undefined,
    created_at: row.created_at as string,
    expires_at: row.expires_at as string | undefined,
    upvotes: (row.upvotes as number) ?? 0,
    downvotes: (row.downvotes as number) ?? 0,
  }
}

export async function addSupabaseCommunityReport(
  report: Omit<DBCommunityReport, "id" | "user_id" | "created_at" | "upvotes" | "downvotes">
): Promise<DBCommunityReport> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Sign in required")

  const { data, error } = await supabase
    .from("community_reports")
    .insert({
      user_id: user.id,
      type: report.type,
      subtype: report.subtype,
      coordinates_lat: report.coordinates_lat,
      coordinates_lng: report.coordinates_lng,
      address: report.address,
      description: report.description,
      expires_at: report.expires_at,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return mapReportRow(data)
}

export async function voteSupabaseCommunityReport(reportId: string, vote: "up" | "down"): Promise<void> {
  const supabase = createClient()
  const { data: report } = await supabase
    .from("community_reports")
    .select("upvotes, downvotes")
    .eq("id", reportId)
    .single()

  if (!report) return
  const upvotes = (report.upvotes as number) + (vote === "up" ? 1 : 0)
  const downvotes = (report.downvotes as number) + (vote === "down" ? 1 : 0)
  await supabase.from("community_reports").update({ upvotes, downvotes }).eq("id", reportId)
}

export async function getSupabasePhotoEvidence(): Promise<DBPhotoEvidence[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("photo_evidence")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (data ?? []).map(mapPhotoRow) as DBPhotoEvidence[]
}

function mapPhotoRow(row: Record<string, unknown>): DBPhotoEvidence {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    type: row.type as "sign" | "meter" | "ticket" | "receipt",
    photo_url: row.photo_url as string,
    coordinates_lat: row.coordinates_lat as number | undefined,
    coordinates_lng: row.coordinates_lng as number | undefined,
    address: row.address as string | undefined,
    notes: row.notes as string | undefined,
    created_at: row.created_at as string,
  }
}

export async function addSupabasePhotoEvidence(
  evidence: Omit<DBPhotoEvidence, "id" | "user_id" | "created_at">
): Promise<DBPhotoEvidence> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Sign in required")

  const { data, error } = await supabase
    .from("photo_evidence")
    .insert({
      user_id: user.id,
      type: evidence.type,
      photo_url: evidence.photo_url,
      coordinates_lat: evidence.coordinates_lat,
      coordinates_lng: evidence.coordinates_lng,
      address: evidence.address,
      notes: evidence.notes,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return mapPhotoRow(data)
}

export async function deleteSupabasePhotoEvidence(evidenceId: string): Promise<void> {
  const supabase = createClient()
  await supabase.from("photo_evidence").delete().eq("id", evidenceId)
}

export async function isSupabaseOnboardingComplete(): Promise<boolean> {
  if (typeof window !== "undefined") {
    try {
      if (localStorage.getItem(ONBOARDING_CACHE_KEY) === "1") return true
    } catch { /* ignore */ }
  }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_complete")
    .eq("id", user.id)
    .single()

  const complete = (profile?.onboarding_complete as boolean) ?? false
  if (complete && typeof window !== "undefined") {
    try { localStorage.setItem(ONBOARDING_CACHE_KEY, "1") } catch { /* ignore */ }
  }
  return complete
}

export function getSupabaseOnboardingCompleteSync(): boolean {
  if (typeof window === "undefined") return false
  try {
    return localStorage.getItem(ONBOARDING_CACHE_KEY) === "1"
  } catch {
    return false
  }
}

export async function completeSupabaseOnboarding(): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from("profiles")
    .update({ onboarding_complete: true })
    .eq("id", user.id)
  if (typeof window !== "undefined") {
    try { localStorage.setItem(ONBOARDING_CACHE_KEY, "1") } catch { /* ignore */ }
  }
}

export async function resetSupabaseOnboarding(): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from("profiles")
    .update({ onboarding_complete: false })
    .eq("id", user.id)
  if (typeof window !== "undefined") {
    try { localStorage.removeItem(ONBOARDING_CACHE_KEY) } catch { /* ignore */ }
  }
}

export async function exportSupabaseAll(): Promise<Record<string, unknown>> {
  const user = await getSupabaseUser()
  const sessions = await getSupabaseActiveSessions()
  const history = await getSupabaseHistory(100)
  const savedLocations = await getSupabaseSavedLocations()
  const reports = await getSupabaseCommunityReports(0, 0, 1000)
  const photoEvidence = await getSupabasePhotoEvidence()
  const onboardingComplete = await isSupabaseOnboardingComplete()

  return {
    user,
    sessions,
    history,
    savedLocations,
    communityReports: reports,
    photoEvidence,
    onboardingComplete,
  }
}

export async function clearSupabaseAll(): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from("parking_sessions").delete().eq("user_id", user.id)
  await supabase.from("history").delete().eq("user_id", user.id)
  await supabase.from("saved_locations").delete().eq("user_id", user.id)
  await supabase.from("photo_evidence").delete().eq("user_id", user.id)
}
