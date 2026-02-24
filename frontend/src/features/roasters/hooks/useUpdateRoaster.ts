import type { Guid } from '@/lib/api-types'
import type { UpdateRoasterRequest } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import { roasterQueryKeys } from '@/features/roasters/queryKeys'
import { useEntityMutation } from '@/lib/useEntityMutation'

type UpdateRoasterInput = {
  id: Guid
  request: UpdateRoasterRequest
}

export function useUpdateRoaster() {
  return useEntityMutation<UpdateRoasterInput>({
    mutationFn: ({ id, request }) => apiClient.api.roasters.byId(id).put(request),
    invalidateKeys: (variables) => [
      roasterQueryKeys.all,
      roasterQueryKeys.detail(variables.id),
    ],
    successMessage: 'Roaster updated.',
  })
}
