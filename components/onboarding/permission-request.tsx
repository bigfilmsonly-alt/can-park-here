"use client"

import { useState } from "react"
import { MapPin, Bell, Check } from "lucide-react"
import { subscribeToPush } from "@/lib/push-notifications"

interface PermissionRequestProps {
  onComplete: () => void
}

export function PermissionRequest({ onComplete }: PermissionRequestProps) {
  const [requesting, setRequesting] = useState(false)
  const [step, setStep] = useState(0) // 0 = location, 1 = notifications

  const requestLocation = async () => {
    setRequesting(true)
    try {
      const permission = await navigator.permissions.query({ name: "geolocation" })
      if (permission.state === "granted") {
        setStep(1)
      } else if (permission.state === "denied") {
        setStep(1)
      } else {
        navigator.geolocation.getCurrentPosition(
          () => setStep(1),
          () => setStep(1)
        )
      }
    } catch {
      navigator.geolocation.getCurrentPosition(
        () => setStep(1),
        () => setStep(1)
      )
    } finally {
      setRequesting(false)
    }
  }

  const requestNotifications = async () => {
    setRequesting(true)
    try {
      const result = await Notification.requestPermission()
      if (result === "granted") {
        await subscribeToPush()
      }
    } catch {
      // Notification API not available or user dismissed
    } finally {
      setRequesting(false)
      onComplete()
    }
  }

  const locationFeatures = [
    { title: "Instant answers by block", sub: "Accurate to 10 meters" },
    { title: "Street cleaning alerts", sub: "Auto-set by city" },
    { title: "Find open spots nearby", sub: "Real-time from drivers" },
  ]

  const notificationFeatures = [
    { title: "Timer alerts at 15, 5, and 1 min", sub: "Never overstay your meter" },
    { title: "Street cleaning warnings", sub: "Move before the sweeper" },
    { title: "Nearby spot reports", sub: "Community-sourced updates" },
  ]

  const features = step === 0 ? locationFeatures : notificationFeatures
  const Icon = step === 0 ? MapPin : Bell

  return (
    <div className="fixed inset-0 z-50 flex flex-col animate-fade-in" style={{ background: "var(--park-bg)", color: "var(--park-fg)" }}>
      <div className="flex-1 flex flex-col items-center px-8 pt-20">
        {/* Icon with ripple rings */}
        <div className="relative mb-2">
          <div
            className="w-[180px] h-[180px] rounded-full flex items-center justify-center"
            style={{ background: "var(--park-accent-pale)", color: "var(--park-accent)" }}
          >
            <Icon className="w-[88px] h-[88px]" />
          </div>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute rounded-full border"
              style={{
                inset: -(14 + i * 20),
                borderColor: "var(--park-accent)",
                opacity: 0.15 - i * 0.04,
              }}
            />
          ))}
        </div>

        {/* Heading */}
        <div
          className="text-center font-bold tracking-tight leading-[1.1] mt-8"
          style={{ fontSize: 34 }}
        >
          {step === 0 ? (
            <>
              Where are you,
              <br />
              right now?
            </>
          ) : (
            <>Never miss a move.</>
          )}
        </div>
        <div className="text-[17px] mt-3 leading-relaxed text-center" style={{ color: "var(--fg2)" }}>
          {step === 0
            ? "Park uses your location to read the signs and rules on your block. We never sell it."
            : "Get reminders before your time runs out, street cleaning alerts, and community spot updates."}
        </div>

        {/* Features */}
        <div className="mt-8 w-full">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex gap-3.5 py-3.5"
              style={{ borderTop: i > 0 ? "1px solid var(--hairline)" : "none" }}
            >
              <div
                className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
                style={{ background: "var(--park-accent-pale)", color: "var(--park-accent)" }}
              >
                <Check className="w-[18px] h-[18px]" />
              </div>
              <div>
                <div className="text-[15px] font-semibold">{f.title}</div>
                <div className="text-[13px] text-muted-foreground mt-0.5">{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="px-6 pb-11">
        <button
          onClick={step === 0 ? requestLocation : requestNotifications}
          disabled={requesting}
          className="w-full py-4 rounded-full text-base font-bold press-effect disabled:opacity-70"
          style={{ background: "var(--park-accent)", color: "#fff" }}
        >
          {step === 0 ? "Allow location" : "Allow notifications"}
        </button>
        <button
          onClick={step === 0 ? () => setStep(1) : onComplete}
          className="w-full mt-2.5 py-2 text-sm text-muted-foreground"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
