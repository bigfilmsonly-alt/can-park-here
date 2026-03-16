"use client"

import { Shield, ShieldCheck } from "lucide-react"

interface ProtectionBadgeProps {
  isActive: boolean
  variant?: "default" | "compact"
}

export function ProtectionBadge({ isActive, variant = "default" }: ProtectionBadgeProps) {
  if (variant === "compact") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          isActive
            ? "bg-status-success/15 text-status-success-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {isActive ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
        {isActive ? "Protected" : "Not protected"}
      </div>
    )
  }

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-2xl ${
        isActive ? "bg-status-success/10" : "bg-muted/50"
      }`}
    >
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-full ${
          isActive ? "bg-status-success/20" : "bg-muted"
        }`}
      >
        {isActive ? (
          <ShieldCheck className="h-5 w-5 text-status-success-foreground" />
        ) : (
          <Shield className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1">
        <p
          className={`text-sm font-medium ${
            isActive ? "text-status-success-foreground" : "text-foreground"
          }`}
        >
          {isActive ? "Ticket Protection Active" : "Not Currently Protected"}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isActive
            ? "We've got you covered if you get a ticket"
            : "Start a parking session to activate protection"}
        </p>
      </div>
    </div>
  )
}
