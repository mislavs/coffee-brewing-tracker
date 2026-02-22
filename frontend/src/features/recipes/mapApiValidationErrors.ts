import type { UseFormSetError } from 'react-hook-form'
import type { RecipeFormValues } from '@/features/recipes/recipeFormSchema'
import {
  extractValidationPayload,
  normalizeApiFieldName,
} from '@/lib/mapApiValidationErrors'

export function applyRecipeFormServerErrors(
  error: unknown,
  setError: UseFormSetError<RecipeFormValues>,
) {
  const payload = extractValidationPayload(error)
  if (!payload) {
    setError('root.serverError', {
      message: 'Unable to save recipe. Please try again.',
    })
    return
  }

  const validationErrors = payload.errors
  if (validationErrors) {
    for (const [fieldName, messages] of Object.entries(validationErrors)) {
      const normalizedFieldName = normalizeApiFieldName(fieldName)

      if (
        normalizedFieldName === 'name' ||
        normalizedFieldName === 'brewerId' ||
        normalizedFieldName === 'description'
      ) {
        setError(normalizedFieldName, {
          message: messages[0] ?? 'Invalid value.',
        })
      }
    }
  }

  const message = payload.title
  if (message) {
    setError('root.serverError', { message })
  }
}
