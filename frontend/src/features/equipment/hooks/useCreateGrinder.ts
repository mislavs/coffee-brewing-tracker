import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreateGrinderRequest } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { grinderQueryKeys } from '@/features/equipment/queryKeys'

export function useCreateGrinder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: CreateGrinderRequest) =>
      apiClient.api.grinders.post(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: grinderQueryKeys.all })
      toast.success('Grinder created.')
    },
  })
}
