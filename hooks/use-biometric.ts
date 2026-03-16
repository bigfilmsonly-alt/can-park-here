"use client"

import { useState, useEffect, useCallback } from "react"

interface BiometricState {
  isSupported: boolean
  isEnabled: boolean
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const BIOMETRIC_ENABLED_KEY = "park_biometric_enabled"
const BIOMETRIC_AUTH_KEY = "park_biometric_authenticated"
const AUTH_EXPIRY = 30 * 60 * 1000 // 30 minutes

export function useBiometric() {
  const [state, setState] = useState<BiometricState>({
    isSupported: false,
    isEnabled: false,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    // Check if WebAuthn is supported
    const supported =
      typeof window !== "undefined" &&
      window.PublicKeyCredential !== undefined &&
      typeof window.PublicKeyCredential === "function"

    // Check if enabled by user
    const enabled = localStorage.getItem(BIOMETRIC_ENABLED_KEY) === "true"

    // Check if recently authenticated
    const lastAuth = localStorage.getItem(BIOMETRIC_AUTH_KEY)
    const authenticated = lastAuth
      ? Date.now() - parseInt(lastAuth, 10) < AUTH_EXPIRY
      : false

    setState({
      isSupported: supported,
      isEnabled: enabled,
      isAuthenticated: authenticated || !enabled, // If not enabled, consider authenticated
      isLoading: false,
      error: null,
    })
  }, [])

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState((prev) => ({ ...prev, error: "Biometric auth not supported" }))
      return false
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // Use WebAuthn for biometric authentication
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      // Check for platform authenticator (Face ID, Touch ID, fingerprint)
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()

      if (!available) {
        // Fall back to simple confirmation for demo
        const confirmed = window.confirm(
          "Biometric authentication would appear here. Simulate success?"
        )

        if (confirmed) {
          localStorage.setItem(BIOMETRIC_AUTH_KEY, Date.now().toString())
          setState((prev) => ({
            ...prev,
            isAuthenticated: true,
            isLoading: false,
          }))
          return true
        } else {
          setState((prev) => ({
            ...prev,
            isAuthenticated: false,
            isLoading: false,
            error: "Authentication cancelled",
          }))
          return false
        }
      }

      // Real WebAuthn flow for devices that support it
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: "Park",
            id: window.location.hostname,
          },
          user: {
            id: new Uint8Array(16),
            name: "user@park.app",
            displayName: "Park User",
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },
            { alg: -257, type: "public-key" },
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      })

      if (credential) {
        localStorage.setItem(BIOMETRIC_AUTH_KEY, Date.now().toString())
        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          isLoading: false,
        }))
        return true
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Authentication failed",
      }))
      return false
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Authentication failed"
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }))
      return false
    }
  }, [state.isSupported])

  const enableBiometric = useCallback(async () => {
    const success = await authenticate()
    if (success) {
      localStorage.setItem(BIOMETRIC_ENABLED_KEY, "true")
      setState((prev) => ({ ...prev, isEnabled: true }))
    }
    return success
  }, [authenticate])

  const disableBiometric = useCallback(() => {
    localStorage.removeItem(BIOMETRIC_ENABLED_KEY)
    localStorage.removeItem(BIOMETRIC_AUTH_KEY)
    setState((prev) => ({
      ...prev,
      isEnabled: false,
      isAuthenticated: true, // When disabled, always authenticated
    }))
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(BIOMETRIC_AUTH_KEY)
    setState((prev) => ({ ...prev, isAuthenticated: false }))
  }, [])

  return {
    ...state,
    authenticate,
    enableBiometric,
    disableBiometric,
    logout,
  }
}
