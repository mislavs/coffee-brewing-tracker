import type { UseFormSetError } from 'react-hook-form'
import type { RecipeFormValues } from '@/features/recipes/recipeFormSchema'
import { applyFormServerErrors } from '@/lib/mapApiValidationErrors'

const recipeFieldNames: Record<string, keyof RecipeFormValues> = {
  name: 'name',
  brewerId: 'brewerId',
  description: 'description',
}

export function applyRecipeFormServerErrors(
  error: unknown,
  setError: UseFormSetError<RecipeFormValues>,
) {
  applyFormServerErrors(error, setError, {
    entityName: 'recipe',
    fieldMap: recipeFieldNames,
  })
}
