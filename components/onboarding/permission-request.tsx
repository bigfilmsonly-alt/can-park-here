"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Bell, Check, X } from "lucide-react"

interface PermissionRequestProps {
  onComplete: () => void
}

export function PermissionRequest({ onComplete }: PermissionRequestProps) {
  const [locationGranted, setLocationGranted] = useState<boolean | null>(null)
  const [notificationsGranted, setNotificationsGranted] = useState<boolean | null>(null)
  const [step, setStep] = useState<"location" | "notifications" | "done">("location")

  const requestLocation = async () => {
    try {
      const permission = await navigator.permissions.query({ name: "geolocation" })
      if (permission.state === "granted") {
        setLocationGranted(true)
        setStep("notifications")
      } else if (permission.state === "denied") {
        setLocationGranted(false)
        setStep("notifications")
      } else {
        // Prompt user
        navigator.geolocation.getCurrentPosition(
          () => {
            setLocationGranted(true)
            setStep("notifications")
          },
          () => {
            setLocationGranted(false)
            setStep("notifications")
          }
        )
      }
    } catch {
      // Fallback: just try to get location
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationGranted(true)
          setStep("notifications")
        },
        () => {
          setLocationGranted(false)
          setStep("notifications")
        }
      )
    }
  }

  const requestNotifications = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      setNotificationsGranted(permission === "granted")
    } else {
      setNotificationsGranted(false)
    }
    setStep("done")
  }

  const skipLocation = () => {
    setLocationGranted(false)
    setStep("notifications")
  }

  const skipNotifications = () => {
    setNotificationsGranted(false)
    setStep("done")
  }

  if (step === "done") {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center px-8">
        <div className="w-20 h-20 rounded-full bg-status-success flex items-center justify-center mb-8">
          <Check className="w-10 h-10 text-background" />
        </div>
        <h1 className="text-3xl font-semibold text-foreground text-center mb-4">
          You're all set
        </h1>
        <p className="text-lg text-muted-foreground text-center max-w-sm leading-relaxed mb-8">
          Park is ready to help you find parking and avoid tickets.
        </p>
        
        {/* Permission summary */}
        <div className="w-full max-w-sm space-y-3 mb-10">
          <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-muted/50">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm">Location</span>
            {locationGranted ? (
              <span className="text-sm text-status-success-foreground">Enabled</span>
            ) : (
              <span className="text-sm text-muted-foreground">Not enabled</span>
            )}
          </div>
          <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-muted/50">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm">Notifications</span>
            {notificationsGranted ? (
              <span className="text-sm text-status-success-foreground">Enabled</span>
            ) : (
              <span className="text-sm text-muted-foreground">Not enabled</span>
            )}
          </div>
        </div>

        <Button
          onClick={onComplete}
          className="w-full max-w-sm h-14 text-base font-medium rounded-2xl"
        >
          Start Using Park
        </Button>
      </div>
    )
  }

  if (step === "notifications") {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex justify-end p-6">
          <button
            onClick={skipNotifications}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-20 h-20 rounded-full bg-status-warning flex items-center justify-center mb-8">
            <Bell className="w-10 h-10 text-background" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground text-center mb-4">
            Stay Informed
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-sm leading-relaxed">
            Get alerts before your meter expires, street cleaning starts, or enforcement is nearby.
          </p>
        </div>

        <div className="px-6 pb-10">
          <Button
            onClick={requestNotifications}
            className="w-full h-14 text-base font-medium rounded-2xl"
          >
            Enable Notifications
          </Button>
        </div>
      </div>
    )
  }

  // Location step
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex justify-end p-6">
        <button
          onClick={skipLocation}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-20 h-20 rounded-full bg-foreground flex items-center justify-center mb-8">
          <MapPin className="w-10 h-10 text-background" />
        </div>
        <h1 className="text-3xl font-semibold text-foreground text-center mb-4">
          Enable Location
        </h1>
        <p className="text-lg text-muted-foreground text-center max-w-sm leading-relaxed">
          Park needs your location to check parking rules at your exact spot.
        </p>
      </div>

      <div className="px-6 pb-10">
        <Button
          onClick={requestLocation}
          className="w-full h-14 text-base font-medium rounded-2xl"
        >
          Enable Location
        </Button>
      </div>
    </div>
  )
}
