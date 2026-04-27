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
  options?: { skipNextResetRef?: { current: boolean } },
) {
  const previousBrewerIdRef = useRef(initialBrewerId)
  const skipNextResetRef = options?.skipNextResetRef

  useEffect(() => {
    if (previousBrewerIdRef.current !== brewerId) {
      if (skipNextResetRef?.current) {
        previousBrewerIdRef.current = brewerId
        return
      }

      form.setValue('recipeId', '', { shouldDirty: true })
      form.clearErrors('recipeId')
    }

    previousBrewerIdRef.current = brewerId
  }, [form, brewerId, skipNextResetRef])
}
