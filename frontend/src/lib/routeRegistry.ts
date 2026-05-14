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

const loadRoasterDetailPage = () =>
  import('@/features/roasters/pages/RoasterDetailPage')

const loadRoasterFormPage = () =>
  import('@/features/roasters/pages/RoasterFormPage')

const loadBeanDetailPage = () => import('@/features/beans/pages/BeanDetailPage')

const loadBeanFormPage = () => import('@/features/beans/pages/BeanFormPage')

const loadRecipeDetailPage = () =>
  import('@/features/recipes/pages/RecipeDetailPage')

const loadRecipeFormPage = () => import('@/features/recipes/pages/RecipeFormPage')

const loadBrewLogDetailPage = () =>
  import('@/features/brew-log/pages/BrewLogDetailPage')

const loadBrewLogFormPage = () =>
  import('@/features/brew-log/pages/BrewLogFormPage')

const loadBrewerDetailPage = () =>
  import('@/features/equipment/pages/BrewerDetailPage')

const loadBrewerFormPage = () =>
  import('@/features/equipment/pages/BrewerFormPage')

const loadGrinderDetailPage = () =>
  import('@/features/equipment/pages/GrinderDetailPage')

const loadGrinderFormPage = () =>
  import('@/features/equipment/pages/GrinderFormPage')

const loadAccessoryDetailPage = () =>
  import('@/features/equipment/pages/AccessoryDetailPage')

const loadAccessoryFormPage = () =>
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
