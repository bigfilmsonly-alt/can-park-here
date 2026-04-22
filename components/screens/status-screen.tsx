"use client"

import type { ParkingResult } from "@/lib/parking-rules"
import { formatTimeRemaining } from "@/lib/parking-rules"
import { useEffect, useState } from "react"
import {
  Bookmark,
  Check,
  ShieldCheck,
  AlertTriangle,
  Accessibility,
  Truck,
  Clock,
  ChevronLeft,
  Share,
} from "lucide-react"
import { WalletPassModal } from "@/components/wallet-pass"

interface StatusScreenProps {
  result: ParkingResult
  location: string
  fullAddress: string
  coordinates: { lat: number; lng: number }
  onBack: () => void
  onSetReminder: () => void
  onEndSession: () => void
  isSaved: boolean
  onSaveLocation: () => void
  onRemoveLocation: () => void
  isProtected: boolean
  reminderSet: boolean
}

const statusConfig = {
  allowed: {
    bg: "var(--status-success-bg)",
    ink: "var(--status-success-foreground)",
    accent: "var(--status-success)",
    label: "ALLOWED",
    icon: Check,
  },
  restricted: {
    bg: "var(--status-warning-bg)",
    ink: "var(--status-warning-foreground)",
    accent: "var(--status-warning)",
    label: "RESTRICTED",
    icon: Clock,
  },
  prohibited: {
    bg: "var(--status-error-bg)",
    ink: "var(--status-error-foreground)",
    accent: "var(--status-error)",
    label: "PROHIBITED",
    icon: AlertTriangle,
  },
}

