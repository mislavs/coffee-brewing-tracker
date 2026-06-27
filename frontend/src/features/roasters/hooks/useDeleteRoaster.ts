import type { Guid } from '@/lib/api-types'
import { roasterQueryKeys } from '@/features/roasters/queryKeys'
import { apiClient } from '@/lib/api-client'
import { useEntityMutation } from '@/lib/useEntityMutation'

export function useDeleteRoaster() {
  return useEntityMutation<Guid>({
    mutationFn: (id) => apiClient.api.roasters.byId(id).delete(),
    invalidateKeys: (id) => [roasterQueryKeys.all, roasterQueryKeys.detail(id)],
    successMessage: 'Roaster deleted.',
  })
}
