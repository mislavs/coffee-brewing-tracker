import type { Guid } from '@/lib/api-types'
import type { UpdateBeanRequest } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import {
  beanQueryKeys,
  countryQueryKeys,
  flavorNoteQueryKeys,
} from '@/features/beans/queryKeys'
import { statsQueryKeys } from '@/features/stats/queryKeys'
import { useEntityMutation } from '@/lib/useEntityMutation'

type UpdateBeanInput = {
  id: Guid
  request: UpdateBeanRequest
}

export function useUpdateBean() {
  return useEntityMutation<UpdateBeanInput>({
    mutationFn: ({ id, request }) => apiClient.api.beans.byId(id).put(request),
    invalidateKeys: (variables) => [
      beanQueryKeys.all,
      beanQueryKeys.detail(variables.id),
      countryQueryKeys.all,
      flavorNoteQueryKeys.all,
      statsQueryKeys.dashboard,
      statsQueryKeys.countryMap,
    ],
    successMessage: 'Bean updated.',
  })
}
