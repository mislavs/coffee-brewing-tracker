import type { Guid } from '@/lib/api-types'
import { apiClient } from '@/lib/api-client'
import { beanQueryKeys } from '@/features/beans/queryKeys'
import { brewLogQueryKeys } from '@/features/brew-log/queryKeys'
import { useEntityMutation } from '@/lib/useEntityMutation'

type SetBrewLogRatingInput = {
  id: Guid
  rating: number | null
}

export function useSetBrewLogRating() {
  return useEntityMutation<SetBrewLogRatingInput>({
    mutationFn: ({ id, rating }) => apiClient.api.brewLogs.byId(id).setRating({ rating }),
    invalidateKeys: (variables) => [
      brewLogQueryKeys.root,
      beanQueryKeys.all,
      brewLogQueryKeys.detail(variables.id),
    ],
    successMessage: 'Rating saved.',
  })
}
