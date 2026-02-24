import { useSuspenseQuery } from '@tanstack/react-query'
import type { Guid } from '@/lib/api-types'
import type { RoasterDto } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import { roasterQueryKeys } from '@/features/roasters/queryKeys'

export function useRoaster(id: Guid) {
  return useSuspenseQuery({
    queryKey: roasterQueryKeys.detail(id),
    queryFn: async (): Promise<RoasterDto> => {
      const roaster = await apiClient.api.roasters.byId(id).get()
      if (!roaster) {
        throw new Error('Roaster not found.')
      }

      return roaster
    },
  })
}
