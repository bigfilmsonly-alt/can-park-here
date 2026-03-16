/**
 * Authentication Layer
 * Uses Supabase Auth when configured, otherwise database layer (localStorage).
 */

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import {
  dbGetUser,
  dbCreateUser,
  dbSignIn,
  dbSignOut,
  dbUpdateUser,
  dbUpdateUserStats,
  dbIsOnboardingComplete,
  dbCompleteOnboarding,
  type DBUser,
} from "./db"

const USER_CACHE_KEY = "park_user_cache"

// Re-export User type for backward compatibility
export type User = {
  id: string
  email: string
  name: string
  avatar?: string
  plan: "free" | "pro" | "fleet"
  createdAt: string
  totalChecks: number
  ticketsAvoided: number
  moneySaved: number
}

// Convert DB user to app User type
function toAppUser(dbUser: DBUser): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    plan: dbUser.plan,
    createdAt: dbUser.created_at,
    totalChecks: dbUser.stats.checks,
    ticketsAvoided: dbUser.stats.tickets_avoided,
    moneySaved: dbUser.stats.money_saved,
  }
}

function cacheUser(user: User): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user))
  } catch { /* ignore */ }
}

// Sign up
export async function signUp(
  email: string,
  password: string,
  name: string
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

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: { data: { name } },
      })
      if (error) {
        if (error.message.includes("already registered")) {
          return { success: false, error: "An account with this email already exists" }
        }
        return { success: false, error: error.message }
      }
      if (!data.user) return { success: false, error: "Failed to create account" }
      const dbUser = await dbGetUser()
      if (dbUser) {
        cacheUser(toAppUser(dbUser))
        return { success: true, user: toAppUser(dbUser) }
      }
      return { success: true, user: undefined }
    } catch (e) {
      return { success: false, error: "Failed to create account. Please try again." }
    }
  }

  try {
    const existing = await dbSignIn(email, password)
    if (existing) {
      return { success: false, error: "An account with this email already exists" }
    }
    const dbUser = await dbCreateUser(email.toLowerCase(), name, password)
    cacheUser(toAppUser(dbUser))
    return { success: true, user: toAppUser(dbUser) }
  } catch {
    return { success: false, error: "Failed to create account. Please try again." }
  }
}

// Sign in
export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      })
      if (error) {
        return { success: false, error: "Invalid email or password" }
      }
      if (!data.user) return { success: false, error: "Invalid email or password" }
      const dbUser = await dbGetUser()
      if (dbUser) {
        cacheUser(toAppUser(dbUser))
        return { success: true, user: toAppUser(dbUser) }
      }
      return { success: true, user: undefined }
    } catch {
      return { success: false, error: "Failed to sign in. Please try again." }
    }
  }

  try {
    const dbUser = await dbSignIn(email.toLowerCase(), password)
    if (!dbUser) return { success: false, error: "Invalid email or password" }
    cacheUser(toAppUser(dbUser))
    return { success: true, user: toAppUser(dbUser) }
  } catch {
    return { success: false, error: "Failed to sign in. Please try again." }
  }
}

// Sign out
export async function signOut(): Promise<void> {
  if (typeof window !== "undefined") {
    try { localStorage.removeItem(USER_CACHE_KEY) } catch { /* ignore */ }
  }
  await dbSignOut()
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  const dbUser = await dbGetUser()
  if (dbUser) {
    const u = toAppUser(dbUser)
    cacheUser(u)
    return u
  }
  return null
}

// Synchronous version - reads from cache/localStorage
export function getCurrentUserSync(): User | null {
  if (typeof window === "undefined") return null
  try {
    if (isSupabaseConfigured()) {
      const cached = localStorage.getItem(USER_CACHE_KEY)
      return cached ? (JSON.parse(cached) as User) : null
    }
    const stored = localStorage.getItem("park_db_user")
    if (!stored) return null
    const dbUser: DBUser = JSON.parse(stored)
    return toAppUser(dbUser)
  } catch {
    return null
  }
}

// Update user
export async function updateUser(updates: Partial<User>): Promise<User | null> {
  const dbUpdates: Partial<DBUser> = {}
  if (updates.name) dbUpdates.name = updates.name
  if (updates.plan) dbUpdates.plan = updates.plan

  const dbUser = await dbUpdateUser(dbUpdates)
  if (dbUser) {
    const u = toAppUser(dbUser)
    cacheUser(u)
    return u
  }
  return null
}

// Increment stats
export async function incrementStats(
  type: "checks" | "ticketsAvoided" | "moneySaved",
  amount: number = 1
): Promise<void> {
  const statMap: Record<string, keyof DBUser["stats"]> = {
    checks: "checks",
    ticketsAvoided: "tickets_avoided",
    moneySaved: "money_saved",
  }
  await dbUpdateUserStats(statMap[type], amount)
}

// Check if onboarding complete
export function isOnboardingComplete(): boolean {
  return dbIsOnboardingComplete()
}

// Mark onboarding complete
export function completeOnboarding(): void {
  dbCompleteOnboarding()
}

// Reset password
export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase())
      if (error) return { success: false, error: error.message }
      return { success: true }
    } catch {
      return { success: false, error: "Failed to send reset email" }
    }
  }
  return { success: true }
}
