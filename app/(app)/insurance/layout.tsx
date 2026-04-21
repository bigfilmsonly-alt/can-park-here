import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Insurance Integration",
  description:
    "Share your parking compliance data with your auto insurer for potential discounts. Good parking habits may qualify you for up to 5% off.",
  openGraph: {
    title: "Park Insurance Integration — Save on Auto Insurance",
    description:
      "Share your parking compliance data with your insurer for potential discounts.",
    type: "website",
  },
}

export default function InsuranceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
