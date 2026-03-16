"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const tabs = [
  { id: "home", label: "Home", href: "/" },
  { id: "community", label: "Community", href: "/community" },
  { id: "history", label: "History", href: "/history" },
  { id: "settings", label: "Settings", href: "/settings" },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around max-w-md mx-auto h-16 px-4">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.id === "home" && (pathname === "/" || pathname === "/status"))
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center justify-center px-4 py-2 transition-colors ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <span className="text-sm font-medium tracking-tight">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
