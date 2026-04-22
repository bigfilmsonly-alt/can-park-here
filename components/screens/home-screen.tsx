"use client"

import {
  MapPin,
  Camera,
  Clock,
  Bookmark,
  Map,
  ShieldCheck,
} from "lucide-react"
import type { ProtectionSession } from "@/lib/protection"
import { formatTimeRemaining } from "@/lib/parking-rules"

interface HomeScreenProps {
  onCheckParking: () => void
  onResumeSession: () => void
  onScanSign: () => void
  onSetTimer: () => void
  onOpenMap: () => void
  onOpenSaved?: () => void
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
  onOpenMap,
  onOpenSaved,
  loading,
  error,
  activeSession,
  sessionTimeRemaining,
  remainingChecks,
  onUpgrade,
  timerActive,
  timerRemainingSeconds,
  formatTimerDisplay,
  onCancelTimer,
  onOpenSettings,
}: HomeScreenProps) {
  const hasActiveSession = activeSession?.status === "active"

  const hour = new Date().getHours()
  const greeting =
    hour >= 18
      ? "Good evening"
      : hour >= 12
        ? "Good afternoon"
        : hour >= 5
          ? "Good morning"
          : "Good evening"

  return (
    <div
      className="flex flex-col min-h-[calc(100vh-5rem)] pt-4 pb-28"
      style={{ paddingLeft: 22, paddingRight: 22, background: "#000000" }}
    >
      {/* ── Active Session Ticker ── */}
      {hasActiveSession && (
        <button
          onClick={onResumeSession}
          className="flex items-center justify-between px-4 py-3 rounded-2xl mb-4 w-full text-left"
          style={{
            background: "rgba(52,199,89,0.12)",
            border: "1px solid rgba(52,199,89,0.25)",
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="relative shrink-0 w-2.5 h-2.5" style={{ color: "var(--accent)" }}>
              <span
                className="absolute inset-0 rounded-full animate-pulse"
                style={{ background: "currentColor" }}
              />
              <span
                className="sonar-ring absolute inset-0 rounded-full"
                style={{ borderColor: "currentColor" }}
              />
            </span>
            <div className="min-w-0">
              <p
                className="text-sm font-semibold truncate"
                style={{ color: "#34C759" }}
              >
                {sessionTimeRemaining !== null &&
                  formatTimeRemaining(sessionTimeRemaining)}{" "}
                remaining
              </p>
              <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.5)" }}>
                {activeSession.locationStreet}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCancelTimer()
            }}
            className="px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 ml-3"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
            }}
          >
            End
          </button>
        </button>
      )}

      {/* ── Timer Ticker ── */}
      {timerActive && !hasActiveSession && (
        <div
          className="flex items-center justify-between px-4 py-3 rounded-2xl mb-4"
          style={{
            background: "rgba(52,199,89,0.12)",
            border: "1px solid rgba(52,199,89,0.25)",
          }}
        >
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4" style={{ color: "#34C759" }} />
            <span className="text-sm font-semibold" style={{ color: "#34C759" }}>
              {formatTimerDisplay(timerRemainingSeconds)}
            </span>
          </div>
          <button
            onClick={onCancelTimer}
            className="px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Greeting ── */}
      <div className="flex items-center justify-between">
        <div>
          <p
            className="font-bold tracking-tight"
            style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}
          >
            {greeting}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0 animate-pulse"
              style={{ background: "#34C759" }}
            />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              Valencia &amp; 20th St
            </p>
          </div>
        </div>
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.07)" }}
            aria-label="Settings"
          >
            <span
              className="text-lg"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              ...
            </span>
          </button>
        )}
      </div>

      {/* ── "Can I park here?" headline ── */}
      <div className="mt-8">
        <h1
          style={{
            fontSize: 34,
            fontWeight: 900,
            letterSpacing: -1,
            lineHeight: 1.1,
            color: "#fff",
          }}
        >
          Can I park{" "}
          <span style={{ color: "var(--accent, #34C759)" }}>here</span>?
        </h1>
      </div>

      {/* ── Circular Scan Button ── */}
      <div className="flex flex-col items-center mt-10 spring-in">
        <button
          onClick={onScanSign}
          disabled={loading}
          className="relative flex items-center justify-center disabled:opacity-50 breathe-glow"
          style={{ width: 120, height: 120 }}
          aria-label="Scan a sign"
        >
          {/* Rotating conic gradient border */}
          <div
            className="absolute inset-0 rounded-full animate-conic-spin"
            style={{
              background:
                "conic-gradient(from 0deg, #34C759, transparent 40%, transparent 60%, #34C759)",
              padding: 3,
            }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{ background: "#000" }}
            />
          </div>

          {/* Inner circle */}
          <div
            className="absolute rounded-full flex items-center justify-center"
            style={{
              width: 112,
              height: 112,
              background: "rgba(52,199,89,0.08)",
              border: "1px solid rgba(52,199,89,0.2)",
            }}
          >
            <Camera className="w-8 h-8" style={{ color: "#fff" }} />
          </div>
        </button>
        <p
          className="mt-4 text-sm font-semibold"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          Scan a sign
        </p>
      </div>

      {/* ── 2x2 Quick Action Grid ── */}
      <div className="grid grid-cols-2 gap-3 mt-10 stagger-spring">
        {/* Check Here */}
        <button
          onClick={onCheckParking}
          disabled={loading || remainingChecks === 0}
          className="glass-card p-4 text-left press-effect hover-lift-interactive disabled:opacity-50"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 18,
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
            style={{ background: "rgba(52,199,89,0.12)" }}
          >
            <MapPin className="w-5 h-5" style={{ color: "#34C759" }} />
          </div>
          <p className="text-sm font-bold" style={{ color: "#fff" }}>
            Check Here
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            Instant answer
          </p>
        </button>

        {/* Set Timer */}
        <button
          onClick={onSetTimer}
          disabled={loading || timerActive}
          className="glass-card p-4 text-left press-effect hover-lift-interactive disabled:opacity-50"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 18,
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
            style={{ background: "rgba(52,199,89,0.12)" }}
          >
            <Clock className="w-5 h-5" style={{ color: "#34C759" }} />
          </div>
          <p className="text-sm font-bold" style={{ color: "#fff" }}>
            Set Timer
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            Smart alerts
          </p>
        </button>

        {/* Saved Spots */}
        <button
          onClick={onOpenSaved}
          className="glass-card p-4 text-left press-effect hover-lift-interactive"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 18,
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
            style={{ background: "rgba(52,199,89,0.12)" }}
          >
            <Bookmark className="w-5 h-5" style={{ color: "#34C759" }} />
          </div>
          <p className="text-sm font-bold" style={{ color: "#fff" }}>
            Saved Spots
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            Your places
          </p>
        </button>

        {/* Map */}
        <button
          onClick={onOpenMap}
          className="glass-card p-4 text-left press-effect hover-lift-interactive"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 18,
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
            style={{ background: "rgba(52,199,89,0.12)" }}
          >
            <Map className="w-5 h-5" style={{ color: "#34C759" }} />
          </div>
          <p className="text-sm font-bold" style={{ color: "#fff" }}>
            Map
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            Nearby parking
          </p>
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div
          className="mt-4 p-4 rounded-2xl text-sm text-center"
          style={{
            background: "rgba(255,59,48,0.12)",
            color: "#FF3B30",
          }}
        >
          {error}
        </div>
      )}

      {/* ── Pro Upgrade Strip ── */}
      <div
        className="mt-auto pt-8"
      >
        <div
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "rgba(52,199,89,0.15)" }}
          >
            <ShieldCheck className="w-5 h-5" style={{ color: "#34C759" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: "#fff" }}>
              Ticket Protection
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
              We pay if you get a ticket
            </p>
          </div>
          <button
            onClick={onUpgrade}
            className="px-4 py-2 rounded-full text-xs font-bold shrink-0"
            style={{
              background: "#34C759",
              color: "#000",
              letterSpacing: -0.2,
            }}
          >
            Try free
          </button>
        </div>
      </div>
    </div>
  )
}
