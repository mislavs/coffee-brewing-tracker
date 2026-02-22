import { z } from 'zod'

export const recipeFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .max(200, 'Name must be 200 characters or fewer.'),
  brewerId: z.string().min(1, 'Brewer is required.'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description must be 2000 characters or fewer.')
    .optional(),
})

export type RecipeFormValues = z.infer<typeof recipeFormSchema>

export function normalizeOptional(value: string | undefined) {
  if (!value) {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}
