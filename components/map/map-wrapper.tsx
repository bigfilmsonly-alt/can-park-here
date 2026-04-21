import dynamic from "next/dynamic"

export const MapWrapper = dynamic(
  () => import("./leaflet-map").then((mod) => mod.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="animate-pulse bg-muted rounded-lg"
        style={{ height: "calc(100vh - 200px)" }}
      />
    ),
  }
)
