"use client"

import { Button } from "@/components/ui/button"
import { TimerDisplay } from "@/components/timer-display"
import {
  Loader2,
  MapPin,
  Camera,
  Clock,
  ChevronRight,
  Settings,
  ShieldCheck,
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
  onOpenSettings?: () => void
  onOpenHistory?: () => void
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
  onOpenSettings,
  onOpenHistory,
}: HomeScreenProps) {
  const hasActiveSession = activeSession?.status === "active"
  const isLimitReached = remainingChecks === 0

  const hour = new Date().getHours()
  const greeting = hour >= 18 ? "Good evening" : hour >= 12 ? "Good afternoon" : hour >= 5 ? "Good morning" : "Good evening"

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] pt-4 pb-28" style={{ paddingLeft: 22, paddingRight: 22 }}>
      {/* Header: greeting + settings */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[22px] font-bold tracking-tight">
            {greeting}, Alex
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Valencia &amp; 20th</p>
          </div>
        </div>
        <button
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
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
            style={{ background: "var(--accent-pale)", color: "var(--accent-ink)", letterSpacing: -0.2 }}
          >
            Saved
          </span>
        </button>
      )}

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
              style={{ letterSpacing: -0.2 }}
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
                className="mt-2 leading-none"
                style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1 }}
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
              <div className="flex items-center gap-2 rounded-full w-fit px-3.5 py-2.5 mt-4" style={{ background: "rgba(255,255,255,0.18)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                <span className="text-xs font-semibold">Live on Valencia St</span>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Shortcut cards: Scan + Timer */}
      {!isLimitReached && (
        <div className="grid grid-cols-2 gap-3 mt-3">
          <button
            onClick={onScanSign}
            disabled={loading || isLimitReached}
            className="p-4 rounded-[18px] bg-card card-elevated text-left press-effect disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5" style={{ background: "var(--accent-pale)" }}>
              <Camera className="w-[18px] h-[18px] text-accent" />
            </div>
            <p className="text-sm font-bold">Scan sign</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Read any sign
            </p>
          </button>
          <button
            onClick={onSetTimer}
            disabled={loading || timerActive}
            className="p-4 rounded-[18px] bg-card card-elevated text-left press-effect disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5" style={{ background: "var(--accent-pale)" }}>
              <Clock className="w-[18px] h-[18px] text-accent" />
            </div>
            <p className="text-sm font-bold">Set timer</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              With smart alerts
            </p>
          </button>
        </div>
      )}

      {/* Stats strip */}
      <div className="bg-card card-elevated rounded-[18px] p-3.5 grid grid-cols-3 mt-4">
        {[["$312", "saved"], ["3", "tickets avoided"], ["142", "karma"]].map(([n, l], i) => (
          <div key={i} className="text-center" style={{ borderLeft: i ? "1px solid var(--hairline)" : "none" }}>
            <div className="text-xl font-bold">{n}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      {/* Pro nudge (free tier) */}
      {isLimitReached || remainingChecks > 0 ? (
        <div className="bg-foreground text-background rounded-[18px] p-4 mt-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--accent)" }}>
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Ticket Protection Pro</p>
            <p className="text-[11px] opacity-60 mt-0.5">We pay up to $100 · $4.99/mo</p>
          </div>
          <button
            onClick={onUpgrade}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0"
            style={{ background: "var(--accent)", color: "#fff", letterSpacing: -0.2 }}
          >
            Try free
          </button>
        </div>
      ) : null}

      {/* Recent section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[15px] font-bold">Recent</p>
          <button onClick={onOpenHistory} className="text-sm font-semibold text-accent" style={{ letterSpacing: -0.2 }}>
            See all
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { status: "success" as const, label: "Allowed · Valencia & 20th", time: "22 min ago" },
            { status: "success" as const, label: "Allowed · Market & Castro", time: "2 hr ago" },
            { status: "warning" as const, label: "2-hr limit · Dolores & 18th", time: "Yesterday" },
            { status: "success" as const, label: "Allowed · Mission & 24th", time: "Yesterday" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3.5 rounded-[18px] bg-card card-elevated"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: item.status === "success" ? "var(--status-success-bg)" : "var(--status-warning-bg)",
                  color: item.status === "success" ? "var(--status-success-foreground)" : "var(--status-warning-foreground)",
                }}
              >
                <Check className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold tracking-tight truncate">{item.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.time}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          ))}
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
    </div>
  )
}
