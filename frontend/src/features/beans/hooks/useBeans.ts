import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { BeanSummaryDto } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import { beanQueryKeys } from '@/features/beans/queryKeys'

export function useBeans(
  search?: string,
  includeUnavailable = false,
  countryId?: string,
) {
  const normalizedSearch = search?.trim() ?? ''
  const normalizedCountryId = countryId?.trim() ?? ''

  return useQuery({
    queryKey: beanQueryKeys.list(
      normalizedSearch,
      includeUnavailable,
      normalizedCountryId,
    ),
    queryFn: async (): Promise<BeanSummaryDto[]> =>
      (await apiClient.api.beans.get({
        queryParameters:
          normalizedSearch || includeUnavailable || normalizedCountryId
            ? {
                search: normalizedSearch,
                includeUnavailable: includeUnavailable ? true : undefined,
                country: normalizedCountryId || undefined,
              }
            : undefined,
      })) ?? [],
    placeholderData: keepPreviousData,
    staleTime: 2 * 60_000,
  })
}
