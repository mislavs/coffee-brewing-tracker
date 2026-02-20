import { z } from 'zod'

export const brewerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .max(200, 'Name must be 200 characters or fewer.'),
})

export type BrewerFormValues = z.infer<typeof brewerFormSchema>
