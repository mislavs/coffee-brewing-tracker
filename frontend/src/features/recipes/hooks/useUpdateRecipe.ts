import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Guid } from '@microsoft/kiota-abstractions'
import type { UpdateRecipeRequest } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { recipeQueryKeys } from '@/features/recipes/queryKeys'

type UpdateRecipeInput = {
  id: Guid
  request: UpdateRecipeRequest
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, request }: UpdateRecipeInput) =>
      apiClient.api.recipes.byId(id).put(request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({
        queryKey: recipeQueryKeys.detail(variables.id),
      })
      toast.success('Recipe updated.')
    },
  })
}
