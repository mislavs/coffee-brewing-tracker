import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { FeatureListToolbar } from '@/components/FeatureListToolbar'

describe('FeatureListToolbar', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the count and screen-reader heading', () => {
    render(
      <FeatureListToolbar
        heading="Beans"
        headingId="beans-heading"
        countLabel="3 beans"
        actions={<button type="button">Add Bean</button>}
      />,
    )

    expect(screen.getByText('3 beans')).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'Beans' }).classList.contains(
        'sr-only',
      ),
    ).toBe(true)
  })

  it('renders active chips only when provided', () => {
    const { rerender } = render(
      <FeatureListToolbar
        heading="Beans"
        headingId="beans-heading"
        countLabel="3 beans"
        activeChips={['Kenya', 'Descending']}
        actions={<button type="button">Add Bean</button>}
      />,
    )

    expect(screen.getByLabelText('Active filters')).toBeTruthy()
    expect(screen.getByText('Kenya')).toBeTruthy()
    expect(screen.getByText('Descending')).toBeTruthy()

    rerender(
      <FeatureListToolbar
        heading="Beans"
        headingId="beans-heading"
        countLabel="3 beans"
        actions={<button type="button">Add Bean</button>}
      />,
    )

    expect(screen.queryByLabelText('Active filters')).toBeNull()
  })

  it('places actions before controls', () => {
    render(
      <FeatureListToolbar
        heading="Beans"
        headingId="beans-heading"
        countLabel="3 beans"
        actions={<button type="button">Add Bean</button>}
        controls={<button type="button">Filters</button>}
      />,
    )

    expect(
      screen.getAllByRole('button').map((button) => button.textContent),
    ).toEqual(['Add Bean', 'Filters'])
  })
})
