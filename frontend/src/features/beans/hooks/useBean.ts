import { useSuspenseQuery } from '@tanstack/react-query'
import type { Guid } from '@microsoft/kiota-abstractions'
import type { BeanDto } from '@/lib/api/generated/models/index.js'
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
