import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Partners",
  description:
    "Partner with Park to improve parking compliance in your city. Analytics dashboards, API access, and official data integrations for municipalities and enterprises.",
  openGraph: {
    title: "Park for Partners — City & Enterprise Solutions",
    description:
      "Help your citizens or customers avoid parking tickets while gaining valuable insights into parking behavior.",
    type: "website",
  },
}

export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
