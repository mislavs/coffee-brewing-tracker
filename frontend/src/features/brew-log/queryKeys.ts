export const brewLogQueryKeys = {
  root: ['brew-logs'] as const,
  all: (params?: { search?: string; dateFrom?: string; dateTo?: string }) =>
    ['brew-logs', params] as const,
  detail: (id: string) => ['brew-logs', id] as const,
}
