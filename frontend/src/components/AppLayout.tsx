import { useCallback, useRef } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/ThemeToggle'
import { beanQueryKeys } from '@/features/beans/queryKeys'
import {
  accessoryQueryKeys,
  brewerQueryKeys,
  grinderQueryKeys,
} from '@/features/equipment/queryKeys'
import { roasterQueryKeys } from '@/features/roasters/queryKeys'
import { apiClient } from '@/lib/api-client'
import { featureRoutes } from '@/lib/navigation'
import { queryClient } from '@/lib/queryClient'
import {
  preloadBeanFeatureRoutes,
  preloadEquipmentFeatureRoutes,
  preloadRoasterFeatureRoutes,
} from '@/lib/routePreload'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const hasPrefetchedRoasters = useRef(false)
  const hasPrefetchedBeans = useRef(false)
  const hasPrefetchedEquipment = useRef(false)

  const prefetchFeature = useCallback((featurePath: string) => {
    if (featurePath === 'roasters') {
      if (hasPrefetchedRoasters.current) {
        return
      }

      hasPrefetchedRoasters.current = true
      preloadRoasterFeatureRoutes()
      void queryClient.prefetchQuery({
        queryKey: roasterQueryKeys.all,
        queryFn: async () => (await apiClient.api.roasters.get()) ?? [],
        staleTime: 2 * 60_000,
      })
      return
    }

    if (featurePath === 'beans') {
      if (hasPrefetchedBeans.current) {
        return
      }

      hasPrefetchedBeans.current = true
      preloadBeanFeatureRoutes()
      void queryClient.prefetchQuery({
        queryKey: beanQueryKeys.list(''),
        queryFn: async () => (await apiClient.api.beans.get()) ?? [],
        staleTime: 2 * 60_000,
      })
      return
    }

    if (featurePath === 'equipment') {
      if (hasPrefetchedEquipment.current) {
        return
      }

      hasPrefetchedEquipment.current = true
      preloadEquipmentFeatureRoutes()
      void Promise.all([
        queryClient.prefetchQuery({
          queryKey: brewerQueryKeys.all,
          queryFn: async () => (await apiClient.api.brewers.get()) ?? [],
          staleTime: 2 * 60_000,
        }),
        queryClient.prefetchQuery({
          queryKey: grinderQueryKeys.all,
          queryFn: async () => (await apiClient.api.grinders.get()) ?? [],
          staleTime: 2 * 60_000,
        }),
        queryClient.prefetchQuery({
          queryKey: accessoryQueryKeys.all,
          queryFn: async () => (await apiClient.api.accessories.get()) ?? [],
          staleTime: 2 * 60_000,
        }),
      ])
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="text-sm font-semibold tracking-wide">
            Coffee Brewing Tracker
          </div>
          <nav className="flex flex-1 flex-wrap gap-1">
            {featureRoutes.map((route) => (
              <NavLink
                key={route.href}
                to={route.href}
                onMouseEnter={() => prefetchFeature(route.path)}
                onFocus={() => prefetchFeature(route.path)}
                onTouchStart={() => prefetchFeature(route.path)}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
              >
                {route.title}
              </NavLink>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <main className="rounded-lg border bg-card p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
