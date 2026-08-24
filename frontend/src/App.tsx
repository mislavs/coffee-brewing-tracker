import { Suspense } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from '@/components/ui/sonner'
import { BeanListPage } from '@/features/beans/pages/BeanListPage'
import { BrewLogListPage } from '@/features/brew-log/pages/BrewLogListPage'
import { EquipmentPage } from '@/features/equipment/pages/EquipmentPage'
import { RecipeListPage } from '@/features/recipes/pages/RecipeListPage'
import { RoasterListPage } from '@/features/roasters/pages/RoasterListPage'
import {
  GraphsPage,
  StatsOverview,
  StatsPage,
} from '@/features/stats/pages/StatsPage'
import { queryClient } from '@/lib/queryClient'
import { defaultFeatureRoute, lazyAppRoutes } from '@/lib/routeRegistry'

function RouteFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <Skeleton className="h-52 w-full rounded-xl" />
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route
          path="/"
          element={
            <ErrorBoundary>
              <AppLayout />
            </ErrorBoundary>
          }
        >
          <Route
            index
            element={<Navigate to={defaultFeatureRoute} replace />}
          />
          <Route path="brew-log" element={<BrewLogListPage />} />
          <Route path="roasters" element={<RoasterListPage />} />
          <Route path="beans" element={<BeanListPage />} />
          <Route path="recipes" element={<RecipeListPage />} />
          <Route path="equipment" element={<EquipmentPage />} />
          <Route path="stats" element={<StatsPage />}>
            <Route index element={<StatsOverview />} />
            <Route path="graphs" element={<GraphsPage />} />
          </Route>
          {lazyAppRoutes.map(({ path, component: Component }) => (
            <Route
              key={path}
              path={path}
              element={
                <Suspense fallback={<RouteFallback />}>
                  <Component />
                </Suspense>
              }
            />
          ))}
          <Route
            path="*"
            element={<Navigate to={defaultFeatureRoute} replace />}
          />
        </Route>
      </Routes>
      <Toaster richColors />
    </QueryClientProvider>
  )
}

export default App
