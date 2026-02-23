import type { CreateGrinderRequest } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { grinderQueryKeys } from '@/features/equipment/queryKeys'
import { useEntityMutation } from '@/lib/useEntityMutation'

export function useCreateGrinder() {
  return useEntityMutation<CreateGrinderRequest>({
    mutationFn: (request) => apiClient.api.grinders.post(request),
    invalidateKeys: [grinderQueryKeys.all],
    successMessage: 'Grinder created.',
  })
}
