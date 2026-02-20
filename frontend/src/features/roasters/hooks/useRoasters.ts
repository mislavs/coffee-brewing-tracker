import { useQuery } from '@tanstack/react-query'
import type { RoasterSummaryDto } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { roasterQueryKeys } from '@/features/roasters/queryKeys'

export function useRoasters() {
  return useQuery({
    queryKey: roasterQueryKeys.all,
    queryFn: async (): Promise<RoasterSummaryDto[]> =>
      (await apiClient.api.roasters.get()) ?? [],
    staleTime: 2 * 60_000,
  })
}
