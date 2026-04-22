"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Camera, Clock, Shield, User } from "lucide-react"

const tabs = [
  { id: "home", label: "Home", href: "/", icon: Home },
  { id: "scan", label: "Scan", href: "/scan", icon: Camera },
  { id: "history", label: "History", href: "/history", icon: Clock },
  { id: "pro", label: "Pro", href: "/pro", icon: Shield },
  { id: "account", label: "Account", href: "/account", icon: User },
] as const

const ACCENT = "#34C759"
const INACTIVE = "rgba(255,255,255,0.4)"

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed md:absolute bottom-3.5 left-3.5 right-3.5 z-50 max-w-md mx-auto sheet-enter">
      <div
        className="grid grid-cols-5 items-center h-[62px] rounded-full"
        style={{
          background: "rgba(0,0,0,0.82)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.id === "home" && pathname === "/status")
          const Icon = tab.icon
          const isScan = tab.id === "scan"

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 transition-colors"
              style={{ color: isActive ? ACCENT : INACTIVE }}
            >
              {isScan ? (
                <span
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 36,
                    height: 36,
                    background: isActive ? ACCENT : "transparent",
                    transition: "background 0.2s, transform 0.25s cubic-bezier(.2,.7,.3,1)",
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  <Icon
                    className="w-[22px] h-[22px]"
                    strokeWidth={1.75}
                    style={{ color: isActive ? "#000" : INACTIVE }}
                  />
                </span>
              ) : (
                <Icon
                  className="w-[22px] h-[22px]"
                  strokeWidth={1.75}
                  style={{
                    transition: "transform 0.25s cubic-bezier(.2,.7,.3,1)",
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                  }}
                />
              )}
              <span className="text-[10px] font-semibold">{tab.label}</span>
              {isActive && (
                <div className="bg-accent rounded-full w-1 h-1 mt-0.5" style={{ background: ACCENT }} />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
