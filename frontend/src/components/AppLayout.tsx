import { useCallback, useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Coffee,
  Globe,
  Icon as LucideLabIcon,
  Menu,
  Store,
  Wrench,
  X,
} from 'lucide-react'
import { coffeeBean } from '@lucide/lab'
import { DashboardStats } from '@/components/DashboardStats'
import { SettingsButton } from '@/components/SettingsButton'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
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

const expandedMapHeightClass = 'h-[30rem] md:h-[42rem] lg:h-[46rem]'

const navIcons: Record<string, LucideIcon> = {
  'brew-log': Coffee,
  equipment: Wrench,
  recipes: BookOpen,
  roasters: Store,
}

export function AppLayout() {
  const { settings } = useSettings()
  const navigate = useNavigate()
  const [isMapExpanded, setIsMapExpanded] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
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

  const renderFeatureLinks = useCallback(
    ({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void } = {}) =>
      featureRoutes.map((route) => {
        const Icon = navIcons[route.path]

        return (
          <NavLink
            key={route.href}
            to={route.href}
            onMouseEnter={() => prefetchFeature(route.path)}
            onFocus={() => prefetchFeature(route.path)}
            onTouchStart={() => prefetchFeature(route.path)}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1.5 rounded-lg font-medium transition-all duration-200',
                mobile ? 'w-full px-4 py-3 text-base' : 'px-3 py-2 text-sm',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            {Icon ? <Icon className="size-3.5" /> : null}
            {route.path === 'beans' ? (
              <LucideLabIcon iconNode={coffeeBean} className="size-3.5" />
            ) : null}
            <span className="truncate">{route.title}</span>
          </NavLink>
        )
      }),
    [prefetchFeature],
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex max-w-7xl flex-nowrap items-center gap-2 px-4 py-3 sm:gap-4 sm:px-6 md:flex-wrap lg:px-8">
          <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-lg md:hidden"
                aria-label="Open navigation menu"
                title="Open navigation menu"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[18rem] gap-0 p-0">
              <SheetHeader className="border-b px-4 py-4">
                <SheetTitle>Navigate</SheetTitle>
                <SheetDescription>
                  Jump between coffee tracking features.
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-1 flex-col gap-1 p-3">
                {renderFeatureLinks({
                  mobile: true,
                  onNavigate: () => setIsMobileNavOpen(false),
                })}
              </nav>
            </SheetContent>
          </Sheet>
          <NavLink
            to="/"
            className="group flex min-w-0 items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Coffee className="size-4" />
            </div>
            <span className="hidden text-base font-bold tracking-tight min-[360px]:inline">
              BeanMeridian
            </span>
          </NavLink>
          <nav className="hidden flex-1 flex-wrap gap-1 md:flex">
            {renderFeatureLinks()}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-0.5">
            <Button
              type="button"
              variant={isMapExpanded ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-lg"
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
              : 'pointer-events-none z-0 -mt-20 h-[22rem] sm:h-[34rem]',
          )}
          aria-hidden={!isMapExpanded}
        >
          <WorldMap
            compact
            mapHeightClassName={isMapExpanded ? expandedMapHeightClass : undefined}
            onCountryClick={(country) => {
              setIsMapExpanded(false)
              navigate(`/beans?country=${encodeURIComponent(country.countryId)}`)
            }}
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
