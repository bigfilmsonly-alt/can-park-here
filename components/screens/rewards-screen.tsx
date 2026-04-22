"use client"

import { useState, useEffect } from "react"
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
import { showToast } from "@/components/ui/toast-notification"

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
  const streakDays = state.currentStreak
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"]

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-5.5 pt-16 pb-28">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          REWARDS
        </p>
        <h1 className="text-[32px] font-bold tracking-tight mt-1">
          Hey, {state.karma.toLocaleString()} karma.
        </h1>
        <p className="text-sm text-[var(--fg2)] mt-0.5">
          {streakDays}-day streak &middot; top 8% in San Francisco
        </p>
      </div>

      {/* Streak card */}
      <div
        className="mt-6 rounded-[22px] p-5 text-white"
        style={{
          background: "linear-gradient(150deg, var(--accent), var(--accent-deep))",
        }}
      >
        <p className="text-xs font-extrabold tracking-wider opacity-85 uppercase">
          STREAK &middot; {streakDays} DAYS
        </p>
        <h2 className="text-[32px] font-bold tracking-tight mt-1">
          Keep it going.
        </h2>
        <div className="flex gap-1.5 mt-4">
          {dayLabels.map((day, i) => (
            <div
              key={i}
              className={`flex-1 h-10 rounded-lg ${
                i < streakDays ? "bg-white/40" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Badges grid */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Badges &middot; {badges.unlocked.length} of{" "}
            {badges.unlocked.length + badges.locked.length}
          </p>
          <button
            className="text-xs font-bold text-[var(--accent)]"
            onClick={() => showToast("info", "All badges", "Full badge collection coming soon")}
          >
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
                className={`aspect-square rounded-2xl border p-1.5 flex flex-col items-center justify-center gap-1.5 ${
                  isUnlocked
                    ? "bg-[var(--accent-pale)] border-[var(--accent)]"
                    : "bg-muted border-border opacity-60"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white ${
                    isUnlocked ? "bg-[var(--accent)]" : "bg-border"
                  }`}
                >
                  {isUnlocked ? (
                    <Star className="w-3.5 h-3.5" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                </div>
                <p className="text-[10px] font-bold text-center leading-tight">
                  {badge.name}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Leaderboard preview */}
      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
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
          <button
            onClick={copyReferralCode}
            className="shrink-0 px-3 py-1.5 rounded-lg border border-border bg-card text-sm"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
