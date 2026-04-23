import type { Guid } from '@/lib/api-types'
import type {
  CreateBrewLogRequest,
  CreateBrewLogResponse,
} from '@/lib/api/schemas'

export type BrewLogLowStockPrompt = {
  beanId: Guid
  remainingQuantity: number
}

export function getBrewLogLowStockPrompt(
  request: CreateBrewLogRequest,
  response: CreateBrewLogResponse | undefined,
): BrewLogLowStockPrompt | null {
  const remainingQuantity = response?.remainingBeanQuantity

  if (
    typeof remainingQuantity !== 'number' ||
    remainingQuantity >= 15 ||
    !request.beanId
  ) {
    return null
  }

  return {
    beanId: request.beanId as Guid,
    remainingQuantity,
  }
}
