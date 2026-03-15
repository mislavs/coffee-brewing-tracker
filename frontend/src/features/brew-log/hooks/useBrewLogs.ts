import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { Guid } from '@/lib/api-types'
import type { BrewLogSummaryDto } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import { brewLogQueryKeys } from '@/features/brew-log/queryKeys'

type BrewLogListFilters = {
  search?: string
  beanId?: Guid
  dateFrom?: string
  dateTo?: string
  includeUnavailableBeans?: boolean
}

export function useBrewLogs(
  search?: string,
  dateFrom?: string,
  dateTo?: string,
  includeUnavailableBeans = false,
  beanId?: Guid,
) {
  const normalizedSearch = search?.trim() ?? ''
  const normalizedBeanId = beanId?.trim() ?? ''
  const normalizedDateFrom = dateFrom?.trim() ?? ''
  const normalizedDateTo = dateTo?.trim() ?? ''

  const params: BrewLogListFilters = {}
  if (normalizedSearch) {
    params.search = normalizedSearch
  }
  if (normalizedBeanId) {
    params.beanId = normalizedBeanId
  }
  if (normalizedDateFrom) {
    params.dateFrom = normalizedDateFrom
  }
  if (normalizedDateTo) {
    params.dateTo = normalizedDateTo
  }
  if (includeUnavailableBeans) {
    params.includeUnavailableBeans = true
  }
  const hasFilters = Object.keys(params).length > 0

  return useQuery({
    queryKey: brewLogQueryKeys.all(hasFilters ? params : undefined),
    queryFn: async (): Promise<BrewLogSummaryDto[]> =>
      (await apiClient.api.brewLogs.get({
        queryParameters: {
          search: normalizedSearch || undefined,
          beanId: normalizedBeanId || undefined,
          dateFrom: normalizedDateFrom ? new Date(normalizedDateFrom) : undefined,
          dateTo: normalizedDateTo ? new Date(normalizedDateTo) : undefined,
          includeUnavailableBeans: includeUnavailableBeans || undefined,
        },
      })) ?? [],
    placeholderData: keepPreviousData,
    staleTime: 2 * 60_000,
  })
}
