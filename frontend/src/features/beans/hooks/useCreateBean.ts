import type { CreateBeanRequest } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import {
  beanQueryKeys,
  countryQueryKeys,
  flavorNoteQueryKeys,
} from '@/features/beans/queryKeys'
import { useEntityMutation } from '@/lib/useEntityMutation'

export function useCreateBean() {
  return useEntityMutation<CreateBeanRequest>({
    mutationFn: (request) => apiClient.api.beans.post(request),
    invalidateKeys: [beanQueryKeys.all, countryQueryKeys.all, flavorNoteQueryKeys.all],
    successMessage: 'Bean created.',
  })
}
