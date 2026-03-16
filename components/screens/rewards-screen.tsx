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
  ChevronLeft,
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
  const [activeTab, setActiveTab] = useState<"badges" | "leaderboard" | "referrals" | "savings">("badges")
  const [state, setState] = useState<GamificationState | null>(null)
  const [badges, setBadges] = useState<{ unlocked: Badge[]; locked: Badge[] }>({ unlocked: [], locked: [] })
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [referralStats, setReferralStats] = useState({ code: "", referrals: 0, earnings: 0 })
  const [savingsStats, setSavingsStats] = useState({ total: 0, thisMonth: 0, ticketsAvoided: 0 })
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

  const karmaForNext = getKarmaForNextLevel(state.level)
  const karmaProgress = (state.karma / karmaForNext) * 100

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Rewards</h1>
        </div>
      </div>

      {/* Karma overview */}
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">{state.level}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Level {state.level}</p>
            <p className="text-2xl font-semibold">{state.karma.toLocaleString()} karma</p>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.min(karmaProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {karmaForNext - state.karma} karma to level {state.level + 1}
            </p>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-2 mt-4 p-3 bg-muted/50 rounded-xl">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-medium">{state.currentStreak} day streak</span>
          <span className="text-xs text-muted-foreground ml-auto">
            Best: {state.longestStreak} days
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(["badges", "leaderboard", "referrals", "savings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {activeTab === "badges" && (
          <div className="p-6 space-y-6">
            {/* Unlocked badges */}
            {badges.unlocked.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-3">
                  Unlocked ({badges.unlocked.length})
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {badges.unlocked.map((badge) => {
                    const Icon = ICON_MAP[badge.icon] || Award
                    return (
                      <div
                        key={badge.id}
                        className="flex flex-col items-center p-4 bg-card rounded-2xl border border-border"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-xs font-medium text-center">{badge.name}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Locked badges */}
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                In Progress ({badges.locked.length})
              </h2>
              <div className="space-y-3">
                {badges.locked.slice(0, 6).map((badge) => {
                  const Icon = ICON_MAP[badge.icon] || Award
                  const progress = getBadgeProgress(badge)
                  return (
                    <div
                      key={badge.id}
                      className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border"
                    >
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Icon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary/50 rounded-full transition-all"
                            style={{ width: `${progress * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.floor(progress * 100)}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="p-6">
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-colors ${
                    entry.isCurrentUser
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-card border border-border"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    entry.rank === 1 ? "bg-yellow-500 text-white" :
                    entry.rank === 2 ? "bg-gray-400 text-white" :
                    entry.rank === 3 ? "bg-amber-600 text-white" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {entry.rank}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {entry.name}
                      {entry.isCurrentUser && <span className="text-primary ml-2">(You)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{entry.karma.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">karma</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "referrals" && (
          <div className="p-6 space-y-6">
            {/* Referral code */}
            <div className="bg-card rounded-2xl border border-border p-6 text-center">
              <Share2 className="w-10 h-10 text-primary mx-auto mb-3" />
              <h2 className="text-lg font-semibold mb-2">Share Park</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Earn 150 karma for each friend who signs up and makes their first check
              </p>
              
              <div className="flex items-center gap-2 bg-muted rounded-xl p-3">
                <span className="flex-1 font-mono text-lg font-semibold tracking-wider">
                  {referralStats.code}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyReferralCode}
                  className="shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-2xl border border-border p-4 text-center">
                <p className="text-3xl font-bold text-foreground">{referralStats.referrals}</p>
                <p className="text-sm text-muted-foreground">Referrals</p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-4 text-center">
                <p className="text-3xl font-bold text-foreground">{referralStats.earnings}</p>
                <p className="text-sm text-muted-foreground">Karma earned</p>
              </div>
            </div>

            {/* How it works */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">How it works</h3>
              <div className="space-y-3">
                {[
                  { step: 1, text: "Share your code with friends" },
                  { step: 2, text: "They sign up and enter your code" },
                  { step: 3, text: "You earn 100 karma instantly" },
                  { step: 4, text: "Earn 50 more when they check their first spot" },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      {step}
                    </div>
                    <p className="text-sm text-foreground">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "savings" && (
          <div className="p-6 space-y-6">
            {/* Total savings */}
            <div className="bg-card rounded-2xl border border-border p-6 text-center">
              <DollarSign className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <p className="text-4xl font-bold text-foreground">
                ${savingsStats.total.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Total money saved</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-2xl border border-border p-4 text-center">
                <p className="text-2xl font-bold text-foreground">
                  ${savingsStats.thisMonth}
                </p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-4 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {savingsStats.ticketsAvoided}
                </p>
                <p className="text-xs text-muted-foreground">Tickets avoided</p>
              </div>
            </div>

            {/* Breakdown */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">How we calculate</h3>
              <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Average ticket cost</span>
                  <span className="font-medium">$75</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tickets avoided</span>
                  <span className="font-medium">{savingsStats.ticketsAvoided}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Total saved</span>
                  <span className="font-bold text-green-500">
                    ${savingsStats.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Share savings */}
            <Button className="w-full" variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share my savings
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
