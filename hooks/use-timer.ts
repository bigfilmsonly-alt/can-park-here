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
  const stored = localStorage.getItem(TIMER_STORAGE_KEY)
  if (!stored) return null
  
  try {
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
  if (state) {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state))
  } else {
    localStorage.removeItem(TIMER_STORAGE_KEY)
  }
}

export function useTimer() {
  const [timerState, setTimerState] = useState<TimerState | null>(null)
  const notificationTimeouts = useRef<NodeJS.Timeout[]>([])

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

    const interval = setInterval(() => {
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((timerState.endTime! - now) / 1000))
      
      if (remaining === 0) {
        // Timer expired
        clearInterval(interval)
        setTimerState(null)
        saveTimerState(null)
        
        // Final notification
        if ("Notification" in window && Notification.permission === "granted") {
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

    return () => clearInterval(interval)
  }, [timerState?.isActive, timerState?.endTime])

  const startTimer = useCallback(async (minutes: number) => {
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

    // Schedule notifications
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

    return newState
  }, [])

  const cancelTimer = useCallback(() => {
    notificationTimeouts.current.forEach(clearTimeout)
    notificationTimeouts.current = []
    setTimerState(null)
    saveTimerState(null)
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
