import { useSuspenseQuery } from '@tanstack/react-query'
import type { Guid } from '@microsoft/kiota-abstractions'
import type { AccessoryDto } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { accessoryQueryKeys } from '@/features/equipment/queryKeys'

export function useAccessory(id: Guid) {
  return useSuspenseQuery({
    queryKey: accessoryQueryKeys.detail(id),
    queryFn: async (): Promise<AccessoryDto> => {
      const accessory = await apiClient.api.accessories.byId(id).get()
      if (!accessory) {
        throw new Error('Accessory not found.')
      }

      return accessory
    },
  })
}
