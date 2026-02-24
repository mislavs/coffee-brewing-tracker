import type { Guid } from '@/lib/api-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { roasterQueryKeys } from '@/features/roasters/queryKeys'
import { apiClient } from '@/lib/api-client'

type DeleteRoasterLogoInput = {
  id: Guid
}

export function useDeleteRoasterLogo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: DeleteRoasterLogoInput) =>
      apiClient.api.roasters.byId(id).logo.delete(),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: roasterQueryKeys.all })
      await queryClient.invalidateQueries({
        queryKey: roasterQueryKeys.detail(variables.id),
      })
      toast.success('Roaster logo removed.')
    },
  })
}
