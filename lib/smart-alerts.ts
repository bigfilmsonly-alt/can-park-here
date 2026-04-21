"use client"

// Proactive Smart Alerts System
// Monitors conditions and sends alerts before parking issues occur

export interface SmartAlert {
  id: string
  type: "street_cleaning" | "meter_expiring" | "rush_hour" | "event" | "weather" | "enforcement" | "tow_zone"
  severity: "info" | "warning" | "critical"
  title: string
  message: string
  actionLabel?: string
  actionType?: "navigate" | "dismiss" | "snooze" | "check_parking"
  expiresAt?: Date
  location?: { lat: number; lng: number }
  createdAt: Date
}

export interface AlertPreferences {
  streetCleaning: boolean
  meterReminders: boolean
  rushHourWarnings: boolean
  eventAlerts: boolean
  weatherAlerts: boolean
  enforcementAlerts: boolean
  advanceNoticeMinutes: number // How early to alert
}

const DEFAULT_PREFERENCES: AlertPreferences = {
  streetCleaning: true,
  meterReminders: true,
  rushHourWarnings: true,
  eventAlerts: true,
  weatherAlerts: true,
  enforcementAlerts: true,
  advanceNoticeMinutes: 30,
}

// Get user's alert preferences
export function getAlertPreferences(): AlertPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES
  const stored = localStorage.getItem("park_alert_preferences")
  if (!stored) return DEFAULT_PREFERENCES

  try {
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

// Save user's alert preferences
export function saveAlertPreferences(prefs: Partial<AlertPreferences>): void {
  if (typeof window === "undefined") return
  const current = getAlertPreferences()
  localStorage.setItem("park_alert_preferences", JSON.stringify({ ...current, ...prefs }))
}

// Get active alerts for current location and time
export function getActiveAlerts(
  location?: { lat: number; lng: number }
): SmartAlert[] {
  const prefs = getAlertPreferences()
  const alerts: SmartAlert[] = []
  const now = new Date()
  const dayOfWeek = now.getDay()
  const hour = now.getHours()
  
  // Street cleaning alerts
  if (prefs.streetCleaning) {
    const cleaningAlerts = checkStreetCleaning(now, dayOfWeek, hour, prefs.advanceNoticeMinutes)
    alerts.push(...cleaningAlerts)
  }
  
  // Rush hour warnings
  if (prefs.rushHourWarnings) {
    const rushAlerts = checkRushHour(hour, prefs.advanceNoticeMinutes)
    alerts.push(...rushAlerts)
  }
  
  // Event alerts (simulated)
  if (prefs.eventAlerts) {
    const eventAlerts = checkNearbyEvents(location)
    alerts.push(...eventAlerts)
  }
  
  // Enforcement activity alerts
  if (prefs.enforcementAlerts) {
    const enforcementAlerts = checkEnforcementActivity(location)
    alerts.push(...enforcementAlerts)
  }
  
  // Active timer/meter alerts
  if (prefs.meterReminders) {
    const meterAlerts = checkActiveTimers()
    alerts.push(...meterAlerts)
  }
  
  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })
}

function checkStreetCleaning(
  now: Date,
  dayOfWeek: number,
  hour: number,
  advanceMinutes: number
): SmartAlert[] {
  const alerts: SmartAlert[] = []
  
  // Typical street cleaning schedules (Mon/Thu 8-11am in many cities)
  const cleaningDays = [1, 4] // Monday, Thursday
  const cleaningStartHour = 8
  const cleaningEndHour = 11
  
  if (cleaningDays.includes(dayOfWeek)) {
    const minutesUntilCleaning = (cleaningStartHour - hour) * 60 - now.getMinutes()
    
    if (minutesUntilCleaning > 0 && minutesUntilCleaning <= advanceMinutes) {
      alerts.push({
        id: `street-cleaning-${Date.now()}`,
        type: "street_cleaning",
        severity: minutesUntilCleaning <= 15 ? "critical" : "warning",
        title: "Street Cleaning Soon",
        message: `Street cleaning starts in ${minutesUntilCleaning} minutes. Move your vehicle to avoid a ticket.`,
        actionLabel: "Find New Spot",
        actionType: "check_parking",
        expiresAt: new Date(now.getTime() + minutesUntilCleaning * 60000),
        createdAt: now,
      })
    } else if (hour >= cleaningStartHour && hour < cleaningEndHour) {
      alerts.push({
        id: `street-cleaning-active-${Date.now()}`,
        type: "street_cleaning",
        severity: "critical",
        title: "Street Cleaning In Progress",
        message: `Street cleaning is active until ${cleaningEndHour}:00 AM. Do not park here.`,
        actionLabel: "Check Parking",
        actionType: "check_parking",
        createdAt: now,
      })
    }
  }
  
  // Check if cleaning is tomorrow
  const tomorrow = (dayOfWeek + 1) % 7
  if (cleaningDays.includes(tomorrow) && hour >= 18) {
    alerts.push({
      id: `street-cleaning-tomorrow-${Date.now()}`,
      type: "street_cleaning",
      severity: "info",
      title: "Street Cleaning Tomorrow",
      message: "Remember to move your car before 8 AM tomorrow for street cleaning.",
      actionLabel: "Set Reminder",
      actionType: "snooze",
      createdAt: now,
    })
  }
  
  return alerts
}

