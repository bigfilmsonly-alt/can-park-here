"use client"

import { Clock, X } from "lucide-react"

interface TimerDisplayProps {
  remainingSeconds: number
  formatTime: (seconds: number) => string
  onCancel: () => void
}

export function TimerDisplay({ remainingSeconds, formatTime, onCancel }: TimerDisplayProps) {
  const isUrgent = remainingSeconds <= 600 // 10 minutes or less
  const isCritical = remainingSeconds <= 300 // 5 minutes or less

  return (
    <div 
      className={`flex items-center justify-between p-4 rounded-2xl mb-6 transition-colors ${
        isCritical 
          ? "bg-status-error/10" 
          : isUrgent 
            ? "bg-status-warning/10" 
            : "bg-muted"
      }`}
    >
      <div className="flex items-center gap-3">
        <div 
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isCritical 
              ? "bg-status-error/20" 
              : isUrgent 
                ? "bg-status-warning/20" 
                : "bg-muted-foreground/10"
          }`}
        >
          <Clock 
            className={`h-5 w-5 ${
              isCritical 
                ? "text-status-error-foreground" 
                : isUrgent 
                  ? "text-status-warning-foreground" 
                  : "text-muted-foreground"
            }`} 
          />
        </div>
        <div>
          <p 
            className={`text-2xl font-semibold tracking-tight tabular-nums ${
              isCritical 
                ? "text-status-error-foreground" 
                : isUrgent 
                  ? "text-status-warning-foreground" 
                  : "text-foreground"
            }`}
          >
            {formatTime(remainingSeconds)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isCritical 
              ? "Move your car soon!" 
              : isUrgent 
                ? "Timer ending soon" 
                : "Time remaining"}
          </p>
        </div>
      </div>
      <button
        onClick={onCancel}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Cancel timer"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}
