import { useQuery } from '@tanstack/react-query'
import type { GrinderSummaryDto } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import { grinderQueryKeys } from '@/features/equipment/queryKeys'

export function useGrinders() {
  return useQuery({
    queryKey: grinderQueryKeys.all,
    queryFn: async (): Promise<GrinderSummaryDto[]> =>
      (await apiClient.api.grinders.get()) ?? [],
    staleTime: 2 * 60_000,
  })
}