function checkRushHour(hour: number, advanceMinutes: number): SmartAlert[] {
  const alerts: SmartAlert[] = []
  
  // Morning rush: 7:30 - 9:30
  // Evening rush: 4:30 - 6:30
  const rushHours = [
    { start: 7.5, end: 9.5, label: "morning" },
    { start: 16.5, end: 18.5, label: "evening" },
  ]
  
  const currentTime = hour + new Date().getMinutes() / 60
  
  for (const rush of rushHours) {
    const minutesUntil = (rush.start - currentTime) * 60
    
    if (minutesUntil > 0 && minutesUntil <= advanceMinutes) {
      alerts.push({
        id: `rush-hour-${rush.label}-${Date.now()}`,
        type: "rush_hour",
        severity: "info",
        title: `${rush.label === "morning" ? "Morning" : "Evening"} Rush Hour Approaching`,
        message: `Parking will be harder to find in ${Math.round(minutesUntil)} minutes. Consider arriving earlier.`,
        createdAt: new Date(),
      })
    }
  }
  
  return alerts
}

function checkNearbyEvents(location?: { lat: number; lng: number }): SmartAlert[] {
  if (!location) return []
  
  // Simulated event detection
  const now = new Date()
  const hour = now.getHours()
  const dayOfWeek = now.getDay()
  
  // Weekend evenings often have events
  if ((dayOfWeek === 5 || dayOfWeek === 6) && hour >= 17 && hour <= 22) {
    return [
      {
        id: `event-weekend-${Date.now()}`,
        type: "event",
        severity: "info",
        title: "Weekend Event Activity",
        message: "Higher parking demand expected in entertainment areas this evening.",
        createdAt: now,
      },
    ]
  }
  
  return []
}

function checkEnforcementActivity(location?: { lat: number; lng: number }): SmartAlert[] {
  if (typeof window === "undefined") return []
  // Check community reports for recent enforcement
  const stored = localStorage.getItem("park_community_reports")
  if (!stored || !location) return []
  
  try {
    const reports = JSON.parse(stored)
    const recentEnforcement = reports.filter((r: { type: string; timestamp: string; location: { lat: number; lng: number } }) => {
      if (r.type !== "enforcement") return false
      const reportTime = new Date(r.timestamp)
      const hoursSince = (Date.now() - reportTime.getTime()) / (1000 * 60 * 60)
      if (hoursSince > 2) return false
      
      // Check if within ~0.5 mile radius
      const distance = Math.sqrt(
        Math.pow(r.location.lat - location.lat, 2) +
        Math.pow(r.location.lng - location.lng, 2)
      )
      return distance < 0.007 // Roughly 0.5 miles
    })
    
    if (recentEnforcement.length > 0) {
      return [
        {
          id: `enforcement-nearby-${Date.now()}`,
          type: "enforcement",
          severity: "warning",
          title: "Enforcement Activity Nearby",
          message: `${recentEnforcement.length} report(s) of parking enforcement in your area in the last 2 hours.`,
          actionLabel: "View Details",
          actionType: "navigate",
          location,
          createdAt: new Date(),
        },
      ]
    }
  } catch {
    // Ignore parse errors
  }
  
  return []
}

function checkActiveTimers(): SmartAlert[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("park_active_timer")
  if (!stored) return []
  
  try {
    const timer = JSON.parse(stored)
    const expiresAt = new Date(timer.expiresAt)
    const now = new Date()
    const minutesRemaining = (expiresAt.getTime() - now.getTime()) / (1000 * 60)
    
    if (minutesRemaining <= 0) {
      return [
        {
          id: `timer-expired-${Date.now()}`,
          type: "meter_expiring",
          severity: "critical",
          title: "Parking Time Expired",
          message: "Your parking timer has expired. Move your vehicle to avoid a ticket.",
          actionLabel: "Check Status",
          actionType: "check_parking",
          createdAt: now,
        },
      ]
    }
    
    if (minutesRemaining <= 10) {
      return [
        {
          id: `timer-expiring-${Date.now()}`,
          type: "meter_expiring",
          severity: "warning",
          title: "Parking Expiring Soon",
          message: `Only ${Math.round(minutesRemaining)} minutes remaining on your parking.`,
          actionLabel: "Extend Time",
          actionType: "navigate",
          createdAt: now,
        },
      ]
    }
    
    if (minutesRemaining <= 20) {
      return [
        {
          id: `timer-notice-${Date.now()}`,
          type: "meter_expiring",
          severity: "info",
          title: "Parking Reminder",
          message: `${Math.round(minutesRemaining)} minutes remaining on your parking.`,
          createdAt: now,
        },
      ]
    }
  } catch {
    // Ignore parse errors
  }
  
  return []
}

// Schedule background alert checks
export function scheduleAlertCheck(
  callback: (alerts: SmartAlert[]) => void,
  intervalMs: number = 60000 // Check every minute
): () => void {
  const checkAlerts = () => {
    const alerts = getActiveAlerts()
    if (alerts.length > 0) {
      callback(alerts)
    }
  }
  
  // Initial check
  checkAlerts()
  
  // Schedule recurring checks
  const intervalId = setInterval(checkAlerts, intervalMs)
  
  // Return cleanup function
  return () => clearInterval(intervalId)
}

// Send browser notification for critical alerts
export async function sendAlertNotification(alert: SmartAlert): Promise<boolean> {
  if (!("Notification" in window)) return false
  
  if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission()
    if (permission !== "granted") return false
  }
  
  new Notification(alert.title, {
    body: alert.message,
    icon: "/favicon.ico",
    tag: alert.id,
    requireInteraction: alert.severity === "critical",
  })
  
  return true
}
