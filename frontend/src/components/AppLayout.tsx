import { useCallback, useEffect, useRef } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/ThemeToggle'
import { beanQueryKeys } from '@/features/beans/queryKeys'
import { roasterQueryKeys } from '@/features/roasters/queryKeys'
import { apiClient } from '@/lib/api-client'
import { featureRoutes } from '@/lib/navigation'
import { queryClient } from '@/lib/queryClient'
import {
  preloadBeanFeatureRoutes,
  preloadRoasterFeatureRoutes,
} from '@/lib/routePreload'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const hasPrefetchedRoasters = useRef(false)
  const hasPrefetchedBeans = useRef(false)

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
    }
  }, [])

  useEffect(() => {
    prefetchFeature('roasters')
    prefetchFeature('beans')
  }, [prefetchFeature])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="text-sm font-semibold tracking-wide">
            Coffee Brewing Tracker
          </div>
          <ThemeToggle />
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <aside className="rounded-lg border bg-card p-3">
          <nav className="flex flex-col gap-1">
            {featureRoutes.map((route) => (
              <NavLink
                key={route.href}
                to={route.href}
                onMouseEnter={() => prefetchFeature(route.path)}
                onFocus={() => prefetchFeature(route.path)}
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
        </aside>
        <main className="rounded-lg border bg-card p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
