import { lazy, Suspense } from 'react'
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
import { WorldMapPage } from '@/features/world-map/pages/WorldMapPage'
import { defaultFeatureRoute, featureRoutes } from '@/lib/navigation'
import { queryClient } from '@/lib/queryClient'
import {
  loadAccessoryDetailPage,
  loadAccessoryFormPage,
  loadBeanDetailPage,
  loadBrewLogDetailPage,
  loadBrewLogFormPage,
  loadBrewerDetailPage,
  loadBrewerFormPage,
  loadGrinderDetailPage,
  loadGrinderFormPage,
  loadRecipeDetailPage,
  loadRecipeFormPage,
  loadRoasterDetailPage,
  loadRoasterFormPage,
} from '@/lib/routePreload'

const RoasterDetailPage = lazy(() =>
  loadRoasterDetailPage().then((m) => ({
    default: m.RoasterDetailPage,
  })),
)
const RoasterFormPage = lazy(() =>
  loadRoasterFormPage().then((m) => ({
    default: m.RoasterFormPage,
  })),
)
const BeanDetailPage = lazy(() =>
  loadBeanDetailPage().then((m) => ({
    default: m.BeanDetailPage,
  })),
)
const BrewLogDetailPage = lazy(() =>
  loadBrewLogDetailPage().then((m) => ({
    default: m.BrewLogDetailPage,
  })),
)
const BrewLogFormPage = lazy(() =>
  loadBrewLogFormPage().then((m) => ({
    default: m.BrewLogFormPage,
  })),
)
const BrewerDetailPage = lazy(() =>
  loadBrewerDetailPage().then((m) => ({
    default: m.BrewerDetailPage,
  })),
)
const BrewerFormPage = lazy(() =>
  loadBrewerFormPage().then((m) => ({
    default: m.BrewerFormPage,
  })),
)
const GrinderDetailPage = lazy(() =>
  loadGrinderDetailPage().then((m) => ({
    default: m.GrinderDetailPage,
  })),
)
const GrinderFormPage = lazy(() =>
  loadGrinderFormPage().then((m) => ({
    default: m.GrinderFormPage,
  })),
)
const AccessoryDetailPage = lazy(() =>
  loadAccessoryDetailPage().then((m) => ({
    default: m.AccessoryDetailPage,
  })),
)
const AccessoryFormPage = lazy(() =>
  loadAccessoryFormPage().then((m) => ({
    default: m.AccessoryFormPage,
  })),
)
const RecipeDetailPage = lazy(() =>
  loadRecipeDetailPage().then((m) => ({
    default: m.RecipeDetailPage,
  })),
)
const RecipeFormPage = lazy(() =>
  loadRecipeFormPage().then((m) => ({
    default: m.RecipeFormPage,
  })),
)
const placeholderFeatureRoutes = featureRoutes.filter(
  (route) =>
    route.path !== 'roasters' &&
    route.path !== 'beans' &&
    route.path !== 'equipment' &&
    route.path !== 'recipes' &&
    route.path !== 'brew-log' &&
    route.path !== 'map',
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
          <Route path="map" element={<WorldMapPage />} />
          <Route
            path="brew-log/new"
            element={
              <Suspense fallback={<RouteFallback />}>
                <BrewLogFormPage />
              </Suspense>
            }
          />
          <Route
            path="brew-log/:id"
            element={
              <Suspense fallback={<RouteFallback />}>
                <BrewLogDetailPage />
              </Suspense>
            }
          />
          <Route
            path="brew-log/:id/edit"
            element={
              <Suspense fallback={<RouteFallback />}>
                <BrewLogFormPage />
              </Suspense>
            }
          />
          <Route path="roasters" element={<RoasterListPage />} />
          <Route
            path="roasters/new"
            element={
              <Suspense fallback={<RouteFallback />}>
                <RoasterFormPage />
              </Suspense>
            }
          />
          <Route
            path="roasters/:id"
            element={
              <Suspense fallback={<RouteFallback />}>
                <RoasterDetailPage />
              </Suspense>
            }
          />
          <Route
            path="roasters/:id/edit"
            element={
              <Suspense fallback={<RouteFallback />}>
                <RoasterFormPage />
              </Suspense>
            }
          />
          <Route path="beans" element={<BeanListPage />} />
          <Route path="beans/new" element={<BeanFormPage />} />
          <Route
            path="beans/:id"
            element={
              <Suspense fallback={<RouteFallback />}>
                <BeanDetailPage />
              </Suspense>
            }
          />
          <Route
            path="beans/:id/edit"
            element={
              <Suspense fallback={<RouteFallback />}>
                <BeanFormPage />
              </Suspense>
            }
          />
          <Route path="recipes" element={<RecipeListPage />} />
          <Route
            path="recipes/new"
            element={
              <Suspense fallback={<RouteFallback />}>
                <RecipeFormPage />
              </Suspense>
            }
          />
          <Route
            path="recipes/:id"
            element={
              <Suspense fallback={<RouteFallback />}>
                <RecipeDetailPage />
              </Suspense>
            }
          />
          <Route
            path="recipes/:id/edit"
            element={
              <Suspense fallback={<RouteFallback />}>
                <RecipeFormPage />
              </Suspense>
            }
          />
          <Route path="equipment" element={<EquipmentPage />} />
          <Route
            path="equipment/brewers/new"
            element={
              <Suspense fallback={<RouteFallback />}>
                <BrewerFormPage />
              </Suspense>
            }
          />
          <Route
            path="equipment/brewers/:id"
            element={
              <Suspense fallback={<RouteFallback />}>
                <BrewerDetailPage />
              </Suspense>
            }
          />
          <Route
            path="equipment/brewers/:id/edit"
            element={
              <Suspense fallback={<RouteFallback />}>
                <BrewerFormPage />
              </Suspense>
            }
          />
          <Route
            path="equipment/grinders/new"
            element={
              <Suspense fallback={<RouteFallback />}>
                <GrinderFormPage />
              </Suspense>
            }
          />
          <Route
            path="equipment/grinders/:id"
            element={
              <Suspense fallback={<RouteFallback />}>
                <GrinderDetailPage />
              </Suspense>
            }
          />
          <Route
            path="equipment/grinders/:id/edit"
            element={
              <Suspense fallback={<RouteFallback />}>
                <GrinderFormPage />
              </Suspense>
            }
          />
          <Route
            path="equipment/accessories/new"
            element={
              <Suspense fallback={<RouteFallback />}>
                <AccessoryFormPage />
              </Suspense>
            }
          />
          <Route
            path="equipment/accessories/:id"
            element={
              <Suspense fallback={<RouteFallback />}>
                <AccessoryDetailPage />
              </Suspense>
            }
          />
          <Route
            path="equipment/accessories/:id/edit"
            element={
              <Suspense fallback={<RouteFallback />}>
                <AccessoryFormPage />
              </Suspense>
            }
          />
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
