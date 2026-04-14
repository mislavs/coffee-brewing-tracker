import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export type FeatureRoute = {
  path: string
  href: `/${string}`
  title: string
}

export const featureRoutes: FeatureRoute[] = [
  { path: 'brew-log', href: '/brew-log', title: 'Brew Log' },
  { path: 'beans', href: '/beans', title: 'Beans' },
  { path: 'equipment', href: '/equipment', title: 'Equipment' },
  { path: 'recipes', href: '/recipes', title: 'Recipes' },
  { path: 'roasters', href: '/roasters', title: 'Roasters' },
]

export const defaultFeatureRoute = '/brew-log'

export const loadRoasterDetailPage = () =>
  import('@/features/roasters/pages/RoasterDetailPage')

export const loadRoasterFormPage = () =>
  import('@/features/roasters/pages/RoasterFormPage')

export const loadBeanDetailPage = () => import('@/features/beans/pages/BeanDetailPage')

export const loadBeanFormPage = () => import('@/features/beans/pages/BeanFormPage')

export const loadRecipeDetailPage = () =>
  import('@/features/recipes/pages/RecipeDetailPage')

export const loadRecipeFormPage = () => import('@/features/recipes/pages/RecipeFormPage')

export const loadBrewLogDetailPage = () =>
  import('@/features/brew-log/pages/BrewLogDetailPage')

export const loadBrewLogFormPage = () =>
  import('@/features/brew-log/pages/BrewLogFormPage')

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

export function preloadRecipeFeatureRoutes() {
  void Promise.all([loadRecipeDetailPage(), loadRecipeFormPage()])
}

export function preloadBrewLogFeatureRoutes() {
  void Promise.all([loadBrewLogDetailPage(), loadBrewLogFormPage()])
}

export function preloadEquipmentFeatureRoutes() {
  void Promise.all([
    loadBrewerDetailPage(),
    loadBrewerFormPage(),
    loadGrinderDetailPage(),
    loadGrinderFormPage(),
    loadAccessoryDetailPage(),
    loadAccessoryFormPage(),
  ])
}

type RouteModule = Record<string, unknown>
type RouteLoader = () => Promise<RouteModule>

function lazyPage(
  loader: RouteLoader,
  exportName: string,
): LazyExoticComponent<ComponentType> {
  return lazy(async () => {
    const module = await loader()
    const component = module[exportName]
    if (typeof component !== 'function') {
      throw new Error(`Export "${exportName}" is not a valid route component.`)
    }

    return { default: component as ComponentType }
  })
}

const BrewLogFormPage = lazyPage(loadBrewLogFormPage, 'BrewLogFormPage')
const BrewLogDetailPage = lazyPage(loadBrewLogDetailPage, 'BrewLogDetailPage')
const RoasterDetailPage = lazyPage(loadRoasterDetailPage, 'RoasterDetailPage')
const RoasterFormPage = lazyPage(loadRoasterFormPage, 'RoasterFormPage')
const BeanDetailPage = lazyPage(loadBeanDetailPage, 'BeanDetailPage')
const BeanFormPage = lazyPage(loadBeanFormPage, 'BeanFormPage')
const BrewerDetailPage = lazyPage(loadBrewerDetailPage, 'BrewerDetailPage')
const BrewerFormPage = lazyPage(loadBrewerFormPage, 'BrewerFormPage')
const GrinderDetailPage = lazyPage(loadGrinderDetailPage, 'GrinderDetailPage')
const GrinderFormPage = lazyPage(loadGrinderFormPage, 'GrinderFormPage')
const AccessoryDetailPage = lazyPage(loadAccessoryDetailPage, 'AccessoryDetailPage')
const AccessoryFormPage = lazyPage(loadAccessoryFormPage, 'AccessoryFormPage')
const RecipeDetailPage = lazyPage(loadRecipeDetailPage, 'RecipeDetailPage')
const RecipeFormPage = lazyPage(loadRecipeFormPage, 'RecipeFormPage')

export type LazyAppRoute = {
  path: string
  component: LazyExoticComponent<ComponentType>
}

export const lazyAppRoutes: LazyAppRoute[] = [
  { path: 'brew-log/new', component: BrewLogFormPage },
  { path: 'brew-log/:id', component: BrewLogDetailPage },
  { path: 'brew-log/:id/edit', component: BrewLogFormPage },
  { path: 'beans/new', component: BeanFormPage },
  { path: 'beans/:id/edit', component: BeanFormPage },
  { path: 'roasters/new', component: RoasterFormPage },
  { path: 'roasters/:id', component: RoasterDetailPage },
  { path: 'roasters/:id/edit', component: RoasterFormPage },
  { path: 'beans/:id', component: BeanDetailPage },
  { path: 'recipes/new', component: RecipeFormPage },
  { path: 'recipes/:id', component: RecipeDetailPage },
  { path: 'recipes/:id/edit', component: RecipeFormPage },
  { path: 'equipment/brewers/new', component: BrewerFormPage },
  { path: 'equipment/brewers/:id', component: BrewerDetailPage },
  { path: 'equipment/brewers/:id/edit', component: BrewerFormPage },
  { path: 'equipment/grinders/new', component: GrinderFormPage },
  { path: 'equipment/grinders/:id', component: GrinderDetailPage },
  { path: 'equipment/grinders/:id/edit', component: GrinderFormPage },
  { path: 'equipment/accessories/new', component: AccessoryFormPage },
  { path: 'equipment/accessories/:id', component: AccessoryDetailPage },
  { path: 'equipment/accessories/:id/edit', component: AccessoryFormPage },
]
