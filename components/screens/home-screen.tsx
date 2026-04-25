"use client"

import {
  MapPin,
  Camera,
  Clock,
  Bookmark,
  Map,
  ShieldCheck,
  Check,
  ChevronRight,
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

  return (
    <div
      className="flex flex-col min-h-[calc(100vh-5rem)] pt-4 pb-28"
      style={{ paddingLeft: 22, paddingRight: 22, background: "#0b0f17" }}
    >
      {/* ── Active Session Ticker ── */}
      {hasActiveSession && (
        <button
          onClick={onResumeSession}
          className="flex items-center justify-between px-4 py-3 rounded-2xl mb-4 w-full text-left"
          style={{
            background: "rgba(16,185,129,0.12)",
            border: "1px solid rgba(16,185,129,0.25)",
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="relative shrink-0 w-2.5 h-2.5">
              <span
                className="absolute inset-0 rounded-full animate-pulse"
                style={{ background: "#10b981" }}
              />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "#10b981" }}>
                {sessionTimeRemaining !== null && formatTimeRemaining(sessionTimeRemaining)} remaining
              </p>
              <p className="text-xs truncate" style={{ color: "#94a3b8" }}>
                {activeSession.locationStreet}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onCancelTimer() }}
            className="px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 ml-3"
            style={{ background: "rgba(255,255,255,0.1)", color: "#f8fafc" }}
          >
            End
          </button>
        </button>
      )}

      {/* ── Timer Ticker ── */}
      {timerActive && !hasActiveSession && (
        <div
          className="flex items-center justify-between px-4 py-3 rounded-2xl mb-4"
          style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}
        >
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4" style={{ color: "#10b981" }} />
            <span className="text-sm font-semibold" style={{ color: "#10b981" }}>
              {formatTimerDisplay(timerRemainingSeconds)}
            </span>
          </div>
          <button
            onClick={onCancelTimer}
            className="px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.1)", color: "#f8fafc" }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Location Pulse Chip ── */}
      <div className="flex items-center justify-between">
        <div
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}
        >
          <span className="relative w-2 h-2 shrink-0">
            <span className="absolute inset-0 rounded-full" style={{ background: "#10b981" }} />
            <span
              className="absolute rounded-full animate-ping"
              style={{ inset: -3, background: "rgba(16,185,129,0.4)" }}
            />
          </span>
          <span className="text-[13px] font-semibold" style={{ color: "#10b981" }}>
            San Francisco · Live
          </span>
        </div>
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.07)" }}
            aria-label="Settings"
          >
            <span className="text-lg" style={{ color: "#94a3b8" }}>···</span>
          </button>
        )}
      </div>

      {/* ── Hero Headline ── */}
      <div className="mt-8">
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: -1.2,
            lineHeight: 1.05,
            color: "#f8fafc",
          }}
        >
          Can I Park Here?
        </h1>
        <p
          className="mt-3"
          style={{ fontSize: 15, lineHeight: 1.5, color: "#cbd5e1", fontWeight: 500 }}
        >
          We'll pay your ticket if we're wrong.{" "}
          <span style={{ color: "#3b82f6", fontWeight: 700 }}>Up to $100.</span>
        </p>
      </div>

      {/* ── Scan Button ── */}
      <div className="flex flex-col items-center mt-10">
        <button
          onClick={onScanSign}
          disabled={loading}
          className="relative flex items-center justify-center disabled:opacity-50"
          style={{ width: 120, height: 120 }}
          aria-label="Scan a sign"
        >
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{
              background: "conic-gradient(from 0deg, #3b82f6, transparent 40%, transparent 60%, #3b82f6)",
              padding: 3,
              animationDuration: "3s",
            }}
          >
            <div className="w-full h-full rounded-full" style={{ background: "#0b0f17" }} />
          </div>
          <div
            className="absolute rounded-full flex items-center justify-center"
            style={{
              width: 112, height: 112,
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            <Camera className="w-8 h-8" style={{ color: "#f8fafc" }} />
          </div>
        </button>
        <p className="mt-4 text-sm font-semibold" style={{ color: "#94a3b8" }}>
          Scan a sign
        </p>
      </div>

      {/* ── Sample Result Card ── */}
      <div
        className="mt-8 p-5 rounded-[22px] press-effect"
        style={{
          background: "linear-gradient(145deg, rgba(16,185,129,0.14), rgba(16,185,129,0.06))",
          border: "1px solid rgba(16,185,129,0.25)",
        }}
        onClick={onCheckParking}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.2)" }}
            >
              <Check className="w-5 h-5" style={{ color: "#10b981" }} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#10b981" }}>
                Yes, park here
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                95% confidence · Valencia & 20th
              </p>
            </div>
          </div>
          <div
            className="px-3 py-1.5 rounded-full text-[11px] font-bold"
            style={{ background: "rgba(16,185,129,0.2)", color: "#10b981" }}
          >
            Protected
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3.5 pt-3.5" style={{ borderTop: "1px solid rgba(16,185,129,0.15)" }}>
          <ShieldCheck className="w-3.5 h-3.5" style={{ color: "rgba(16,185,129,0.6)" }} />
          <p className="text-[11px]" style={{ color: "#94a3b8" }}>
            Tap to check your current spot · Protected by Ticket Guarantee
          </p>
        </div>
      </div>

      {/* ── 2x2 Quick Actions ── */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <button
          onClick={onCheckParking}
          disabled={loading || remainingChecks === 0}
          className="p-4 text-left press-effect disabled:opacity-50"
          style={{ background: "#1a1f2b", border: "1px solid #2d3447", borderRadius: 18 }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(59,130,246,0.12)" }}>
            <MapPin className="w-5 h-5" style={{ color: "#3b82f6" }} />
          </div>
          <p className="text-sm font-bold" style={{ color: "#f8fafc" }}>Check Here</p>
          <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>Instant answer</p>
        </button>
        <button
          onClick={onSetTimer}
          disabled={loading || timerActive}
          className="p-4 text-left press-effect disabled:opacity-50"
          style={{ background: "#1a1f2b", border: "1px solid #2d3447", borderRadius: 18 }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(59,130,246,0.12)" }}>
            <Clock className="w-5 h-5" style={{ color: "#3b82f6" }} />
          </div>
          <p className="text-sm font-bold" style={{ color: "#f8fafc" }}>Set Timer</p>
          <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>Smart alerts</p>
        </button>
        <button
          onClick={onOpenSaved}
          className="p-4 text-left press-effect"
          style={{ background: "#1a1f2b", border: "1px solid #2d3447", borderRadius: 18 }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(59,130,246,0.12)" }}>
            <Bookmark className="w-5 h-5" style={{ color: "#3b82f6" }} />
          </div>
          <p className="text-sm font-bold" style={{ color: "#f8fafc" }}>Saved Spots</p>
          <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>Your places</p>
        </button>
        <button
          onClick={onOpenMap}
          className="p-4 text-left press-effect"
          style={{ background: "#1a1f2b", border: "1px solid #2d3447", borderRadius: 18 }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(59,130,246,0.12)" }}>
            <Map className="w-5 h-5" style={{ color: "#3b82f6" }} />
          </div>
          <p className="text-sm font-bold" style={{ color: "#f8fafc" }}>Map</p>
          <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>Nearby parking</p>
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div
          className="mt-4 p-4 rounded-2xl text-sm text-center"
          style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}
        >
          {error}
        </div>
      )}

      {/* ── Pro Upgrade Strip ── */}
      <div className="mt-auto pt-8">
        <div
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl press-effect"
          style={{ background: "#1a1f2b", border: "1px solid #2d3447" }}
          onClick={onUpgrade}
          role="button"
          tabIndex={0}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "rgba(59,130,246,0.15)" }}
          >
            <ShieldCheck className="w-5 h-5" style={{ color: "#3b82f6" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: "#f8fafc" }}>Ticket Protection</p>
            <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>
              We pay if you get a ticket
            </p>
          </div>
          <span
            className="px-4 py-2 rounded-full text-xs font-bold shrink-0"
            style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", color: "#fff", letterSpacing: -0.2 }}
          >
            Try free
          </span>
        </div>
      </div>

      {/* ── Footer Trust Line ── */}
      <div className="mt-5 flex items-center justify-center gap-1.5">
        <p className="text-[11px] text-center" style={{ color: "#64748b", letterSpacing: 0.3 }}>
          95% accuracy · 24h payouts · SF Coverage Live
        </p>
      </div>
    </div>
  )
}
