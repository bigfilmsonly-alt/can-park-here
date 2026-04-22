"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface TimerState {
  isActive: boolean
  endTime: number | null
  totalMinutes: number
  remainingSeconds: number
  twentyMinNotified: boolean
  tenMinNotified: boolean
}

const TIMER_STORAGE_KEY = "park_active_timer"

function loadTimerState(): TimerState | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(TIMER_STORAGE_KEY)
    if (!stored) return null

    const state = JSON.parse(stored) as TimerState
    // Check if timer has expired
    if (state.endTime && Date.now() > state.endTime) {
      localStorage.removeItem(TIMER_STORAGE_KEY)
      return null
    }
    return state
  } catch {
    return null
  }
}

function saveTimerState(state: TimerState | null) {
  if (typeof window === "undefined") return
  try {
    if (state) {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state))
    } else {
      localStorage.removeItem(TIMER_STORAGE_KEY)
    }
  } catch {
    // localStorage may be unavailable
  }
}

// ---------------------------------------------------------------------------
// Server-side push scheduling helpers
// ---------------------------------------------------------------------------

const SERVER_PUSH_MILESTONES = [
  { minutesBefore: 15, title: "15 minutes left", body: "Your parking timer expires in 15 minutes." },
  { minutesBefore: 5, title: "5 minutes left", body: "Your parking timer expires in 5 minutes!" },
  { minutesBefore: 1, title: "1 minute left!", body: "Your parking timer expires in 1 minute. Move your vehicle now!" },
  { minutesBefore: 0, title: "Time's up!", body: "Your parking timer has expired. Move your vehicle now." },
]

async function scheduleServerPush(minutes: number): Promise<void> {
  try {
    // Only schedule milestones that are within the timer duration
    const notifications = SERVER_PUSH_MILESTONES.filter(
      (m) => m.minutesBefore <= minutes,
    )
    if (notifications.length === 0) return

    await fetch("/api/push/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minutes, notifications }),
    })
  } catch {
    // Server push is best-effort; local notifications are the fallback
  }
}

async function cancelServerPush(): Promise<void> {
  try {
    await fetch("/api/push/schedule", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
  } catch {
    // Best-effort cancellation
  }
}

export function useTimer() {
  const [timerState, setTimerState] = useState<TimerState | null>(null)
  const notificationTimeouts = useRef<ReturnType<typeof setTimeout>[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load timer state on mount
  useEffect(() => {
    const stored = loadTimerState()
    if (stored) {
      setTimerState(stored)
    }
  }, [])

  // Update countdown every second
  useEffect(() => {
    if (!timerState?.isActive || !timerState.endTime) return

    // Clear any previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((timerState.endTime! - now) / 1000))

      if (remaining === 0) {
        // Timer expired
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        setTimerState(null)
        saveTimerState(null)

        // Final notification
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          new Notification("Time's up!", {
            body: "Your parking timer has expired. Move your vehicle now.",
            icon: "/favicon.ico",
          })
        }
        return
      }

      setTimerState(prev => {
        if (!prev) return null
        const updated = { ...prev, remainingSeconds: remaining }
        saveTimerState(updated)
        return updated
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [timerState?.isActive, timerState?.endTime])

  // Cleanup notification timeouts on unmount
  useEffect(() => {
    return () => {
      notificationTimeouts.current.forEach(clearTimeout)
      notificationTimeouts.current = []
    }
  }, [])

  const startTimer = useCallback(async (minutes: number) => {
    // SSR guard
    if (typeof window === "undefined") return null

    // Request notification permission
    if ("Notification" in window && Notification.permission !== "granted") {
      await Notification.requestPermission()
    }

    const endTime = Date.now() + minutes * 60 * 1000
    const remainingSeconds = minutes * 60

    const newState: TimerState = {
      isActive: true,
      endTime,
      totalMinutes: minutes,
      remainingSeconds,
      twentyMinNotified: false,
      tenMinNotified: false,
    }

    setTimerState(newState)
    saveTimerState(newState)

    // Clear any existing notification timeouts
    notificationTimeouts.current.forEach(clearTimeout)
    notificationTimeouts.current = []

    // Schedule local notifications (fallback for when app is in foreground)
    if ("Notification" in window && Notification.permission === "granted") {
      // 20-minute warning
      if (minutes > 20) {
        const twentyMinTimeout = setTimeout(() => {
          new Notification("20 minutes remaining", {
            body: "Your parking timer expires in 20 minutes.",
            icon: "/favicon.ico",
          })
          setTimerState(prev => prev ? { ...prev, twentyMinNotified: true } : null)
        }, (minutes - 20) * 60 * 1000)
        notificationTimeouts.current.push(twentyMinTimeout)
      }

      // 10-minute warning
      if (minutes > 10) {
        const tenMinTimeout = setTimeout(() => {
          new Notification("10 minutes remaining", {
            body: "Your parking timer expires in 10 minutes. Consider moving your vehicle.",
            icon: "/favicon.ico",
          })
          setTimerState(prev => prev ? { ...prev, tenMinNotified: true } : null)
        }, (minutes - 10) * 60 * 1000)
        notificationTimeouts.current.push(tenMinTimeout)
      }

      // 5-minute warning
      if (minutes > 5) {
        const fiveMinTimeout = setTimeout(() => {
          new Notification("5 minutes remaining", {
            body: "Your parking timer expires in 5 minutes!",
            icon: "/favicon.ico",
          })
        }, (minutes - 5) * 60 * 1000)
        notificationTimeouts.current.push(fiveMinTimeout)
      }
    }

    // Schedule server-side push notifications (works even when app is backgrounded)
    scheduleServerPush(minutes)

    return newState
  }, [])

  const cancelTimer = useCallback(() => {
    notificationTimeouts.current.forEach(clearTimeout)
    notificationTimeouts.current = []
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setTimerState(null)
    saveTimerState(null)

    // Cancel server-side scheduled notifications
    cancelServerPush()
  }, [])

  const formatTimeDisplay = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }, [])

  return {
    timerState,
    startTimer,
    cancelTimer,
    formatTimeDisplay,
    isActive: timerState?.isActive ?? false,
    remainingSeconds: timerState?.remainingSeconds ?? 0,
  }
}
