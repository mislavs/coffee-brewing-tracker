export const brewLogQueryKeys = {
  root: ['brew-logs'] as const,
  all: (params?: {
    search?: string
    beanId?: string
    recipeId?: string
    dateFrom?: string
    dateTo?: string
    includeUnavailableBeans?: boolean
    page?: number
    pageSize?: number
  }) =>
    ['brew-logs', params] as const,
  quickLogUsage: (beanId: string) =>
    ['brew-logs', 'quick-log-usage', beanId] as const,
  detail: (id: string) => ['brew-logs', id] as const,
}
