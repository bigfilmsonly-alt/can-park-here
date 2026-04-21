"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Camera, Upload, ImageIcon, CheckCircle, AlertTriangle, XCircle, Clock, RefreshCw } from "lucide-react"
import { interpretSignForUser, type ParsedSign } from "@/lib/sign-parser"

interface ScanSignModalProps {
  isOpen: boolean
  onClose: () => void
  onResult: (canPark: boolean, timeLimit?: number) => void
}

type ScanState = "idle" | "camera" | "scanning" | "result"

export function ScanSignModal({ isOpen, onClose, onResult }: ScanSignModalProps) {
  const [state, setState] = useState<ScanState>("idle")
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ParsedSign | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)

  // Keep ref in sync for cleanup
  useEffect(() => {
    cameraStreamRef.current = cameraStream
  }, [cameraStream])

  // Cleanup camera stream on unmount or when modal closes
  useEffect(() => {
    if (!isOpen && cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop())
      cameraStreamRef.current = null
      setCameraStream(null)
    }

    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop())
        cameraStreamRef.current = null
      }
    }
  }, [isOpen])

  const startCamera = useCallback(async () => {
    // SSR guard
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      fileInputRef.current?.click()
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      setCameraStream(stream)
      setState("camera")
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch {
      // Camera not available, show upload option
      fileInputRef.current?.click()
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop())
      cameraStreamRef.current = null
      setCameraStream(null)
    }
  }, [])

  const scanImage = useCallback(async (imageDataUrl: string) => {
    setState("scanning")
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Scan failed")
      }
      setScanResult(data.data.sign as ParsedSign)
    } catch (err) {
      console.error("Scan error:", err)
      // Surface an unknown result so the user knows something went wrong
      setScanResult({
        type: "unknown",
        status: "allowed",
        message: "Could not analyze the sign. Please try again.",
        confidence: 0,
        rawText: [],
      })
    }
    setState("result")
  }, [])

  const capturePhoto = useCallback(async () => {
    let imageDataUrl = ""
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        imageDataUrl = canvas.toDataURL("image/jpeg")
        setCapturedImage(imageDataUrl)
      }
    }

    stopCamera()
    await scanImage(imageDataUrl)
  }, [stopCamera, scanImage])

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const imageDataUrl = event.target?.result as string
        setCapturedImage(imageDataUrl)
        await scanImage(imageDataUrl)
      }
      reader.readAsDataURL(file)
    }
  }, [scanImage])

  const handleClose = () => {
    stopCamera()
    setState("idle")
    setCapturedImage(null)
    setScanResult(null)
    onClose()
  }

  const handleRetry = () => {
    setCapturedImage(null)
    setScanResult(null)
    setState("idle")
  }

  const handleConfirm = () => {
    if (scanResult) {
      const interpretation = interpretSignForUser(scanResult)
      onResult(interpretation.canPark, interpretation.timeLimit)
    }
    handleClose()
  }

  if (!isOpen) return null

  const interpretation = scanResult ? interpretSignForUser(scanResult) : null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className="w-full max-w-md bg-card rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {state === "result" ? "Sign Analysis" : "Scan a street sign"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Idle state */}
        {state === "idle" && (
          <>
            <div className="aspect-4/3 rounded-2xl bg-muted flex flex-col items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-muted-foreground/10 flex items-center justify-center mb-4">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-center px-8">
                Point your camera at the parking sign
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={startCamera}
                className="w-full h-14 text-base font-medium rounded-2xl"
              >
                <span className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Open Camera
                </span>
              </Button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-4 text-base text-muted-foreground hover:text-foreground transition-colors"
              >
                <Upload className="h-5 w-5" />
                Upload from library
              </button>
            </div>
          </>
        )}

        {/* Camera state */}
        {state === "camera" && (
          <>
            <div className="aspect-4/3 rounded-2xl overflow-hidden bg-black mb-6 relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {/* Camera frame overlay */}
              <div className="absolute inset-4 border-2 border-white/50 rounded-xl pointer-events-none" />
            </div>

            <Button
              onClick={capturePhoto}
              className="w-full h-14 text-base font-medium rounded-2xl"
            >
              <span className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Capture Sign
              </span>
            </Button>
          </>
        )}

        {/* Scanning state */}
        {state === "scanning" && (
          <>
            <div className="aspect-4/3 rounded-2xl overflow-hidden bg-muted mb-6 relative">
              {capturedImage && (
                <img src={capturedImage} alt="Captured sign" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin mb-4" />
                <p className="text-sm font-medium text-foreground">Analyzing sign...</p>
                <p className="text-xs text-muted-foreground mt-1">Reading text and interpreting rules</p>
              </div>
            </div>
          </>
        )}

        {/* Result state */}
        {state === "result" && interpretation && (
          <>
            <div className="aspect-4/3 rounded-2xl overflow-hidden bg-muted mb-6 relative">
              {capturedImage && (
                <img src={capturedImage} alt="Captured sign" className="w-full h-full object-cover opacity-50" />
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  interpretation.canPark ? "bg-status-success/20" : "bg-status-error/20"
                }`}>
                  {interpretation.canPark ? (
                    <CheckCircle className="h-8 w-8 text-status-success-foreground" />
                  ) : (
                    <XCircle className="h-8 w-8 text-status-error-foreground" />
                  )}
                </div>
                <h3 className={`text-xl font-semibold text-center ${
                  interpretation.canPark ? "text-status-success-foreground" : "text-status-error-foreground"
                }`}>
                  {interpretation.headline}
                </h3>
              </div>
            </div>

            {/* Details */}
            <div className="mb-6 space-y-4">
              <div className="p-4 bg-muted rounded-xl">
                <p className="text-sm text-foreground">{interpretation.explanation}</p>
                
                {interpretation.timeLimit && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{interpretation.timeLimit / 60} hour limit</span>
                  </div>
                )}
              </div>

              {interpretation.warnings.length > 0 && (
                <div className="space-y-2">
                  {interpretation.warnings.map((warning, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-status-warning-foreground">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Confidence indicator */}
              {scanResult && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Confidence</span>
                  <span>{scanResult.confidence}%</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleConfirm}
                className="w-full h-14 text-base font-medium rounded-2xl"
              >
                {interpretation.canPark ? "Start Parking Here" : "Got It"}
              </Button>

              <button
                onClick={handleRetry}
                className="w-full flex items-center justify-center gap-2 py-4 text-base text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
                Scan Another Sign
              </button>
            </div>
          </>
        )}

        {/* Hidden elements */}
        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {state === "idle" && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Our AI reads the sign and tells you the rules
          </p>
        )}
      </div>
    </div>
  )
}
