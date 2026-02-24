import type { Guid } from '@/lib/api-types'
import { recipeQueryKeys } from '@/features/recipes/queryKeys'
import { apiClient } from '@/lib/api-client'
import { useEntityMutation } from '@/lib/useEntityMutation'

export function useDeleteRecipe() {
  return useEntityMutation<Guid>({
    mutationFn: (id) => apiClient.api.recipes.byId(id).delete(),
    invalidateKeys: [recipeQueryKeys.root],
    successMessage: 'Recipe deleted.',
  })
}
