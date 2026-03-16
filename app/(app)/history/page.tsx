"use client"

import { HistoryScreen } from "@/components/screens/history-screen"
import { useAppContext } from "@/lib/app-context"

export default function HistoryPage() {
  const ctx = useAppContext()

  return (
    <HistoryScreen
      history={ctx.history}
      onItemClick={ctx.handleHistoryItemClick}
      onCheckParking={ctx.handleCheckParking}
    />
  )
}
