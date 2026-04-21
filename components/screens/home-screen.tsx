"use client"

import { Button } from "@/components/ui/button"
import { TimerDisplay } from "@/components/timer-display"
import { AlertsPanel } from "@/components/alerts-panel"
import {
  Loader2,
  MapPin,
  Camera,
  Clock,
  ChevronRight,
  Mic,
  ShieldCheck,
  Zap,
  Check,
} from "lucide-react"
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
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-5 pt-4 pb-28">
      {/* Top row: avatar + streak */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--accent-deep))",
            }}
          >
            P
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground font-medium">
              Good evening
            </p>
            <p className="text-[15px] font-semibold tracking-tight">Park</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
          <Zap className="w-3.5 h-3.5 text-accent" />
          <span className="text-[13px] font-semibold">14-day streak</span>
        </div>
      </div>

      {/* Smart alerts */}
      <div className="mt-4">
        <AlertsPanel
          location={currentLocation}
          onAction={(alert) => {
            if (alert.actionType === "check_parking") {
              onCheckParking()
            }
          }}
        />
      </div>

      {/* Active timer */}
      {timerActive && (
        <div className="mt-4">
          <TimerDisplay
            remainingSeconds={timerRemainingSeconds}
            formatTime={formatTimerDisplay}
            onCancel={onCancelTimer}
          />
        </div>
      )}

      {/* Active session banner */}
      {hasActiveSession && !timerActive && (
        <button
          onClick={onResumeSession}
          aria-label="Resume active parking session"
          className="flex items-center justify-between p-4 rounded-2xl mt-4 text-left w-full group"
          style={{ background: "var(--status-success-bg)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-[14px] flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.2)" }}
            >
              <Check className="w-5 h-5 text-status-success-foreground" />
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-tight">
                Allowed · {sessionTimeRemaining !== null && formatTimeRemaining(sessionTimeRemaining)} ago
              </p>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                {activeSession.locationStreet}
              </p>
            </div>
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: "var(--accent-pale)", color: "var(--accent-ink)" }}
          >
            Saved
          </span>
        </button>
      )}

      {/* Location line */}
      <div className="mt-6">
        <p className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">
          You&apos;re on
        </p>
        <p className="text-[26px] font-semibold tracking-tight mt-1">
          Market St &amp; Valencia
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">
          San Francisco · ±5m accuracy
        </p>
      </div>

      {/* Primary CTA: "Can I park here?" hero card */}
      <div className="mt-6">
        {isLimitReached ? (
          <div className="rounded-[22px] p-6 bg-muted text-center">
            <p className="text-sm font-medium">Free checks used up</p>
            <p className="text-xs text-muted-foreground mt-1">
              Upgrade to Pro for unlimited checks and ticket protection
            </p>
            <Button
              onClick={onUpgrade}
              className="w-full h-14 text-base font-semibold rounded-full mt-4"
            >
              Upgrade to Pro
            </Button>
          </div>
        ) : (
          <button
            onClick={onCheckParking}
            disabled={loading}
            className="w-full rounded-[26px] text-left overflow-hidden press-effect disabled:opacity-70"
            style={{
              background: "linear-gradient(150deg, var(--accent), var(--accent-deep))",
              color: "#fff",
              boxShadow: "0 20px 40px rgba(59,130,246,0.25)",
            }}
          >
            <div className="p-6 pb-6">
              <p className="text-[11px] font-extrabold tracking-[1.2px] opacity-85 uppercase">
                CAN I PARK HERE?
              </p>
              <h2
                className="mt-2 font-bold leading-none"
                style={{ fontSize: 42, letterSpacing: -1.5 }}
              >
                {loading ? "Checking..." : "Tap to check."}
              </h2>
              <p className="text-sm opacity-85 mt-2.5">
                Instant answer · Protected by Guarantee
              </p>
              {loading && (
                <div className="flex items-center gap-2 mt-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm opacity-80">Finding your location</span>
                </div>
              )}
              <div
                className="flex items-center gap-2 mt-4.5 px-3.5 py-2.5 rounded-full w-fit"
                style={{ background: "rgba(255,255,255,0.18)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                <span className="text-xs font-semibold">Live on your block</span>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Secondary actions: Scan + Timer */}
      {!isLimitReached && (
        <div className="grid grid-cols-2 gap-3 mt-3">
          <button
            onClick={onScanSign}
            disabled={loading || isLimitReached}
            className="p-[18px] rounded-[22px] bg-card border border-border text-left press-effect disabled:opacity-50"
            style={{
              boxShadow:
                "0 1px 2px rgba(0,0,0,.03), 0 1px 8px rgba(0,0,0,.02)",
            }}
          >
            <div className="text-accent mb-2.5">
              <Camera className="w-[22px] h-[22px]" />
            </div>
            <p className="text-base font-semibold tracking-tight">Scan sign</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Point at any sign
            </p>
          </button>
          <button
            onClick={onSetTimer}
            disabled={loading || timerActive}
            className="p-[18px] rounded-[22px] bg-card border border-border text-left press-effect disabled:opacity-50"
            style={{
              boxShadow:
                "0 1px 2px rgba(0,0,0,.03), 0 1px 8px rgba(0,0,0,.02)",
            }}
          >
            <div className="text-accent mb-2.5">
              <Clock className="w-[22px] h-[22px]" />
            </div>
            <p className="text-base font-semibold tracking-tight">Set timer</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Remind me before
            </p>
          </button>
        </div>
      )}

      {/* Last check section */}
      <div className="mt-6">
        <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
          Last check
        </p>
        <div
          className="flex items-center gap-3.5 p-4 rounded-[22px] bg-card border border-border"
          style={{
            boxShadow:
              "0 1px 2px rgba(0,0,0,.03), 0 1px 8px rgba(0,0,0,.02)",
          }}
        >
          <div
            className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0"
            style={{
              background: "var(--status-success-bg)",
              color: "var(--status-success-foreground)",
            }}
          >
            <Check className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold tracking-tight">
              Allowed · 22 min ago
            </p>
            <p className="text-[13px] text-muted-foreground mt-0.5 truncate">
              Valencia &amp; 20th · expired 4 min ago
            </p>
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
            style={{
              background: "var(--accent-pale)",
              color: "var(--accent-ink)",
            }}
          >
            Saved
          </span>
        </div>
      </div>

      {error && (
        <div
          className="mt-4 p-4 rounded-2xl text-sm text-center"
          style={{
            background: "var(--status-error-bg)",
            color: "var(--status-error-foreground)",
          }}
        >
          {error}
        </div>
      )}

      {/* Voice FAB */}
      <div className="fixed right-6 z-30" style={{ bottom: 108 }}>
        <button
          className="w-14 h-14 rounded-full flex items-center justify-center text-white press-effect"
          style={{
            background: "var(--accent)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          }}
          aria-label="Voice command"
        >
          <Mic className="w-6 h-6" />
        </button>
      </div>

      {/* Protection footer */}
      <div className="mt-auto pt-6 flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-accent" />
        <span className="text-xs text-muted-foreground">
          Protected by Ticket Guarantee
        </span>
      </div>
    </div>
  )
}
