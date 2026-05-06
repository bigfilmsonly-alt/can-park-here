"use client"

import { useState, useEffect, useCallback } from "react"
import { AlertTriangle, Truck, Wrench, Flag, ArrowUp, ArrowDown, ShieldAlert } from "lucide-react"
import { useHaptics } from "@/hooks/use-haptics"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CommunityScreenProps {
  currentLocation?: { lat: number; lng: number }
  currentAddress?: string
  onOpenPhotoVault: () => void
  onOpenReportIssue: () => void
  showToast: (type: "success" | "error" | "info", title: string, message: string) => void
}

type FilterChip = "all" | "enforcement" | "meters"

type SightingTone = "err" | "warn" | "muted"

interface Sighting {
  id: string
  icon: typeof AlertTriangle
  tone: SightingTone
  title: string
  timeAgo: string
  distance: string
  upvotes: number
}

/* ------------------------------------------------------------------ */
/*  Static seed data (real SF streets)                                 */
/* ------------------------------------------------------------------ */

const SEED_SIGHTINGS: Sighting[] = [
  {
    id: "s1",
    icon: AlertTriangle,
    tone: "err",
    title: "Meter maid \u00b7 Valencia & 16th",
    timeAgo: "2 min ago",
    distance: "0.3 mi",
    upvotes: 12,
  },
  {
    id: "s2",
    icon: Truck,
    tone: "warn",
    title: "Tow truck \u00b7 Mission & 18th",
    timeAgo: "14 min ago",
    distance: "0.4 mi",
    upvotes: 8,
  },
  {
    id: "s3",
    icon: Wrench,
    tone: "muted",
    title: "Broken meter \u00b7 spot 8",
    timeAgo: "22 min ago",
    distance: "0.1 mi",
    upvotes: 3,
  },
  {
    id: "s4",
    icon: ShieldAlert,
    tone: "err",
    title: "Police \u00b7 24th & Guerrero",
    timeAgo: "31 min ago",
    distance: "0.6 mi",
    upvotes: 4,
  },
]

/* ------------------------------------------------------------------ */
/*  Tone colour map                                                    */
/* ------------------------------------------------------------------ */

const TONE_STYLES: Record<SightingTone, { bg: string; ink: string }> = {
  err: { bg: "var(--park-err-bg)", ink: "var(--park-err-ink)" },
  warn: { bg: "var(--park-warn-bg)", ink: "var(--park-warn-ink)" },
  muted: { bg: "var(--park-muted)", ink: "var(--park-muted-fg)" },
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "park_community_votes"

function loadVotes(): Record<string, number> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, number>) : {}
  } catch {
    return {}
  }
}

