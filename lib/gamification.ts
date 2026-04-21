"use client"

import { dbGetUser } from "./db"

// Karma points configuration
export const KARMA_ACTIONS = {
  parkingCheck: 5,
  reportEnforcement: 15,
  reportMeterStatus: 10,
  confirmReport: 5,
  photoEvidence: 20,
  referralSignup: 100,
  referralFirstCheck: 50,
  dailyStreak: 10,
  weeklyStreak: 50,
  helpfulReport: 25, // When others confirm your report
  firstCheck: 25,
  tenthCheck: 50,
  fiftiethCheck: 100,
  hundredthCheck: 250,
} as const

// Badge definitions
export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: "milestone" | "streak" | "community" | "special"
  requirement: number
  requirementType: "checks" | "reports" | "karma" | "streak" | "referrals" | "tickets_avoided"
  unlockedAt?: Date
}

export const BADGES: Badge[] = [
  // Milestone badges
  { id: "first_check", name: "First Timer", description: "Complete your first parking check", icon: "flag", category: "milestone", requirement: 1, requirementType: "checks" },
  { id: "ten_checks", name: "Getting Started", description: "Complete 10 parking checks", icon: "award", category: "milestone", requirement: 10, requirementType: "checks" },
  { id: "fifty_checks", name: "Regular Parker", description: "Complete 50 parking checks", icon: "medal", category: "milestone", requirement: 50, requirementType: "checks" },
  { id: "hundred_checks", name: "Parking Pro", description: "Complete 100 parking checks", icon: "trophy", category: "milestone", requirement: 100, requirementType: "checks" },
  { id: "five_hundred_checks", name: "Parking Master", description: "Complete 500 parking checks", icon: "crown", category: "milestone", requirement: 500, requirementType: "checks" },
  
  // Streak badges
  { id: "three_day_streak", name: "On a Roll", description: "Use the app 3 days in a row", icon: "flame", category: "streak", requirement: 3, requirementType: "streak" },
  { id: "seven_day_streak", name: "Week Warrior", description: "Use the app 7 days in a row", icon: "zap", category: "streak", requirement: 7, requirementType: "streak" },
  { id: "thirty_day_streak", name: "Dedicated Driver", description: "Use the app 30 days in a row", icon: "star", category: "streak", requirement: 30, requirementType: "streak" },
  
  // Community badges
  { id: "first_report", name: "Community Helper", description: "Submit your first enforcement report", icon: "users", category: "community", requirement: 1, requirementType: "reports" },
  { id: "ten_reports", name: "Neighborhood Watch", description: "Submit 10 enforcement reports", icon: "eye", category: "community", requirement: 10, requirementType: "reports" },
  { id: "fifty_reports", name: "Community Guardian", description: "Submit 50 enforcement reports", icon: "shield", category: "community", requirement: 50, requirementType: "reports" },
  
  // Karma badges
  { id: "hundred_karma", name: "Rising Star", description: "Earn 100 karma points", icon: "trending-up", category: "community", requirement: 100, requirementType: "karma" },
  { id: "five_hundred_karma", name: "Respected Member", description: "Earn 500 karma points", icon: "heart", category: "community", requirement: 500, requirementType: "karma" },
  { id: "thousand_karma", name: "Community Legend", description: "Earn 1,000 karma points", icon: "gem", category: "community", requirement: 1000, requirementType: "karma" },
  
  // Referral badges
  { id: "first_referral", name: "Ambassador", description: "Refer your first friend", icon: "user-plus", category: "special", requirement: 1, requirementType: "referrals" },
  { id: "five_referrals", name: "Influencer", description: "Refer 5 friends", icon: "share-2", category: "special", requirement: 5, requirementType: "referrals" },
  { id: "ten_referrals", name: "Park Evangelist", description: "Refer 10 friends", icon: "megaphone", category: "special", requirement: 10, requirementType: "referrals" },
  
  // Safety badges
  { id: "five_avoided", name: "Ticket Dodger", description: "Avoid 5 potential tickets", icon: "shield-check", category: "special", requirement: 5, requirementType: "tickets_avoided" },
  { id: "twenty_avoided", name: "Ticket Slayer", description: "Avoid 20 potential tickets", icon: "swords", category: "special", requirement: 20, requirementType: "tickets_avoided" },
  { id: "fifty_avoided", name: "Untouchable", description: "Avoid 50 potential tickets", icon: "sparkles", category: "special", requirement: 50, requirementType: "tickets_avoided" },
]

