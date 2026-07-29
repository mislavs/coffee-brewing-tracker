import { useQuery } from '@tanstack/react-query'
import type { Guid } from '@/lib/api-types'
import type { QuickLogUsageDto } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import { brewLogQueryKeys } from '@/features/brew-log/queryKeys'

export function useQuickLogUsage(beanId: string | undefined) {
  const normalizedBeanId = beanId?.trim() ?? ''

  return useQuery({
    queryKey: brewLogQueryKeys.quickLogUsage(normalizedBeanId),
    queryFn: async (): Promise<QuickLogUsageDto> =>
      (await apiClient.api.brewLogs.getQuickLogUsage(normalizedBeanId as Guid)) ?? {},
    enabled: Boolean(normalizedBeanId),
    staleTime: 60_000,
  })
}
