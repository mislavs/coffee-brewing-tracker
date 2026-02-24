import type { CreateBrewerRequest } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import { brewerQueryKeys } from '@/features/equipment/queryKeys'
import { useEntityMutation } from '@/lib/useEntityMutation'

export function useCreateBrewer() {
  return useEntityMutation<CreateBrewerRequest>({
    mutationFn: (request) => apiClient.api.brewers.post(request),
    invalidateKeys: [brewerQueryKeys.all],
    successMessage: 'Brewer created.',
  })
}
