import { useSuspenseQuery } from '@tanstack/react-query'
import type { Guid } from '@microsoft/kiota-abstractions'
import type { BrewLogDto } from '@/lib/api/generated/models/index.js'
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
