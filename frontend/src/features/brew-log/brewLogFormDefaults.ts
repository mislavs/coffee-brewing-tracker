import type { BrewLogDto } from '@/lib/api/schemas'
import type { BrewLogFormValues } from '@/features/brew-log/brewLogFormSchema'

function toDateTimeLocalValue(value: Date | string | null | undefined) {
  const parsed = value instanceof Date ? value : value ? new Date(value) : null
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return ''
  }

  const offsetMs = parsed.getTimezoneOffset() * 60_000
  return new Date(parsed.getTime() - offsetMs).toISOString().slice(0, 16)
}

function toBrewTimeParts(totalSeconds: number | null | undefined) {
  if (totalSeconds === null || totalSeconds === undefined || totalSeconds < 0) {
    return {
      brewTimeMinutes: undefined,
      brewTimeSeconds: undefined,
    }
  }

  return {
    brewTimeMinutes: Math.floor(totalSeconds / 60),
    brewTimeSeconds: totalSeconds % 60,
  }
}

export function createInitialBrewLogValues(): BrewLogFormValues {
  return {
    beanId: '',
    brewerId: '',
    grinderId: '',
    recipeId: '',
    dose: 0,
    waterAmount: 0,
    waterTemperature: undefined,
    grindSize: undefined,
    brewTimeMinutes: undefined,
    brewTimeSeconds: undefined,
    rating: undefined,
    tastingNotes: undefined,
    adjustmentIdeas: undefined,
    accessoryIds: [],
    brewedAt: toDateTimeLocalValue(new Date()),
  }
}

export function createInitialBrewLogValuesFromBrewLog(
  brewLog: BrewLogDto,
  options?: {
    clearResults?: boolean
    brewedAt?: Date | string | null | undefined
  },
): BrewLogFormValues {
  const clearResults = options?.clearResults ?? false

  return {
    ...toBrewTimeParts(clearResults ? undefined : brewLog.brewTimeSeconds),
    beanId: brewLog.beanId ?? '',
    brewerId: brewLog.brewerId ?? '',
    grinderId: brewLog.grinderId ?? '',
    recipeId: brewLog.recipeId ?? '',
    dose: brewLog.dose ?? 0,
    waterAmount: brewLog.waterAmount ?? 0,
    waterTemperature: brewLog.waterTemperature ?? undefined,
    grindSize: brewLog.grindSize ?? undefined,
    rating: clearResults ? undefined : (brewLog.rating ?? undefined),
    tastingNotes: clearResults ? undefined : (brewLog.notes ?? undefined),
    adjustmentIdeas: clearResults ? undefined : (brewLog.adjustmentIdeas ?? undefined),
    accessoryIds:
      brewLog.accessories
        ?.map((accessory) => accessory.id ?? '')
        .filter((id) => id.length > 0) ?? [],
    brewedAt: toDateTimeLocalValue(options?.brewedAt ?? brewLog.brewedAt),
  }
}
