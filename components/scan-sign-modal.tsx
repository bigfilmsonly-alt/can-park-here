"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { X, Camera, Upload, Check, AlertTriangle, Clock, RefreshCw, ShieldCheck, Loader2 } from "lucide-react"
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

  useEffect(() => { cameraStreamRef.current = cameraStream }, [cameraStream])

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
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      fileInputRef.current?.click()
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      setCameraStream(stream)
      setState("camera")
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
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
      if (!res.ok || !data.ok) throw new Error(data.error || "Scan failed")
      setScanResult(data.data.sign as ParsedSign)
    } catch {
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
      const canvas = canvasRef.current
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
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
        const url = event.target?.result as string
        setCapturedImage(url)
        await scanImage(url)
      }
      reader.readAsDataURL(file)
    }
  }, [scanImage])

  const handleClose = () => { stopCamera(); setState("idle"); setCapturedImage(null); setScanResult(null); onClose() }
  const handleRetry = () => { setCapturedImage(null); setScanResult(null); setState("idle") }
  const handleConfirm = () => {
    if (scanResult) {
      const interp = interpretSignForUser(scanResult)
      onResult(interp.canPark, interp.timeLimit)
    }
    handleClose()
  }

  if (!isOpen) return null

  const interpretation = scanResult ? interpretSignForUser(scanResult) : null
  const lowConfidence = scanResult ? scanResult.confidence < 70 : false

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#0b0f17" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-3">
        <button onClick={handleClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#1a1f2b" }}>
          <X className="w-5 h-5" style={{ color: "#f8fafc" }} />
        </button>
        <span className="text-sm font-semibold" style={{ color: "#94a3b8" }}>
          {state === "result" ? "Result" : state === "scanning" ? "Analyzing..." : "Scan Sign"}
        </span>
        <div className="w-10" />
      </div>

      {/* ── IDLE ── */}
      {state === "idle" && (
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-24 h-24 rounded-[28px] flex items-center justify-center mb-6" style={{ background: "#1a1f2b", border: "1px solid #2d3447" }}>
            <Camera className="w-12 h-12" style={{ color: "#64748b" }} />
          </div>
          <h2 className="text-2xl font-bold text-center" style={{ color: "#f8fafc" }}>Point at any parking sign</h2>
          <p className="text-sm text-center mt-2" style={{ color: "#94a3b8", maxWidth: 280 }}>
            Our AI reads the sign and tells you exactly what it means
          </p>
          <div className="w-full mt-10 space-y-3 max-w-xs">
            <button onClick={startCamera} className="w-full py-4 rounded-full font-bold text-base press-effect" style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", color: "#fff" }}>
              Open Camera
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 rounded-full font-semibold text-sm" style={{ color: "#94a3b8" }}>
              <Upload className="w-4 h-4 inline mr-2" />Upload photo
            </button>
          </div>
        </div>
      )}

      {/* ── CAMERA ── */}
      {state === "camera" && (
        <div className="flex-1 flex flex-col relative">
          <div className="flex-1 relative overflow-hidden">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            {/* Scanning frame */}
            <div className="absolute inset-[15%] border-2 border-dashed border-white/50 rounded-2xl pointer-events-none" />
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <div className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", color: "#f8fafc" }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#f59e0b" }} />
                Hold steady on the sign
              </div>
            </div>
          </div>
          {/* Shutter */}
          <div className="flex justify-center py-8" style={{ background: "#0b0f17" }}>
            <button onClick={capturePhoto} className="w-20 h-20 rounded-full flex items-center justify-center press-effect" style={{ background: "#fff", border: "4px solid rgba(255,255,255,0.4)" }}>
              <div className="w-16 h-16 rounded-full" style={{ background: "#fff", border: "2px solid rgba(0,0,0,0.06)" }} />
            </button>
          </div>
        </div>
      )}

      {/* ── SCANNING (animated) ── */}
      {state === "scanning" && (
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          {capturedImage && (
            <div className="w-48 h-48 rounded-[28px] overflow-hidden mb-8 relative" style={{ border: "1px solid #2d3447" }}>
              <img src={capturedImage} alt="Sign" className="w-full h-full object-cover opacity-40" />
              {/* Scan line */}
              <div className="absolute left-0 right-0 h-0.5" style={{ background: "#3b82f6", boxShadow: "0 0 20px #3b82f6", animation: "scanLine 1.4s ease-in-out infinite" }} />
            </div>
          )}
          <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: "#3b82f6" }} />
          <h2 className="text-lg font-bold" style={{ color: "#f8fafc" }}>Analyzing sign...</h2>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Reading text and interpreting rules</p>
        </div>
      )}

      {/* ── RESULT (slide up) ── */}
      {state === "result" && interpretation && (
        <div className="flex-1 flex flex-col animate-slide-in-up">
          {/* Image */}
          {capturedImage && (
            <div className="h-48 overflow-hidden relative">
              <img src={capturedImage} alt="Sign" className="w-full h-full object-cover opacity-30" />
            </div>
          )}

          {/* Result card */}
          <div className="flex-1 px-5 -mt-8 relative z-10">
            {/* Success card (green) or warning card (yellow) */}
            <div
              className="p-5 rounded-[22px]"
              style={{
                background: lowConfidence
                  ? "rgba(245,158,11,0.12)"
                  : interpretation.canPark
                    ? "rgba(16,185,129,0.12)"
                    : "rgba(239,68,68,0.12)",
                border: `1px solid ${lowConfidence ? "rgba(245,158,11,0.25)" : interpretation.canPark ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: lowConfidence ? "rgba(245,158,11,0.2)" : interpretation.canPark ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)",
                  }}
                >
                  {lowConfidence ? (
                    <AlertTriangle className="w-6 h-6" style={{ color: "#f59e0b" }} />
                  ) : interpretation.canPark ? (
                    <Check className="w-6 h-6" style={{ color: "#10b981" }} />
                  ) : (
                    <X className="w-6 h-6" style={{ color: "#ef4444" }} />
                  )}
                </div>
                <div>
                  <p className="text-base font-bold" style={{
                    color: lowConfidence ? "#f59e0b" : interpretation.canPark ? "#10b981" : "#ef4444",
                  }}>
                    {lowConfidence ? "Low confidence" : interpretation.headline}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                    {scanResult?.confidence || 0}% confidence
                  </p>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="mt-4 p-4 rounded-2xl" style={{ background: "#1a1f2b", border: "1px solid #2d3447" }}>
              <p className="text-sm" style={{ color: "#cbd5e1", lineHeight: 1.5 }}>
                {interpretation.explanation}
              </p>
              {interpretation.timeLimit && (
                <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: "#94a3b8" }}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{Math.round(interpretation.timeLimit / 60)} hour limit</span>
                </div>
              )}
            </div>

            {/* Low confidence warning */}
            {lowConfidence && (
              <div className="mt-3 p-3.5 rounded-2xl flex items-start gap-3" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}>
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#f59e0b" }} />
                <p className="text-xs" style={{ color: "#fbbf24", lineHeight: 1.5 }}>
                  We couldn't read this sign clearly. Double-check the rules before parking, or try scanning again from a different angle.
                </p>
              </div>
            )}

            {/* Warnings */}
            {interpretation.warnings.length > 0 && (
              <div className="mt-3 space-y-2">
                {interpretation.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs" style={{ color: "#f59e0b" }}>
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom actions */}
          <div className="px-5 pt-4 pb-10" style={{ borderTop: "1px solid #2d3447" }}>
            <button onClick={handleConfirm} className="w-full py-4 rounded-full font-bold text-base press-effect" style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", color: "#fff" }}>
              {interpretation.canPark ? "Park Here" : "Got It"}
            </button>
            <button onClick={handleRetry} className="w-full py-3 mt-2 flex items-center justify-center gap-2 text-sm font-semibold" style={{ color: "#94a3b8" }}>
              <RefreshCw className="w-4 h-4" /> Scan Another Sign
            </button>
          </div>
        </div>
      )}

      {/* Hidden */}
      <canvas ref={canvasRef} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
      <style>{`@keyframes scanLine { 0% { top: 10%; } 100% { top: 90%; } }`}</style>
    </div>
  )
}
