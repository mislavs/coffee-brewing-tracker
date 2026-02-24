import type { Guid } from '@/lib/api-types'
import type { UpdateRecipeRequest } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import { recipeQueryKeys } from '@/features/recipes/queryKeys'
import { useEntityMutation } from '@/lib/useEntityMutation'

type UpdateRecipeInput = {
  id: Guid
  request: UpdateRecipeRequest
}

export function useUpdateRecipe() {
  return useEntityMutation<UpdateRecipeInput>({
    mutationFn: ({ id, request }) => apiClient.api.recipes.byId(id).put(request),
    invalidateKeys: (variables) => [
      recipeQueryKeys.root,
      recipeQueryKeys.detail(variables.id),
    ],
    successMessage: 'Recipe updated.',
  })
}
