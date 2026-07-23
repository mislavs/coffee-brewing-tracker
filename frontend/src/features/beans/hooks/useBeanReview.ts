import { useQuery } from '@tanstack/react-query'
import type { Guid } from '@/lib/api-types'
import type { BeanDto } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import { beanQueryKeys } from '@/features/beans/queryKeys'

export function useBeanReview(id: Guid | null) {
  return useQuery({
    queryKey: beanQueryKeys.detail(id ?? ''),
    queryFn: async (): Promise<BeanDto> => {
      if (!id) {
        throw new Error('Bean review is unavailable.')
      }

      const bean = await apiClient.api.beans.byId(id).get()
      if (!bean) {
        throw new Error('Bean not found.')
      }

      return bean
    },
    enabled: Boolean(id),
  })
}
