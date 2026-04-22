"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Plus, Check, Flag, ArrowUp, Trash2 } from "lucide-react"
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

type FilterType = "all" | "open" | "cleaning" | "tow"

function getSightingCategory(type: EnforcementSighting["type"]): FilterType {
  switch (type) {
    case "parking_enforcement":
    case "police":
      return "open"
    case "meter_maid":
      return "cleaning"
    case "tow_truck":
      return "tow"
    default:
      return "open"
  }
}

function getSightingIcon(type: EnforcementSighting["type"]) {
  const category = getSightingCategory(type)
  switch (category) {
    case "open":
      return Check
    case "cleaning":
      return Trash2
    case "tow":
      return Flag
    default:
      return Check
  }
}

function getSightingColors(type: EnforcementSighting["type"]) {
  const category = getSightingCategory(type)
  switch (category) {
    case "open":
      return {
        bg: "bg-status-success",
        text: "text-status-success-foreground",
      }
    case "cleaning":
      return {
        bg: "bg-status-warning",
        text: "text-status-warning-foreground",
      }
    case "tow":
      return {
        bg: "bg-status-error",
        text: "text-status-error-foreground",
      }
    default:
      return {
        bg: "bg-status-success",
        text: "text-status-success-foreground",
      }
  }
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
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")

  const loadData = useCallback(async () => {
    setSightings(await getEnforcementSightings())
    if (currentLocation) {
      setMeters(getNearbyMeters(currentLocation.lat, currentLocation.lng))
    }
  }, [currentLocation])

  useEffect(() => {
    loadData()
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [loadData])

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

  const filteredSightings = useMemo(() => {
    if (activeFilter === "all") return sightings
    return sightings.filter((s) => getSightingCategory(s.type) === activeFilter)
  }, [sightings, activeFilter])

  const recentSightings = filteredSightings.slice(0, 5)

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Open", value: "open" },
    { label: "Cleaning", value: "cleaning" },
    { label: "Tow", value: "tow" },
  ]

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-[22px] pt-16 pb-28 overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              COMMUNITY
            </p>
            <h1 className="text-[32px] font-bold tracking-tight mt-1">Spots near you</h1>
          </div>
          <button
            className="breathe-glow w-11 h-11 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shrink-0"
            onClick={onOpenReportIssue}
            aria-label="New report"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm mt-2" style={{ color: "var(--fg2)" }}>
          {recentSightings.length} recent reports in 0.3 mi
        </p>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 mt-5">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`px-3.5 py-2 rounded-full text-[13px] font-semibold transition-all duration-300 ${
              activeFilter === filter.value
                ? "bg-foreground text-background"
                : "bg-muted text-foreground"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Sighting Cards */}
      <div className="mt-5 flex flex-col gap-2.5">
        {recentSightings.map((sighting) => {
          const Icon = getSightingIcon(sighting.type)
          const colors = getSightingColors(sighting.type)
          const hasVoted = votedIds.has(sighting.id)
          const voteCount = sighting.upvotes - sighting.downvotes

          return (
            <div
              key={sighting.id}
              className="hover-lift-interactive bg-card card-elevated rounded-[18px] p-3.5"
            >
              <div className="flex items-center gap-3">
                {/* Icon circle */}
                <div
                  className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}
                >
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>

                {/* Center content */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">
                    {getEnforcementTypeLabel(sighting.type)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {sighting.reportedBy} &middot; {getTimeAgo(sighting.reportedAt)} &middot; {sighting.address}
                  </p>
                </div>

                {/* Upvote button */}
                <button
                  onClick={() => handleVote(sighting.id, true)}
                  disabled={hasVoted}
                  className={`px-2.5 py-[7px] rounded-[10px] text-xs font-bold flex items-center gap-1 shrink-0 transition-colors ${
                    hasVoted
                      ? "bg-[var(--accent-pale)] text-[var(--accent)]"
                      : "bg-muted text-foreground"
                  }`}
                  aria-label={`Upvote sighting, ${sighting.upvotes} upvotes`}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>{voteCount}</span>
                </button>
              </div>
            </div>
          )
        })}

        {recentSightings.length === 0 && (
          <div className="bg-card card-elevated rounded-[18px] p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No reports in this area yet
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