function saveVotes(votes: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(votes))
  } catch {
    /* quota exceeded - silently ignore */
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CommunityScreen({
  onOpenReportIssue,
}: CommunityScreenProps) {
  const haptics = useHaptics()
  const [activeChip, setActiveChip] = useState<FilterChip>("all")
  /* votes stores id -> delta (+1 upvoted, -1 downvoted, 0 neutral) */
  const [votes, setVotes] = useState<Record<string, number>>({})

  /* Hydrate votes from localStorage once */
  useEffect(() => {
    setVotes(loadVotes())
  }, [])

  /* Persist whenever votes change (skip initial empty render) */
  const persistVotes = useCallback((next: Record<string, number>) => {
    setVotes(next)
    saveVotes(next)
  }, [])

  /* ----- vote handlers ----- */
  const handleUpvote = (id: string) => {
    const current = votes[id] ?? 0
    const next = current === 1 ? 0 : 1 /* toggle */
    haptics.light()
    persistVotes({ ...votes, [id]: next })
  }

  const handleDownvote = (id: string) => {
    const current = votes[id] ?? 0
    const next = current === -1 ? 0 : -1 /* toggle */
    haptics.light()
    persistVotes({ ...votes, [id]: next })
  }

  /* ----- filtered list ----- */
  const filtered = SEED_SIGHTINGS.filter((s) => {
    if (activeChip === "all") return true
    if (activeChip === "enforcement") return s.tone === "err"
    if (activeChip === "meters") return s.tone === "warn" || s.tone === "muted"
    return true
  })

  const chips: { label: string; value: FilterChip }[] = [
    { label: "All", value: "all" },
    { label: "Enforcement", value: "enforcement" },
    { label: "Meters", value: "meters" },
  ]

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - 5rem)",
        background: "var(--park-bg)",
        overflowY: "auto",
      }}
    >
      {/* ---- Header ---- */}
      <div style={{ padding: "16px 22px 0" }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.6,
            color: "var(--park-muted-fg)",
            margin: 0,
          }}
        >
          COMMUNITY
        </p>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: -1.2,
            color: "var(--park-fg)",
            margin: "4px 0 0",
          }}
        >
          Sightings nearby
        </h1>
      </div>

      {/* ---- Filter chips ---- */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "16px 22px 0",
        }}
      >
        {chips.map((chip) => {
          const isActive = activeChip === chip.value
          return (
            <button
              key={chip.value}
              onClick={() => setActiveChip(chip.value)}
              className="press-effect"
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
                background: isActive ? "var(--park-fg)" : "var(--park-muted)",
                color: isActive ? "var(--park-bg)" : "var(--park-fg)",
              }}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      {/* ---- Feed cards ---- */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: "16px 22px 180px",
        }}
      >
        {filtered.map((sighting) => {
          const Icon = sighting.icon
          const tone = TONE_STYLES[sighting.tone]
          const voteState = votes[sighting.id] ?? 0
          const displayCount = sighting.upvotes + voteState

          return (
            <div
              key={sighting.id}
              className="hover-lift-interactive"
              style={{
                background: "var(--park-surface)",
                border: "1px solid var(--park-border)",
                borderRadius: 18,
                padding: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {/* Icon box */}
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: tone.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon style={{ width: 20, height: 20, color: tone.ink }} />
              </div>

              {/* Text content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--park-fg)",
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {sighting.title}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--park-muted-fg)",
                    margin: "2px 0 0",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {sighting.timeAgo} &middot; {sighting.distance}
                  {displayCount > 0 && (
                    <span> &middot; {displayCount} upvotes</span>
                  )}
                </p>
              </div>

              {/* Vote arrows */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => handleUpvote(sighting.id)}
                  className="press-effect"
                  aria-label={`Upvote ${sighting.title}`}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  <ArrowUp
                    style={{
                      width: 18,
                      height: 18,
                      color:
                        voteState === 1
                          ? "var(--park-ok)"
                          : "var(--park-muted-fg)",
                      transition: "color 0.15s",
                    }}
                  />
                </button>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color:
                      voteState === 1
                        ? "var(--park-ok)"
                        : voteState === -1
                          ? "var(--park-err)"
                          : "var(--park-fg2)",
                    lineHeight: 1,
                  }}
                >
                  {displayCount}
                </span>
                <button
                  onClick={() => handleDownvote(sighting.id)}
                  className="press-effect"
                  aria-label={`Downvote ${sighting.title}`}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  <ArrowDown
                    style={{
                      width: 18,
                      height: 18,
                      color:
                        voteState === -1
                          ? "var(--park-err)"
                          : "var(--park-muted-fg)",
                      transition: "color 0.15s",
                    }}
                  />
                </button>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div
            style={{
              background: "var(--park-surface)",
              border: "1px solid var(--park-border)",
              borderRadius: 18,
              padding: 32,
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--park-muted-fg)",
                margin: 0,
              }}
            >
              No sightings in this category
            </p>
          </div>
        )}
      </div>

      {/* ---- FAB ---- */}
      <button
        onClick={onOpenReportIssue}
        className="press-effect"
        style={{
          position: "fixed",
          bottom: 108,
          right: 22,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 20px",
          borderRadius: 999,
          border: "none",
          background: "var(--park-fg)",
          color: "var(--park-bg)",
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
          zIndex: 40,
        }}
      >
        <Flag style={{ width: 16, height: 16 }} />
        Report sighting
      </button>
    </div>
  )
}
