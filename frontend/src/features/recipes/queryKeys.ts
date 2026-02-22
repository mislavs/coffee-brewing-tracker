export const recipeQueryKeys = {
  all: (brewerId?: string) => ['recipes', { brewerId }] as const,
  detail: (id: string) => ['recipes', id] as const,
}
