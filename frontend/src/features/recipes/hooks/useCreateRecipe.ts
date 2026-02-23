import { recipeQueryKeys } from '@/features/recipes/queryKeys'
import type { CreateRecipeRequest } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { useEntityMutation } from '@/lib/useEntityMutation'

export function useCreateRecipe() {
  return useEntityMutation<CreateRecipeRequest>({
    mutationFn: (request) => apiClient.api.recipes.post(request),
    invalidateKeys: [recipeQueryKeys.root],
    successMessage: 'Recipe created.',
  })
}
