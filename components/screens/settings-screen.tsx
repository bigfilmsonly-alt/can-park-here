"use client"

import React from "react"
import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, ShieldCheck, Car, CreditCard, Camera } from "lucide-react"
import { getProtectionStatus, type UserProtection } from "@/lib/protection"
import { getUserAccessibility, setUserAccessibility, type UserAccessibility } from "@/lib/parking-rules"
import { showToast } from "@/components/ui/toast-notification"
import { type User } from "@/lib/auth"
import { Button } from "@/components/ui/button"

interface SettingsScreenProps {
  onUpgrade: () => void
  user?: User | null
  onOpenAccount?: () => void
  onSignIn?: () => void
  onOpenAccessibilitySettings?: () => void
}

const SUPPORTED_CITIES = [
  { id: "sf", name: "San Francisco, CA", available: true },
  { id: "la", name: "Los Angeles, CA", available: true },
  { id: "nyc", name: "New York, NY", available: true },
  { id: "chi", name: "Chicago, IL", available: true },
  { id: "sea", name: "Seattle, WA", available: true },
  { id: "aus", name: "Austin, TX", available: true },
  { id: "bos", name: "Boston, MA", available: true },
  { id: "den", name: "Denver, CO", available: true },
  { id: "por", name: "Portland, OR", available: true },
  { id: "mia", name: "Miami, FL", available: true },
  { id: "atl", name: "Atlanta, GA", available: true },
  { id: "dc", name: "Washington, DC", available: true },
]

const PLACARD_TYPES = [
  { id: "permanent", name: "Permanent Placard", description: "No expiration" },
  { id: "temporary", name: "Temporary Placard", description: "Valid for limited time" },
  { id: "disabled-veteran", name: "Disabled Veteran", description: "DV plates or placard" },
]

function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`w-10 h-6 rounded-full relative transition-colors ${
        on ? "bg-[var(--accent)]" : "border border-border bg-muted"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
          on ? "left-[18px]" : "left-0.5"
        }`}
      />
    </button>
  )
}

