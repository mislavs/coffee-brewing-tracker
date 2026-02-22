import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreateRecipeRequest } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'

export function useCreateRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: CreateRecipeRequest) =>
      apiClient.api.recipes.post(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast.success('Recipe created.')
    },
  })
}
