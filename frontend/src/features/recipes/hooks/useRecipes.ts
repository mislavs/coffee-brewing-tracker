import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { Guid } from '@/lib/api-types'
import type { RecipeSummaryDto } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import { recipeQueryKeys } from '@/features/recipes/queryKeys'

export function useRecipes(brewerId?: string) {
  const normalizedBrewerId = brewerId?.trim()

  return useQuery({
    queryKey: recipeQueryKeys.all(normalizedBrewerId),
    queryFn: async (): Promise<RecipeSummaryDto[]> =>
      (await apiClient.api.recipes.get({
        queryParameters: normalizedBrewerId
          ? {
              brewerId: normalizedBrewerId as Guid,
            }
          : undefined,
      })) ?? [],
    placeholderData: keepPreviousData,
    staleTime: 2 * 60_000,
  })
}
