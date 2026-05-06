"use client"

import { useCity } from "@/lib/city-context"

type Region = "sf" | "miami"

const PILLS: { region: Region; label: string }[] = [
  { region: "sf", label: "SF Bay Area" },
  { region: "miami", label: "Miami" },
]

export function CityToggle() {
  const { region, setRegion } = useCity()

  return (
    <div
      style={{
        display: "inline-flex",
        borderRadius: 999,
        background: "#f1f5f9",
        padding: 3,
        gap: 2,
      }}
    >
      {PILLS.map(({ region: r, label }) => {
        const active = region === r
        return (
          <button
            key={r}
            className="press"
            onClick={() => setRegion(r)}
            style={{
              padding: "5px 14px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: -0.2,
              transition: "background 0.15s, color 0.15s",
              background: active ? "#2563eb" : "transparent",
              color: active ? "#fff" : "#0f172a",
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
