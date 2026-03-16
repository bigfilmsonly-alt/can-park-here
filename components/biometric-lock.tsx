"use client"

import { Button } from "@/components/ui/button"
import { Fingerprint, ScanFace, Loader2 } from "lucide-react"

interface BiometricLockProps {
  onAuthenticate: () => Promise<boolean>
  isLoading: boolean
  error: string | null
}

export function BiometricLock({
  onAuthenticate,
  isLoading,
  error,
}: BiometricLockProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-xs">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-muted flex items-center justify-center">
          <ScanFace className="h-10 w-10 text-foreground" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-foreground">
          Park
        </h1>
        <p className="text-base text-muted-foreground mt-2">
          Unlock to continue
        </p>

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive mt-4">
            {error}
          </p>
        )}

        {/* Unlock button */}
        <Button
          onClick={onAuthenticate}
          disabled={isLoading}
          className="w-full h-14 mt-8 rounded-2xl text-base font-medium"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Fingerprint className="h-5 w-5 mr-2" />
              Unlock with Biometrics
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground mt-6">
          Face ID, Touch ID, or fingerprint
        </p>
      </div>
    </div>
  )
}
