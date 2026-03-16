import { useEffect, useState } from 'react'
import type { SetURLSearchParams } from 'react-router-dom'

type UseDebouncedSearchParamOptions = {
  paramName: string
  value: string
  setSearchParams: SetURLSearchParams
  delay?: number
}

export function useDebouncedSearchParam({
  paramName,
  value,
  setSearchParams,
  delay = 300,
}: UseDebouncedSearchParamOptions) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const normalized = draft.trim()
      const normalizedValue = value.trim()

      if (normalized === normalizedValue) {
        return
      }

      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          if (normalized) {
            next.set(paramName, normalized)
          } else {
            next.delete(paramName)
          }

          return next
        },
        { replace: true },
      )
    }, delay)

    return () => clearTimeout(timeoutId)
  }, [delay, draft, paramName, setSearchParams, value])

  return [draft, setDraft] as const
}
