"use client"

import { useState, useEffect } from "react"
import { Star, Lock } from "lucide-react"
import {
  getGamificationState,
  getMoneySavedStats,
  type GamificationState,
} from "@/lib/gamification"
import { dbGetUserSync } from "@/lib/db"
import { showToast } from "@/components/ui/toast-notification"

interface RewardsScreenProps {
  onBack: () => void
}

/* ------------------------------------------------------------------ */
/*  Badge catalogue – 12 badges with earned/locked status             */
/* ------------------------------------------------------------------ */

interface BadgeDef {
  name: string
  earned: boolean
}

const DEFAULT_BADGES: BadgeDef[] = [
  { name: "First Check", earned: true },
  { name: "10-Day",      earned: true },
  { name: "Scanner",     earned: true },
  { name: "Saver",       earned: true },
  { name: "Night Owl",   earned: true },
  { name: "Early Bird",  earned: false },
  { name: "Commuter",    earned: false },
  { name: "Pro Tipper",  earned: true },
  { name: "100 Checks",  earned: false },
  { name: "Block Hero",  earned: true },
  { name: "Streak 30",   earned: false },
  { name: "Dispute",     earned: false },
]

/* ------------------------------------------------------------------ */
/*  Defaults (overridden by localStorage when available)              */
/* ------------------------------------------------------------------ */

const DEFAULTS = {
  name: "Alex",
  karma: 1284,
  streak: 14,
  saved: 312,
  checks: 48,
  badgeCount: 11,
  badgeTotal: 21,
} as const

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function RewardsScreen({ onBack }: RewardsScreenProps) {
  const [userName, setUserName] = useState<string>(DEFAULTS.name)
  const [karma, setKarma] = useState<number>(DEFAULTS.karma)
  const [streak, setStreak] = useState<number>(DEFAULTS.streak)
  const [saved, setSaved] = useState<number>(DEFAULTS.saved)
  const [checks, setChecks] = useState<number>(DEFAULTS.checks)
  const [badges] = useState<BadgeDef[]>(DEFAULT_BADGES)

  const earnedCount = badges.filter((b) => b.earned).length
  const totalCount = DEFAULTS.badgeTotal

  useEffect(() => {
    const state: GamificationState = getGamificationState()
    const user = dbGetUserSync()
    const savings = getMoneySavedStats()

    if (user?.name) setUserName(user.name)
    if (state.karma > 0) setKarma(state.karma)
    if (state.currentStreak > 0) setStreak(state.currentStreak)
    if (state.totalChecks > 0) setChecks(state.totalChecks)
    if (savings.total > 0) setSaved(savings.total)
  }, [])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        padding: "64px 22px 120px",
        background: "var(--park-bg)",
        color: "var(--park-fg)",
      }}
    >
      {/* ---- Header ---- */}
      <p
        style={{
          fontSize: 13,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--park-muted-fg)",
          margin: 0,
        }}
      >
        REWARDS
      </p>
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: -1.2,
          margin: "4px 0 0",
        }}
      >
        {userName}
      </h1>

      {/* ---- Karma / Streak gradient card ---- */}
      <div
        style={{
          marginTop: 24,
          borderRadius: 22,
          overflow: "hidden",
          border: "none",
        }}
      >
        {/* Top gradient section */}
        <div
          style={{
            background:
              "linear-gradient(135deg, var(--park-accent), var(--park-accent-deep))",
            color: "#fff",
            padding: "24px 24px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          {/* Left – Karma */}
          <div>
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                opacity: 0.75,
                margin: 0,
              }}
            >
              KARMA
            </p>
            <p
              style={{
                fontSize: 44,
                fontWeight: 700,
                letterSpacing: -1.5,
                margin: "2px 0 0",
                lineHeight: 1,
              }}
            >
              {karma.toLocaleString()}
            </p>
          </div>

          {/* Right – Streak */}
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                opacity: 0.75,
                margin: 0,
              }}
            >
              STREAK
            </p>
            <p
              style={{
                fontSize: 22,
                fontWeight: 700,
                margin: "2px 0 0",
                lineHeight: 1,
              }}
            >
              {streak}
            </p>
          </div>
        </div>

        {/* Bottom stats section */}
        <div
          style={{
            background: "var(--park-surface)",
            padding: "16px 24px",
            display: "flex",
            gap: 20,
          }}
        >
          <StatCell value={`$${saved}`} label="saved" />
          <StatCell value={String(checks)} label="checks" />
          <StatCell value={String(earnedCount)} label="badges" />
        </div>
      </div>

      {/* ---- Badges section ---- */}
      <div style={{ marginTop: 24 }}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--park-muted-fg)",
              margin: 0,
            }}
          >
            Badges &middot; {earnedCount} of {totalCount}
          </p>
          <button
            onClick={() =>
              showToast("info", "All badges", "Full badge collection coming soon")
            }
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--park-accent)",
            }}
          >
            See all
          </button>
        </div>

        {/* 4-column grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
          }}
        >
          {badges.map((badge) => (
            <BadgeTile key={badge.name} badge={badge} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p
        style={{
          fontSize: 20,
          fontWeight: 700,
          margin: 0,
          lineHeight: 1.2,
          color: "var(--park-fg)",
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: 12,
          color: "var(--park-muted-fg)",
          margin: "2px 0 0",
        }}
      >
        {label}
      </p>
    </div>
  )
}

function BadgeTile({ badge }: { badge: BadgeDef }) {
  const earned = badge.earned

  return (
    <div
      style={{
        aspectRatio: "1",
        borderRadius: 16,
        border: `1px solid ${earned ? "var(--park-accent)" : "var(--park-border)"}`,
        background: earned ? "var(--park-accent-pale)" : "var(--park-muted)",
        opacity: earned ? 1 : 0.5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: 6,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: earned ? "var(--park-accent)" : "transparent",
          border: earned ? "none" : `1px solid var(--park-border)`,
          color: earned ? "#fff" : "var(--park-muted-fg)",
        }}
      >
        {earned ? (
          <Star style={{ width: 14, height: 14 }} />
        ) : (
          <Lock style={{ width: 12, height: 12 }} />
        )}
      </div>
      <p
        style={{
          fontSize: 10.5,
          fontWeight: 600,
          textAlign: "center",
          lineHeight: 1.2,
          margin: 0,
          color: earned ? "var(--park-fg)" : "var(--park-muted-fg)",
        }}
      >
        {badge.name}
      </p>
    </div>
  )
}
