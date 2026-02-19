import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreateBeanRequest } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import {
  beanQueryKeys,
  countryQueryKeys,
  flavorNoteQueryKeys,
} from '@/features/beans/queryKeys'

export function useCreateBean() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: CreateBeanRequest) =>
      apiClient.api.beans.post(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: beanQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: countryQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: flavorNoteQueryKeys.all })
      toast.success('Bean created.')
    },
  })
}
