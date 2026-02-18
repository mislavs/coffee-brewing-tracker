export const roasterQueryKeys = {
  all: ['roasters'] as const,
  detail: (id: string) => ['roasters', id] as const,
}
