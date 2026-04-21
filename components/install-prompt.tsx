"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, Share } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    // SSR guard
    if (typeof window === "undefined") return

    // Check if already installed
    const standalone = window.matchMedia("(display-mode: standalone)").matches
    setIsStandalone(standalone)

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Check if dismissed recently
    try {
      const dismissed = localStorage.getItem("park_install_dismissed")
      if (dismissed) {
        const dismissedTime = parseInt(dismissed, 10)
        const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
        if (daysSinceDismissed < 7) return
      }
    } catch {
      // localStorage unavailable
    }

    // Listen for install prompt (Android/Desktop)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show after 30 seconds of use
      const t = setTimeout(() => setShowPrompt(true), 30000)
      timeoutsRef.current.push(t)
    }

    window.addEventListener("beforeinstallprompt", handler)

    // For iOS, show after some usage
    if (iOS && !standalone) {
      const t = setTimeout(() => setShowPrompt(true), 60000)
      timeoutsRef.current.push(t)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("park_install_dismissed", Date.now().toString())
  }

  if (!showPrompt || isStandalone) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-2xl p-4 shadow-lg">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="pr-6">
          <h3 className="text-base font-semibold text-foreground">
            Add Park to Home Screen
          </h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Get faster access and work offline. No app store needed.
          </p>
        </div>

        {isIOS ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Share className="h-4 w-4" />
            <span>
              Tap <span className="font-medium text-foreground">Share</span> then{" "}
              <span className="font-medium text-foreground">Add to Home Screen</span>
            </span>
          </div>
        ) : (
          <Button
            onClick={handleInstall}
            className="w-full mt-4 h-12 rounded-xl"
          >
            <Download className="h-4 w-4 mr-2" />
            Install App
          </Button>
        )}
      </div>
    </div>
  )
}
