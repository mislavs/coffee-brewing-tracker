import { Suspense } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PlaceholderPage } from '@/components/PlaceholderPage'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from '@/components/ui/sonner'
import { BeanListPage } from '@/features/beans/pages/BeanListPage'
import { BeanFormPage } from '@/features/beans/pages/BeanFormPage'
import { BrewLogListPage } from '@/features/brew-log/pages/BrewLogListPage'
import { EquipmentPage } from '@/features/equipment/pages/EquipmentPage'
import { RecipeListPage } from '@/features/recipes/pages/RecipeListPage'
import { RoasterListPage } from '@/features/roasters/pages/RoasterListPage'
import { defaultFeatureRoute, featureRoutes } from '@/lib/navigation'
import { queryClient } from '@/lib/queryClient'
import {
  implementedFeaturePaths,
  lazyAppRoutes,
} from '@/lib/routeRegistry'

const placeholderFeatureRoutes = featureRoutes.filter(
  (route) => !implementedFeaturePaths.includes(route.path),
)

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
          <Route path="beans/new" element={<BeanFormPage />} />
          <Route
            path="beans/:id/edit"
            element={
              <Suspense fallback={<RouteFallback />}>
                <BeanFormPage />
              </Suspense>
            }
          />
          <Route path="recipes" element={<RecipeListPage />} />
          <Route path="equipment" element={<EquipmentPage />} />
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
          {placeholderFeatureRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<PlaceholderPage title={route.title} />}
            />
          ))}
          <Route
            path="*"
            element={<Navigate to={defaultFeatureRoute} replace />}
          />
        </Route>
        <Route
          path="*"
          element={<Navigate to={defaultFeatureRoute} replace />}
        />
      </Routes>
      <Toaster richColors />
    </QueryClientProvider>
  )
}

export default App
