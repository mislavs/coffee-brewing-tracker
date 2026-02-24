import { useSuspenseQuery } from '@tanstack/react-query'
import type { Guid } from '@/lib/api-types'
import type { BrewerDto } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import { brewerQueryKeys } from '@/features/equipment/queryKeys'

export function useBrewer(id: Guid) {
  return useSuspenseQuery({
    queryKey: brewerQueryKeys.detail(id),
    queryFn: async (): Promise<BrewerDto> => {
      const brewer = await apiClient.api.brewers.byId(id).get()
      if (!brewer) {
        throw new Error('Brewer not found.')
      }

      return brewer
    },
  })
}
