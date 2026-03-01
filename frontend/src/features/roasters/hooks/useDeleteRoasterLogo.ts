import type { Guid } from '@/lib/api-types'
import { roasterQueryKeys } from '@/features/roasters/queryKeys'
import { apiClient } from '@/lib/api-client'
import { useEntityMutation } from '@/lib/useEntityMutation'

type DeleteRoasterLogoInput = {
  id: Guid
}

export function useDeleteRoasterLogo() {
  return useEntityMutation<DeleteRoasterLogoInput>({
    mutationFn: ({ id }: DeleteRoasterLogoInput) =>
      apiClient.api.roasters.byId(id).logo.delete(),
    invalidateKeys: (variables) => [
      roasterQueryKeys.all,
      roasterQueryKeys.detail(variables.id),
    ],
    successMessage: 'Roaster logo removed.',
  })
}
