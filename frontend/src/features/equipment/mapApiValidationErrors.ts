import type { UseFormSetError } from 'react-hook-form'
import type { AccessoryFormValues } from '@/features/equipment/accessoryFormSchema'
import type { BrewerFormValues } from '@/features/equipment/brewerFormSchema'
import type { GrinderFormValues } from '@/features/equipment/grinderFormSchema'
import { applyFormServerErrors } from '@/lib/mapApiValidationErrors'

const brewerFieldNames: Record<string, keyof BrewerFormValues> = {
  name: 'name',
}

const grinderFieldNames: Record<string, keyof GrinderFormValues> = {
  name: 'name',
}

const accessoryFieldNames: Record<string, keyof AccessoryFormValues> = {
  name: 'name',
  brewerIds: 'brewerIds',
}

export function applyBrewerFormServerErrors(
  error: unknown,
  setError: UseFormSetError<BrewerFormValues>,
) {
  applyFormServerErrors(error, setError, {
    entityName: 'brewer',
    fieldMap: brewerFieldNames,
  })
}

export function applyGrinderFormServerErrors(
  error: unknown,
  setError: UseFormSetError<GrinderFormValues>,
) {
  applyFormServerErrors(error, setError, {
    entityName: 'grinder',
    fieldMap: grinderFieldNames,
  })
}

export function applyAccessoryFormServerErrors(
  error: unknown,
  setError: UseFormSetError<AccessoryFormValues>,
) {
  applyFormServerErrors(error, setError, {
    entityName: 'accessory',
    resolveField: (normalizedFieldName) =>
      accessoryFieldNames[normalizedFieldName] ??
      (normalizedFieldName.startsWith('brewerIds')
        ? accessoryFieldNames.brewerIds
        : undefined),
  })
}
