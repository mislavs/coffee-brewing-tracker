import { useSuspenseQuery } from '@tanstack/react-query'
import type { Guid } from '@/lib/api-types'
import type { GrinderDto } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import { grinderQueryKeys } from '@/features/equipment/queryKeys'

export function useGrinder(id: Guid) {
  return useSuspenseQuery({
    queryKey: grinderQueryKeys.detail(id),
    queryFn: async (): Promise<GrinderDto> => {
      const grinder = await apiClient.api.grinders.byId(id).get()
      if (!grinder) {
        throw new Error('Grinder not found.')
      }

      return grinder
    },
  })
}
