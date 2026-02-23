import type { Guid } from '@microsoft/kiota-abstractions'
import type { UpdateRecipeRequest } from '@/lib/api/generated/models/index.js'
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
