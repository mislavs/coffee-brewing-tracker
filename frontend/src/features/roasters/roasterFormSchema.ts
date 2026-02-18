import { z } from 'zod'

export const roasterFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .max(200, 'Name must be 200 characters or fewer.'),
  city: z
    .string()
    .trim()
    .max(100, 'City must be 100 characters or fewer.')
    .optional(),
  country: z
    .string()
    .trim()
    .max(100, 'Country must be 100 characters or fewer.')
    .optional(),
})

export type RoasterFormValues = z.infer<typeof roasterFormSchema>

export function normalizeOptional(value: string | undefined) {
  if (!value) {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}
