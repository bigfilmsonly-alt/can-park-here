"use client"

import { useState, useEffect, useCallback } from "react"

interface BiometricState {
  isAvailable: boolean
  isEnabled: boolean
  isLocked: boolean
  lastAuthTime: number | null
}

const AUTH_KEY = "park_biometric_enabled"
const LOCK_TIMEOUT = 5 * 60 * 1000 // 5 minutes of inactivity

export function useBiometricAuth() {
  const [state, setState] = useState<BiometricState>({
    isAvailable: false,
    isEnabled: false,
    isLocked: false,
    lastAuthTime: null,
  })

  // Check if WebAuthn/biometrics is available
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const available =
          window.PublicKeyCredential !== undefined &&
          (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())

        const enabled = localStorage.getItem(AUTH_KEY) === "true"
        
        setState((prev) => ({
          ...prev,
          isAvailable: available,
          isEnabled: enabled,
          isLocked: enabled, // Start locked if enabled
        }))
      } catch {
        setState((prev) => ({ ...prev, isAvailable: false }))
      }
    }

    checkAvailability()
  }, [])

  // Auto-lock after inactivity
  useEffect(() => {
    if (!state.isEnabled || state.isLocked) return

    const checkLock = () => {
      if (state.lastAuthTime && Date.now() - state.lastAuthTime > LOCK_TIMEOUT) {
        setState((prev) => ({ ...prev, isLocked: true }))
      }
    }

    const interval = setInterval(checkLock, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [state.isEnabled, state.isLocked, state.lastAuthTime])

  // Enable biometric authentication
  const enableBiometric = useCallback(async (): Promise<boolean> => {
    if (!state.isAvailable) return false

    try {
      // Create a credential to verify biometric works
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "Park", id: window.location.hostname },
          user: {
            id: new Uint8Array(16),
            name: "park-user",
            displayName: "Park User",
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 }, // ES256
            { type: "public-key", alg: -257 }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      })

      if (credential) {
        localStorage.setItem(AUTH_KEY, "true")
        setState((prev) => ({
          ...prev,
          isEnabled: true,
          isLocked: false,
          lastAuthTime: Date.now(),
        }))
        return true
      }
    } catch {
      // User cancelled or error occurred
    }

    return false
  }, [state.isAvailable])

  // Disable biometric authentication
  const disableBiometric = useCallback(() => {
    localStorage.removeItem(AUTH_KEY)
    setState((prev) => ({
      ...prev,
      isEnabled: false,
      isLocked: false,
    }))
  }, [])

  // Authenticate with biometrics
  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!state.isEnabled) return true // Not enabled, no auth needed

    try {
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: "required",
          rpId: window.location.hostname,
        },
      })

      if (assertion) {
        setState((prev) => ({
          ...prev,
          isLocked: false,
          lastAuthTime: Date.now(),
        }))
        return true
      }
    } catch {
      // User cancelled or error
    }

    return false
  }, [state.isEnabled])

  // Lock the app manually
  const lock = useCallback(() => {
    if (state.isEnabled) {
      setState((prev) => ({ ...prev, isLocked: true }))
    }
  }, [state.isEnabled])

  return {
    isAvailable: state.isAvailable,
    isEnabled: state.isEnabled,
    isLocked: state.isLocked,
    enableBiometric,
    disableBiometric,
    authenticate,
    lock,
  }
}
