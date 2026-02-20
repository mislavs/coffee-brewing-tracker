export const loadRoasterDetailPage = () =>
  import('@/features/roasters/pages/RoasterDetailPage')

export const loadRoasterFormPage = () =>
  import('@/features/roasters/pages/RoasterFormPage')

export const loadBeanDetailPage = () =>
  import('@/features/beans/pages/BeanDetailPage')

export const loadBeanFormPage = () => import('@/features/beans/pages/BeanFormPage')

export const loadEquipmentPage = () =>
  import('@/features/equipment/pages/EquipmentPage')

export const loadBrewerDetailPage = () =>
  import('@/features/equipment/pages/BrewerDetailPage')

export const loadBrewerFormPage = () =>
  import('@/features/equipment/pages/BrewerFormPage')

export const loadGrinderDetailPage = () =>
  import('@/features/equipment/pages/GrinderDetailPage')

export const loadGrinderFormPage = () =>
  import('@/features/equipment/pages/GrinderFormPage')

export const loadAccessoryDetailPage = () =>
  import('@/features/equipment/pages/AccessoryDetailPage')

export const loadAccessoryFormPage = () =>
  import('@/features/equipment/pages/AccessoryFormPage')

export function preloadRoasterFeatureRoutes() {
  void Promise.all([loadRoasterDetailPage(), loadRoasterFormPage()])
}

export function preloadBeanFeatureRoutes() {
  void Promise.all([loadBeanDetailPage(), loadBeanFormPage()])
}

export function preloadEquipmentFeatureRoutes() {
  void Promise.all([
    loadEquipmentPage(),
    loadBrewerDetailPage(),
    loadBrewerFormPage(),
    loadGrinderDetailPage(),
    loadGrinderFormPage(),
    loadAccessoryDetailPage(),
    loadAccessoryFormPage(),
  ])
}
