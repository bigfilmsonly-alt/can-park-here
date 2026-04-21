"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  getGamificationState,
  getUserBadges,
  getLeaderboard,
  getReferralStats,
  getMoneySavedStats,
  getBadgeProgress,
  getKarmaForNextLevel,
  type GamificationState,
  type Badge,
  type LeaderboardEntry,
} from "@/lib/gamification"
import {
  Trophy,
  Medal,
  Star,
  Flame,
  Users,
  Share2,
  DollarSign,
  Crown,
  Shield,
  Zap,
  Heart,
  Award,
  Flag,
  Eye,
  TrendingUp,
  Gem,
  UserPlus,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  Lock,
} from "lucide-react"

interface RewardsScreenProps {
  onBack: () => void
}

const ICON_MAP: Record<string, React.ElementType> = {
  flag: Flag,
  award: Award,
  medal: Medal,
  trophy: Trophy,
  crown: Crown,
  flame: Flame,
  zap: Zap,
  star: Star,
  users: Users,
  eye: Eye,
  shield: Shield,
  "trending-up": TrendingUp,
  heart: Heart,
  gem: Gem,
  "user-plus": UserPlus,
  "share-2": Share2,
  megaphone: Megaphone,
  "shield-check": ShieldCheck,
  swords: Shield,
  sparkles: Sparkles,
}

export function RewardsScreen({ onBack }: RewardsScreenProps) {
  const [state, setState] = useState<GamificationState | null>(null)
  const [badges, setBadges] = useState<{ unlocked: Badge[]; locked: Badge[] }>({
    unlocked: [],
    locked: [],
  })
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [referralStats, setReferralStats] = useState({
    code: "",
    referrals: 0,
    earnings: 0,
  })
  const [savingsStats, setSavingsStats] = useState({
    total: 0,
    thisMonth: 0,
    ticketsAvoided: 0,
  })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setState(getGamificationState())
      setBadges(getUserBadges())
      setLeaderboard(await getLeaderboard())
      setReferralStats(getReferralStats())
      setSavingsStats(getMoneySavedStats())
    }
    loadData()
  }, [])

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralStats.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!state) return null

  const allBadges = [...badges.unlocked, ...badges.locked].slice(0, 12)

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-5 pt-4 pb-28">
      {/* Header */}
      <div>
        <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
          Rewards
        </p>
        <h1
          className="font-bold mt-1"
          style={{ fontSize: 32, letterSpacing: -0.8, lineHeight: 1 }}
        >
          Alex
        </h1>
      </div>

      {/* Karma card with gradient header */}
      <div
        className="mt-6 rounded-[22px] border border-border overflow-hidden bg-card"
        style={{
          boxShadow: "0 1px 2px rgba(0,0,0,.03), 0 1px 8px rgba(0,0,0,.02)",
        }}
      >
        <div
          className="px-[22px] py-5 text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--accent), var(--accent-deep))",
          }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold opacity-75 uppercase tracking-wider">
                Karma
              </p>
              <p
                className="font-bold mt-0.5"
                style={{
                  fontSize: 44,
                  letterSpacing: -1.5,
                  lineHeight: 1,
                }}
              >
                {state.karma.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold opacity-75 uppercase tracking-wider">
                Streak
              </p>
              <p className="text-[22px] font-bold mt-1">
                <Flame className="w-5 h-5 inline-block mr-1" />
                {state.currentStreak}
              </p>
            </div>
          </div>
        </div>
        <div className="px-[22px] py-3.5 flex gap-5">
          <div>
            <p className="text-xl font-bold">${savingsStats.total}</p>
            <p className="text-xs text-muted-foreground">saved</p>
          </div>
          <div>
            <p className="text-xl font-bold">{state.totalChecks || 48}</p>
            <p className="text-xs text-muted-foreground">checks</p>
          </div>
          <div>
            <p className="text-xl font-bold">{badges.unlocked.length}</p>
            <p className="text-xs text-muted-foreground">badges</p>
          </div>
        </div>
      </div>

      {/* Badges grid */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
            Badges · {badges.unlocked.length} of{" "}
            {badges.unlocked.length + badges.locked.length}
          </p>
          <button className="text-[13px] font-semibold text-accent">
            See all
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {allBadges.map((badge) => {
            const isUnlocked = badges.unlocked.some((b) => b.id === badge.id)
            const Icon = ICON_MAP[badge.icon] || Star
            return (
              <div
                key={badge.id}
                className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-border aspect-square"
                style={{
                  background: isUnlocked
                    ? "var(--accent-pale)"
                    : "var(--muted)",
                  opacity: isUnlocked ? 1 : 0.5,
                }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{
                    background: isUnlocked
                      ? "var(--accent)"
                      : "var(--border)",
                    color: "#fff",
                  }}
                >
                  {isUnlocked ? (
                    <Icon className="w-3.5 h-3.5" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                </div>
                <p
                  className="text-[10.5px] font-semibold text-center px-1 leading-tight"
                  style={{
                    color: isUnlocked
                      ? "var(--foreground)"
                      : "var(--muted-foreground)",
                  }}
                >
                  {badge.name}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Leaderboard preview */}
      <div className="mt-6">
        <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Leaderboard
        </p>
        <div className="space-y-2">
          {leaderboard.slice(0, 3).map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-3.5 rounded-[18px] border ${
                entry.isCurrentUser
                  ? "border-accent"
                  : "border-border bg-card"
              }`}
              style={
                entry.isCurrentUser
                  ? { background: "var(--accent-pale)" }
                  : undefined
              }
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background:
                    entry.rank === 1
                      ? "#eab308"
                      : entry.rank === 2
                        ? "#9ca3af"
                        : entry.rank === 3
                          ? "#d97706"
                          : "var(--muted)",
                  color:
                    entry.rank <= 3 ? "#fff" : "var(--muted-foreground)",
                }}
              >
                {entry.rank}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {entry.name}
                  {entry.isCurrentUser && (
                    <span className="text-accent ml-1.5">(You)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Level {entry.level}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">
                  {entry.karma.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">karma</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Referral card */}
      <div
        className="mt-6 rounded-[22px] bg-card border border-border p-5"
        style={{
          boxShadow: "0 1px 2px rgba(0,0,0,.03), 0 1px 8px rgba(0,0,0,.02)",
        }}
      >
        <Share2 className="w-8 h-8 text-accent mb-3" />
        <p className="text-lg font-semibold">Share Park</p>
        <p className="text-sm text-muted-foreground mt-1">
          Earn 150 karma for each friend who joins
        </p>
        <div className="flex items-center gap-2 mt-4 bg-muted rounded-xl p-3">
          <span className="flex-1 font-mono text-lg font-semibold tracking-wider">
            {referralStats.code}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={copyReferralCode}
            className="shrink-0"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
