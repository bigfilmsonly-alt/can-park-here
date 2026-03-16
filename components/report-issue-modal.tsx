"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  X, 
  MapPin, 
  Camera,
  ChevronRight,
  AlertCircle,
  Clock,
  Ban,
  HelpCircle,
  CheckCircle
} from "lucide-react"
import { reportCorrection, type DataCorrection } from "@/lib/community"

interface ReportIssueModalProps {
  isOpen: boolean
  onClose: () => void
  currentLocation?: { lat: number; lng: number }
  currentAddress?: string
  showToast: (type: "success" | "error" | "info", title: string, message: string) => void
}

export function ReportIssueModal({
  isOpen,
  onClose,
  currentLocation,
  currentAddress,
  showToast,
}: ReportIssueModalProps) {
  const [step, setStep] = useState<"type" | "details" | "success">("type")
  const [issueType, setIssueType] = useState<DataCorrection["type"] | null>(null)
  const [description, setDescription] = useState("")
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const issueTypes = [
    { 
      type: "wrong_hours" as const, 
      label: "Wrong Hours", 
      description: "Posted hours don't match app",
      icon: Clock 
    },
    { 
      type: "wrong_restrictions" as const, 
      label: "Wrong Restrictions", 
      description: "Parking rules are incorrect",
      icon: Ban 
    },
    { 
      type: "sign_missing" as const, 
      label: "Sign Missing", 
      description: "Sign is gone or removed",
      icon: AlertCircle 
    },
    { 
      type: "sign_changed" as const, 
      label: "Sign Changed", 
      description: "New sign with different rules",
      icon: AlertCircle 
    },
    { 
      type: "other" as const, 
      label: "Other Issue", 
      description: "Something else is wrong",
      icon: HelpCircle 
    },
  ]

  const handleSelectType = (type: DataCorrection["type"]) => {
    setIssueType(type)
    setStep("details")
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    if (!issueType || !currentLocation || !currentAddress) {
      showToast("error", "Missing info", "Please provide all required information")
      return
    }

    reportCorrection(
      issueType,
      currentLocation,
      currentAddress,
      description || `${issueTypes.find(t => t.type === issueType)?.label} reported`,
      photoUrl || undefined
    )

    setStep("success")
  }

  const handleClose = () => {
    setStep("type")
    setIssueType(null)
    setDescription("")
    setPhotoUrl(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full bg-card rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom max-h-[85vh] overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            {step === "type" && "Report an Issue"}
            {step === "details" && "Describe the Issue"}
            {step === "success" && "Thank You"}
          </h2>
          <button onClick={handleClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Select Issue Type */}
        {step === "type" && (
          <>
            {currentLocation ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <MapPin className="w-4 h-4" />
                <span>{currentAddress || "Current location"}</span>
              </div>
            ) : (
              <p className="text-sm text-status-error-foreground mb-6">
                Please enable location to report issues
              </p>
            )}

            <div className="space-y-3">
              {issueTypes.map(({ type, label, description, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => handleSelectType(type)}
                  disabled={!currentLocation}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-secondary hover:bg-accent transition-colors disabled:opacity-50 text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2: Details */}
        {step === "details" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{currentAddress}</span>
            </div>

            <div className="p-4 rounded-2xl bg-secondary">
              <p className="text-sm font-medium">
                {issueTypes.find(t => t.type === issueType)?.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {issueTypes.find(t => t.type === issueType)?.description}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                What's wrong? (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-secondary border-0 text-sm focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Add a photo (optional)
              </label>
              
              {photoUrl ? (
                <div className="relative">
                  <img 
                    src={photoUrl} 
                    alt="Evidence" 
                    className="w-full rounded-xl"
                  />
                  <button
                    onClick={() => setPhotoUrl(null)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-muted-foreground transition-colors"
                >
                  <Camera className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Take or upload photo
                  </span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setStep("type")}
                variant="outline"
                className="flex-1 h-14 text-base font-medium rounded-2xl bg-transparent"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 h-14 text-base font-medium rounded-2xl"
              >
                Submit Report
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-status-success/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-status-success-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Report Submitted</h3>
            <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
              We'll review your report and update our data. Thanks for helping make parking better for everyone.
            </p>
            <Button
              onClick={handleClose}
              className="w-full h-14 text-base font-medium rounded-2xl"
            >
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
