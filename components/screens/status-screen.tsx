"use client"

import { Button } from "@/components/ui/button"
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
  Bus,
  Flame,
  Clock,
  ChevronLeft,
  Share,
  Navigation,
  Camera,
  Timer,
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
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-5 pt-4 pb-28">
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
          <div
            className="w-[7px] h-[7px] rounded-full"
            style={{ background: config.accent }}
          />
          {config.label} · 97% CONFIDENT
        </div>

        <h1
          className="mt-[18px] font-bold leading-[0.98]"
          style={{
            fontSize: 72,
            letterSpacing: -2,
            textWrap: "balance",
          }}
        >
          {result.title}
        </h1>

        <p
          className="mt-3 text-[22px] font-medium tracking-tight"
          style={{ color: "var(--fg2)" }}
        >
          {result.description}
        </p>
      </div>

      {/* Explanation card */}
      <div className="mt-8">
        <div
          className="rounded-[22px] bg-card border border-border p-5"
          style={{
            boxShadow:
              "0 1px 2px rgba(0,0,0,.03), 0 1px 8px rgba(0,0,0,.02)",
          }}
        >
          <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
            Why
          </p>
          <p className="text-[17px] mt-2 leading-relaxed tracking-tight">
            {result.description}
          </p>

          {result.warnings.length > 0 && (
            <>
              <div
                className="h-px my-4"
                style={{ background: "var(--hairline)" }}
              />
              {result.warnings.map((warning, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 py-1.5 text-sm"
                  style={{ color: "var(--fg2)" }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: config.accent }}
                  />
                  {warning.message}
                </div>
              ))}
            </>
          )}

          {isProtected && canPark && (
            <>
              <div
                className="h-px my-3.5"
                style={{ background: "var(--hairline)" }}
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                Protected by Ticket Guarantee
              </div>
            </>
          )}
        </div>
      </div>

      {/* Handicap info */}
      {result.handicapInfo && (
        <div className="mt-4 flex items-start gap-3 p-4 rounded-[18px] bg-card border border-border">
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
        {canPark ? (
          <>
            <Button
              onClick={onSetReminder}
              disabled={reminderSet}
              className="flex-1 h-14 text-base font-semibold rounded-full"
            >
              <Timer className="w-[18px] h-[18px] mr-2" />
              {reminderSet ? "Reminder set" : "Start timer"}
            </Button>
            <button
              onClick={() => setShowWalletPass(true)}
              className="w-14 h-14 rounded-full bg-muted flex items-center justify-center shrink-0"
              aria-label="Photo evidence"
            >
              <Camera className="w-[18px] h-[18px]" />
            </button>
          </>
        ) : (
          <>
            <Button
              onClick={onBack}
              className="flex-1 h-14 text-base font-semibold rounded-full"
            >
              <Navigation className="w-[18px] h-[18px] mr-2" />
              Find nearby spot
            </Button>
            <button
              className="w-14 h-14 rounded-full bg-muted flex items-center justify-center shrink-0"
              aria-label="Photo evidence"
            >
              <Camera className="w-[18px] h-[18px]" />
            </button>
          </>
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
