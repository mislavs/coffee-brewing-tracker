export const brewLogQueryKeys = {
  root: ['brew-logs'] as const,
  all: (params?: {
    search?: string
    beanId?: string
    dateFrom?: string
    dateTo?: string
    includeUnavailableBeans?: boolean
    page?: number
    pageSize?: number
  }) =>
    ['brew-logs', params] as const,
  detail: (id: string) => ['brew-logs', id] as const,
}
