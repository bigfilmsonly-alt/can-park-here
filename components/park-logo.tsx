"use client"

interface ParkLogoProps {
  size?: number
  className?: string
}

export function ParkLogo({ size = 40, className }: ParkLogoProps) {
  const r = size * 0.225
  const iconSize = size * 0.58

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
      {/* Background */}
      <div
        className="absolute inset-0 bg-accent"
        style={{ borderRadius: r }}
      />
      {/* Top sheen */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: r,
          background:
            "linear-gradient(180deg, rgba(255,255,255,.18) 0%, rgba(255,255,255,0) 32%)",
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
          fillOpacity=".16"
          stroke="white"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="M42 72 V36 h14 a11 11 0 010 22 H42"
          stroke="white"
          strokeWidth="7"
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
        letterSpacing: -size * 0.06,
        lineHeight: 1,
      }}
    >
      park
      <span className="text-accent">.</span>
    </span>
  )
}
