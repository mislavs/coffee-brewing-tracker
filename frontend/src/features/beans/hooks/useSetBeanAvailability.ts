import type { Guid } from '@/lib/api-types'
import { apiClient } from '@/lib/api-client'
import { beanQueryKeys } from '@/features/beans/queryKeys'
import { statsQueryKeys } from '@/features/stats/queryKeys'
import { useEntityMutation } from '@/lib/useEntityMutation'

type SetBeanAvailabilityInput = {
  id: Guid
  isAvailable: boolean
}

export function useSetBeanAvailability() {
  return useEntityMutation<SetBeanAvailabilityInput>({
    mutationFn: ({ id, isAvailable }) =>
      apiClient.api.beans.byId(id).setAvailability({ isAvailable }),
    invalidateKeys: (variables) => [
      beanQueryKeys.all,
      beanQueryKeys.detail(variables.id),
      statsQueryKeys.dashboard,
    ],
    successMessage: 'Bean availability updated.',
  })
}
