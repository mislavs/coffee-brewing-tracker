import * as React from 'react'

import { focusNextFormField } from '@/lib/formFocusNavigation'
import { cn } from '@/lib/utils'

function Textarea({
  className,
  enterKeyHint,
  onKeyDown,
  ...props
}: React.ComponentProps<'textarea'>) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event)

    if (
      event.defaultPrevented ||
      event.key !== 'Enter' ||
      event.nativeEvent.isComposing ||
      enterKeyHint !== 'next'
    ) {
      return
    }

    if (focusNextFormField(event.currentTarget)) {
      event.preventDefault()
    }
  }

  return (
    <textarea
      enterKeyHint={enterKeyHint}
      data-slot="textarea"
      className={cn(
        'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      onKeyDown={handleKeyDown}
      {...props}
    />
  )
}

export { Textarea }
