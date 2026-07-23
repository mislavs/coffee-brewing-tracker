import type { Guid } from '@/lib/api-types'
import { apiClient } from '@/lib/api-client'
import { beanQueryKeys } from '@/features/beans/queryKeys'
import { statsQueryKeys } from '@/features/stats/queryKeys'
import { useEntityMutation } from '@/lib/useEntityMutation'
import type { SetBeanAvailabilityReviewRequest } from '@/lib/api/schemas'

type SetBeanAvailabilityInput = {
  id: Guid
  isAvailable: boolean
  review?: SetBeanAvailabilityReviewRequest
}

export function useSetBeanAvailability() {
  return useEntityMutation<SetBeanAvailabilityInput>({
    mutationFn: ({ id, isAvailable, review }) =>
      apiClient.api.beans.byId(id).setAvailability({ isAvailable, review }),
    invalidateKeys: (variables) => [
      beanQueryKeys.all,
      beanQueryKeys.detail(variables.id),
      statsQueryKeys.dashboard,
    ],
    successMessage: 'Bean availability updated.',
  })
}
