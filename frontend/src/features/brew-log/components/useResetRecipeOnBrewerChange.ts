import { useEffect, useRef } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type {
  BrewLogFormInput,
  BrewLogFormValues,
} from '@/features/brew-log/brewLogFormSchema'

type BrewLogForm = UseFormReturn<BrewLogFormInput, undefined, BrewLogFormValues>

export function useResetRecipeOnBrewerChange(
  form: BrewLogForm,
  brewerId: string,
  initialBrewerId: string,
) {
  const previousBrewerIdRef = useRef(initialBrewerId)

  useEffect(() => {
    if (previousBrewerIdRef.current !== brewerId) {
      form.setValue('recipeId', '', {
        shouldDirty: true,
        shouldValidate: true,
      })
    }

    previousBrewerIdRef.current = brewerId
  }, [form, brewerId])
}
