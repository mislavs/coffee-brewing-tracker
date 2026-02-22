import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Guid } from '@microsoft/kiota-abstractions'
import { apiClient } from '@/lib/api-client'

export function useDeleteRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: Guid) => apiClient.api.recipes.byId(id).delete(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast.success('Recipe deleted.')
    },
  })
}
