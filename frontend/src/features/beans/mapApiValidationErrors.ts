import type { UseFormSetError } from 'react-hook-form'
import type { BeanFormValues } from '@/features/beans/beanFormSchema'
import { applyFormServerErrors } from '@/lib/mapApiValidationErrors'

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
  applyFormServerErrors(error, setError, {
    entityName: 'bean',
    fieldMap: beanFieldNames,
  })
}
