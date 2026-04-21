/**
 * Authentication Layer — wraps Supabase Auth + profiles table.
 */

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import {
  dbGetUser,
  dbGetUserSync,
  dbSignOut,
  dbUpdateUser,
  dbUpdateUserStats,
  dbIsOnboardingComplete,
  dbCompleteOnboarding,
  dbResetOnboarding,
  refreshCache,
  clearCache,
  type DBUser,
} from "./db"

// ---------------------------------------------------------------------------
// App-level User type (camelCase, flattened from DBUser)
// ---------------------------------------------------------------------------

export type User = {
  id: string
  email: string
  name: string | null
  avatar?: string
  tier: "free" | "pro" | "fleet"
  city: string
  createdAt: string
  karma: number
  level: number
  streak: number
  totalChecks: number
  ticketsAvoided: number
  moneySaved: number
  referralCode: string | null
  handicapEnabled: boolean
  vehiclePlate: string | null
}

function toAppUser(dbUser: DBUser): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    tier: dbUser.tier,
    city: dbUser.city,
    createdAt: dbUser.created_at,
    karma: dbUser.karma,
    level: dbUser.level,
    streak: dbUser.streak,
    totalChecks: dbUser.stats.checks,
    ticketsAvoided: dbUser.stats.ticketsAvoided,
    moneySaved: dbUser.stats.moneySaved,
    referralCode: dbUser.referral_code,
    handicapEnabled: dbUser.handicap_enabled,
    vehiclePlate: dbUser.vehicle_plate,
  }
}

// ---------------------------------------------------------------------------
// Sign up
// ---------------------------------------------------------------------------

export async function signUp(
  email: string,
  password: string,
  name: string,
): Promise<{ success: boolean; user?: User; error?: string }> {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address" }
  }
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" }
  }
  if (!name || name.length < 2) {
    return { success: false, error: "Please enter your name" }
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: { name },
        emailRedirectTo: typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined,
      },
    })
    if (error) {
      if (error.message.includes("already registered")) {
        return { success: false, error: "An account with this email already exists" }
      }
      return { success: false, error: error.message }
    }
    if (!data.user) return { success: false, error: "Failed to create account" }

    await refreshCache()
    const dbUser = dbGetUserSync()
    return { success: true, user: dbUser ? toAppUser(dbUser) : undefined }
  } catch {
    return { success: false, error: "Failed to create account. Please try again." }
  }
}

// ---------------------------------------------------------------------------
// Sign in
// ---------------------------------------------------------------------------

export async function signIn(
  email: string,
  password: string,
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    })
    if (error) return { success: false, error: "Invalid email or password" }
    if (!data.user) return { success: false, error: "Invalid email or password" }

    await refreshCache()
    const dbUser = dbGetUserSync()
    return { success: true, user: dbUser ? toAppUser(dbUser) : undefined }
  } catch {
    return { success: false, error: "Failed to sign in. Please try again." }
  }
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------

export async function signOut(): Promise<void> {
  await dbSignOut()
  clearCache()
}

// ---------------------------------------------------------------------------
// Get current user
// ---------------------------------------------------------------------------

export async function getCurrentUser(): Promise<User | null> {
  const dbUser = await dbGetUser()
  return dbUser ? toAppUser(dbUser) : null
}

export function getCurrentUserSync(): User | null {
  const dbUser = dbGetUserSync()
  return dbUser ? toAppUser(dbUser) : null
}

// ---------------------------------------------------------------------------
// Update user
// ---------------------------------------------------------------------------

export async function updateUser(updates: Partial<User>): Promise<User | null> {
  const dbUpdates: Partial<DBUser> = {}
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.tier) dbUpdates.tier = updates.tier
  if (updates.city !== undefined) dbUpdates.city = updates.city
  if (updates.handicapEnabled !== undefined) dbUpdates.handicap_enabled = updates.handicapEnabled
  if (updates.vehiclePlate !== undefined) dbUpdates.vehicle_plate = updates.vehiclePlate

  const dbUser = await dbUpdateUser(dbUpdates)
  return dbUser ? toAppUser(dbUser) : null
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export async function incrementStats(
  type: "checks" | "ticketsAvoided" | "moneySaved",
  amount: number = 1,
): Promise<void> {
  await dbUpdateUserStats(type, amount)
}

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------

export function isOnboardingComplete(): boolean {
  return dbIsOnboardingComplete()
}

export async function completeOnboarding(): Promise<void> {
  await dbCompleteOnboarding()
}

export async function resetOnboarding(): Promise<void> {
  await dbResetOnboarding()
}

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------

export async function resetPassword(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: true }
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo: typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined,
    })
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch {
    return { success: false, error: "Failed to send reset email" }
  }
}
