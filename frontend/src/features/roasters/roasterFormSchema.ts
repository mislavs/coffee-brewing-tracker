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
  countryId: z
    .string()
    .trim()
    .uuid('Country must be a valid identifier.')
    .optional(),
  websiteUrl: z
    .string()
    .trim()
    .url('Website URL must be a valid URL.')
    .max(2048, 'Website URL must be 2048 characters or fewer.')
    .optional()
    .or(z.literal('')),
})

export type RoasterFormValues = z.infer<typeof roasterFormSchema>
