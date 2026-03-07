import { z } from 'zod'
import type { DateOnly } from '@/lib/api-types'
import { guidPattern } from '@/lib/guid'
import { optionalTrimmedStringSchema } from '@/lib/zodUtils'

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
  originCountryIds: z.array(z.string().trim().min(1)).default([]),
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
  isAvailable: z.boolean().default(true),
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

export function normalizeDistinctIdList(values: string[]) {
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
