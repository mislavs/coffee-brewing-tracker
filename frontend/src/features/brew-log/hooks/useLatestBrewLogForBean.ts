import { useQuery } from '@tanstack/react-query'
import type { Guid } from '@/lib/api-types'
import type { BrewLogDto } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'

export function useLatestBrewLogForBean(beanId: string | undefined) {
  const normalizedBeanId = beanId?.trim() ?? ''

  return useQuery({
    queryKey: ['brew-logs', 'latest-for-bean', normalizedBeanId],
    queryFn: async (): Promise<BrewLogDto | null> => {
      if (!normalizedBeanId) {
        return null
      }

      const list = await apiClient.api.brewLogs.get({
        queryParameters: {
          beanId: normalizedBeanId as Guid,
          includeUnavailableBeans: true,
          page: 1,
          pageSize: 1,
        },
      })
      const summaryId = list?.items?.[0]?.id

      if (!summaryId) {
        return null
      }

      return (await apiClient.api.brewLogs.byId(summaryId).get()) ?? null
    },
    enabled: Boolean(normalizedBeanId),
    staleTime: 60_000,
  })
}
