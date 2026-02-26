import { useCallback, useEffect, useRef, useState } from 'react'
import { Globe, X } from 'lucide-react'
import { DashboardStats } from '@/components/DashboardStats'
import { SettingsButton } from '@/components/SettingsButton'
import { Button } from '@/components/ui/button'
import { NavLink, Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/ThemeToggle'
import { WorldMap } from '@/features/world-map/components/WorldMap'
import { beanQueryKeys } from '@/features/beans/queryKeys'
import { brewLogQueryKeys } from '@/features/brew-log/queryKeys'
import {
  accessoryQueryKeys,
  brewerQueryKeys,
  grinderQueryKeys,
} from '@/features/equipment/queryKeys'
import { recipeQueryKeys } from '@/features/recipes/queryKeys'
import { roasterQueryKeys } from '@/features/roasters/queryKeys'
import { apiClient } from '@/lib/api-client'
import { useSettings } from '@/hooks/useSettings'
import { featureRoutes } from '@/lib/navigation'
import { queryClient } from '@/lib/queryClient'
import {
  preloadBeanFeatureRoutes,
  preloadBrewLogFeatureRoutes,
  preloadEquipmentFeatureRoutes,
  preloadRecipeFeatureRoutes,
  preloadRoasterFeatureRoutes,
} from '@/lib/routePreload'
import { cn } from '@/lib/utils'

const expandedMapHeightClass = 'h-[42rem] md:h-[46rem]'

export function AppLayout() {
  const { settings } = useSettings()
  const [isMapExpanded, setIsMapExpanded] = useState(false)
  const hasPrefetchedRoasters = useRef(false)
  const hasPrefetchedBeans = useRef(false)
  const hasPrefetchedBrewLog = useRef(false)
  const hasPrefetchedRecipes = useRef(false)
  const hasPrefetchedEquipment = useRef(false)
  const shouldRenderWorldMap = settings.showWorldMap || isMapExpanded

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

    if (featurePath === 'brew-log') {
      if (hasPrefetchedBrewLog.current) {
        return
      }

      hasPrefetchedBrewLog.current = true
      preloadBrewLogFeatureRoutes()
      void queryClient.prefetchQuery({
        queryKey: brewLogQueryKeys.all(),
        queryFn: async () => (await apiClient.api.brewLogs.get()) ?? [],
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
      return
    }

    if (featurePath === 'recipes') {
      if (hasPrefetchedRecipes.current) {
        return
      }

      hasPrefetchedRecipes.current = true
      preloadRecipeFeatureRoutes()
      void queryClient.prefetchQuery({
        queryKey: recipeQueryKeys.all(),
        queryFn: async () => (await apiClient.api.recipes.get()) ?? [],
        staleTime: 2 * 60_000,
      })
    }
  }, [])

  useEffect(() => {
    if (!isMapExpanded) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMapExpanded(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMapExpanded])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="relative z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="text-sm font-semibold tracking-wide">BeanMeridian</div>
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
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={isMapExpanded ? 'secondary' : 'ghost'}
              size="icon"
              aria-label={isMapExpanded ? 'Close map view' : 'Open map view'}
              aria-expanded={isMapExpanded}
              aria-pressed={isMapExpanded}
              title={isMapExpanded ? 'Close map view' : 'Open map view'}
              onClick={() => {
                setIsMapExpanded((current) => !current)
              }}
            >
              {isMapExpanded ? <X className="size-4" /> : <Globe className="size-4" />}
            </Button>
            <SettingsButton />
            <ThemeToggle />
          </div>
        </div>
      </header>
      {shouldRenderWorldMap ? (
        <div
          className={cn(
            'relative left-1/2 w-screen -translate-x-1/2 overflow-hidden origin-top transform-gpu transition-[margin-top,height] duration-[900ms] ease-in-out motion-reduce:transition-none',
            isMapExpanded
              ? 'pointer-events-auto z-20 mt-8 h-[calc(100dvh-6rem)]'
              : 'pointer-events-none z-0 -mt-20 h-[34rem]',
          )}
          aria-hidden={!isMapExpanded}
        >
          <WorldMap
            compact
            mapHeightClassName={isMapExpanded ? expandedMapHeightClass : undefined}
          />
        </div>
      ) : null}
      <div
        className={cn(
          'mx-auto flex max-w-7xl flex-col px-4 transition-[opacity,max-height] duration-300 ease-out sm:px-6 lg:px-8',
          isMapExpanded
            ? 'pointer-events-none relative z-10 max-h-0 overflow-hidden opacity-0'
            : settings.showWorldMap
              ? 'relative z-20 max-h-[200rem] -mt-32 gap-5 pb-6 pt-0 opacity-100'
              : 'max-h-[200rem] gap-6 py-6 opacity-100',
        )}
      >
        <DashboardStats />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
