import { useSuspenseQuery } from '@tanstack/react-query'
import type { Guid } from '@/lib/api-types'
import type { BrewLogDto } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import { brewLogQueryKeys } from '@/features/brew-log/queryKeys'

export function useBrewLog(id: Guid) {
  return useSuspenseQuery({
    queryKey: brewLogQueryKeys.detail(id),
    queryFn: async (): Promise<BrewLogDto> => {
      const brewLog = await apiClient.api.brewLogs.byId(id).get()
      if (!brewLog) {
        throw new Error('Brew log not found.')
      }

      return brewLog
    },
  })
}
