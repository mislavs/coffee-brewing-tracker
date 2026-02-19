import { lazy, Suspense } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PlaceholderPage } from '@/components/PlaceholderPage'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from '@/components/ui/sonner'
import { BeanListPage } from '@/features/beans/pages/BeanListPage'
import { RoasterListPage } from '@/features/roasters/pages/RoasterListPage'
import { defaultFeatureRoute, featureRoutes } from '@/lib/navigation'
import { queryClient } from '@/lib/queryClient'
import {
  loadBeanDetailPage,
  loadBeanFormPage,
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
const BeanFormPage = lazy(() =>
  loadBeanFormPage().then((m) => ({
    default: m.BeanFormPage,
  })),
)
const placeholderFeatureRoutes = featureRoutes.filter(
  (route) => route.path !== 'roasters' && route.path !== 'beans',
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
          <Route
            path="beans/new"
            element={
              <Suspense fallback={<RouteFallback />}>
                <BeanFormPage />
              </Suspense>
            }
          />
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
