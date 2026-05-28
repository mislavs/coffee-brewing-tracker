import {
  originTypeLabels,
  roastProfileLabels,
} from '@/features/beans/beanShared'

const decimalFormatters = new Map<string, Intl.NumberFormat>()

function getDecimalFormatter(
  maximumFractionDigits: number,
  minimumFractionDigits: number,
) {
  const key = `${minimumFractionDigits}:${maximumFractionDigits}`
  const existingFormatter = decimalFormatters.get(key)
  if (existingFormatter) {
    return existingFormatter
  }

  const formatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits,
    maximumFractionDigits,
  })
  decimalFormatters.set(key, formatter)
  return formatter
}

export function formatOriginType(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return '—'
  }

  return originTypeLabels[value as keyof typeof originTypeLabels] ?? 'Unknown'
}

export function formatRoastProfile(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return '—'
  }

  return roastProfileLabels[value as keyof typeof roastProfileLabels] ?? 'Unknown'
}

export function formatDecimal(
  value: number | null | undefined,
  maximumFractionDigits = 2,
  minimumFractionDigits = 0,
) {
  if (value === null || value === undefined) {
    return '—'
  }

  return getDecimalFormatter(maximumFractionDigits, minimumFractionDigits).format(value)
}

export function formatPrice(
  value: number | null | undefined,
) {
  if (value === null || value === undefined) {
    return '—'
  }

  return `${formatDecimal(value, 2, 2)} €`
}

export function formatPricePerKg(
  value: number | null | undefined,
  fallback = '—',
) {
  if (value === null || value === undefined) {
    return fallback
  }

  return `${formatDecimal(value, 2)} € / kg`
}

export function getRatingDisplay(rating: number | null | undefined) {
  switch (rating) {
    case 1:
      return '😞'
    case 2:
      return '🙁'
    case 3:
      return '😐'
    case 4:
      return '🙂'
    case 5:
      return '🤩'
    default:
      return '—'
  }
}
