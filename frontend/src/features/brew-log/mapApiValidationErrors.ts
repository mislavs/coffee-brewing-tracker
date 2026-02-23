import type { UseFormSetError } from 'react-hook-form'
import type { BrewLogFormValues } from '@/features/brew-log/brewLogFormSchema'
import {
  extractValidationPayload,
  normalizeApiFieldName,
} from '@/lib/mapApiValidationErrors'

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
  const payload = extractValidationPayload(error)
  if (!payload) {
    setError('root.serverError', {
      message: 'Unable to save brew log. Please try again.',
    })
    return
  }

  const validationErrors = payload.errors
  if (validationErrors) {
    for (const [fieldName, messages] of Object.entries(validationErrors)) {
      const normalizedFieldName = normalizeApiFieldName(fieldName)
      const mappedField = brewLogFieldNames[normalizedFieldName]
      if (!mappedField) {
        continue
      }

      setError(mappedField, {
        message: messages[0] ?? 'Invalid value.',
      })
    }
  }

  if (payload.title) {
    setError('root.serverError', { message: payload.title })
  }
}
