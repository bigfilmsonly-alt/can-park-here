"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signUp, signIn, resetPassword, type User } from "@/lib/auth"
import { Loader2, Mail, Lock, User as UserIcon, ArrowLeft, Eye, EyeOff } from "lucide-react"

interface AuthScreenProps {
  onSuccess: (user: User) => void
  onSkip: () => void
}

type AuthMode = "welcome" | "signin" | "signup" | "forgot"

export function AuthScreen({ onSuccess, onSkip }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("welcome")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signIn(email, password)
    setLoading(false)

    if (result.success && result.user) {
      onSuccess(result.user)
    } else {
      setError(result.error || "Sign in failed")
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signUp(email, password, name)
    setLoading(false)

    if (result.success && result.user) {
      onSuccess(result.user)
    } else {
      setError(result.error || "Sign up failed")
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await resetPassword(email)
    setLoading(false)

    if (result.success) {
      setSuccess("If an account exists with this email, you'll receive a reset link.")
    } else {
      setError(result.error || "Failed to send reset email")
    }
  }

  // Welcome screen
  if (mode === "welcome") {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex justify-end p-6">
          <button
            onClick={onSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <h1 className="text-4xl font-semibold text-foreground text-center mb-2">
            Park
          </h1>
          <p className="text-lg text-muted-foreground text-center mb-12">
            Can I park here?
          </p>

          <p className="text-sm text-muted-foreground text-center max-w-xs mb-8">
            Create an account to sync your data, unlock ticket protection, and track your savings.
          </p>
        </div>

        <div className="px-6 pb-10 space-y-3">
          <Button
            onClick={() => setMode("signup")}
            className="w-full h-14 text-base font-medium rounded-2xl"
          >
            Create Account
          </Button>
          <Button
            onClick={() => setMode("signin")}
            variant="outline"
            className="w-full h-14 text-base font-medium rounded-2xl bg-transparent"
          >
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  // Forgot password screen
  if (mode === "forgot") {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center p-6">
          <button
            onClick={() => {
              setMode("signin")
              setError(null)
              setSuccess(null)
            }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="flex-1 flex flex-col px-8 pt-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Reset Password
          </h1>
          <p className="text-muted-foreground mb-8">
            Enter your email and we'll send you a reset link.
          </p>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 pl-12 text-base rounded-2xl"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {success && (
              <p className="text-sm text-status-success-foreground">{success}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-base font-medium rounded-2xl"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // Sign in / Sign up form
  const isSignUp = mode === "signup"

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center p-6">
        <button
          onClick={() => {
            setMode("welcome")
            setError(null)
          }}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="flex-1 flex flex-col px-8 pt-8 overflow-y-auto">
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {isSignUp
            ? "Sign up to unlock all features"
            : "Sign in to your account"}
        </p>

        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
          {isSignUp && (
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 pl-12 text-base rounded-2xl"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 pl-12 text-base rounded-2xl"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 pl-12 pr-12 text-base rounded-2xl"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {!isSignUp && (
            <button
              type="button"
              onClick={() => {
                setMode("forgot")
                setError(null)
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot password?
            </button>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 text-base font-medium rounded-2xl"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={() => {
              setMode(isSignUp ? "signin" : "signup")
              setError(null)
            }}
            className="text-foreground font-medium hover:underline"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>

        {isSignUp && (
          <p className="text-center text-xs text-muted-foreground mt-4 pb-8">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        )}
      </div>
    </div>
  )
}
