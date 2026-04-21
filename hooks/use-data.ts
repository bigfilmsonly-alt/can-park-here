import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useNearbyReports(lat: number | null, lng: number | null) {
  return useSWR(
    lat && lng ? `/api/community/reports?lat=${lat}&lng=${lng}&radius=1` : null,
    fetcher,
    { dedupingInterval: 30000, refreshInterval: 60000 }
  )
}

export function useUserProfile() {
  return useSWR("/api/user", fetcher, { dedupingInterval: 30000 })
}
