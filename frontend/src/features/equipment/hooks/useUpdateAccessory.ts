import type { Guid } from '@microsoft/kiota-abstractions'
import type { UpdateAccessoryRequest } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { accessoryQueryKeys } from '@/features/equipment/queryKeys'
import { useEntityMutation } from '@/lib/useEntityMutation'

type UpdateAccessoryInput = {
  id: Guid
  request: UpdateAccessoryRequest
}

export function useUpdateAccessory() {
  return useEntityMutation<UpdateAccessoryInput>({
    mutationFn: ({ id, request }) => apiClient.api.accessories.byId(id).put(request),
    invalidateKeys: (variables) => [
      accessoryQueryKeys.all,
      accessoryQueryKeys.detail(variables.id),
    ],
    successMessage: 'Accessory updated.',
  })
}
