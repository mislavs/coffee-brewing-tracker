import { useQuery } from '@tanstack/react-query'
import type { AccessorySummaryDto } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { accessoryQueryKeys } from '@/features/equipment/queryKeys'

export function useAccessories() {
  return useQuery({
    queryKey: accessoryQueryKeys.all,
    queryFn: async (): Promise<AccessorySummaryDto[]> =>
      (await apiClient.api.accessories.get()) ?? [],
    staleTime: 2 * 60_000,
  })
}
