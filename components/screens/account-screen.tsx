"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type User, updateUser, signOut } from "@/lib/auth"
import { 
  ArrowLeft, 
  User as UserIcon, 
  Mail, 
  Shield, 
  Crown, 
  LogOut,
  ChevronRight,
  Check,
  MapPin,
  Clock,
  DollarSign
} from "lucide-react"

interface AccountScreenProps {
  user: User
  onBack: () => void
  onSignOut: () => void
  onUpgrade: () => void
  onUserUpdate: (user: User) => void
}

export function AccountScreen({ user, onBack, onSignOut, onUpgrade, onUserUpdate }: AccountScreenProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.name)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const updated = await updateUser({ name })
    if (updated) {
      onUserUpdate(updated)
    }
    setSaving(false)
    setEditing(false)
  }

  const handleSignOut = async () => {
    await signOut()
    onSignOut()
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-border">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold">Account</h1>
      </div>

      <div className="flex-1 p-6 pb-20 overflow-y-auto">
        {/* Profile card */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <UserIcon className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              {editing ? (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 text-lg font-semibold rounded-xl"
                  autoFocus
                />
              ) : (
                <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
              )}
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            {editing ? (
              <Button
                onClick={handleSave}
                disabled={saving}
                size="sm"
                className="rounded-xl"
              >
                <Check className="w-4 h-4" />
              </Button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Member since {memberSince}</span>
          </div>
        </div>

        {/* Plan card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
          <div className="p-4 flex items-center gap-4">
            {user.plan === "pro" ? (
              <div className="w-10 h-10 rounded-full bg-status-warning flex items-center justify-center">
                <Crown className="w-5 h-5 text-background" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Shield className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {user.plan === "pro" ? "Pro Plan" : "Free Plan"}
              </p>
              <p className="text-sm text-muted-foreground">
                {user.plan === "pro"
                  ? "Unlimited checks + ticket protection"
                  : "10 checks per month"}
              </p>
            </div>
            {user.plan !== "pro" && (
              <button
                onClick={onUpgrade}
                className="text-sm font-medium text-foreground hover:underline"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 px-1">
            Your Stats
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card rounded-2xl border border-border p-4 text-center">
              <MapPin className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
              <p className="text-2xl font-semibold text-foreground">{user.totalChecks}</p>
              <p className="text-xs text-muted-foreground">Checks</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-4 text-center">
              <Shield className="w-5 h-5 text-status-success-foreground mx-auto mb-2" />
              <p className="text-2xl font-semibold text-foreground">{user.ticketsAvoided}</p>
              <p className="text-xs text-muted-foreground">Tickets Avoided</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-4 text-center">
              <DollarSign className="w-5 h-5 text-status-warning-foreground mx-auto mb-2" />
              <p className="text-2xl font-semibold text-foreground">${user.moneySaved}</p>
              <p className="text-xs text-muted-foreground">Saved</p>
            </div>
          </div>
        </div>

        {/* Account actions */}
        <div className="mb-6">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 px-1">
            Account
          </h3>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <button
              className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
            >
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-base text-foreground">Change Email</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            
            <div className="h-px bg-border mx-4" />
            
            <button
              className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
            >
              <Shield className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-base text-foreground">Change Password</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Sign out */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full h-14 text-base font-medium rounded-2xl bg-transparent text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
