"use client"

import { useState, useEffect } from "react"
import { MapPin, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

// Compact widget for home screen / lock screen preview
export default function WidgetPage() {
  const [status, setStatus] = useState<"loading" | "allowed" | "restricted" | "prohibited">("loading")
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [location, setLocation] = useState<string>("Checking...")

  useEffect(() => {
    // Simulate loading parking status
    const timer = setTimeout(() => {
      // Check for active session in localStorage
      const sessionData = localStorage.getItem("park_active_session")
      if (sessionData) {
        const session = JSON.parse(sessionData)
        setLocation(session.locationStreet || "Current Location")
        setStatus(session.status === "active" ? "allowed" : "restricted")
        
        if (session.timeLimit) {
          const elapsed = (Date.now() - session.startTime) / 1000 / 60
          const remaining = Math.max(0, session.timeLimit - elapsed)
          setTimeRemaining(Math.floor(remaining))
        }
      } else {
        setStatus("allowed")
        setLocation("No active session")
        setTimeRemaining(null)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Update timer every minute
  useEffect(() => {
    if (timeRemaining === null) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) return 0
        return prev - 1
      })
    }, 60000)

    return () => clearInterval(interval)
  }, [timeRemaining])

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hrs > 0) {
      return `${hrs}h ${mins}m`
    }
    return `${mins}m`
  }

  const getStatusColor = () => {
    switch (status) {
      case "allowed":
        return "bg-[oklch(0.75_0.14_145)]"
      case "restricted":
        return "bg-[oklch(0.82_0.12_85)]"
      case "prohibited":
        return "bg-[oklch(0.75_0.12_25)]"
      default:
        return "bg-muted"
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "allowed":
        return <CheckCircle className="h-6 w-6 text-[oklch(0.35_0.1_145)]" />
      case "restricted":
        return <AlertTriangle className="h-6 w-6 text-[oklch(0.4_0.1_85)]" />
      case "prohibited":
        return <XCircle className="h-6 w-6 text-[oklch(0.45_0.1_25)]" />
      default:
        return <Clock className="h-6 w-6 text-muted-foreground" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "allowed":
        return "You can park"
      case "restricted":
        return "Time limited"
      case "prohibited":
        return "Don't park here"
      default:
        return "Checking..."
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Small Widget (2x2) */}
      <div className="space-y-6">
        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Small Widget</p>
          <div className={`w-40 h-40 rounded-3xl ${getStatusColor()} p-4 flex flex-col justify-between shadow-lg`}>
            <div className="flex items-start justify-between">
              {getStatusIcon()}
              <span className="text-[10px] font-medium text-foreground/60 uppercase">Park</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{getStatusText()}</p>
              {timeRemaining !== null && timeRemaining > 0 && (
                <p className="text-sm text-foreground/70">{formatTime(timeRemaining)} left</p>
              )}
            </div>
          </div>
        </div>

        {/* Medium Widget (4x2) */}
        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Medium Widget</p>
          <div className={`w-80 h-40 rounded-3xl ${getStatusColor()} p-5 flex flex-col justify-between shadow-lg`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="text-sm font-medium text-foreground">{getStatusText()}</span>
              </div>
              <span className="text-xs font-medium text-foreground/60 uppercase">Park</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-sm text-foreground/70 mb-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[180px]">{location}</span>
                </div>
                {timeRemaining !== null && timeRemaining > 0 && (
                  <div className="flex items-center gap-1.5 text-sm text-foreground/70">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatTime(timeRemaining)} remaining</span>
                  </div>
                )}
              </div>
              <button className="px-4 py-2 bg-foreground/10 hover:bg-foreground/20 rounded-full text-sm font-medium text-foreground transition-colors">
                Check
              </button>
            </div>
          </div>
        </div>

        {/* Large Widget (4x4) */}
        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Large Widget</p>
          <div className={`w-80 h-80 rounded-3xl ${getStatusColor()} p-6 flex flex-col shadow-lg`}>
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-foreground/10 flex items-center justify-center">
                {getStatusIcon()}
              </div>
              <span className="text-sm font-medium text-foreground/60 uppercase">Park</span>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-3xl font-semibold text-foreground mb-2">{getStatusText()}</p>
              <div className="flex items-center gap-1.5 text-base text-foreground/70">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{location}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-foreground/10">
              {timeRemaining !== null && timeRemaining > 0 ? (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-foreground/70" />
                  <div>
                    <p className="text-2xl font-semibold text-foreground">{formatTime(timeRemaining)}</p>
                    <p className="text-xs text-foreground/60">remaining</p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-foreground/60">No active timer</div>
              )}
              <button className="px-5 py-2.5 bg-foreground/10 hover:bg-foreground/20 rounded-full text-sm font-medium text-foreground transition-colors">
                Check Parking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
