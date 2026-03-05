import { useQuery } from '@tanstack/react-query'
import type { FeaturesDto } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'

const featuresQueryKey = ['features'] as const

export function useFeatures(enabled = true) {
  return useQuery({
    queryKey: featuresQueryKey,
    queryFn: async (): Promise<FeaturesDto | undefined> =>
      apiClient.api.features.get(),
    staleTime: 5 * 60_000,
    enabled,
  })
}
