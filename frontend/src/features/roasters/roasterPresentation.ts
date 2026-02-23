import { API_URL } from '@/lib/config'

export function resolveRoasterLogoUrl(logoUrl: string | null | undefined) {
  if (!logoUrl) {
    return null
  }

  if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
    return logoUrl
  }

  if (logoUrl.startsWith('/')) {
    return `${API_URL}${logoUrl}`
  }

  return `${API_URL}/${logoUrl}`
}

export function formatPricePerKg(value: number | null | undefined) {
  if (value == null) {
    return 'No price data'
  }

  return `${value.toFixed(2)} / kg`
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
