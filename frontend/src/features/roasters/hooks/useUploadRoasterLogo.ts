import type { Guid } from '@/lib/api-types'
import { roasterQueryKeys } from '@/features/roasters/queryKeys'
import { apiClient } from '@/lib/api-client'
import { useEntityMutation } from '@/lib/useEntityMutation'

type UploadRoasterLogoInput = {
  id: Guid
  file: File
}

export function useUploadRoasterLogo() {
  return useEntityMutation<UploadRoasterLogoInput>({
    mutationFn: ({ id, file }: UploadRoasterLogoInput) =>
      apiClient.api.roasters.byId(id).logo.put(file),
    invalidateKeys: (variables) => [
      roasterQueryKeys.all,
      roasterQueryKeys.detail(variables.id),
    ],
    successMessage: 'Roaster logo updated.',
  })
}
