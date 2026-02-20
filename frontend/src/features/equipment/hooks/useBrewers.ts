import { useQuery } from '@tanstack/react-query'
import type { BrewerSummaryDto } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { brewerQueryKeys } from '@/features/equipment/queryKeys'

export function useBrewers() {
  return useQuery({
    queryKey: brewerQueryKeys.all,
    queryFn: async (): Promise<BrewerSummaryDto[]> =>
      (await apiClient.api.brewers.get()) ?? [],
    staleTime: 2 * 60_000,
  })
}
