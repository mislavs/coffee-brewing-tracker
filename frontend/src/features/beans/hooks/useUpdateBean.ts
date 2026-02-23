import type { Guid } from '@microsoft/kiota-abstractions'
import type { UpdateBeanRequest } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import {
  beanQueryKeys,
  countryQueryKeys,
  flavorNoteQueryKeys,
} from '@/features/beans/queryKeys'
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
    ],
    successMessage: 'Bean updated.',
  })
}
