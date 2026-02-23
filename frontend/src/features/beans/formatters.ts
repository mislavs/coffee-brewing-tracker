import {
  originTypeLabels,
  roastProfileLabels,
} from '@/features/beans/beanShared'
import { formatDate } from '@/lib/date'

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
) {
  if (value === null || value === undefined) {
    return '—'
  }

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value)
}

export function formatPrice(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return '—'
  }

  return `${formatDecimal(value, 2)} €`
}

export function formatPricePerKg(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return '—'
  }

  return `${formatDecimal(value, 2)} € / kg`
}

export function formatRoastDate(value: unknown) {
  return formatDate(value)
}
