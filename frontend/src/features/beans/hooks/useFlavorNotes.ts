import { useSuspenseQuery } from '@tanstack/react-query'
import type { FlavorNoteDto } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { flavorNoteQueryKeys } from '@/features/beans/queryKeys'

export function useFlavorNotes() {
  return useSuspenseQuery({
    queryKey: flavorNoteQueryKeys.all,
    queryFn: async (): Promise<FlavorNoteDto[]> =>
      (await apiClient.api.flavorNotes.get()) ?? [],
  })
}
