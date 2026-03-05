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

export type OriginTypeValue = 0 | 1
export type RoastProfileValue = 0 | 1 | 2 | 3

const originTypeAliases: Record<string, OriginTypeValue> = {
  '0': 0,
  number_0: 0,
  singleorigin: 0,
  single_origin: 0,
  'single-origin': 0,
  '1': 1,
  number_1: 1,
  blend: 1,
}

const roastProfileAliases: Record<string, RoastProfileValue> = {
  '0': 0,
  number_0: 0,
  filter: 0,
  '1': 1,
  number_1: 1,
  espresso: 1,
  '2': 2,
  number_2: 2,
  omni: 2,
  '3': 3,
  number_3: 3,
  unknown: 3,
}

export function toOriginTypeValue(value: unknown): OriginTypeValue | undefined {
  if (value === 0 || value === 1) {
    return value
  }

  if (typeof value === 'string') {
    return originTypeAliases[value.trim().toLowerCase()]
  }

  return undefined
}

export function toRoastProfileValue(
  value: unknown,
): RoastProfileValue | undefined {
  if (value === 0 || value === 1 || value === 2 || value === 3) {
    return value
  }

  if (typeof value === 'string') {
    return roastProfileAliases[value.trim().toLowerCase()]
  }

  return undefined
}

export function toOriginTypeLabel(value: unknown) {
  const normalized = toOriginTypeValue(value)
  return normalized == null ? undefined : originTypeLabels[normalized]
}

export function toRoastProfileLabel(value: unknown) {
  const normalized = toRoastProfileValue(value)
  return normalized == null ? undefined : roastProfileLabels[normalized]
}

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
