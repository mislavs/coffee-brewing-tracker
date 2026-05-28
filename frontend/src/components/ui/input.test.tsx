import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { KeyboardEvent } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

describe('mobile keyboard field navigation', () => {
  afterEach(() => {
    cleanup()
  })

  it('moves focus to the next input when enterKeyHint is next', () => {
    render(
      <form>
        <Input aria-label="First" enterKeyHint="next" />
        <Input aria-label="Second" />
      </form>,
    )

    const firstInput = screen.getByLabelText('First')
    const secondInput = screen.getByLabelText('Second')

    firstInput.focus()
    fireEvent.keyDown(firstInput, { key: 'Enter' })

    expect(document.activeElement).toBe(secondInput)
  })

  it('skips disabled, hidden, and readonly fields', () => {
    render(
      <form>
        <Input aria-label="First" enterKeyHint="next" />
        <Input aria-label="Disabled" disabled />
        <Input aria-label="Hidden" hidden />
        <Input aria-label="Readonly" readOnly />
        <button type="button">Not a field</button>
        <Input aria-label="Second" />
      </form>,
    )

    const firstInput = screen.getByLabelText('First')
    const secondInput = screen.getByLabelText('Second')

    firstInput.focus()
    fireEvent.keyDown(firstInput, { key: 'Enter' })

    expect(document.activeElement).toBe(secondInput)
  })

  it('respects an existing keydown handler that prevents default', () => {
    const onKeyDown = vi.fn((event: KeyboardEvent<HTMLInputElement>) => {
      event.preventDefault()
    })

    render(
      <form>
        <Input aria-label="First" enterKeyHint="next" onKeyDown={onKeyDown} />
        <Input aria-label="Second" />
      </form>,
    )

    const firstInput = screen.getByLabelText('First')

    firstInput.focus()
    fireEvent.keyDown(firstInput, { key: 'Enter' })

    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(document.activeElement).toBe(firstInput)
  })

  it('does not move focus when enterKeyHint is done', () => {
    render(
      <form>
        <Input aria-label="First" enterKeyHint="done" />
        <Input aria-label="Second" />
      </form>,
    )

    const firstInput = screen.getByLabelText('First')

    firstInput.focus()
    fireEvent.keyDown(firstInput, { key: 'Enter' })

    expect(document.activeElement).toBe(firstInput)
  })

  it('moves focus from a textarea with enterKeyHint next', () => {
    render(
      <form>
        <Textarea aria-label="First" enterKeyHint="next" />
        <Textarea aria-label="Second" />
      </form>,
    )

    const firstTextarea = screen.getByLabelText('First')
    const secondTextarea = screen.getByLabelText('Second')

    firstTextarea.focus()
    fireEvent.keyDown(firstTextarea, { key: 'Enter' })

    expect(document.activeElement).toBe(secondTextarea)
  })
})
