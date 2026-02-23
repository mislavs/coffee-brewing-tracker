import { useMemo, useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { toDisplayDate, toDisplayDateTime, toIsoDateTime } from '@/lib/date'

type DateTimePickerProps = {
  id?: string
  value?: string
  onChange: (value: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  onInvalidInput?: () => void
}

const DISPLAY_DATE_TIME_PATTERN = /^(\d{2}\.\d{2}\.\d{4})\s+(\d{2}:\d{2})$/
const ISO_DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
const TIME_24_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

function parseIsoDateTime(value: string | undefined) {
  if (!value) {
    return undefined
  }

  const match = ISO_DATE_TIME_PATTERN.exec(value)
  if (!match) {
    return undefined
  }

  const [, yearText, monthText, dayText, hourText, minuteText] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const hour = Number(hourText)
  const minute = Number(minuteText)
  const parsed = new Date(year, month - 1, day, hour, minute)
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

function extractTime(displayDateTime: string) {
  const match = DISPLAY_DATE_TIME_PATTERN.exec(displayDateTime.trim())
  return match ? match[2] : undefined
}

function extractDate(displayDateTime: string) {
  const match = DISPLAY_DATE_TIME_PATTERN.exec(displayDateTime.trim())
  return match ? match[1] : undefined
}

function extractTimeParts(displayDateTime: string) {
  const timeText = extractTime(displayDateTime)
  if (!timeText) {
    return undefined
  }

  const match = TIME_24_PATTERN.exec(timeText)
  if (!match) {
    return undefined
  }

  const [, hour, minute] = match
  return { hour, minute }
}

function normalizeTimePart(value: string, max: number) {
  const digits = value.replace(/\D/g, '').slice(0, 2)
  if (!digits) {
    return '00'
  }

  const numeric = Number(digits)
  if (!Number.isInteger(numeric)) {
    return undefined
  }

  if (numeric < 0 || numeric > max) {
    return undefined
  }

  return String(numeric).padStart(2, '0')
}

export function DateTimePicker({
  id,
  value,
  onChange,
  placeholder = 'dd.mm.yyyy HH:mm (24h)',
  disabled = false,
  className,
  onInvalidInput,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)
  const [draftOverride, setDraftOverride] = useState<string | null>(null)
  const [hourOverride, setHourOverride] = useState<string | null>(null)
  const [minuteOverride, setMinuteOverride] = useState<string | null>(null)
  const selectedDate = useMemo(() => parseIsoDateTime(value), [value])
  const displayDateTime = toDisplayDateTime(value)
  const displayTimeParts = extractTimeParts(displayDateTime)
  const draft = draftOverride ?? displayDateTime
  const hourDraft = hourOverride ?? displayTimeParts?.hour ?? '00'
  const minuteDraft = minuteOverride ?? displayTimeParts?.minute ?? '00'

  const commitDraft = () => {
    const normalized = draft.trim()
    if (!normalized) {
      onChange(undefined)
      setDraftOverride(null)
      setHourOverride(null)
      setMinuteOverride(null)
      return
    }

    const isoDateTime = toIsoDateTime(normalized)
    if (!isoDateTime) {
      onInvalidInput?.()
      return
    }

    onChange(isoDateTime)
    setDraftOverride(null)
    setHourOverride(null)
    setMinuteOverride(null)
  }

  const commitTime = (nextHour: string, nextMinute: string) => {
    const normalizedHour = normalizeTimePart(nextHour, 23)
    const normalizedMinute = normalizeTimePart(nextMinute, 59)
    if (!normalizedHour || !normalizedMinute) {
      onInvalidInput?.()
      return
    }

    const normalizedTime = `${normalizedHour}:${normalizedMinute}`
    const dateText =
      extractDate(draft) ?? (selectedDate ? toDisplayDate(toIsoDateText(selectedDate)) : undefined)
    if (!dateText) {
      return
    }

    const isoDateTime = toIsoDateTime(`${dateText} ${normalizedTime}`)
    if (!isoDateTime) {
      return
    }

    onChange(isoDateTime)
    setDraftOverride(null)
    setHourOverride(null)
    setMinuteOverride(null)
  }

  const handleCalendarSelect = (nextDate: Date | undefined) => {
    if (!nextDate) {
      onChange(undefined)
      setDraftOverride(null)
      setHourOverride(null)
      setMinuteOverride(null)
      setOpen(false)
      return
    }

    const dateText = toDisplayDate(toIsoDateText(nextDate))
    const normalizedHour = normalizeTimePart(hourDraft, 23)
    const normalizedMinute = normalizeTimePart(minuteDraft, 59)
    const normalizedTime = normalizedHour && normalizedMinute ? `${normalizedHour}:${normalizedMinute}` : '00:00'
    const isoDateTime = toIsoDateTime(`${dateText} ${normalizedTime}`)
    if (!isoDateTime) {
      return
    }

    onChange(isoDateTime)
    setDraftOverride(null)
    setHourOverride(null)
    setMinuteOverride(null)
    setOpen(false)
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Input
        id={id}
        type="text"
        inputMode="text"
        placeholder={placeholder}
        value={draft}
        onChange={(event) => {
          setDraftOverride(event.target.value)
          const nextTimeParts = extractTimeParts(event.target.value)
          if (nextTimeParts) {
            setHourOverride(nextTimeParts.hour)
            setMinuteOverride(nextTimeParts.minute)
          }
        }}
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
        <PopoverContent className="w-auto p-3" align="end">
          <div className="space-y-3">
            <Calendar mode="single" selected={selectedDate} onSelect={handleCalendarSelect} />
            <div className="space-y-2 border-t pt-3">
              <div className="flex items-center gap-2">
                <Input
                  id={`${id ?? 'date-time'}-hour`}
                  type="text"
                  inputMode="numeric"
                  placeholder="HH"
                  value={hourDraft}
                  className="w-16 text-center"
                  onChange={(event) => {
                    setHourOverride(event.target.value.replace(/\D/g, '').slice(0, 2))
                  }}
                  onBlur={() => commitTime(hourDraft, minuteDraft)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      commitTime(hourDraft, minuteDraft)
                    }
                  }}
                  disabled={disabled}
                />
                <span className="text-muted-foreground w-3 text-center text-sm">:</span>
                <Input
                  id={`${id ?? 'date-time'}-minute`}
                  type="text"
                  inputMode="numeric"
                  placeholder="mm"
                  value={minuteDraft}
                  className="w-16 text-center"
                  onChange={(event) => {
                    setMinuteOverride(event.target.value.replace(/\D/g, '').slice(0, 2))
                  }}
                  onBlur={() => commitTime(hourDraft, minuteDraft)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      commitTime(hourDraft, minuteDraft)
                    }
                  }}
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