export function StatusScreen({
  result,
  location,
  fullAddress,
  coordinates,
  isSaved,
  onBack,
  onSetReminder,
  onEndSession,
  onSaveLocation,
  onRemoveLocation,
  isProtected,
  reminderSet,
}: StatusScreenProps) {
  const config = statusConfig[result.status]
  const hasTimer = result.timeRemaining !== null && result.timeRemaining > 0
  const canPark = result.status !== "prohibited"

  const [timeRemaining, setTimeRemaining] = useState(result.timeRemaining || 0)
  const [justSaved, setJustSaved] = useState(false)
  const [showWalletPass, setShowWalletPass] = useState(false)

  useEffect(() => {
    if (!hasTimer) return
    setTimeRemaining(result.timeRemaining || 0)
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 60000)
    return () => clearInterval(interval)
  }, [result.timeRemaining, hasTimer])

  const handleSaveToggle = () => {
    if (isSaved) {
      onRemoveLocation()
    } else {
      onSaveLocation()
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2000)
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-[22px] pt-4 pb-28">
      {/* Header: back + share */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          aria-label="Go back"
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveToggle}
            aria-label={isSaved ? "Remove saved" : "Save location"}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            {isSaved || justSaved ? (
              <Check className="w-[18px] h-[18px]" />
            ) : (
              <Bookmark className="w-[18px] h-[18px]" />
            )}
          </button>
          <button
            aria-label="Share"
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            onClick={async () => {
              const text = `${result.title} — ${location}\n${result.description}`
              if (navigator.share) {
                try { await navigator.share({ title: "Park — Can I park here?", text }) } catch {}
              } else {
                await navigator.clipboard.writeText(text)
              }
            }}
          >
            <Share className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>

      {/* Status pill + giant typographic answer */}
      <div className="mt-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-[7px] rounded-full text-[11px] font-bold tracking-wider"
          style={{ background: config.bg, color: config.ink }}
        >
          <div className="relative w-[7px] h-[7px]">
            <div
              className="w-[7px] h-[7px] rounded-full relative z-10"
              style={{ background: config.accent }}
            />
            <div
              className="sonar-ring absolute inset-0 rounded-full"
              style={{ borderColor: config.accent }}
            />
          </div>
          {config.label} · {(result as ParkingResult & { confidence?: number }).confidence ?? 97}% CONFIDENT
        </div>

        <h1
          className="mt-[18px] font-bold leading-[0.98] count-reveal"
          style={{
            fontSize: 56,
            letterSpacing: -2.2,
            textWrap: "balance",
          }}
        >
          {result.title}
        </h1>

        <p
          className="mt-[14px]"
          style={{ fontSize: 15, color: "var(--fg2)", lineHeight: 1.5 }}
        >
          {result.description}
        </p>
      </div>

      {/* Warnings card */}
      {result.warnings.length > 0 && (
        <div className="mt-8 bg-card card-elevated rounded-[18px] overflow-hidden">
          {result.warnings.map((warning, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-3.5 py-3 text-sm"
              style={{
                color: "var(--fg2)",
                borderTop: i > 0 ? "1px solid var(--hairline)" : undefined,
              }}
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: config.accent }}
              />
              {warning.message}
            </div>
          ))}
        </div>
      )}

      {/* Why this answer card */}
      <div className="mt-4 bg-card card-elevated rounded-[18px] p-3.5 spring-in">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          WHY THIS ANSWER
        </p>
        <p className="text-[13px] mt-2 leading-relaxed" style={{ color: "var(--fg2)" }}>
          {result.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {result.timeRemaining && result.timeRemaining > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[11px] font-medium">
              {formatTimeRemaining(result.timeRemaining)} limit
            </span>
          )}
          {result.activeRule && (
            <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[11px] font-medium">
              Meter active
            </span>
          )}
          {result.warnings.map((w, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[11px] font-medium">
              {w.type.replace("-", " ")}
            </span>
          ))}
        </div>
      </div>

      {/* Protection card */}
      {isProtected && canPark && (
        <div className="mt-4 bg-[var(--accent-pale)] border border-[var(--accent)] rounded-[18px] p-3.5 flex items-center gap-2.5"
          style={{ color: "var(--accent-ink, var(--accent))" }}
        >
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">This answer is protected. Get a ticket? We pay.</p>
        </div>
      )}

      {/* Handicap info */}
      {result.handicapInfo && (
        <div className="mt-4 flex items-start gap-3 p-4 rounded-[18px] bg-card card-elevated">
          <Accessibility className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Accessible Parking</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {result.handicapInfo.message}
            </p>
            {result.handicapInfo.timeLimit && (
              <p className="text-sm text-muted-foreground mt-1">
                Time limit: {formatTimeRemaining(result.handicapInfo.timeLimit)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tow warning */}
      {result.status === "prohibited" &&
        result.activeRule?.towRisk === "high" && (
          <div
            className="mt-4 p-4 rounded-2xl border"
            style={{
              background: "var(--status-error-bg)",
              borderColor: "rgba(239,68,68,0.2)",
            }}
          >
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-status-error-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-status-error-foreground">
                  High tow risk
                </p>
                <p className="text-sm text-foreground/80 mt-1">
                  Vehicles are actively towed here. Find another spot to avoid
                  $300-500+ fees.
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Action buttons */}
      <div className="mt-8 flex gap-2.5">
        <button
          onClick={onEndSession}
          className="flex-1 py-3.5 rounded-full border border-border font-semibold hover-lift-interactive"
        >
          Done
        </button>
        {canPark ? (
          <button
            onClick={onSetReminder}
            disabled={reminderSet}
            className="flex-[2] py-3.5 rounded-full bg-[var(--accent)] text-white font-semibold hover-lift-interactive"
          >
            {reminderSet
              ? "Reminder set"
              : `Start ${result.timeRemaining ? formatTimeRemaining(result.timeRemaining) : "2-hour"} timer`}
          </button>
        ) : (
          <button
            onClick={onBack}
            className="flex-[2] py-3.5 rounded-full bg-[var(--accent)] text-white font-semibold hover-lift-interactive"
          >
            Find legal spot nearby
          </button>
        )}
      </div>

      {/* Wallet Pass Modal */}
      <WalletPassModal
        isOpen={showWalletPass}
        onClose={() => setShowWalletPass(false)}
        location={location}
        address={fullAddress}
        timeLimit={result.timeRemaining || undefined}
        isProtected={isProtected}
      />
    </div>
  )
}
