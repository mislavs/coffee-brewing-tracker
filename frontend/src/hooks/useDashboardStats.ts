import { useQuery } from '@tanstack/react-query'
import type { DashboardStatsDto } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'

export const dashboardStatsQueryKey = ['stats', 'dashboard'] as const

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardStatsQueryKey,
    queryFn: async (): Promise<DashboardStatsDto> => {
      const stats = await apiClient.api.stats.dashboard.get()
      if (!stats) {
        throw new Error('Dashboard stats could not be loaded.')
      }

      return stats
    },
    staleTime: 60_000,
  })
}
