import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatsPage } from '@/features/stats/pages/StatsPage'

describe('StatsPage', () => {
  it('introduces the future stats area', () => {
    render(<StatsPage />)

    expect(screen.getByRole('heading', { name: 'Stats' })).toBeTruthy()
    expect(screen.getByText('This is where stats will live.')).toBeTruthy()
  })
})
