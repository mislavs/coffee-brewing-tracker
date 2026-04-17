import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { toast } from 'sonner'

type InvalidateKeys<TInput> = QueryKey[] | ((variables: TInput) => QueryKey[])

type UseEntityMutationOptions<TInput, TResult> = {
  mutationFn: (input: TInput) => Promise<TResult>
  invalidateKeys: InvalidateKeys<TInput>
  successMessage: string
  shouldToast?: (variables: TInput) => boolean
}

export function useEntityMutation<TInput, TResult = unknown>({
  mutationFn,
  invalidateKeys,
  successMessage,
  shouldToast,
}: UseEntityMutationOptions<TInput, TResult>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (_data, variables) => {
      const keysToInvalidate =
        typeof invalidateKeys === 'function'
          ? invalidateKeys(variables)
          : invalidateKeys

      for (const queryKey of keysToInvalidate) {
        queryClient.invalidateQueries({ queryKey })
      }

      if (shouldToast === undefined || shouldToast(variables)) {
        toast.success(successMessage)
      }
    },
  })
}
