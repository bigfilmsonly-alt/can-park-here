"use client"

import { Button } from "@/components/ui/button"
import { ProtectionBadge } from "@/components/ui/protection-badge"
import { TimerDisplay } from "@/components/timer-display"
import { AlertsPanel } from "@/components/alerts-panel"
import { Loader2, ChevronRight, Camera, Clock, MapPin, Sparkles, Trophy, Map } from "lucide-react"
import type { ProtectionSession } from "@/lib/protection"
import { formatTimeRemaining } from "@/lib/parking-rules"

interface HomeScreenProps {
  onCheckParking: () => void
  onResumeSession: () => void
  onScanSign: () => void
  onSetTimer: () => void
  onOpenPredictions: () => void
  onOpenRewards: () => void
  onOpenMap: () => void
  loading?: boolean
  error?: string | null
  activeSession: ProtectionSession | null
  sessionTimeRemaining: number | null
  remainingChecks: number
  onUpgrade: () => void
  currentLocation?: { lat: number; lng: number }
  // Timer props
  timerActive: boolean
  timerRemainingSeconds: number
  formatTimerDisplay: (seconds: number) => string
  onCancelTimer: () => void
}

export function HomeScreen({
  onCheckParking,
  onResumeSession,
  onScanSign,
  onSetTimer,
  onOpenPredictions,
  onOpenRewards,
  onOpenMap,
  loading,
  error,
  activeSession,
  sessionTimeRemaining,
  remainingChecks,
  onUpgrade,
  currentLocation,
  timerActive,
  timerRemainingSeconds,
  formatTimerDisplay,
  onCancelTimer,
}: HomeScreenProps) {
  const hasActiveSession = activeSession?.status === "active"
  const isLimitReached = remainingChecks === 0

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-6 py-8">
      {/* Smart alerts */}
      <div className="mb-4">
        <AlertsPanel 
          location={currentLocation} 
          onAction={() => onCheckParking()}
        />
      </div>

      {/* Active timer countdown */}
      {timerActive && (
        <TimerDisplay
          remainingSeconds={timerRemainingSeconds}
          formatTime={formatTimerDisplay}
          onCancel={onCancelTimer}
        />
      )}

      {/* Active session banner */}
      {hasActiveSession && !timerActive && (
        <button
          onClick={onResumeSession}
          className="flex items-center justify-between p-4 rounded-2xl bg-status-success/10 mb-6 text-left w-full group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-status-success/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-status-success-foreground animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium text-status-success-foreground">
                Currently parked
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeSession.locationStreet} · {sessionTimeRemaining !== null && formatTimeRemaining(sessionTimeRemaining)} remaining
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center text-center max-w-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground text-balance leading-tight">
            Can I park here?
          </h1>

          <p className="mt-4 text-lg text-muted-foreground leading-relaxed text-nowrap">
            Clear answers. No tickets.<br />No confusion.
          </p>

          <div className="mt-10 w-full space-y-3">
            {isLimitReached ? (
              <>
                <div className="p-4 rounded-2xl bg-muted text-center">
                  <p className="text-sm text-foreground font-medium">Free checks used up</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upgrade to Pro for unlimited checks and ticket protection
                  </p>
                </div>
                <Button
                  onClick={onUpgrade}
                  className="w-full h-14 text-base font-medium rounded-2xl"
                >
                  Upgrade to Pro
                </Button>
              </>
            ) : (
              <>
                {/* Primary action - Check Parking */}
                <Button
                  onClick={onCheckParking}
                  disabled={loading}
                  className="w-full h-14 text-base font-medium rounded-2xl"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Finding your location
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Check Parking
                    </span>
                  )}
                </Button>

                {/* Secondary actions */}
                <div className="grid grid-cols-5 gap-1.5 w-full">
                  <button
                    onClick={onScanSign}
                    disabled={loading || isLimitReached}
                    className="flex flex-col items-center justify-center gap-1 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors rounded-xl border border-border disabled:opacity-50"
                  >
                    <Camera className="h-4 w-4" />
                    Scan
                  </button>
                  <button
                    onClick={onSetTimer}
                    disabled={loading || timerActive}
                    className="flex flex-col items-center justify-center gap-1 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors rounded-xl border border-border disabled:opacity-50"
                  >
                    <Clock className="h-4 w-4" />
                    Timer
                  </button>
                  <button
                    onClick={onOpenMap}
                    className="flex flex-col items-center justify-center gap-1 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors rounded-xl border border-border"
                  >
                    <Map className="h-4 w-4" />
                    Map
                  </button>
                  <button
                    onClick={onOpenPredictions}
                    disabled={loading}
                    className="flex flex-col items-center justify-center gap-1 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors rounded-xl border border-border disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4" />
                    Predict
                  </button>
                  <button
                    onClick={onOpenRewards}
                    className="flex flex-col items-center justify-center gap-1 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors rounded-xl border border-border"
                  >
                    <Trophy className="h-4 w-4" />
                    Rewards
                  </button>
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="mt-6 p-4 rounded-2xl bg-status-error/10 text-status-error-foreground text-sm text-center">
              {error}
            </div>
          )}

          {/* Pro upgrade prompt */}
          {!isLimitReached && (
            <button
              onClick={onUpgrade}
              className="mt-6 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Get unlimited checks with Pro
            </button>
          )}
        </div>
      </div>

      {/* Bottom section */}
      <div className="mt-auto pt-8 pb-16 space-y-6">
        {/* Protection status */}
        <ProtectionBadge isActive={hasActiveSession} />

        {/* Trust statement */}
        <p className="text-center text-sm text-muted-foreground/70 max-w-xs mx-auto leading-relaxed">
          If you follow our guidance and still receive a ticket, we'll cover it.
        </p>
      </div>
    </div>
  )
}
