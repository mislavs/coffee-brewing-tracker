import type { Guid } from '@/lib/api-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { roasterQueryKeys } from '@/features/roasters/queryKeys'
import { apiClient } from '@/lib/api-client'

type UploadRoasterLogoInput = {
  id: Guid
  file: File
}

export function useUploadRoasterLogo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, file }: UploadRoasterLogoInput) =>
      apiClient.api.roasters.byId(id).logo.put(file),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: roasterQueryKeys.all })
      await queryClient.invalidateQueries({
        queryKey: roasterQueryKeys.detail(variables.id),
      })
      toast.success('Roaster logo updated.')
    },
  })
}
