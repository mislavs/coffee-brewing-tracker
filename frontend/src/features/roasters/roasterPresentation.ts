import { resolveApiUrl } from '@/lib/api/request'
import { formatPricePerKg as formatBeanPricePerKg } from '@/features/beans/formatters'

export function resolveRoasterLogoUrl(logoUrl: string | null | undefined) {
  if (!logoUrl) {
    return null
  }

  return resolveApiUrl(logoUrl)
}

export function formatPricePerKg(value: number | null | undefined) {
  return formatBeanPricePerKg(value, 'No price data')
}

export function getInitials(name: string | null | undefined) {
  const normalized = (name ?? '').trim()
  if (!normalized) {
    return 'R'
  }

  const words = normalized.split(/\s+/).slice(0, 2)
  return words.map((word) => word.charAt(0).toUpperCase()).join('')
}

export function formatWeightKg(grams: number | null | undefined) {
  if (grams == null) {
    return '0.00 kg'
  }

  return `${(grams / 1000).toFixed(2)} kg`
}

export function formatBrewRating(rating: number | null | undefined) {
  if (rating == null) {
    return 'No ratings'
  }

  return `${rating.toFixed(2)} / 5`
}
