import type { Guid } from '@microsoft/kiota-abstractions'
import { z } from 'zod'
import type { CreateBrewLogRequest } from '@/lib/api/generated/models/index.js'

const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

const requiredPositiveNumberSchema = (message: string) =>
  z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return Number.NaN
      }

      return typeof value === 'number' ? value : Number(value)
    },
    z.number().finite('A value is required.').positive(message),
  )

const optionalNumberSchema = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }

  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}, z.number().optional())

export const brewLogFormSchema = z.object({
  beanId: z
    .string()
    .trim()
    .min(1, 'Bean is required.')
    .regex(guidPattern, 'Choose a valid bean.'),
  brewerId: z
    .string()
    .trim()
    .min(1, 'Brewer is required.')
    .regex(guidPattern, 'Choose a valid brewer.'),
  grinderId: z
    .string()
    .trim()
    .min(1, 'Grinder is required.')
    .regex(guidPattern, 'Choose a valid grinder.'),
  recipeId: z
    .string()
    .trim()
    .min(1, 'Recipe is required.')
    .regex(guidPattern, 'Choose a valid recipe.'),
  dose: requiredPositiveNumberSchema('Dose must be greater than 0.'),
  waterAmount: requiredPositiveNumberSchema(
    'Water amount must be greater than 0.',
  ),
  waterTemperature: optionalNumberSchema.refine(
    (value) => value === undefined || (value >= 0 && value <= 100),
    'Water temperature must be between 0 and 100.',
  ),
  grindSize: optionalTrimmedStringSchema.refine(
    (value) => value === undefined || value.length <= 10,
    'Grind size must be 10 characters or fewer.',
  ),
  brewTimeMinutes: optionalNumberSchema.refine(
    (value) => value === undefined || (Number.isInteger(value) && value >= 0),
    'Minutes must be a non-negative whole number.',
  ),
  brewTimeSeconds: optionalNumberSchema.refine(
    (value) =>
      value === undefined ||
      (Number.isInteger(value) && value >= 0 && value <= 59),
    'Seconds must be between 0 and 59.',
  ),
  rating: optionalNumberSchema.refine(
    (value) =>
      value === undefined || (Number.isInteger(value) && value >= 1 && value <= 5),
    'Rating must be between 1 and 5.',
  ),
  tastingNotes: optionalTrimmedStringSchema.refine(
    (value) => value === undefined || value.length <= 2000,
    'Notes must be 2000 characters or fewer.',
  ),
  adjustmentIdeas: optionalTrimmedStringSchema.refine(
    (value) => value === undefined || value.length <= 1000,
    'Adjustment ideas must be 1000 characters or fewer.',
  ),
  accessoryIds: z.array(z.string().trim().regex(guidPattern)).default([]),
  brewedAt: z
    .string()
    .trim()
    .min(1, 'Brew date is required.')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid brew date.'),
})

export type BrewLogFormInput = z.input<typeof brewLogFormSchema>
export type BrewLogFormValues = z.output<typeof brewLogFormSchema>

function normalizeOptional(value: string | undefined) {
  if (!value) {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function normalizeBrewLogFormValues(
  values: BrewLogFormValues,
): CreateBrewLogRequest {
  const brewedAt = new Date(values.brewedAt)
  const brewTimeMinutes = values.brewTimeMinutes ?? 0
  const brewTimeSeconds = values.brewTimeSeconds ?? 0
  const totalBrewTimeSeconds =
    brewTimeMinutes > 0 || brewTimeSeconds > 0
      ? brewTimeMinutes * 60 + brewTimeSeconds
      : undefined

  return {
    beanId: values.beanId as Guid,
    brewerId: values.brewerId as Guid,
    grinderId: values.grinderId as Guid,
    recipeId: values.recipeId as Guid,
    accessoryIds:
      values.accessoryIds.length > 0
        ? values.accessoryIds.map((id) => id as Guid)
        : undefined,
    dose: values.dose,
    waterAmount: values.waterAmount,
    waterTemperature: values.waterTemperature,
    grindSize: normalizeOptional(values.grindSize),
    brewTimeSeconds: totalBrewTimeSeconds,
    rating: values.rating,
    notes: normalizeOptional(values.tastingNotes),
    adjustmentIdeas: normalizeOptional(values.adjustmentIdeas),
    brewedAt,
  }
}
