import { useQuery } from '@tanstack/react-query'
import type { DashboardStatsDto } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import { statsQueryKeys } from '@/features/stats/queryKeys'

export const dashboardStatsQueryKey = statsQueryKeys.dashboard

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
