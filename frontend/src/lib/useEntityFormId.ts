import type { Guid } from '@/lib/api-types'
import { useParams } from 'react-router-dom'
import { tryParseGuid } from '@/lib/guid'

type EntityFormId =
  | { mode: 'create' }
  | { mode: 'edit'; id: Guid }
  | { mode: 'invalid' }

export function useEntityFormId(): EntityFormId {
  const { id } = useParams<{ id: string }>()
  if (!id) {
    return { mode: 'create' }
  }

  const parsed = tryParseGuid(id)
  if (!parsed) {
    return { mode: 'invalid' }
  }

  return { mode: 'edit', id: parsed }
}
