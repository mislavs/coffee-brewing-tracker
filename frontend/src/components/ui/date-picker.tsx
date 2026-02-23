import { useMemo, useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { toDisplayDate, toIsoDate } from '@/lib/date'

type DatePickerProps = {
  id?: string
  value?: string
  onChange: (value: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  onInvalidInput?: () => void
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

function parseIsoDate(value: string | undefined) {
  if (!value) {
    return undefined
  }

  const match = ISO_DATE_PATTERN.exec(value)
  if (!match) {
    return undefined
  }

  const [, yearText, monthText, dayText] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const parsed = new Date(year, month - 1, day)
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return undefined
  }

  return parsed
}

function toIsoDateText(date: Date) {
  const year = String(date.getFullYear())
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = 'dd.mm.yyyy',
  disabled = false,
  className,
  onInvalidInput,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [draftOverride, setDraftOverride] = useState<string | null>(null)
  const selectedDate = useMemo(() => parseIsoDate(value), [value])
  const draft = draftOverride ?? toDisplayDate(value)

  const commitDraft = () => {
    const normalized = draft.trim()
    if (!normalized) {
      onChange(undefined)
      setDraftOverride(null)
      return
    }

    const isoDate = toIsoDate(normalized)
    if (!isoDate) {
      onInvalidInput?.()
      return
    }

    onChange(isoDate)
    setDraftOverride(null)
  }

  const handleCalendarSelect = (nextDate: Date | undefined) => {
    if (!nextDate) {
      onChange(undefined)
      setDraftOverride(null)
      setOpen(false)
      return
    }

    const isoDate = toIsoDateText(nextDate)
    onChange(isoDate)
    setDraftOverride(null)
    setOpen(false)
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={draft}
        onChange={(event) => setDraftOverride(event.target.value)}
        onBlur={commitDraft}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            commitDraft()
          }
        }}
        disabled={disabled}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Open calendar"
            disabled={disabled}
          >
            <CalendarIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar mode="single" selected={selectedDate} onSelect={handleCalendarSelect} />
        </PopoverContent>
      </Popover>
    </div>
  )
}
