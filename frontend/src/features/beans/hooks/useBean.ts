import { useSuspenseQuery } from '@tanstack/react-query'
import type { Guid } from '@/lib/api-types'
import type { BeanDto } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import { beanQueryKeys } from '@/features/beans/queryKeys'

export function useBean(id: Guid) {
  return useSuspenseQuery({
    queryKey: beanQueryKeys.detail(id),
    queryFn: async (): Promise<BeanDto> => {
      const bean = await apiClient.api.beans.byId(id).get()
      if (!bean) {
        throw new Error('Bean not found.')
      }

      return bean
    },
  })
}
