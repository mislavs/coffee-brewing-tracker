export const brewerQueryKeys = {
  all: ['brewers'] as const,
  detail: (id: string) => ['brewers', id] as const,
}

export const grinderQueryKeys = {
  all: ['grinders'] as const,
  detail: (id: string) => ['grinders', id] as const,
}

export const accessoryQueryKeys = {
  all: ['accessories'] as const,
  detail: (id: string) => ['accessories', id] as const,
}
