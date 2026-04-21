"use client"

// Habit Learning & Smart Reminders
// Learns user parking patterns and provides personalized suggestions

export interface ParkingHabit {
  id: string
  dayOfWeek: number // 0-6
  hour: number // 0-23
  location: {
    lat: number
    lng: number
    address: string
  }
  frequency: number // times visited
  averageDuration: number // minutes
  lastVisit: Date
  tags: string[] // "work", "gym", "groceries", etc.
}

export interface SmartReminder {
  id: string
  type: "departure" | "arrival" | "move_car" | "meter" | "custom"
  title: string
  message: string
  scheduledFor: Date
  location?: { lat: number; lng: number; address: string }
  recurring: boolean
  daysOfWeek?: number[] // for recurring reminders
  enabled: boolean
}

export interface UserInsight {
  type: "pattern" | "suggestion" | "warning" | "achievement"
  title: string
  description: string
  actionLabel?: string
  actionType?: "set_reminder" | "view_location" | "dismiss"
}

const HABITS_KEY = "park_habits"
const REMINDERS_KEY = "park_smart_reminders"

// Get all parking habits
export function getParkingHabits(): ParkingHabit[] {
  if (typeof window === "undefined") return []
  
  const stored = localStorage.getItem(HABITS_KEY)
  if (!stored) return []
  
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

// Record a parking event to learn habits
export function recordParkingEvent(
  location: { lat: number; lng: number; address: string },
  duration?: number,
  tag?: string
): void {
  if (typeof window === "undefined") return
  
  const habits = getParkingHabits()
  const now = new Date()
  const dayOfWeek = now.getDay()
  const hour = now.getHours()
  
  // Find existing habit for this location/time
  const existingIndex = habits.findIndex(h => {
    const sameLocation = 
      Math.abs(h.location.lat - location.lat) < 0.001 &&
      Math.abs(h.location.lng - location.lng) < 0.001
    const sameTimeSlot = 
      h.dayOfWeek === dayOfWeek &&
      Math.abs(h.hour - hour) <= 1
    return sameLocation && sameTimeSlot
  })
  
  if (existingIndex >= 0) {
    // Update existing habit
    const habit = habits[existingIndex]
    habit.frequency++
    habit.lastVisit = now
    if (duration) {
      habit.averageDuration = Math.round(
        (habit.averageDuration * (habit.frequency - 1) + duration) / habit.frequency
      )
    }
    if (tag && !habit.tags.includes(tag)) {
      habit.tags.push(tag)
    }
  } else {
    // Create new habit
    habits.push({
      id: `habit_${Date.now()}`,
      dayOfWeek,
      hour,
      location,
      frequency: 1,
      averageDuration: duration || 60,
      lastVisit: now,
      tags: tag ? [tag] : [],
    })
  }
  
  // Keep only top 50 habits
  habits.sort((a, b) => b.frequency - a.frequency)
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits.slice(0, 50)))
}

// Get habits for current time
export function getCurrentTimeHabits(): ParkingHabit[] {
  const habits = getParkingHabits()
  const now = new Date()
  const dayOfWeek = now.getDay()
  const hour = now.getHours()
  
  return habits.filter(h => 
    h.dayOfWeek === dayOfWeek &&
    Math.abs(h.hour - hour) <= 2
  ).sort((a, b) => b.frequency - a.frequency)
}

// Get most frequent locations
export function getFrequentLocations(): ParkingHabit[] {
  return getParkingHabits()
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5)
}

// Get user insights based on habits
export function getUserInsights(): UserInsight[] {
  const habits = getParkingHabits()
  const insights: UserInsight[] = []
  
  if (habits.length === 0) {
    insights.push({
      type: "suggestion",
      title: "Start Building Your Profile",
      description: "Check parking a few times and we'll learn your patterns to give personalized suggestions.",
    })
    return insights
  }
  
  // Most visited location
  const topHabit = habits[0]
  if (topHabit && topHabit.frequency >= 3) {
    insights.push({
      type: "pattern",
      title: "Your Most Frequent Spot",
      description: `You've parked near ${topHabit.location.address.split(",")[0]} ${topHabit.frequency} times, usually around ${formatHour(topHabit.hour)}.`,
      actionLabel: "Set Reminder",
      actionType: "set_reminder",
    })
  }
  
  // Time-based pattern
  const now = new Date()
  const currentHabits = getCurrentTimeHabits()
  if (currentHabits.length > 0) {
    const habit = currentHabits[0]
    insights.push({
      type: "suggestion",
      title: "Heading to Your Usual Spot?",
      description: `You often park near ${habit.location.address.split(",")[0]} around this time.`,
      actionLabel: "Check Parking",
      actionType: "view_location",
    })
  }
  
  // Achievement for consistent parking
  const totalParks = habits.reduce((sum, h) => sum + h.frequency, 0)
  if (totalParks >= 10) {
    insights.push({
      type: "achievement",
      title: "Regular Parker",
      description: `You've used Park ${totalParks} times! Your predictions are getting more accurate.`,
    })
  }
  
  // Warning for high-risk location
  const highRiskHabit = habits.find(h => {
    // Check if location has had issues (simplified check)
    return h.tags.includes("restricted") || h.tags.includes("ticketed")
  })
  if (highRiskHabit) {
    insights.push({
      type: "warning",
      title: "Watch This Spot",
      description: `You've had parking issues near ${highRiskHabit.location.address.split(",")[0]} before. Be extra careful.`,
    })
  }
  
  return insights.slice(0, 4)
}

