import type { UseFormSetError } from 'react-hook-form'
import type { RoasterFormValues } from '@/features/roasters/roasterFormSchema'
import { applyFormServerErrors } from '@/lib/mapApiValidationErrors'

const roasterFieldNames: Record<string, keyof RoasterFormValues> = {
  name: 'name',
  city: 'city',
  countryId: 'countryId',
  websiteUrl: 'websiteUrl',
}

export function applyRoasterFormServerErrors(
  error: unknown,
  setError: UseFormSetError<RoasterFormValues>,
) {
  const { payload, firstUnhandledValidationMessage } = applyFormServerErrors(
    error,
    setError,
    {
      entityName: 'roaster',
      fieldMap: roasterFieldNames,
      applyTitleToRoot: false,
    },
  )

  if (!payload) {
    return
  }

  const message = firstUnhandledValidationMessage ?? payload.title
  if (message) {
    setError('root.serverError', { message })
  }
}
