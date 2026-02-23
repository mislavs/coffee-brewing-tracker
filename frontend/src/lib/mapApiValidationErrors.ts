import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

export type ValidationPayload = {
  title?: string
  errors?: Record<string, string[]>
}

export function extractValidationPayload(error: unknown): ValidationPayload | null {
  if (!error || typeof error !== 'object') {
    return null
  }

  const errorRecord = error as Record<string, unknown>

  const fromResponseBody = errorRecord.responseBody
  if (fromResponseBody && typeof fromResponseBody === 'object') {
    return fromResponseBody as ValidationPayload
  }

  if (
    (errorRecord.title && typeof errorRecord.title === 'string') ||
    (errorRecord.errors && typeof errorRecord.errors === 'object')
  ) {
    return errorRecord as ValidationPayload
  }

  return null
}

export function normalizeApiFieldName(fieldName: string) {
  return fieldName.charAt(0).toLowerCase() + fieldName.slice(1)
}

type ApplyFormServerErrorsOptions<TFormValues extends FieldValues> = {
  entityName: string
  fieldMap?: Record<string, Path<TFormValues>>
  resolveField?: (normalizedFieldName: string) => Path<TFormValues> | undefined
  applyTitleToRoot?: boolean
}

type ApplyFormServerErrorsResult = {
  payload: ValidationPayload | null
  firstUnhandledValidationMessage?: string
}

export function applyFormServerErrors<TFormValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFormValues>,
  options: ApplyFormServerErrorsOptions<TFormValues>,
): ApplyFormServerErrorsResult {
  const payload = extractValidationPayload(error)
  if (!payload) {
    setError('root.serverError' as Path<TFormValues>, {
      message: `Unable to save ${options.entityName}. Please try again.`,
    })
    return { payload: null }
  }

  let firstUnhandledValidationMessage: string | undefined

  if (payload.errors) {
    for (const [fieldName, messages] of Object.entries(payload.errors)) {
      const normalizedFieldName = normalizeApiFieldName(fieldName)
      const mappedField =
        options.resolveField?.(normalizedFieldName) ??
        options.fieldMap?.[normalizedFieldName]

      if (!mappedField) {
        firstUnhandledValidationMessage ??= messages[0]
        continue
      }

      setError(mappedField, {
        message: messages[0] ?? 'Invalid value.',
      })
    }
  }

  if (options.applyTitleToRoot !== false && payload.title) {
    setError('root.serverError' as Path<TFormValues>, { message: payload.title })
  }

  return { payload, firstUnhandledValidationMessage }
}
