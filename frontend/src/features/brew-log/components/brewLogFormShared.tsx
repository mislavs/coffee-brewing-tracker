import type { AccessoryDto } from '@/lib/api/schemas'

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

export function sortOptionsByPreferredId(
  options: IdNameOption[],
  preferredId: string | undefined,
) {
  return sortOptionsByPreferredIds(options, preferredId ? [preferredId] : [])
}

export function sortOptionsByPreferredIds(
  options: IdNameOption[],
  preferredIds: string[] | undefined,
) {
  if (!preferredIds?.length) {
    return options
  }

  const preferredOrder = new Map(preferredIds.map((id, index) => [id, index]))
  const preferredOptions = options
    .filter((option) => preferredOrder.has(option.id))
    .sort(
      (left, right) =>
        (preferredOrder.get(left.id) ?? 0) - (preferredOrder.get(right.id) ?? 0),
    )

  if (preferredOptions.length === 0) {
    return options
  }

  const preferredIdSet = new Set(preferredIds)
  return [
    ...preferredOptions,
    ...options.filter((option) => !preferredIdSet.has(option.id)),
  ]
}

export function isAccessoryCompatibleWithBrewer(
  accessory: AccessoryDto,
  brewerId: string | null | undefined,
) {
  if (!brewerId) {
    return true
  }

  const compatibleBrewers = accessory.compatibleBrewers ?? []

  if (compatibleBrewers.length === 0) {
    return true
  }

  return compatibleBrewers.some((brewer) => brewer.id === brewerId)
}

export function filterAccessoriesByBrewer(
  accessories: AccessoryDto[],
  brewerId: string | null | undefined,
) {
  return accessories.filter((accessory) =>
    isAccessoryCompatibleWithBrewer(accessory, brewerId),
  )
}

export { getFieldErrorMessage } from '@/lib/formUtils'
