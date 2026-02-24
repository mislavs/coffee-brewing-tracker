import type {
  CreateRoasterRequest,
  CreateRoasterResponse,
} from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { roasterQueryKeys } from '@/features/roasters/queryKeys'
import { useEntityMutation } from '@/lib/useEntityMutation'

export function useCreateRoaster() {
  return useEntityMutation<CreateRoasterRequest, CreateRoasterResponse | undefined>({
    mutationFn: (request) => apiClient.api.roasters.post(request),
    invalidateKeys: [roasterQueryKeys.all],
    successMessage: 'Roaster created.',
  })
}