// Gamification state
export interface GamificationState {
  karma: number
  level: number
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null
  totalChecks: number
  totalReports: number
  totalReferrals: number
  ticketsAvoided: number
  moneySaved: number
  unlockedBadges: string[]
  referralCode: string
  referredBy: string | null
}

const STORAGE_KEY = "park_gamification"

// Get gamification state
export function getGamificationState(): GamificationState {
  if (typeof window === "undefined") {
    return getDefaultState()
  }
  
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    const defaultState = getDefaultState()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState))
    return defaultState
  }

  try {
    return JSON.parse(stored)
  } catch {
    const defaultState = getDefaultState()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState))
    return defaultState
  }
}

function getDefaultState(): GamificationState {
  return {
    karma: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    totalChecks: 0,
    totalReports: 0,
    totalReferrals: 0,
    ticketsAvoided: 0,
    moneySaved: 0,
    unlockedBadges: [],
    referralCode: generateReferralCode(),
    referredBy: null,
  }
}

function generateReferralCode(): string {
  return "PARK" + Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Save gamification state
function saveGamificationState(state: GamificationState): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

// Calculate level from karma
export function calculateLevel(karma: number): number {
  // Level thresholds: 0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500...
  // Formula: level = floor(sqrt(karma / 50)) + 1
  return Math.floor(Math.sqrt(karma / 50)) + 1
}

// Get karma needed for next level
export function getKarmaForNextLevel(currentLevel: number): number {
  return currentLevel * currentLevel * 50
}

// Add karma points
export function addKarma(action: keyof typeof KARMA_ACTIONS): { karma: number; newBadges: Badge[] } {
  const state = getGamificationState()
  const points = KARMA_ACTIONS[action]
  
  state.karma += points
  state.level = calculateLevel(state.karma)
  
  // Check for new badges
  const newBadges = checkForNewBadges(state)
  
  saveGamificationState(state)
  
  return { karma: points, newBadges }
}

// Update streak
export function updateStreak(): { streakUpdated: boolean; newBadges: Badge[] } {
  const state = getGamificationState()
  const today = new Date().toDateString()
  
  if (state.lastActiveDate === today) {
    return { streakUpdated: false, newBadges: [] }
  }
  
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (state.lastActiveDate === yesterday.toDateString()) {
    state.currentStreak++
    state.karma += KARMA_ACTIONS.dailyStreak
    
    if (state.currentStreak % 7 === 0) {
      state.karma += KARMA_ACTIONS.weeklyStreak
    }
  } else if (state.lastActiveDate !== today) {
    state.currentStreak = 1
  }
  
  if (state.currentStreak > state.longestStreak) {
    state.longestStreak = state.currentStreak
  }
  
  state.lastActiveDate = today
  state.level = calculateLevel(state.karma)
  
  const newBadges = checkForNewBadges(state)
  saveGamificationState(state)
  
  return { streakUpdated: true, newBadges }
}

// Increment stat and add karma
export function incrementGamificationStat(
  stat: "checks" | "reports" | "referrals" | "ticketsAvoided",
  amount: number = 1
): { newBadges: Badge[] } {
  const state = getGamificationState()
  
  switch (stat) {
    case "checks":
      state.totalChecks += amount
      state.karma += KARMA_ACTIONS.parkingCheck
      if (state.totalChecks === 1) state.karma += KARMA_ACTIONS.firstCheck
      if (state.totalChecks === 10) state.karma += KARMA_ACTIONS.tenthCheck
      if (state.totalChecks === 50) state.karma += KARMA_ACTIONS.fiftiethCheck
      if (state.totalChecks === 100) state.karma += KARMA_ACTIONS.hundredthCheck
      break
    case "reports":
      state.totalReports += amount
      state.karma += KARMA_ACTIONS.reportEnforcement
      break
    case "referrals":
      state.totalReferrals += amount
      state.karma += KARMA_ACTIONS.referralSignup
      break
    case "ticketsAvoided":
      state.ticketsAvoided += amount
      state.moneySaved += 75 * amount // Average ticket cost
      break
  }
  
  state.level = calculateLevel(state.karma)
  const newBadges = checkForNewBadges(state)
  saveGamificationState(state)
  
  return { newBadges }
}

// Check for new badges
function checkForNewBadges(state: GamificationState): Badge[] {
  const newBadges: Badge[] = []
  
  for (const badge of BADGES) {
    if (state.unlockedBadges.includes(badge.id)) continue
    
    let unlocked = false
    switch (badge.requirementType) {
      case "checks":
        unlocked = state.totalChecks >= badge.requirement
        break
      case "reports":
        unlocked = state.totalReports >= badge.requirement
        break
      case "karma":
        unlocked = state.karma >= badge.requirement
        break
      case "streak":
        unlocked = state.longestStreak >= badge.requirement
        break
      case "referrals":
        unlocked = state.totalReferrals >= badge.requirement
        break
      case "tickets_avoided":
        unlocked = state.ticketsAvoided >= badge.requirement
        break
    }
    
    if (unlocked) {
      state.unlockedBadges.push(badge.id)
      newBadges.push({ ...badge, unlockedAt: new Date() })
    }
  }
  
  return newBadges
}

// Get user's badges
export function getUserBadges(): { unlocked: Badge[]; locked: Badge[] } {
  const state = getGamificationState()
  
  const unlocked = BADGES.filter(b => state.unlockedBadges.includes(b.id))
  const locked = BADGES.filter(b => !state.unlockedBadges.includes(b.id))
  
  return { unlocked, locked }
}

// Get badge progress
export function getBadgeProgress(badge: Badge): number {
  const state = getGamificationState()
  
  let current = 0
  switch (badge.requirementType) {
    case "checks":
      current = state.totalChecks
      break
    case "reports":
      current = state.totalReports
      break
    case "karma":
      current = state.karma
      break
    case "streak":
      current = state.longestStreak
      break
    case "referrals":
      current = state.totalReferrals
      break
    case "tickets_avoided":
      current = state.ticketsAvoided
      break
  }
  
  return Math.min(current / badge.requirement, 1)
}

// Leaderboard entry
export interface LeaderboardEntry {
  id: string
  name: string
  avatar?: string
  karma: number
  level: number
  rank: number
  isCurrentUser: boolean
}

// Get mock leaderboard (in production, this would be from the server)
export async function getLeaderboard(_type: "global" | "local" | "friends" = "global"): Promise<LeaderboardEntry[]> {
  const state = getGamificationState()
  const user = await dbGetUser()
  
  // Mock leaderboard data
  const mockUsers: LeaderboardEntry[] = [
    { id: "1", name: "Sarah M.", karma: 2450, level: 8, rank: 1, isCurrentUser: false },
    { id: "2", name: "James K.", karma: 2100, level: 7, rank: 2, isCurrentUser: false },
    { id: "3", name: "Emily R.", karma: 1850, level: 7, rank: 3, isCurrentUser: false },
    { id: "4", name: "Michael T.", karma: 1600, level: 6, rank: 4, isCurrentUser: false },
    { id: "5", name: "Lisa W.", karma: 1400, level: 6, rank: 5, isCurrentUser: false },
    { id: "6", name: "David L.", karma: 1200, level: 5, rank: 6, isCurrentUser: false },
    { id: "7", name: "Jennifer P.", karma: 1000, level: 5, rank: 7, isCurrentUser: false },
    { id: "8", name: "Chris B.", karma: 850, level: 4, rank: 8, isCurrentUser: false },
    { id: "9", name: "Amanda G.", karma: 700, level: 4, rank: 9, isCurrentUser: false },
    { id: "10", name: "Kevin H.", karma: 550, level: 4, rank: 10, isCurrentUser: false },
  ]
  
  // Insert current user into appropriate position
  const currentUser: LeaderboardEntry = {
    id: "current",
    name: user?.name || "You",
    karma: state.karma,
    level: state.level,
    rank: 0,
    isCurrentUser: true,
  }
  
  // Find rank
  const allUsers = [...mockUsers, currentUser].sort((a, b) => b.karma - a.karma)
  allUsers.forEach((u, i) => { u.rank = i + 1 })
  
  return allUsers.slice(0, 10)
}

// Referral system
export function applyReferralCode(code: string): boolean {
  const state = getGamificationState()
  
  if (state.referredBy) return false // Already used a referral
  if (code === state.referralCode) return false // Can't use own code
  
  state.referredBy = code
  state.karma += 50 // Bonus for using a referral code
  state.level = calculateLevel(state.karma)
  
  saveGamificationState(state)
  return true
}

// Get referral stats
export function getReferralStats(): { code: string; referrals: number; earnings: number } {
  const state = getGamificationState()
  return {
    code: state.referralCode,
    referrals: state.totalReferrals,
    earnings: state.totalReferrals * 150, // 100 for signup + 50 for first check
  }
}

// Get money saved stats
export function getMoneySavedStats(): { total: number; thisMonth: number; ticketsAvoided: number } {
  const state = getGamificationState()
  return {
    total: state.moneySaved,
    thisMonth: Math.floor(state.moneySaved * 0.3), // Simulated monthly portion
    ticketsAvoided: state.ticketsAvoided,
  }
}
