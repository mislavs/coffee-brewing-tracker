import { useSuspenseQuery } from '@tanstack/react-query'
import type { Guid } from '@microsoft/kiota-abstractions'
import type { RecipeDto } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { recipeQueryKeys } from '@/features/recipes/queryKeys'

export function useRecipe(id: Guid) {
  return useSuspenseQuery({
    queryKey: recipeQueryKeys.detail(id),
    queryFn: async (): Promise<RecipeDto> => {
      const recipe = await apiClient.api.recipes.byId(id).get()
      if (!recipe) {
        throw new Error('Recipe not found.')
      }

      return recipe
    },
  })
}
