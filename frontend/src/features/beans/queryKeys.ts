export const beanQueryKeys = {
  all: ['beans'] as const,
  list: (search: string) => ['beans', 'list', search] as const,
  detail: (id: string) => ['beans', id] as const,
}

export const flavorNoteQueryKeys = {
  all: ['flavor-notes'] as const,
}

export const countryQueryKeys = {
  all: ['countries'] as const,
}