export function SettingsScreen({ onUpgrade, user, onOpenAccount, onSignIn, onOpenAccessibilitySettings }: SettingsScreenProps) {
  const [protection, setProtection] = useState<UserProtection | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [cleaningAlerts, setCleaningAlerts] = useState(true)
  const [communityNearby, setCommunityNearby] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string>("sf")
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [accessibility, setAccessibility] = useState<UserAccessibility>({ hasHandicapPlacard: false })
  const [theme, setTheme] = useState<"light" | "dark" | "aaa">("light")
  const [accentColor, setAccentColor] = useState<"blue" | "teal" | "indigo" | "slate">("blue")

  useEffect(() => {
    setProtection(getProtectionStatus())
    setAccessibility(getUserAccessibility())

    const savedNotifications = localStorage.getItem("park_notifications")
    if ("Notification" in window) {
      if (savedNotifications === "off") {
        setNotificationsEnabled(false)
      } else if (Notification.permission === "granted") {
        setNotificationsEnabled(true)
      }
    }
    const savedCity = localStorage.getItem("park_selected_city")
    if (savedCity) {
      setSelectedCity(savedCity)
    }
  }, [])

  const isPro = protection?.tier === "pro"

  const handleNotificationsToggle = async () => {
    if ("Notification" in window) {
      if (notificationsEnabled) {
        setNotificationsEnabled(false)
        localStorage.setItem("park_notifications", "off")
        showToast("info", "Notifications off", "You won't receive reminders until you turn them back on")
      } else {
        if (Notification.permission === "denied") {
          showToast("error", "Notifications blocked", "Please enable in your browser settings")
        } else if (Notification.permission === "granted") {
          setNotificationsEnabled(true)
          localStorage.setItem("park_notifications", "on")
          showToast("success", "Notifications on", "You'll receive parking reminders")
        } else {
          const permission = await Notification.requestPermission()
          if (permission === "granted") {
            setNotificationsEnabled(true)
            localStorage.setItem("park_notifications", "on")
            showToast("success", "Notifications on", "You'll receive parking reminders")
          }
        }
      }
    }
  }

  const handleCitySelect = (cityId: string) => {
    setSelectedCity(cityId)
    localStorage.setItem("park_selected_city", cityId)
    setShowCityDropdown(false)
    const city = SUPPORTED_CITIES.find(c => c.id === cityId)
    showToast("success", "City updated", `Parking rules now set for ${city?.name}`)
  }

  const handleAccessibilityToggle = () => {
    const newValue = !accessibility.hasHandicapPlacard
    const updated: UserAccessibility = {
      ...accessibility,
      hasHandicapPlacard: newValue,
      placardType: newValue ? accessibility.placardType || "permanent" : undefined,
    }
    setAccessibility(updated)
    setUserAccessibility(updated)

    if (newValue) {
      showToast("success", "Accessibility enabled", "Handicap parking spots will now show as available for you")
    } else {
      showToast("info", "Accessibility disabled", "Standard parking rules will apply")
    }
  }

  const handlePlacardTypeSelect = (type: "permanent" | "temporary" | "disabled-veteran") => {
    const updated: UserAccessibility = {
      ...accessibility,
      placardType: type,
    }
    setAccessibility(updated)
    setUserAccessibility(updated)
    showToast("success", "Placard type updated", PLACARD_TYPES.find(p => p.id === type)?.name || "")
  }

  const handleFileClaim = () => {
    showToast("info", "File a claim", "Email support@park.app with your ticket photo and session details")
  }

  const handleContactSupport = () => {
    showToast("info", "Contact support", "Email us at support@park.app")
  }

  const handleReset = () => {
    localStorage.clear()
    showToast("info", "Settings reset", "All local data has been cleared")
    window.location.reload()
  }

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AM"

  const accentSwatches: { id: "blue" | "teal" | "indigo" | "slate"; color: string }[] = [
    { id: "blue", color: "#3b82f6" },
    { id: "teal", color: "#14b8a6" },
    { id: "indigo", color: "#6366f1" },
    { id: "slate", color: "#64748b" },
  ]

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-5 pb-20 overflow-y-auto">
      {/* Header */}
      <div className="pt-16 pb-6">
        <button
          onClick={onOpenAccount}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-3xl font-bold text-foreground mt-4">Settings</h1>
      </div>

      {/* Profile card */}
      <div className="bg-card border border-border rounded-[18px] p-4 flex items-center gap-3.5">
        <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] flex items-center justify-center text-white text-lg font-semibold">
          {userInitials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-foreground truncate">
            {user?.name ?? "Alex Morton"}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {user?.email ?? (isPro ? "Pro plan" : "Free plan")}
          </p>
        </div>
      </div>

      {/* Pro upgrade banner */}
      {!isPro && (
        <div className="bg-foreground text-background rounded-2xl p-3.5 mt-4 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Ticket Protection Pro</p>
            <p className="text-xs opacity-70">3 claims/yr &middot; $4.99/mo</p>
          </div>
          <Button
            onClick={onUpgrade}
            className="rounded-full px-4 py-1.5 text-xs font-semibold h-auto bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90"
          >
            Upgrade
          </Button>
        </div>
      )}

      {/* Appearance section */}
      <div className="mt-8">
        <p className="text-xs font-bold tracking-wider uppercase text-muted-foreground px-2 pb-1.5">
          Appearance
        </p>

        {/* Theme row */}
        <div className="bg-card border border-border rounded-[18px]">
          <div className="px-4 py-3.5 flex items-center gap-3">
            <span className="text-sm text-foreground flex-1">Theme</span>
            <div className="flex gap-1.5">
              {(["light", "dark", "aaa"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-3 py-1.5 rounded-[9px] text-xs font-semibold transition-colors ${
                    theme === t
                      ? "bg-foreground text-background"
                      : "bg-muted text-[var(--fg2)]"
                  }`}
                >
                  {t === "aaa" ? "AAA" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[var(--hairline)]" />

          {/* Accent color row */}
          <div className="px-4 py-3.5 flex items-center gap-3">
            <span className="text-sm text-foreground flex-1">Accent color</span>
            <div className="flex gap-2">
              {accentSwatches.map((swatch) => (
                <button
                  key={swatch.id}
                  onClick={() => setAccentColor(swatch.id)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    accentColor === swatch.id
                      ? "ring-2 ring-offset-2 ring-offset-card ring-[var(--accent)]"
                      : ""
                  }`}
                  style={{ backgroundColor: swatch.color }}
                  aria-label={`${swatch.id} accent color`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications section */}
      <div className="mt-8">
        <p className="text-xs font-bold tracking-wider uppercase text-muted-foreground px-2 pb-1.5">
          Notifications
        </p>
        <div className="bg-card border border-border rounded-[18px]">
          {/* Timer reminders */}
          <div className="px-4 py-3.5 flex items-center gap-3">
            <span className="text-sm text-foreground flex-1">Timer reminders</span>
            <ToggleSwitch on={notificationsEnabled} onToggle={handleNotificationsToggle} />
          </div>

          <div className="border-t border-[var(--hairline)]" />

          {/* Street cleaning alerts */}
          <div className="px-4 py-3.5 flex items-center gap-3">
            <span className="text-sm text-foreground flex-1">Street cleaning alerts</span>
            <ToggleSwitch on={cleaningAlerts} onToggle={() => setCleaningAlerts(!cleaningAlerts)} />
          </div>

          <div className="border-t border-[var(--hairline)]" />

          {/* Community nearby */}
          <div className="px-4 py-3.5 flex items-center gap-3">
            <span className="text-sm text-foreground flex-1">Community nearby</span>
            <ToggleSwitch on={communityNearby} onToggle={() => setCommunityNearby(!communityNearby)} />
          </div>
        </div>
      </div>

      {/* Info rows card */}
      <div className="mt-8">
        <div className="bg-card border border-border rounded-[18px]">
          {/* Vehicle */}
          <button
            onClick={() => onOpenAccessibilitySettings?.()}
            className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
          >
            <Car className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">Vehicle</p>
              <p className="text-xs text-muted-foreground">Placard, plate, type</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          <div className="border-t border-[var(--hairline)]" />

          {/* Payment methods */}
          <button
            onClick={() => {}}
            className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
          >
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">Payment methods</p>
              <p className="text-xs text-muted-foreground">Cards, meters, wallets</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          <div className="border-t border-[var(--hairline)]" />

          {/* Photo vault */}
          <button
            onClick={() => {}}
            className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
          >
            <Camera className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">Photo vault</p>
              <p className="text-xs text-muted-foreground">Saved sign scans, receipts</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Reset button */}
      <div className="mt-8 pb-8">
        <button
          onClick={handleReset}
          className="w-full py-3 bg-muted rounded-[18px] text-sm font-medium text-red-500"
        >
          Reset all settings
        </button>
      </div>
    </div>
  )
}
