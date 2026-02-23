export const recipeQueryKeys = {
  root: ['recipes'] as const,
  all: (brewerId?: string) => ['recipes', { brewerId }] as const,
  detail: (id: string) => ['recipes', id] as const,
}
