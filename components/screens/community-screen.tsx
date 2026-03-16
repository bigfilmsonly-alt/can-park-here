"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  AlertTriangle, 
  Truck, 
  Car,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Plus,
  MapPin,
  Clock,
  Camera,
  Flag,
  ChevronRight,
  X
} from "lucide-react"
import {
  type EnforcementSighting,
  type MeterStatus,
  getEnforcementSightings,
  getNearbyMeters,
  reportEnforcement,
  reportMeterStatus,
  voteEnforcement,
  getEnforcementTypeLabel,
  getMeterStatusLabel,
  getTimeAgo,
} from "@/lib/community"

interface CommunityScreenProps {
  currentLocation?: { lat: number; lng: number }
  currentAddress?: string
  onOpenPhotoVault: () => void
  onOpenReportIssue: () => void
  showToast: (type: "success" | "error" | "info", title: string, message: string) => void
}

export function CommunityScreen({
  currentLocation,
  currentAddress,
  onOpenPhotoVault,
  onOpenReportIssue,
  showToast,
}: CommunityScreenProps) {
  const [sightings, setSightings] = useState<EnforcementSighting[]>([])
  const [meters, setMeters] = useState<MeterStatus[]>([])
  const [showReportEnforcement, setShowReportEnforcement] = useState(false)
  const [showReportMeter, setShowReportMeter] = useState(false)
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadData()
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [currentLocation])

  const loadData = async () => {
    setSightings(await getEnforcementSightings())
    if (currentLocation) {
      setMeters(getNearbyMeters(currentLocation.lat, currentLocation.lng))
    }
  }

  const handleReportEnforcement = async (type: EnforcementSighting["type"]) => {
    if (!currentLocation || !currentAddress) {
      showToast("error", "Location needed", "Please enable location to report sightings")
      return
    }

    await reportEnforcement(type, currentLocation, currentAddress)
    loadData()
    setShowReportEnforcement(false)
    showToast("success", "Reported", "Thanks for helping the community!")
  }

  const handleReportMeter = (status: MeterStatus["status"]) => {
    if (!currentLocation || !currentAddress) {
      showToast("error", "Location needed", "Please enable location to report meter status")
      return
    }

    const meterId = `meter_${currentLocation.lat.toFixed(4)}_${currentLocation.lng.toFixed(4)}`
    reportMeterStatus(meterId, status, currentLocation, currentAddress)
    loadData()
    setShowReportMeter(false)
    showToast("success", "Reported", "Meter status updated!")
  }

  const handleVote = async (id: string, isUpvote: boolean) => {
    if (votedIds.has(id)) {
      showToast("info", "Already voted", "You've already voted on this sighting")
      return
    }
    
    await voteEnforcement(id, isUpvote)
    setVotedIds(new Set([...votedIds, id]))
    loadData()
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-6 py-8 pb-24">
      <h1 className="text-2xl font-semibold tracking-tight">Community</h1>
      <p className="text-muted-foreground mt-1">
        Real-time updates from nearby drivers
      </p>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <button
          onClick={() => setShowReportEnforcement(true)}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:bg-accent transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-status-error/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-status-error-foreground" />
          </div>
          <span className="text-sm font-medium">Report Enforcement</span>
        </button>

        <button
          onClick={() => setShowReportMeter(true)}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:bg-accent transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-status-warning/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-status-warning-foreground" />
          </div>
          <span className="text-sm font-medium">Meter Status</span>
        </button>

        <button
          onClick={onOpenPhotoVault}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:bg-accent transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Camera className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium">Photo Vault</span>
        </button>

        <button
          onClick={onOpenReportIssue}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:bg-accent transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Flag className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium">Report Issue</span>
        </button>
      </div>

      {/* Enforcement Sightings */}
      <div className="mt-8">
        <h2 className="text-lg font-medium">Nearby Enforcement</h2>
        <p className="text-sm text-muted-foreground">Active in the last 2 hours</p>

        {sightings.length === 0 ? (
          <div className="mt-4 p-6 rounded-2xl bg-card border border-border text-center">
            <Shield className="w-8 h-8 text-status-success-foreground mx-auto mb-2" />
            <p className="text-sm font-medium">All clear nearby</p>
            <p className="text-xs text-muted-foreground mt-1">
              No enforcement reported in your area
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {sightings.slice(0, 5).map((sighting) => (
              <div
                key={sighting.id}
                className="p-4 rounded-2xl bg-card border border-border"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-status-error/10 flex items-center justify-center">
                      {sighting.type === "tow_truck" ? (
                        <Truck className="w-5 h-5 text-status-error-foreground" />
                      ) : (
                        <Car className="w-5 h-5 text-status-error-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {getEnforcementTypeLabel(sighting.type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sighting.address}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {getTimeAgo(sighting.reportedAt)}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => handleVote(sighting.id, true)}
                    className={`flex items-center gap-1.5 text-xs ${
                      votedIds.has(sighting.id) ? "text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{sighting.upvotes}</span>
                  </button>
                  <button
                    onClick={() => handleVote(sighting.id, false)}
                    className={`flex items-center gap-1.5 text-xs ${
                      votedIds.has(sighting.id) ? "text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>{sighting.downvotes}</span>
                  </button>
                  <span className="text-xs text-muted-foreground ml-auto">
                    Still there?
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nearby Meters */}
      {meters.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-medium">Meter Status</h2>
          <p className="text-sm text-muted-foreground">Reported by users nearby</p>

          <div className="mt-4 space-y-3">
            {meters.slice(0, 3).map((meter) => (
              <div
                key={meter.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    meter.status === "working" ? "bg-status-success/10" :
                    meter.status === "broken" ? "bg-status-error/10" :
                    "bg-status-warning/10"
                  }`}>
                    <Clock className={`w-5 h-5 ${
                      meter.status === "working" ? "text-status-success-foreground" :
                      meter.status === "broken" ? "text-status-error-foreground" :
                      "text-status-warning-foreground"
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{getMeterStatusLabel(meter.status)}</p>
                    <p className="text-xs text-muted-foreground">{meter.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{getTimeAgo(meter.reportedAt)}</p>
                  <p className="text-xs text-muted-foreground">{meter.confirmations} confirmed</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Enforcement Modal */}
      {showReportEnforcement && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full bg-card rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Report Enforcement</h2>
              <button onClick={() => setShowReportEnforcement(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {currentLocation ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span>{currentAddress || "Current location"}</span>
              </div>
            ) : (
              <p className="text-sm text-status-error-foreground mb-4">
                Location not available
              </p>
            )}

            <div className="space-y-3">
              {[
                { type: "parking_enforcement" as const, label: "Parking Enforcement", icon: Car },
                { type: "meter_maid" as const, label: "Meter Maid", icon: Clock },
                { type: "tow_truck" as const, label: "Tow Truck", icon: Truck },
                { type: "police" as const, label: "Police", icon: Shield },
              ].map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => handleReportEnforcement(type)}
                  disabled={!currentLocation}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-secondary hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <Icon className="w-5 h-5 text-status-error-foreground" />
                  <span className="font-medium">{label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Report Meter Modal */}
      {showReportMeter && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full bg-card rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Report Meter Status</h2>
              <button onClick={() => setShowReportMeter(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {currentLocation ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span>{currentAddress || "Current location"}</span>
              </div>
            ) : (
              <p className="text-sm text-status-error-foreground mb-4">
                Location not available
              </p>
            )}

            <div className="space-y-3">
              {[
                { status: "working" as const, label: "Working", color: "text-status-success-foreground" },
                { status: "broken" as const, label: "Broken", color: "text-status-error-foreground" },
                { status: "card_only" as const, label: "Card Only", color: "text-status-warning-foreground" },
                { status: "coin_only" as const, label: "Coins Only", color: "text-status-warning-foreground" },
                { status: "free" as const, label: "Free Parking", color: "text-status-success-foreground" },
              ].map(({ status, label, color }) => (
                <button
                  key={status}
                  onClick={() => handleReportMeter(status)}
                  disabled={!currentLocation}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-secondary hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <Clock className={`w-5 h-5 ${color}`} />
                  <span className="font-medium">{label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
