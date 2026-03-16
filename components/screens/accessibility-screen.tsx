"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronDown, Check, Eye, Type, Zap, Volume2, Languages, Accessibility } from "lucide-react"
import {
  getAccessibilitySettings,
  updateAccessibilitySettings,
  applyAccessibilityStyles,
  SUPPORTED_LANGUAGES,
  type AccessibilitySettings,
} from "@/lib/accessibility"
import { showToast } from "@/components/ui/toast-notification"

interface AccessibilityScreenProps {
  onBack: () => void
}

export function AccessibilityScreen({ onBack }: AccessibilityScreenProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(getAccessibilitySettings())
  const [showLanguages, setShowLanguages] = useState(false)

  useEffect(() => {
    // Apply settings on mount
    applyAccessibilityStyles(settings)
  }, [])

  const handleToggle = (key: keyof AccessibilitySettings) => {
    if (key === "language") return
    
    const newValue = !settings[key]
    const updated = updateAccessibilitySettings({ [key]: newValue })
    setSettings(updated)
    
    const labels: Record<string, string> = {
      highContrast: "High contrast",
      largeText: "Large text",
      reducedMotion: "Reduced motion",
      screenReaderMode: "Screen reader mode",
      dyslexiaFont: "Dyslexia-friendly font",
    }
    
    showToast(
      "success",
      `${labels[key]} ${newValue ? "enabled" : "disabled"}`,
      newValue ? "Settings applied" : "Settings reverted"
    )
  }

  const handleLanguageChange = (code: string) => {
    const updated = updateAccessibilitySettings({ language: code })
    setSettings(updated)
    setShowLanguages(false)
    
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code)
    showToast("success", "Language changed", `Now using ${lang?.name || code}`)
  }

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === settings.language)

  return (
    <div 
      className="flex flex-col min-h-[calc(100vh-5rem)] px-6 py-8 pb-20"
      role="main"
      aria-label="Accessibility settings"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full"
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Accessibility</h1>
      </div>

      {/* Vision section */}
      <section aria-labelledby="vision-heading" className="mb-8">
        <h2 id="vision-heading" className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 px-1">
          Vision
        </h2>
        <div className="bg-card rounded-2xl overflow-hidden border border-border">
          {/* High Contrast */}
          <button
            onClick={() => handleToggle("highContrast")}
            className="w-full flex items-center gap-4 py-4 px-4 hover:bg-muted/50 transition-colors text-left"
            role="switch"
            aria-checked={settings.highContrast}
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Eye className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <span className="text-base text-foreground">High Contrast</span>
              <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
            </div>
            <div
              className={`w-12 h-7 rounded-full transition-colors ${
                settings.highContrast ? "bg-foreground" : "bg-muted"
              }`}
              aria-hidden="true"
            >
              <div
                className={`w-5 h-5 rounded-full bg-background mt-1 transition-transform ${
                  settings.highContrast ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
          </button>

          <div className="h-px bg-border mx-4" role="separator" />

          {/* Large Text */}
          <button
            onClick={() => handleToggle("largeText")}
            className="w-full flex items-center gap-4 py-4 px-4 hover:bg-muted/50 transition-colors text-left"
            role="switch"
            aria-checked={settings.largeText}
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Type className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <span className="text-base text-foreground">Large Text</span>
              <p className="text-sm text-muted-foreground">Increase text size throughout the app</p>
            </div>
            <div
              className={`w-12 h-7 rounded-full transition-colors ${
                settings.largeText ? "bg-foreground" : "bg-muted"
              }`}
              aria-hidden="true"
            >
              <div
                className={`w-5 h-5 rounded-full bg-background mt-1 transition-transform ${
                  settings.largeText ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
          </button>

          <div className="h-px bg-border mx-4" role="separator" />

          {/* Dyslexia Font */}
          <button
            onClick={() => handleToggle("dyslexiaFont")}
            className="w-full flex items-center gap-4 py-4 px-4 hover:bg-muted/50 transition-colors text-left"
            role="switch"
            aria-checked={settings.dyslexiaFont}
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Accessibility className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <span className="text-base text-foreground">Dyslexia-Friendly Font</span>
              <p className="text-sm text-muted-foreground">Use a font designed for easier reading</p>
            </div>
            <div
              className={`w-12 h-7 rounded-full transition-colors ${
                settings.dyslexiaFont ? "bg-foreground" : "bg-muted"
              }`}
              aria-hidden="true"
            >
              <div
                className={`w-5 h-5 rounded-full bg-background mt-1 transition-transform ${
                  settings.dyslexiaFont ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
          </button>
        </div>
      </section>

      {/* Motion section */}
      <section aria-labelledby="motion-heading" className="mb-8">
        <h2 id="motion-heading" className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 px-1">
          Motion
        </h2>
        <div className="bg-card rounded-2xl overflow-hidden border border-border">
          <button
            onClick={() => handleToggle("reducedMotion")}
            className="w-full flex items-center gap-4 py-4 px-4 hover:bg-muted/50 transition-colors text-left"
            role="switch"
            aria-checked={settings.reducedMotion}
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Zap className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <span className="text-base text-foreground">Reduce Motion</span>
              <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
            </div>
            <div
              className={`w-12 h-7 rounded-full transition-colors ${
                settings.reducedMotion ? "bg-foreground" : "bg-muted"
              }`}
              aria-hidden="true"
            >
              <div
                className={`w-5 h-5 rounded-full bg-background mt-1 transition-transform ${
                  settings.reducedMotion ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
          </button>
        </div>
      </section>

      {/* Screen Reader section */}
      <section aria-labelledby="screenreader-heading" className="mb-8">
        <h2 id="screenreader-heading" className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 px-1">
          Screen Reader
        </h2>
        <div className="bg-card rounded-2xl overflow-hidden border border-border">
          <button
            onClick={() => handleToggle("screenReaderMode")}
            className="w-full flex items-center gap-4 py-4 px-4 hover:bg-muted/50 transition-colors text-left"
            role="switch"
            aria-checked={settings.screenReaderMode}
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Volume2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <span className="text-base text-foreground">Screen Reader Mode</span>
              <p className="text-sm text-muted-foreground">Enhanced focus indicators and announcements</p>
            </div>
            <div
              className={`w-12 h-7 rounded-full transition-colors ${
                settings.screenReaderMode ? "bg-foreground" : "bg-muted"
              }`}
              aria-hidden="true"
            >
              <div
                className={`w-5 h-5 rounded-full bg-background mt-1 transition-transform ${
                  settings.screenReaderMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
          </button>
        </div>
      </section>

      {/* Language section */}
      <section aria-labelledby="language-heading" className="mb-8">
        <h2 id="language-heading" className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 px-1">
          Language
        </h2>
        <div className="bg-card rounded-2xl overflow-hidden border border-border">
          <button
            onClick={() => setShowLanguages(!showLanguages)}
            className="w-full flex items-center gap-4 py-4 px-4 hover:bg-muted/50 transition-colors text-left"
            aria-expanded={showLanguages}
            aria-controls="language-list"
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Languages className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <span className="text-base text-foreground">App Language</span>
              <p className="text-sm text-muted-foreground">{currentLang?.nativeName || "English"}</p>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-muted-foreground transition-transform ${
                showLanguages ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          {showLanguages && (
            <div id="language-list" className="border-t border-border" role="listbox" aria-label="Select language">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className="w-full flex items-center gap-4 py-3 px-4 hover:bg-muted/50 transition-colors text-left"
                  role="option"
                  aria-selected={settings.language === lang.code}
                >
                  <div className="w-10" />
                  <div className="flex-1">
                    <span className="text-base text-foreground">{lang.nativeName}</span>
                    <span className="text-sm text-muted-foreground ml-2">({lang.name})</span>
                  </div>
                  {settings.language === lang.code && (
                    <Check className="h-5 w-5 text-foreground" aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Info note */}
      <p className="text-sm text-muted-foreground text-center px-4">
        These settings are saved automatically and will persist across sessions.
      </p>
    </div>
  )
}
