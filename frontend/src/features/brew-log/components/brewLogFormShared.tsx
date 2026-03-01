type OptionSource = {
  id?: string | null
  name?: string | null
}

export type IdNameOption = {
  id: string
  name: string
}

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

export { getFieldErrorMessage } from '@/lib/formUtils'
