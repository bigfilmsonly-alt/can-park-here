"use client"

type Tab = "home" | "community" | "history" | "settings"

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "community", label: "Community" },
    { id: "history", label: "History" },
    { id: "settings", label: "Settings" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around max-w-md mx-auto h-16 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center px-4 py-2 transition-colors ${
              activeTab === tab.id ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <span className="text-sm font-medium tracking-tight">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
