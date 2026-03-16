/**
 * Database Abstraction Layer
 *
 * Uses Supabase when NEXT_PUBLIC_SUPABASE_URL is set, otherwise localStorage.
 */

import { isSupabaseConfigured } from "@/lib/supabase/client"
import * as local from "./db-local"
import * as supabase from "./db-supabase"

export type {
  DBUser,
  DBParkingSession,
  DBHistoryItem,
  DBSavedLocation,
  DBCommunityReport,
  DBPhotoEvidence,
} from "./db-types"

const useSupabase = () => typeof window !== "undefined" && isSupabaseConfigured()

// User
export async function dbGetUser() {
  return useSupabase() ? supabase.getSupabaseUser() : local.getLocalUser()
}

export async function dbCreateUser(email: string, name: string, password: string) {
  if (useSupabase()) throw new Error("Use Supabase Auth signUp instead")
  return local.createLocalUser(email, name, password)
}

export async function dbSignIn(email: string, password: string) {
  if (useSupabase()) throw new Error("Use Supabase Auth signIn instead")
  return local.signInLocal(email, password)
}

export async function dbSignOut() {
  if (useSupabase()) {
    const { createClient } = await import("@/lib/supabase/client")
    await createClient().auth.signOut()
    return
  }
  return local.signOutLocal()
}

export async function dbUpdateUser(updates: Parameters<typeof local.updateLocalUser>[0]) {
  return useSupabase() ? supabase.updateSupabaseUser(updates) : local.updateLocalUser(updates)
}

export async function dbUpdateUserStats(stat: keyof import("./db-types").DBUser["stats"], increment?: number) {
  return useSupabase()
    ? supabase.updateSupabaseUserStats(stat, increment)
    : local.updateLocalUserStats(stat, increment)
}

export async function dbUpdateUserPreferences(prefs: Partial<import("./db-types").DBUser["preferences"]>) {
  return useSupabase()
    ? supabase.updateSupabaseUserPreferences(prefs)
    : local.updateLocalUserPreferences(prefs)
}

// Sessions
export async function dbGetActiveSessions() {
  return useSupabase() ? supabase.getSupabaseActiveSessions() : local.getLocalActiveSessions()
}

export async function dbGetActiveSession() {
  return useSupabase() ? supabase.getSupabaseActiveSession() : local.getLocalActiveSession()
}

export async function dbCreateSession(session: Parameters<typeof local.createLocalSession>[0]) {
  return useSupabase() ? supabase.createSupabaseSession(session) : local.createLocalSession(session)
}

export async function dbEndSession(sessionId: string) {
  return useSupabase() ? supabase.endSupabaseSession(sessionId) : local.endLocalSession(sessionId)
}

export async function dbUpdateSession(sessionId: string, updates: Parameters<typeof local.updateLocalSession>[1]) {
  return useSupabase()
    ? supabase.updateSupabaseSession(sessionId, updates)
    : local.updateLocalSession(sessionId, updates)
}

// History
export async function dbGetHistory(limit?: number) {
  return useSupabase() ? supabase.getSupabaseHistory(limit ?? 20) : local.getLocalHistory(limit ?? 20)
}

export async function dbAddHistoryItem(item: Parameters<typeof local.addLocalHistoryItem>[0]) {
  return useSupabase() ? supabase.addSupabaseHistoryItem(item) : local.addLocalHistoryItem(item)
}

export async function dbClearHistory() {
  return useSupabase() ? supabase.clearSupabaseHistory() : local.clearLocalHistory()
}

// Saved locations
export async function dbGetSavedLocations() {
  return useSupabase() ? supabase.getSupabaseSavedLocations() : local.getLocalSavedLocations()
}

export async function dbSaveLocation(location: Parameters<typeof local.saveLocalLocation>[0]) {
  return useSupabase() ? supabase.saveSupabaseLocation(location) : local.saveLocalLocation(location)
}

export async function dbRemoveSavedLocation(locationId: string) {
  return useSupabase() ? supabase.removeSupabaseSavedLocation(locationId) : local.removeLocalSavedLocation(locationId)
}

// Community
export async function dbGetCommunityReports(lat: number, lng: number, radiusKm?: number) {
  return useSupabase()
    ? supabase.getSupabaseCommunityReports(lat, lng, radiusKm ?? 1)
    : local.getLocalCommunityReports(lat, lng, radiusKm ?? 1)
}

export async function dbAddCommunityReport(
  report: Parameters<typeof local.addLocalCommunityReport>[0]
) {
  return useSupabase()
    ? supabase.addSupabaseCommunityReport(report)
    : local.addLocalCommunityReport(report)
}

export async function dbVoteCommunityReport(reportId: string, vote: "up" | "down") {
  return useSupabase()
    ? supabase.voteSupabaseCommunityReport(reportId, vote)
    : local.voteLocalCommunityReport(reportId, vote)
}

// Photo evidence
export async function dbGetPhotoEvidence() {
  return useSupabase() ? supabase.getSupabasePhotoEvidence() : local.getLocalPhotoEvidence()
}

export async function dbAddPhotoEvidence(evidence: Parameters<typeof local.addLocalPhotoEvidence>[0]) {
  return useSupabase() ? supabase.addSupabasePhotoEvidence(evidence) : local.addLocalPhotoEvidence(evidence)
}

export async function dbDeletePhotoEvidence(evidenceId: string) {
  return useSupabase()
    ? supabase.deleteSupabasePhotoEvidence(evidenceId)
    : local.deleteLocalPhotoEvidence(evidenceId)
}

// Onboarding
export function dbIsOnboardingComplete(): boolean {
  if (useSupabase()) return supabase.getSupabaseOnboardingCompleteSync()
  return local.isLocalOnboardingComplete()
}

export function dbCompleteOnboarding(): void {
  if (useSupabase()) {
    supabase.completeSupabaseOnboarding().catch(console.error)
    return
  }
  local.completeLocalOnboarding()
}

export function dbResetOnboarding(): void {
  if (useSupabase()) {
    supabase.resetSupabaseOnboarding().catch(console.error)
    return
  }
  local.resetLocalOnboarding()
}

// Export / clear
export async function dbExportAll() {
  return useSupabase() ? supabase.exportSupabaseAll() : local.exportLocalAll()
}

export function dbClearAll(): void {
  if (useSupabase()) {
    void supabase.clearSupabaseAll()
    return
  }
  local.clearLocalAll()
}
