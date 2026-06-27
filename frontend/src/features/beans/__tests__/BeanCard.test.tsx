import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { BeanCard } from '@/features/beans/components/BeanCard'
import type { BeanSummaryDto } from '@/lib/api/schemas'

const beanId = '11111111-1111-1111-1111-111111111111'

function createBean(overrides: Partial<BeanSummaryDto> = {}): BeanSummaryDto {
  return {
    id: beanId,
    name: 'Test Bean',
    roasterName: 'Test Roaster',
    roastProfile: 1,
    roastDate: null,
    bagWeight: 250,
    rating: null,
    hasImage: false,
    imageUrl: null,
    isAvailable: true,
    remainingQuantity: 125,
    ...overrides,
  }
}

function renderCard(bean: BeanSummaryDto) {
  return render(
    <MemoryRouter>
      <BeanCard bean={bean} />
    </MemoryRouter>,
  )
}

describe('BeanCard', () => {
  afterEach(() => {
    cleanup()
  })

  it('shows the price badge when the bean has a price per kg', () => {
    renderCard(createBean({ pricePerKg: 24.5 }))

    expect(screen.getByText(/\u20ac \/ kg/)).toBeTruthy()
  })

  it('hides the price badge when the bean price per kg is null', () => {
    renderCard(createBean({ pricePerKg: null }))

    expect(screen.queryByText(/\u20ac \/ kg/)).toBeNull()
    expect(screen.queryByText('\u2014')).toBeNull()
  })

  it('hides the price badge when the bean price per kg is omitted', () => {
    renderCard(createBean())

    expect(screen.queryByText(/\u20ac \/ kg/)).toBeNull()
    expect(screen.queryByText('\u2014')).toBeNull()
  })
})
