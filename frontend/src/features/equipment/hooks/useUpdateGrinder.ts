import type { Guid } from '@/lib/api-types'
import type { UpdateGrinderRequest } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import { grinderQueryKeys } from '@/features/equipment/queryKeys'
import { useEntityMutation } from '@/lib/useEntityMutation'

type UpdateGrinderInput = {
  id: Guid
  request: UpdateGrinderRequest
}

export function useUpdateGrinder() {
  return useEntityMutation<UpdateGrinderInput>({
    mutationFn: ({ id, request }) => apiClient.api.grinders.byId(id).put(request),
    invalidateKeys: (variables) => [
      grinderQueryKeys.all,
      grinderQueryKeys.detail(variables.id),
    ],
    successMessage: 'Grinder updated.',
  })
}
