export const originTypeLabels = {
  0: 'Single Origin',
  1: 'Blend',
} as const

export const roastProfileLabels = {
  0: 'Filter',
  1: 'Espresso',
  2: 'Omni',
  3: 'Unknown',
} as const

export function toDateInputValue(
  value:
    | string
    | Date
    | { year?: unknown; month?: unknown; day?: unknown }
    | null
    | undefined,
) {
  if (!value) {
    return undefined
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) {
      return undefined
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed
    }

    const fromIsoLike = trimmed.slice(0, 10)
    return /^\d{4}-\d{2}-\d{2}$/.test(fromIsoLike) ? fromIsoLike : undefined
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }

  if (typeof value === 'object') {
    const parts = value as { year?: unknown; month?: unknown; day?: unknown }
    if (
      typeof parts.year === 'number' &&
      typeof parts.month === 'number' &&
      typeof parts.day === 'number'
    ) {
      const year = String(parts.year).padStart(4, '0')
      const month = String(parts.month).padStart(2, '0')
      const day = String(parts.day).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const asText = String(value).trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(asText)) {
      return asText
    }

    const fromIsoLike = asText.slice(0, 10)
    if (/^\d{4}-\d{2}-\d{2}$/.test(fromIsoLike)) {
      return fromIsoLike
    }
  }

  return undefined
}