// Smart reminders
export function getSmartReminders(): SmartReminder[] {
  if (typeof window === "undefined") return []
  
  const stored = localStorage.getItem(REMINDERS_KEY)
  if (!stored) return []
  
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function addSmartReminder(reminder: Omit<SmartReminder, "id">): SmartReminder {
  const reminders = getSmartReminders()

  const newReminder: SmartReminder = {
    ...reminder,
    id: `reminder_${Date.now()}`,
  }

  reminders.push(newReminder)
  if (typeof window !== "undefined") {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders))
  }
  
  // Schedule browser notification
  scheduleReminderNotification(newReminder)
  
  return newReminder
}

export function removeSmartReminder(id: string): void {
  if (typeof window === "undefined") return
  const reminders = getSmartReminders()
  const filtered = reminders.filter(r => r.id !== id)
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(filtered))
}

export function toggleSmartReminder(id: string): void {
  if (typeof window === "undefined") return
  const reminders = getSmartReminders()
  const updated = reminders.map(r =>
    r.id === id ? { ...r, enabled: !r.enabled } : r
  )
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(updated))
}

// Schedule notification for reminder
function scheduleReminderNotification(reminder: SmartReminder): void {
  if (typeof window === "undefined") return
  if (!("Notification" in window)) return
  if (!reminder.enabled) return
  
  const now = new Date()
  const scheduledTime = new Date(reminder.scheduledFor)
  const delay = scheduledTime.getTime() - now.getTime()
  
  if (delay <= 0) return
  if (delay > 24 * 60 * 60 * 1000) return // Max 24 hours ahead
  
  setTimeout(async () => {
    if (Notification.permission === "granted") {
      new Notification(reminder.title, {
        body: reminder.message,
        icon: "/icon-192.png",
        tag: reminder.id,
      })
    }
  }, delay)
}

// Generate smart reminder suggestions
export function getSmartReminderSuggestions(): SmartReminder[] {
  const habits = getParkingHabits()
  const suggestions: SmartReminder[] = []
  const now = new Date()
  
  // Suggest reminders based on frequent habits
  for (const habit of habits.slice(0, 3)) {
    if (habit.frequency >= 2) {
      // Suggest departure reminder
      const departureTime = new Date(now)
      departureTime.setHours(habit.hour - 1, 0, 0, 0)
      
      // Only suggest for future times
      if (departureTime > now) {
        suggestions.push({
          id: "",
          type: "departure",
          title: `Leave for ${habit.location.address.split(",")[0]}`,
          message: `Based on your pattern, you usually head here around ${formatHour(habit.hour)}.`,
          scheduledFor: departureTime,
          location: habit.location,
          recurring: true,
          daysOfWeek: [habit.dayOfWeek],
          enabled: false,
        })
      }
      
      // Suggest move car reminder based on average duration
      if (habit.averageDuration > 0) {
        const moveTime = new Date(now)
        moveTime.setMinutes(moveTime.getMinutes() + habit.averageDuration - 15)
        
        suggestions.push({
          id: "",
          type: "move_car",
          title: "Time to Move Your Car",
          message: `You usually park here for about ${Math.round(habit.averageDuration)} minutes.`,
          scheduledFor: moveTime,
          location: habit.location,
          recurring: false,
          enabled: false,
        })
      }
    }
  }
  
  return suggestions
}

// Predict next parking need
export function predictNextParkingNeed(): {
  location: { lat: number; lng: number; address: string }
  time: Date
  confidence: number
} | null {
  const habits = getCurrentTimeHabits()
  
  if (habits.length === 0) return null
  
  const topHabit = habits[0]
  const confidence = Math.min(95, 50 + topHabit.frequency * 5)
  
  const predictedTime = new Date()
  predictedTime.setHours(topHabit.hour, 0, 0, 0)
  
  return {
    location: topHabit.location,
    time: predictedTime,
    confidence,
  }
}

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM"
  if (hour === 12) return "12 PM"
  if (hour < 12) return `${hour} AM`
  return `${hour - 12} PM`
}

// Get day name
export function getDayName(dayOfWeek: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return days[dayOfWeek] ?? "Unknown"
}
