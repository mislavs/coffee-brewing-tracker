type OptionSource = {
  id?: string | null
  name?: string | null
}

export type IdNameOption = {
  id: string
  name: string
}

export const textareaFieldClassName =
  'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50'

export function toIdNameOptions<T extends OptionSource>(
  items: T[],
  fallbackName: string,
): IdNameOption[] {
  return items.flatMap((item) =>
    item.id
      ? [
          {
            id: item.id,
            name: item.name ?? fallbackName,
          },
        ]
      : [],
  )
}

export function getFieldErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return undefined
  }

  const errorRecord = error as { message?: unknown }
  return typeof errorRecord.message === 'string' ? errorRecord.message : undefined
}
