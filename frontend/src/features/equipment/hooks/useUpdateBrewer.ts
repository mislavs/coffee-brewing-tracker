import type { Guid } from '@microsoft/kiota-abstractions'
import type { UpdateBrewerRequest } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { brewerQueryKeys } from '@/features/equipment/queryKeys'
import { useEntityMutation } from '@/lib/useEntityMutation'

type UpdateBrewerInput = {
  id: Guid
  request: UpdateBrewerRequest
}

export function useUpdateBrewer() {
  return useEntityMutation<UpdateBrewerInput>({
    mutationFn: ({ id, request }) => apiClient.api.brewers.byId(id).put(request),
    invalidateKeys: (variables) => [
      brewerQueryKeys.all,
      brewerQueryKeys.detail(variables.id),
    ],
    successMessage: 'Brewer updated.',
  })
}
