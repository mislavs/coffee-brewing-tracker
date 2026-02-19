import { useSuspenseQuery } from '@tanstack/react-query'
import type { BeanSummaryDto } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { beanQueryKeys } from '@/features/beans/queryKeys'

export function useBeans(search?: string) {
  const normalizedSearch = search?.trim() ?? ''

  return useSuspenseQuery({
    queryKey: beanQueryKeys.list(normalizedSearch),
    queryFn: async (): Promise<BeanSummaryDto[]> =>
      (await apiClient.api.beans.get({
        queryParameters: normalizedSearch
          ? {
              search: normalizedSearch,
            }
          : undefined,
      })) ?? [],
  })
}
