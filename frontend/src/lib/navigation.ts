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
