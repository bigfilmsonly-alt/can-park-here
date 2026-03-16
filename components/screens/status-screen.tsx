"use client"

import { Button } from "@/components/ui/button"
import type { ParkingResult, ParkingWarning } from "@/lib/parking-rules"
import { formatTimeRemaining } from "@/lib/parking-rules"
import { useEffect, useState } from "react"
import { MapPin, Bookmark, Check, Bell, BellOff, ShieldCheck, AlertTriangle, Accessibility, Truck, Bus, Flame, Clock, Wallet } from "lucide-react"
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
    bgClass: "bg-status-success/10",
    textClass: "text-status-success-foreground",
    dotClass: "bg-status-success-foreground",
  },
  restricted: {
    bgClass: "bg-status-warning/10",
    textClass: "text-status-warning-foreground",
    dotClass: "bg-status-warning-foreground",
  },
  prohibited: {
    bgClass: "bg-status-error/10",
    textClass: "text-status-error-foreground",
    dotClass: "bg-status-error-foreground",
  },
}

const warningIcons: Record<string, React.ReactNode> = {
  tow: <Truck className="h-4 w-4" />,
  "street-cleaning": <Clock className="h-4 w-4" />,
  permit: <Clock className="h-4 w-4" />,
  "time-limit": <Clock className="h-4 w-4" />,
  hydrant: <Flame className="h-4 w-4" />,
  "bus-stop": <Bus className="h-4 w-4" />,
}

function WarningBadge({ warning }: { warning: ParkingWarning }) {
  const severityStyles = {
    critical: "bg-status-error/15 text-status-error-foreground border-status-error/30",
    warning: "bg-status-warning/15 text-status-warning-foreground border-status-warning/30",
    info: "bg-muted text-muted-foreground border-border",
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${severityStyles[warning.severity]}`}>
      {warningIcons[warning.type] || <AlertTriangle className="h-4 w-4" />}
      <span className="text-sm font-medium">{warning.message}</span>
    </div>
  )
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

  // Live countdown timer
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
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [result.timeRemaining, hasTimer])

  // Calculate progress percentage
  const maxTime = result.timeRemaining || 120
  const progressPercent = hasTimer ? (timeRemaining / maxTime) * 100 : 0

  const handleSaveToggle = () => {
    if (isSaved) {
      onRemoveLocation()
    } else {
      onSaveLocation()
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2000)
    }
  }

  // Filter warnings by severity for display
  const criticalWarnings = result.warnings.filter(w => w.severity === "critical")
  const otherWarnings = result.warnings.filter(w => w.severity !== "critical")

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-6 py-8">
      {/* Header with back and save */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors text-base"
        >
          ← Back
        </button>

        <button
          onClick={handleSaveToggle}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          {isSaved || justSaved ? (
            <>
              <Check className="h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4" />
              Save
            </>
          )}
        </button>
      </div>

      {/* Location indicator */}
      <div className="mt-6 flex items-center gap-2 text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span className="text-sm truncate">{location}</span>
      </div>

      {/* Critical warnings - show prominently above status */}
      {criticalWarnings.length > 0 && (
        <div className="mt-4 space-y-2">
          {criticalWarnings.map((warning, index) => (
            <WarningBadge key={index} warning={warning} />
          ))}
        </div>
      )}

      {/* Status card */}
      <div className={`mt-4 rounded-3xl ${config.bgClass} p-8`}>
        {/* Status indicator dot */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${config.dotClass}`} />
          <span className={`text-xs font-medium uppercase tracking-wider ${config.textClass}`}>
            {result.status === "allowed"
              ? "All clear"
              : result.status === "restricted"
                ? "Restrictions apply"
                : "Cannot park"}
          </span>
        </div>

        <h1
          className={`text-2xl font-semibold tracking-tight ${config.textClass} text-balance leading-tight`}
        >
          {result.title}
        </h1>

        <p className="mt-4 text-base text-foreground/80 leading-relaxed">{result.description}</p>

        {/* Handicap info */}
        {result.handicapInfo && (
          <div className="mt-4 flex items-start gap-3 p-3 rounded-xl bg-background/50">
            <Accessibility className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Accessible Parking</p>
              <p className="text-sm text-muted-foreground mt-0.5">{result.handicapInfo.message}</p>
              {result.handicapInfo.timeLimit && (
                <p className="text-sm text-muted-foreground mt-1">
                  Time limit: {formatTimeRemaining(result.handicapInfo.timeLimit)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Other warnings */}
      {otherWarnings.length > 0 && (
        <div className="mt-4 space-y-2">
          {otherWarnings.map((warning, index) => (
            <WarningBadge key={index} warning={warning} />
          ))}
        </div>
      )}

      {/* Timer section */}
      {hasTimer && canPark && (
        <div className="mt-8">
          <div className="flex flex-col items-center py-6">
            <span className="text-sm text-muted-foreground uppercase tracking-wide">
              Time remaining
            </span>
            <span className="mt-2 text-5xl font-light tracking-tight text-foreground tabular-nums">
              {formatTimeRemaining(timeRemaining)}
            </span>

            {/* Minimal progress indicator */}
            <div className="mt-6 w-full max-w-xs h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground/20 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Reminder button */}
          <Button
            onClick={onSetReminder}
            variant="secondary"
            className="w-full h-14 text-base font-medium rounded-2xl mt-2"
            disabled={reminderSet}
          >
            {reminderSet ? (
              <span className="flex items-center gap-2">
                <BellOff className="h-5 w-5" />
                Reminder set
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Remind me before time expires
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Prohibited timer - showing when restriction ends */}
      {hasTimer && result.status === "prohibited" && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Restriction ends in{" "}
            <span className="font-medium text-foreground">{formatTimeRemaining(timeRemaining)}</span>
          </p>
        </div>
      )}

      {/* Tow warning callout for prohibited */}
      {result.status === "prohibited" && result.activeRule?.towRisk === "high" && (
        <div className="mt-6 p-4 rounded-2xl bg-status-error/10 border border-status-error/20">
          <div className="flex items-start gap-3">
            <Truck className="h-5 w-5 text-status-error-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-status-error-foreground">High tow risk</p>
              <p className="text-sm text-foreground/80 mt-1">
                Vehicles are actively towed from this location. Find another spot immediately to avoid towing fees (typically $300-500+).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-8 space-y-3">
        {canPark && isProtected && (
          <>
            <Button
              onClick={() => setShowWalletPass(true)}
              className="w-full h-14 text-base font-medium rounded-2xl"
            >
              <span className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Add to Wallet
              </span>
            </Button>
            <Button
              onClick={onEndSession}
              variant="outline"
              className="w-full h-14 text-base font-medium rounded-2xl bg-transparent"
            >
              I'm leaving this spot
            </Button>
          </>
        )}

        {result.status === "prohibited" && (
          <Button
            onClick={onBack}
            variant="secondary"
            className="w-full h-14 text-base font-medium rounded-2xl"
          >
            Check another location
          </Button>
        )}
      </div>

      {/* Protection status */}
      <div className="mt-auto pt-8 pb-16">
        {isProtected && canPark && (
          <div className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-status-success/10">
            <ShieldCheck className="h-5 w-5 text-status-success-foreground" />
            <span className="text-sm font-medium text-status-success-foreground">
              Protection active for this session
            </span>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground/70 max-w-xs mx-auto leading-relaxed mt-6">
          {canPark
            ? "If you follow our guidance and still receive a ticket, we'll cover it."
            : "Find a valid spot and we'll protect you there."}
        </p>
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
