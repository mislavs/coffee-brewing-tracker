import { z } from 'zod'

export const accessoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .max(200, 'Name must be 200 characters or fewer.'),
  brewerIds: z.array(z.string()).optional(),
})

export type AccessoryFormValues = z.infer<typeof accessoryFormSchema>
