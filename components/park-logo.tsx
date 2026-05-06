"use client"

interface ParkLogoProps {
  size?: number
  className?: string
}

export function ParkLogo({ size = 40, className }: ParkLogoProps) {
  const r = size * 0.24
  const iconSize = size * 0.56

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius: r,
          background: "linear-gradient(145deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)",
        }}
      />
      {/* Top sheen — Ive-style glass reflection */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: r,
          background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 40%)",
        }}
      />
      {/* Shield + P glyph */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        className="relative z-10"
      >
        <path
          d="M50 10 L84 22 V52 C84 74 68 88 50 94 C32 88 16 74 16 52 V22 Z"
          fill="white"
          fillOpacity=".14"
          stroke="white"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <path
          d="M42 72 V36 h14 a11 11 0 010 22 H42"
          stroke="white"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  )
}

export function Wordmark({
  size = 28,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <span
      className={className}
      style={{
        fontSize: size,
        fontWeight: 600,
        letterSpacing: -size * 0.04,
        lineHeight: 1,
      }}
    >
      park
      <span style={{ color: "var(--park-accent)" }}>.</span>
    </span>
  )
}
