"use client"

import { useCallback } from "react"

type HapticType = "light" | "medium" | "heavy" | "success" | "warning" | "error" | "selection"

export function useHaptics() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern)
    }
  }, [])

  const trigger = useCallback((type: HapticType = "light") => {
    // Vibration patterns for different feedback types
    const patterns: Record<HapticType, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 30,
      success: [10, 50, 20],
      warning: [20, 100, 20],
      error: [30, 50, 30, 50, 30],
      selection: 5,
    }

    vibrate(patterns[type])
  }, [vibrate])

  // Convenience methods
  const light = useCallback(() => trigger("light"), [trigger])
  const medium = useCallback(() => trigger("medium"), [trigger])
  const heavy = useCallback(() => trigger("heavy"), [trigger])
  const success = useCallback(() => trigger("success"), [trigger])
  const warning = useCallback(() => trigger("warning"), [trigger])
  const error = useCallback(() => trigger("error"), [trigger])
  const selection = useCallback(() => trigger("selection"), [trigger])

  return {
    trigger,
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
    vibrate,
  }
}
