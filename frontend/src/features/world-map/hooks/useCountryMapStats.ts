import { useQuery } from '@tanstack/react-query'
import type { CountryMapStatsDto } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import { countryMapStatsQueryKeys } from '@/features/world-map/queryKeys'

export function useCountryMapStats() {
  return useQuery({
    queryKey: countryMapStatsQueryKeys.all,
    queryFn: async (): Promise<CountryMapStatsDto[]> =>
      (await apiClient.api.stats.countryMap.get()) ?? [],
    staleTime: 2 * 60_000,
  })
}
