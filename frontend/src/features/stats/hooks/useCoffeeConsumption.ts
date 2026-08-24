import { useQuery } from '@tanstack/react-query'
import type {
  CoffeeConsumptionGranularity,
  CoffeeConsumptionSeriesDto,
} from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import { statsQueryKeys } from '@/features/stats/queryKeys'

type CoffeeConsumptionQuery = {
  from: string
  to: string
  granularity: CoffeeConsumptionGranularity
  timeZone: string
}

export function useCoffeeConsumption(query: CoffeeConsumptionQuery) {
  return useQuery({
    queryKey: statsQueryKeys.coffeeConsumption(
      query.from,
      query.to,
      query.granularity,
      query.timeZone,
    ),
    queryFn: async (): Promise<CoffeeConsumptionSeriesDto> => {
      const result = await apiClient.api.stats.coffeeConsumption.get(query)
      if (!result) {
        throw new Error('Coffee consumption could not be loaded.')
      }

      return result
    },
    staleTime: 60_000,
  })
}
