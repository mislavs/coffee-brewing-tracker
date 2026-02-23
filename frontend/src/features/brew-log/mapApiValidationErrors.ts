import type { UseFormSetError } from 'react-hook-form'
import type { BrewLogFormValues } from '@/features/brew-log/brewLogFormSchema'
import { applyFormServerErrors } from '@/lib/mapApiValidationErrors'

const brewLogFieldNames: Record<string, keyof BrewLogFormValues> = {
  beanId: 'beanId',
  brewerId: 'brewerId',
  grinderId: 'grinderId',
  recipeId: 'recipeId',
  dose: 'dose',
  waterAmount: 'waterAmount',
  waterTemperature: 'waterTemperature',
  grindSize: 'grindSize',
  brewTimeSeconds: 'brewTimeSeconds',
  rating: 'rating',
  tastingNotes: 'tastingNotes',
  notes: 'tastingNotes',
  adjustmentIdeas: 'adjustmentIdeas',
  accessoryIds: 'accessoryIds',
  brewedAt: 'brewedAt',
}

export function applyBrewLogFormServerErrors(
  error: unknown,
  setError: UseFormSetError<BrewLogFormValues>,
) {
  applyFormServerErrors(error, setError, {
    entityName: 'brew log',
    fieldMap: brewLogFieldNames,
  })
}
