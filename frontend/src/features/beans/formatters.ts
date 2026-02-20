import {
  originTypeLabels,
  roastProfileLabels,
  toDateInputValue,
} from '@/features/beans/beanShared'

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

export function formatPricePerKg(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return '—'
  }

  return `${formatDecimal(value, 2)} / kg`
}

export function formatRoastDate(value: unknown) {
  const dateInputValue = toDateInputValue(value as string | null | undefined)
  if (!dateInputValue) {
    return '—'
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateInputValue)
  if (!match) {
    return dateInputValue
  }

  const [, year, month, day] = match
  return `${day}.${month}.${year}`
}
