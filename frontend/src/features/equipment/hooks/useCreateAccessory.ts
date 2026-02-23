import type { CreateAccessoryRequest } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { accessoryQueryKeys } from '@/features/equipment/queryKeys'
import { useEntityMutation } from '@/lib/useEntityMutation'

export function useCreateAccessory() {
  return useEntityMutation<CreateAccessoryRequest>({
    mutationFn: (request) => apiClient.api.accessories.post(request),
    invalidateKeys: [accessoryQueryKeys.all],
    successMessage: 'Accessory created.',
  })
}
