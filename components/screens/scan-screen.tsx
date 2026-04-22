"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { X, Zap, ZapOff, Image as ImageIcon } from "lucide-react"

interface ScanScreenProps {
  onCapture: (imageBase64: string) => void
  onClose: () => void
}

export function ScanScreen({ onCapture, onClose }: ScanScreenProps) {
  const [flashOn, setFlashOn] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      setCameraError("Camera is not available on this device.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraError(null)
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access in your browser settings."
          : "Unable to access camera. Please try uploading a photo instead."
      setCameraError(message)
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [startCamera, stopCamera])

  const toggleFlash = useCallback(async () => {
    if (!streamRef.current) return
    const track = streamRef.current.getVideoTracks()[0]
    if (!track) return

    try {
      const capabilities = track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean }
      if (capabilities?.torch) {
        const newFlash = !flashOn
        await track.applyConstraints({
          advanced: [{ torch: newFlash } as MediaTrackConstraintSet],
        })
        setFlashOn(newFlash)
      }
    } catch {
      // Flash not supported on this device
    }
  }, [flashOn])

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(video, 0, 0)
    const base64 = canvas.toDataURL("image/jpeg", 0.85)

    stopCamera()
    onCapture(base64)
  }, [stopCamera, onCapture])

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        if (base64) {
          stopCamera()
          onCapture(base64)
        }
      }
      reader.readAsDataURL(file)
    },
    [stopCamera, onCapture]
  )

  const handleClose = useCallback(() => {
    stopCamera()
    onClose()
  }, [stopCamera, onClose])

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Camera feed */}
      <div className="relative flex-1 overflow-hidden">
        {cameraError ? (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.07)] flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-[var(--muted-foreground)]" />
            </div>
            <p className="text-[var(--fg2)] text-body mb-6">{cameraError}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 rounded-2xl text-white font-semibold press-effect"
              style={{ background: "var(--accent)" }}
            >
              Upload Photo
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Corner brackets overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative" style={{ width: "72%", aspectRatio: "4/3" }}>
                {/* Top-left */}
                <div
                  className="absolute top-0 left-0 w-8 h-8"
                  style={{
                    borderLeft: "3px solid var(--accent)",
                    borderTop: "3px solid var(--accent)",
                    borderRadius: "4px 0 0 0",
                  }}
                />
                {/* Top-right */}
                <div
                  className="absolute top-0 right-0 w-8 h-8"
                  style={{
                    borderRight: "3px solid var(--accent)",
                    borderTop: "3px solid var(--accent)",
                    borderRadius: "0 4px 0 0",
                  }}
                />
                {/* Bottom-left */}
                <div
                  className="absolute bottom-0 left-0 w-8 h-8"
                  style={{
                    borderLeft: "3px solid var(--accent)",
                    borderBottom: "3px solid var(--accent)",
                    borderRadius: "0 0 0 4px",
                  }}
                />
                {/* Bottom-right */}
                <div
                  className="absolute bottom-0 right-0 w-8 h-8"
                  style={{
                    borderRight: "3px solid var(--accent)",
                    borderBottom: "3px solid var(--accent)",
                    borderRadius: "0 0 4px 0",
                  }}
                />

                {/* Scan line */}
                <div
                  className="absolute left-0 right-0 h-[2px] animate-scan-line"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, var(--accent) 20%, var(--accent) 80%, transparent 100%)",
                    boxShadow: "0 0 12px rgba(52,199,89,0.5)",
                  }}
                />
              </div>
            </div>
          </>
        )}

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full flex items-center justify-center press-effect"
          style={{
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(12px)",
            paddingTop: "env(safe-area-inset-top)",
          }}
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Bottom bar */}
      <div
        className="flex items-center justify-between px-8 py-6"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 20px) + 16px)" }}
      >
        {/* Flash toggle */}
        <button
          onClick={toggleFlash}
          className="w-12 h-12 rounded-full flex items-center justify-center press-effect"
          style={{ background: "rgba(255,255,255,0.1)" }}
          aria-label={flashOn ? "Turn flash off" : "Turn flash on"}
        >
          {flashOn ? (
            <Zap className="w-5 h-5 text-[var(--accent)]" />
          ) : (
            <ZapOff className="w-5 h-5 text-white" />
          )}
        </button>

        {/* Shutter button */}
        <button
          onClick={handleCapture}
          disabled={!!cameraError}
          className="press-effect"
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#ffffff",
            border: "4px solid rgba(255,255,255,0.3)",
            boxShadow: "0 0 0 2px rgba(0,0,0,0.2)",
            opacity: cameraError ? 0.3 : 1,
          }}
          aria-label="Capture photo"
        />

        {/* Gallery/upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-12 h-12 rounded-full flex items-center justify-center press-effect"
          style={{ background: "rgba(255,255,255,0.1)" }}
          aria-label="Upload from gallery"
        >
          <ImageIcon className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Hidden elements */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}
