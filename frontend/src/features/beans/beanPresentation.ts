import { resolveApiUrl } from '@/lib/api/request'

export function resolveBeanImageUrl(imageUrl: string | null | undefined) {
  if (!imageUrl) {
    return null
  }

  return resolveApiUrl(imageUrl)
}

export function getBeanInitials(name: string | null | undefined) {
  const normalized = (name ?? '').trim()
  if (!normalized) {
    return 'B'
  }

  const words = normalized.split(/\s+/).slice(0, 2)
  return words.map((word) => word.charAt(0).toUpperCase()).join('')
}
