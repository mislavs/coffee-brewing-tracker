export const loadRoasterDetailPage = () =>
  import('@/features/roasters/pages/RoasterDetailPage')

export const loadRoasterFormPage = () =>
  import('@/features/roasters/pages/RoasterFormPage')

export const loadBeanDetailPage = () =>
  import('@/features/beans/pages/BeanDetailPage')

export const loadBeanFormPage = () => import('@/features/beans/pages/BeanFormPage')

export function preloadRoasterFeatureRoutes() {
  void Promise.all([loadRoasterDetailPage(), loadRoasterFormPage()])
}

export function preloadBeanFeatureRoutes() {
  void Promise.all([loadBeanDetailPage(), loadBeanFormPage()])
}
