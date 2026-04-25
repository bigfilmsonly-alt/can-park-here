"use client"

import { useState } from "react"
import { type User, updateUser } from "@/lib/auth"
import { showToast } from "@/components/ui/toast-notification"
import {
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Shield,
  ShieldCheck,
  LogOut,
  DollarSign,
  MapPin,
  Crown,
  Mail,
  Check,
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
  const [name, setName] = useState(user.name ?? "")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const updated = await updateUser({ name })
    if (updated) onUserUpdate(updated)
    setSaving(false)
    setEditing(false)
  }

  const isPro = user.tier === "pro"
  const claimsRemaining = isPro ? Math.max(0, 3 - (user.ticketsAvoided || 0)) : 0
  const moneySaved = user.moneySaved || 48

  return (
    <div
      className="flex flex-col min-h-screen pb-28"
      style={{ paddingLeft: 22, paddingRight: 22, background: "#0b0f17" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 pt-14">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "#1a1f2b" }}
        >
          <ChevronLeft className="w-5 h-5" style={{ color: "#f8fafc" }} />
        </button>
        <h1 className="text-xl font-bold" style={{ color: "#f8fafc" }}>Account</h1>
      </div>

      {/* Profile card */}
      <div
        className="mt-6 p-4 rounded-2xl flex items-center gap-3.5"
        style={{ background: "#1a1f2b", border: "1px solid #2d3447" }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-lg shrink-0"
          style={{
            background: isPro
              ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
              : "#262c3b",
            color: isPro ? "#fff" : "#94a3b8",
          }}
        >
          {(user.name || "U").charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="bg-transparent border-b font-semibold text-base outline-none"
                style={{ color: "#f8fafc", borderColor: "#3b82f6" }}
              />
              <button onClick={handleSave} disabled={saving} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#3b82f6" }}>
                <Check className="w-4 h-4" style={{ color: "#fff" }} />
              </button>
            </div>
          ) : (
            <p className="text-base font-bold truncate" style={{ color: "#f8fafc" }}>{user.name || "User"}</p>
          )}
          <p className="text-xs mt-0.5 truncate" style={{ color: "#94a3b8" }}>{user.email}</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "#262c3b", color: "#94a3b8" }}>
            Edit
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className="p-4 rounded-2xl text-center" style={{ background: "#1a1f2b", border: "1px solid #2d3447" }}>
          <DollarSign className="w-5 h-5 mx-auto mb-2" style={{ color: "#3b82f6" }} />
          <p className="text-2xl font-bold" style={{ color: "#f8fafc" }}>${moneySaved}</p>
          <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>Saved</p>
        </div>
        <div className="p-4 rounded-2xl text-center" style={{ background: "#1a1f2b", border: "1px solid #2d3447" }}>
          <ShieldCheck className="w-5 h-5 mx-auto mb-2" style={{ color: isPro ? "#3b82f6" : "#64748b" }} />
          <p className="text-2xl font-bold" style={{ color: "#f8fafc" }}>{isPro ? claimsRemaining : "—"}</p>
          <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>Claims Left</p>
        </div>
      </div>

      {/* Ticket Protection Status */}
      <div
        className="mt-5 p-4 rounded-2xl flex items-center gap-3.5"
        style={{
          background: isPro ? "rgba(59,130,246,0.08)" : "#1a1f2b",
          border: `1px solid ${isPro ? "rgba(59,130,246,0.2)" : "#2d3447"}`,
        }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: isPro ? "rgba(59,130,246,0.15)" : "#262c3b" }}
        >
          <ShieldCheck className="w-6 h-6" style={{ color: isPro ? "#3b82f6" : "#64748b" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: "#f8fafc" }}>Ticket Protection</p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: isPro ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                color: isPro ? "#10b981" : "#ef4444",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />
              {isPro ? "Active" : "Inactive"}
            </span>
            {isPro && (
              <span className="text-[11px]" style={{ color: "#94a3b8" }}>
                {claimsRemaining} of 3 claims remaining
              </span>
            )}
          </div>
        </div>
        {!isPro && (
          <button
            onClick={onUpgrade}
            className="px-3.5 py-2 rounded-full text-xs font-bold shrink-0 press-effect"
            style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", color: "#fff" }}
          >
            Activate
          </button>
        )}
      </div>

      {/* Plan info */}
      <div
        className="mt-5 rounded-2xl overflow-hidden"
        style={{ background: "#1a1f2b", border: "1px solid #2d3447" }}
      >
        <div className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isPro ? "rgba(59,130,246,0.12)" : "#262c3b" }}>
            {isPro ? <Crown className="w-5 h-5" style={{ color: "#3b82f6" }} /> : <Shield className="w-5 h-5" style={{ color: "#64748b" }} />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: "#f8fafc" }}>{isPro ? "Pro Plan" : "Free Plan"}</p>
            <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>
              {isPro ? "Unlimited checks + $100 ticket guarantee" : "10 checks per month"}
            </p>
          </div>
          {!isPro && (
            <button onClick={onUpgrade} className="text-xs font-semibold" style={{ color: "#3b82f6" }}>
              Upgrade
            </button>
          )}
        </div>
      </div>

      {/* Account actions */}
      <div
        className="mt-5 rounded-2xl overflow-hidden"
        style={{ background: "#1a1f2b", border: "1px solid #2d3447" }}
      >
        {[
          { icon: Mail, label: "Change Email", action: () => showToast("info", "Coming soon", "Email change in the next update") },
          { icon: Shield, label: "Change Password", action: () => showToast("info", "Coming soon", "Password change in the next update") },
        ].map((item, i) => (
          <button
            key={item.label}
            onClick={item.action}
            className="w-full px-4 py-3.5 flex items-center gap-3 text-left press-effect"
            style={{ borderTop: i > 0 ? "1px solid #2d3447" : "none" }}
          >
            <item.icon className="w-5 h-5" style={{ color: "#64748b" }} />
            <span className="flex-1 text-sm" style={{ color: "#cbd5e1" }}>{item.label}</span>
            <ChevronRight className="w-4 h-4" style={{ color: "#64748b" }} />
          </button>
        ))}
      </div>

      {/* Sign out */}
      <button
        onClick={onSignOut}
        className="mt-6 w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold press-effect"
        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.15)", color: "#ef4444" }}
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  )
}
