export const beanQueryKeys = {
  all: ['beans'] as const,
  list: (search: string, includeUnavailable = false, countryId?: string) =>
    ['beans', 'list', search, includeUnavailable, countryId ?? ''] as const,
  detail: (id: string) => ['beans', id] as const,
}

export const flavorNoteQueryKeys = {
  all: ['flavor-notes'] as const,
}

export const countryQueryKeys = {
  all: ['countries'] as const,
}
