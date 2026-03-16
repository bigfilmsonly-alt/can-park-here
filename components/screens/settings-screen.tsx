"use client"

import React from "react"
import { useEffect, useState } from "react"
import { Shield, ChevronRight, ChevronDown, Bell, MapPin, HelpCircle, FileText, AlertCircle, Mail, Check, Accessibility, Car, Building2, CreditCard, BarChart3 } from "lucide-react"
import { getProtectionStatus, type UserProtection } from "@/lib/protection"
import { getUserAccessibility, setUserAccessibility, type UserAccessibility } from "@/lib/parking-rules"
import { showToast } from "@/components/ui/toast-notification"
import { type User } from "@/lib/auth"
import { User as UserIcon } from "lucide-react"

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

export function SettingsScreen({ onUpgrade, user, onOpenAccount, onSignIn, onOpenAccessibilitySettings }: SettingsScreenProps) {
  const [protection, setProtection] = useState<UserProtection | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string>("sf")
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showAccessibility, setShowAccessibility] = useState(false)
  const [accessibility, setAccessibility] = useState<UserAccessibility>({ hasHandicapPlacard: false })

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
  const currentCity = SUPPORTED_CITIES.find(c => c.id === selectedCity)

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

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-6 py-8 pb-20">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>

      {/* Account section */}
      <div className="mt-6">
        {user ? (
          <button
            onClick={onOpenAccount}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:bg-muted/50 transition-colors text-left"
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-base font-medium text-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        ) : (
          <button
            onClick={onSignIn}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:bg-muted/50 transition-colors text-left"
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-base font-medium text-foreground">Sign in</p>
              <p className="text-sm text-muted-foreground">Sync data and unlock features</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Subscription status */}
      <div className="mt-8">
        <div
          className={`p-5 rounded-2xl ${
            isPro ? "bg-status-success/10" : "bg-muted/50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isPro ? "bg-status-success/20" : "bg-muted"
              }`}
            >
              <Shield
                className={`h-6 w-6 ${
                  isPro ? "text-status-success-foreground" : "text-muted-foreground"
                }`}
              />
            </div>
            <div className="flex-1">
              <p className="text-base font-medium text-foreground">
                {isPro ? "Park Pro" : "Free Plan"}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isPro
                  ? "Unlimited checks + ticket protection"
                  : `${protection?.checksThisMonth || 0}/${protection?.checksLimit || 10} checks used this month`}
              </p>
            </div>
            {!isPro && (
              <button 
                onClick={onUpgrade}
                className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-full hover:bg-foreground/90 transition-colors"
              >
                Upgrade
              </button>
            )}
          </div>

          {isPro && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Claims used</span>
                <span className="text-foreground font-medium">
                  {protection?.claimsThisYear || 0} / {protection?.claimsLimit || 3}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Max claim amount</span>
                <span className="text-foreground font-medium">${protection?.maxClaimAmount || 100}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File a claim */}
      {isPro && (
        <div className="mt-6">
          <button 
            onClick={handleFileClaim}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-status-error/10 hover:bg-status-error/15 transition-colors text-left"
          >
            <AlertCircle className="h-5 w-5 text-status-error-foreground" />
            <div className="flex-1">
              <p className="text-base font-medium text-foreground">Got a ticket?</p>
              <p className="text-sm text-muted-foreground">File a protection claim</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Accessibility settings - prominent placement */}
      <div className="mt-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 px-1">Accessibility</h2>
        <div className="bg-card rounded-2xl overflow-hidden border border-border">
          {/* Handicap placard toggle */}
          <button
            onClick={handleAccessibilityToggle}
            className="w-full flex items-center gap-4 py-4 px-4 hover:bg-muted/50 transition-colors text-left"
          >
            <Accessibility className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <span className="text-base text-foreground">Handicap placard</span>
              <p className="text-sm text-muted-foreground mt-0.5">Access disabled parking spots</p>
            </div>
            <div className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors ${
              accessibility.hasHandicapPlacard ? "bg-status-success" : "bg-muted"
            }`}>
              <div className={`w-5 h-5 rounded-full bg-background shadow-sm transition-transform ${
                accessibility.hasHandicapPlacard ? "translate-x-5" : "translate-x-0"
              }`} />
            </div>
          </button>
          
          {/* Placard type selector - only show if enabled */}
          {accessibility.hasHandicapPlacard && (
            <>
              <div className="h-px bg-border mx-4" />
              <div className="p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground mb-3">Placard type</p>
                <div className="space-y-2">
                  {PLACARD_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handlePlacardTypeSelect(type.id as "permanent" | "temporary" | "disabled-veteran")}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-background hover:bg-muted/50 transition-colors text-left"
                    >
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <span className="text-sm text-foreground">{type.name}</span>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                      {accessibility.placardType === type.id && (
                        <Check className="h-4 w-4 text-status-success-foreground" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* General settings */}
      <div className="mt-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 px-1">General</h2>
        <div className="bg-card rounded-2xl overflow-hidden border border-border">
          {/* Notifications with toggle */}
          <button
            onClick={handleNotificationsToggle}
            className="w-full flex items-center gap-4 py-4 px-4 hover:bg-muted/50 transition-colors text-left"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-base text-foreground">Notifications</span>
            <div className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors ${
              notificationsEnabled ? "bg-status-success" : "bg-muted"
            }`}>
              <div className={`w-5 h-5 rounded-full bg-background shadow-sm transition-transform ${
                notificationsEnabled ? "translate-x-5" : "translate-x-0"
              }`} />
            </div>
          </button>
          
          <div className="h-px bg-border mx-4" />
          
          {/* City selector dropdown */}
          <div>
            <button
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="w-full flex items-center gap-4 py-4 px-4 hover:bg-muted/50 transition-colors text-left"
            >
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-base text-foreground">Your city</span>
              <span className="text-sm text-muted-foreground">{currentCity?.name.split(",")[0]}</span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showCityDropdown ? "rotate-180" : ""}`} />
            </button>
            
            {showCityDropdown && (
              <div className="border-t border-border bg-muted/30">
                <div className="max-h-64 overflow-y-auto">
                  {SUPPORTED_CITIES.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleCitySelect(city.id)}
                      className="w-full flex items-center gap-4 py-3 px-4 pl-14 hover:bg-muted/50 transition-colors text-left"
                    >
                      <span className="flex-1 text-sm text-foreground">{city.name}</span>
                      {selectedCity === city.id && (
                        <Check className="h-4 w-4 text-status-success-foreground" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info section */}
      <div className="mt-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 px-1">Information</h2>
        <div className="bg-card rounded-2xl overflow-hidden border border-border">
          {/* How it works expandable */}
          <div>
            <button
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="w-full flex items-center gap-4 py-4 px-4 hover:bg-muted/50 transition-colors text-left"
            >
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-base text-foreground">How it works</span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showHowItWorks ? "rotate-180" : ""}`} />
            </button>
            
            {showHowItWorks && (
              <div className="border-t border-border bg-muted/30 px-4 py-4 pl-14">
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-medium shrink-0">1</span>
                    <div>
                      <p className="text-foreground font-medium">Check your spot</p>
                      <p className="mt-0.5">Tap "Check Parking" when you arrive. We'll analyze local parking rules for your exact location.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-medium shrink-0">2</span>
                    <div>
                      <p className="text-foreground font-medium">Scan a street sign</p>
                      <p className="mt-0.5">Take a photo of confusing parking signs and we'll translate them into plain English.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-medium shrink-0">3</span>
                    <div>
                      <p className="text-foreground font-medium">Set a reminder</p>
                      <p className="mt-0.5">We'll notify you at 20 minutes, 10 minutes, and 5 minutes before your time expires.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-medium shrink-0">4</span>
                    <div>
                      <p className="text-foreground font-medium">Ticket protection (Pro)</p>
                      <p className="mt-0.5">If you follow our guidance and still get a ticket, Pro members can file a claim for up to $100 reimbursement.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="h-px bg-border mx-4" />
          
          {/* Terms expandable */}
          <div>
            <button
              onClick={() => setShowTerms(!showTerms)}
              className="w-full flex items-center gap-4 py-4 px-4 hover:bg-muted/50 transition-colors text-left"
            >
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-base text-foreground">Terms & Privacy</span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showTerms ? "rotate-180" : ""}`} />
            </button>
            
            {showTerms && (
              <div className="border-t border-border bg-muted/30 px-4 py-4 pl-14">
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div>
                    <p className="text-foreground font-medium">Terms of Service</p>
                    <p className="mt-1">By using Park, you agree to use our parking guidance responsibly. Our information is based on publicly available parking regulations but may not always be 100% accurate due to temporary changes or local variations.</p>
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Ticket Protection</p>
                    <p className="mt-1">Pro members are eligible for ticket reimbursement (up to $100, max 3 claims/year) when:</p>
                    <ul className="mt-2 space-y-1 ml-4">
                      <li>- You checked parking before parking</li>
                      <li>- We indicated parking was allowed</li>
                      <li>- You followed the time limits we displayed</li>
                      <li>- You submit your claim within 14 days</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Handicap Parking</p>
                    <p className="mt-1">Users with valid handicap placards can enable accessibility mode in Settings. You must have a valid placard displayed in your vehicle to use accessible parking spots. Misuse of accessible parking is illegal and subject to heavy fines.</p>
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Privacy</p>
                    <p className="mt-1">We collect location data only when you check parking, and only to provide accurate results. We don't sell your data or track you in the background. Your parking history is stored locally on your device.</p>
                  </div>
                  <div className="pt-2">
                    <a href="#" className="text-foreground underline underline-offset-2">Read full terms at park.app/terms</a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

{/* Accessibility section */}
      <div className="mt-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 px-1">Accessibility</h2>
        <div className="bg-card rounded-2xl overflow-hidden border border-border">
          <button
            onClick={onOpenAccessibilitySettings}
            className="w-full flex items-center gap-4 py-4 px-4 hover:bg-muted/50 transition-colors text-left"
          >
            <Accessibility className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <span className="text-base text-foreground">Accessibility Settings</span>
              <p className="text-sm text-muted-foreground">Display, motion, language options</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Business section */}
      <div className="mt-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 px-1">Business</h2>
        <div className="bg-card rounded-2xl overflow-hidden border border-border">
          <a
            href="/fleet"
            className="w-full flex items-center gap-4 py-4 px-4 hover:bg-muted/50 transition-colors text-left"
          >
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <span className="text-base text-foreground">Fleet Management</span>
              <p className="text-sm text-muted-foreground">Manage parking for your business</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </a>
          
          <div className="h-px bg-border mx-4" />
          
          <a
            href="/insurance"
            className="w-full flex items-center gap-4 py-4 px-4 hover:bg-muted/50 transition-colors text-left"
          >
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <span className="text-base text-foreground">Insurance Integration</span>
              <p className="text-sm text-muted-foreground">Get discounts for safe parking</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </a>
          
          <div className="h-px bg-border mx-4" />
          
          <a
            href="/partners"
            className="w-full flex items-center gap-4 py-4 px-4 hover:bg-muted/50 transition-colors text-left"
          >
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <span className="text-base text-foreground">City & Enterprise API</span>
              <p className="text-sm text-muted-foreground">Partner with Park</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </a>
        </div>
      </div>

      {/* Support section */}
      <div className="mt-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 px-1">Support</h2>
        <div className="bg-card rounded-2xl overflow-hidden border border-border">
          <button
            onClick={handleContactSupport}
            className="w-full flex items-center gap-4 py-4 px-4 hover:bg-muted/50 transition-colors text-left"
          >
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-base text-foreground">Contact support</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-12 pb-8 space-y-2 text-center">
        <p className="text-sm text-muted-foreground">Park v1.0.0</p>
        <p className="text-xs text-muted-foreground/60">Made with care in San Francisco</p>
      </div>
    </div>
  )
}
