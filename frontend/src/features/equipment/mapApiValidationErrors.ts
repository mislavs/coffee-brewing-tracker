import type { UseFormSetError } from 'react-hook-form'
import type { AccessoryFormValues } from '@/features/equipment/accessoryFormSchema'
import type { BrewerFormValues } from '@/features/equipment/brewerFormSchema'
import type { GrinderFormValues } from '@/features/equipment/grinderFormSchema'
import {
  extractValidationPayload,
  normalizeApiFieldName,
} from '@/lib/mapApiValidationErrors'

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
  const payload = extractValidationPayload(error)
  if (!payload) {
    setError('root.serverError', {
      message: 'Unable to save brewer. Please try again.',
    })
    return
  }

  const validationErrors = payload.errors ?? payload.Errors
  if (validationErrors) {
    for (const [fieldName, messages] of Object.entries(validationErrors)) {
      const normalizedFieldName = normalizeApiFieldName(fieldName)
      const mappedField = brewerFieldNames[normalizedFieldName]
      if (!mappedField) {
        continue
      }

      setError(mappedField, { message: messages[0] ?? 'Invalid value.' })
    }
  }

  const message = payload.message ?? payload.Message
  if (message) {
    setError('root.serverError', { message })
  }
}

export function applyGrinderFormServerErrors(
  error: unknown,
  setError: UseFormSetError<GrinderFormValues>,
) {
  const payload = extractValidationPayload(error)
  if (!payload) {
    setError('root.serverError', {
      message: 'Unable to save grinder. Please try again.',
    })
    return
  }

  const validationErrors = payload.errors ?? payload.Errors
  if (validationErrors) {
    for (const [fieldName, messages] of Object.entries(validationErrors)) {
      const normalizedFieldName = normalizeApiFieldName(fieldName)
      const mappedField = grinderFieldNames[normalizedFieldName]
      if (!mappedField) {
        continue
      }

      setError(mappedField, { message: messages[0] ?? 'Invalid value.' })
    }
  }

  const message = payload.message ?? payload.Message
  if (message) {
    setError('root.serverError', { message })
  }
}

export function applyAccessoryFormServerErrors(
  error: unknown,
  setError: UseFormSetError<AccessoryFormValues>,
) {
  const payload = extractValidationPayload(error)
  if (!payload) {
    setError('root.serverError', {
      message: 'Unable to save accessory. Please try again.',
    })
    return
  }

  const validationErrors = payload.errors ?? payload.Errors
  if (validationErrors) {
    for (const [fieldName, messages] of Object.entries(validationErrors)) {
      const normalizedFieldName = normalizeApiFieldName(fieldName)
      const mappedField =
        accessoryFieldNames[normalizedFieldName] ??
        (normalizedFieldName.startsWith('brewerIds')
          ? accessoryFieldNames.brewerIds
          : undefined)
      if (!mappedField) {
        continue
      }

      setError(mappedField, { message: messages[0] ?? 'Invalid value.' })
    }
  }

  const message = payload.message ?? payload.Message
  if (message) {
    setError('root.serverError', { message })
  }
}
