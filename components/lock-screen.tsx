"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Fingerprint, ScanFace, Lock } from "lucide-react"

interface LockScreenProps {
  onAuthenticate: () => Promise<boolean>
}

export function LockScreen({ onAuthenticate }: LockScreenProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const handleUnlock = async () => {
    setIsAuthenticating(true)
    setError(null)

    const success = await onAuthenticate()

    if (!mountedRef.current) return

    if (!success) {
      setError("Authentication failed. Please try again.")
    }

    setIsAuthenticating(false)
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center text-center max-w-xs">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <Lock className="h-10 w-10 text-muted-foreground" />
        </div>

        <h1 className="text-2xl font-semibold text-foreground">
          Park is Locked
        </h1>
        
        <p className="text-muted-foreground mt-2 leading-relaxed">
          Use Face ID or Touch ID to unlock and access your parking information.
        </p>

        {error && (
          <p className="text-sm text-destructive mt-4">
            {error}
          </p>
        )}

        <Button
          onClick={handleUnlock}
          disabled={isAuthenticating}
          className="w-full h-14 rounded-2xl mt-8 text-base"
        >
          {isAuthenticating ? (
            <span className="flex items-center gap-2">
              <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Authenticating...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ScanFace className="h-5 w-5" />
              Unlock with Face ID
            </span>
          )}
        </Button>

        <button
          onClick={handleUnlock}
          className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Fingerprint className="h-4 w-4" />
          Use Touch ID instead
        </button>
      </div>

      <p className="absolute bottom-8 text-xs text-muted-foreground/60">
        Your data is protected by biometric authentication
      </p>
    </div>
  )
}
