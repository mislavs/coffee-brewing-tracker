import type { UseFormSetError } from 'react-hook-form'
import type { BeanFormValues } from '@/features/beans/beanFormSchema'
import {
  extractValidationPayload,
  normalizeApiFieldName,
} from '@/lib/mapApiValidationErrors'

const beanFieldNames: Record<string, keyof BeanFormValues> = {
  name: 'name',
  roasterId: 'roasterId',
  originType: 'originType',
  originCountries: 'originCountries',
  variety: 'variety',
  processingMethod: 'processingMethod',
  roastProfile: 'roastProfile',
  roastDate: 'roastDate',
  altitude: 'altitude',
  bagWeight: 'bagWeight',
  price: 'price',
  flavorNoteNames: 'flavorNoteNames',
}

export function applyBeanFormServerErrors(
  error: unknown,
  setError: UseFormSetError<BeanFormValues>,
) {
  const payload = extractValidationPayload(error)
  if (!payload) {
    setError('root.serverError', {
      message: 'Unable to save bean. Please try again.',
    })
    return
  }

  const validationErrors = payload.errors
  if (validationErrors) {
    for (const [fieldName, messages] of Object.entries(validationErrors)) {
      const normalizedFieldName = normalizeApiFieldName(fieldName)
      const mappedField = beanFieldNames[normalizedFieldName]
      if (!mappedField) {
        continue
      }

      setError(mappedField, {
        message: messages[0] ?? 'Invalid value.',
      })
    }
  }

  const message = payload.title
  if (message) {
    setError('root.serverError', { message })
  }
}
