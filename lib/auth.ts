/**
 * Authentication Layer
 * Uses the database abstraction layer for persistence.
 * Ready for Supabase Auth migration.
 */

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

// Sign up
export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  // Validate
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
    // Check if user exists by trying to sign in
    const existing = await dbSignIn(email, password)
    if (existing) {
      return { success: false, error: "An account with this email already exists" }
    }

    const dbUser = await dbCreateUser(email.toLowerCase(), name, password)
    return { success: true, user: toAppUser(dbUser) }
  } catch (error) {
    return { success: false, error: "Failed to create account. Please try again." }
  }
}

// Sign in
export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const dbUser = await dbSignIn(email.toLowerCase(), password)
    
    if (!dbUser) {
      return { success: false, error: "Invalid email or password" }
    }

    return { success: true, user: toAppUser(dbUser) }
  } catch (error) {
    return { success: false, error: "Failed to sign in. Please try again." }
  }
}

// Sign out
export async function signOut(): Promise<void> {
  await dbSignOut()
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  const dbUser = await dbGetUser()
  return dbUser ? toAppUser(dbUser) : null
}

// Synchronous version for backward compatibility
export function getCurrentUserSync(): User | null {
  if (typeof window === "undefined") return null
  try {
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
  return dbUser ? toAppUser(dbUser) : null
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

// Reset password (simulated - in production use Supabase Auth)
export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  // In production, this would call Supabase Auth or send an email
  // For MVP, just return success
  return { success: true }
}
