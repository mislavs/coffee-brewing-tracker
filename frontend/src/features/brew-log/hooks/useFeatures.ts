import { useQuery } from '@tanstack/react-query'
import type { FeaturesDto } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import { featuresQueryKeys } from '@/features/brew-log/queryKeys'

export function useFeatures(enabled = true) {
  return useQuery({
    queryKey: featuresQueryKeys.all,
    queryFn: async (): Promise<FeaturesDto | undefined> =>
      apiClient.api.features.get(),
    staleTime: 5 * 60_000,
    enabled,
  })
}
