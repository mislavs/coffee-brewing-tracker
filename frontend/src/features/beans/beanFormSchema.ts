import { z } from 'zod'
import type { DateOnly } from '@microsoft/kiota-abstractions'

const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const optionalTrimmedStringSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return value
    }

    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  },
  z.string().optional(),
)

const optionalPositiveNumberSchema = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }

  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}, z.number().positive('Must be greater than 0.').optional())

const optionalPositiveIntegerSchema = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }

  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}, z.number().int('Must be a whole number.').positive('Must be greater than 0.').optional())

const optionalDateSchema = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }

  return value
}, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format.').optional())

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

export const beanFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .max(200, 'Name must be 200 characters or fewer.'),
  roasterId: z
    .string()
    .trim()
    .min(1, 'Roaster is required.')
    .regex(guidPattern, 'Choose a valid roaster.'),
  originType: z.coerce
    .number()
    .int()
    .refine((value) => value === 0 || value === 1, 'Choose a valid origin type.'),
  originCountries: z.array(z.string().trim().min(1)).default([]),
  variety: optionalTrimmedStringSchema,
  processingMethod: optionalTrimmedStringSchema,
  roastProfile: z.coerce
    .number()
    .int()
    .refine(
      (value) => value >= 0 && value <= 3,
      'Choose a valid roast profile.',
    ),
  roastDate: optionalDateSchema,
  altitude: optionalPositiveIntegerSchema,
  bagWeight: z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
      return Number.NaN
    }

    return typeof value === 'number' ? value : Number(value)
  }, z.number().positive('Bag weight must be greater than 0.')),
  price: optionalPositiveNumberSchema,
  flavorNoteNames: z.array(z.string().trim().min(1)).default([]),
})

export type BeanFormInput = z.input<typeof beanFormSchema>
export type BeanFormValues = z.output<typeof beanFormSchema>

export function normalizeDistinctNameList(values: string[]) {
  const seen = new Set<string>()
  const normalized: string[] = []

  for (const value of values) {
    const trimmed = value.trim()
    if (!trimmed) {
      continue
    }

    const key = trimmed.toLowerCase()
    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    normalized.push(trimmed)
  }

  return normalized
}

export function toOptionalDateOnly(value: string | undefined) {
  if (!value) {
    return undefined
  }

  return value as unknown as DateOnly
}

export function toDateInputValue(value: DateOnly | string | null | undefined) {
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
