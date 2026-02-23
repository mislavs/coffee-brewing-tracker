import type { Guid } from '@microsoft/kiota-abstractions'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { roasterQueryKeys } from '@/features/roasters/queryKeys'
import { API_URL } from '@/lib/config'

type DeleteRoasterLogoInput = {
  id: Guid
}

export function useDeleteRoasterLogo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: DeleteRoasterLogoInput) => {
      const response = await fetch(`${API_URL}/api/roasters/${id}/logo`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Unable to remove roaster logo.')
      }
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: roasterQueryKeys.all })
      await queryClient.invalidateQueries({
        queryKey: roasterQueryKeys.detail(variables.id),
      })
      toast.success('Roaster logo removed.')
    },
  })
}
