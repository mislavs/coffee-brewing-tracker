import type { CreateBeanRequest, CreateBeanResponse } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import {
  beanQueryKeys,
  countryQueryKeys,
  flavorNoteQueryKeys,
} from '@/features/beans/queryKeys'
import { statsQueryKeys } from '@/features/stats/queryKeys'
import { useEntityMutation } from '@/lib/useEntityMutation'

export function useCreateBean() {
  return useEntityMutation<CreateBeanRequest, CreateBeanResponse | undefined>({
    mutationFn: (request) => apiClient.api.beans.post(request),
    invalidateKeys: [
      beanQueryKeys.all,
      countryQueryKeys.all,
      flavorNoteQueryKeys.all,
      statsQueryKeys.dashboard,
      statsQueryKeys.countryMap,
    ],
    successMessage: 'Bean created.',
  })
}
