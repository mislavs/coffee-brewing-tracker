const DATE_PLACEHOLDER = '—'
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const DISPLAY_DATE_PATTERN = /^(\d{2})\.(\d{2})\.(\d{4})$/
const ISO_DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d{1,3})?)?$/
const DISPLAY_DATE_TIME_PATTERN = /^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})$/

type DateParts = {
  year: number
  month: number
  day: number
}

function pad2(value: number) {
  return String(value).padStart(2, '0')
}

function formatDateParts(year: string, month: string, day: string) {
  return `${day}.${month}.${year}`
}

function formatTimeParts(hour: string, minute: string) {
  return `${hour}:${minute}`
}

function isValidDateParts(year: number, month: number, day: number) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false
  }

  const parsed = new Date(Date.UTC(year, month - 1, day))
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  )
}

function isValidTimeParts(hour: number, minute: number) {
  return (
    Number.isInteger(hour) &&
    Number.isInteger(minute) &&
    hour >= 0 &&
    hour <= 23 &&
    minute >= 0 &&
    minute <= 59
  )
}

function toIsoDateText(year: string, month: string, day: string) {
  return `${year}-${month}-${day}`
}

function toIsoDateTimeText(
  year: string,
  month: string,
  day: string,
  hour: string,
  minute: string,
) {
  return `${toIsoDateText(year, month, day)}T${hour}:${minute}`
}

function toValidDate(value: unknown) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  return null
}

function toDateParts(value: unknown): DateParts | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) {
      return null
    }

    const isoMatch = ISO_DATE_PATTERN.exec(trimmed)
    if (isoMatch) {
      const [, yearText, monthText, dayText] = isoMatch
      const year = Number(yearText)
      const month = Number(monthText)
      const day = Number(dayText)
      return isValidDateParts(year, month, day) ? { year, month, day } : null
    }
  }

  if (value && typeof value === 'object') {
    const parts = value as { year?: unknown; month?: unknown; day?: unknown }
    if (
      typeof parts.year === 'number' &&
      typeof parts.month === 'number' &&
      typeof parts.day === 'number' &&
      isValidDateParts(parts.year, parts.month, parts.day)
    ) {
      return {
        year: parts.year,
        month: parts.month,
        day: parts.day,
      }
    }
  }

  const parsed = toValidDate(value)
  if (!parsed) {
    return null
  }

  return {
    year: parsed.getFullYear(),
    month: parsed.getMonth() + 1,
    day: parsed.getDate(),
  }
}

function formatDateFromDateOnlyObject(value: unknown) {
  if (!value || typeof value !== 'object') {
    return null
  }

  const parts = value as { year?: unknown; month?: unknown; day?: unknown }
  if (
    typeof parts.year !== 'number' ||
    typeof parts.month !== 'number' ||
    typeof parts.day !== 'number'
  ) {
    return null
  }

  return formatDateParts(
    String(parts.year).padStart(4, '0'),
    String(parts.month).padStart(2, '0'),
    String(parts.day).padStart(2, '0'),
  )
}

export function formatDate(value: unknown) {
  if (value === null || value === undefined) {
    return DATE_PLACEHOLDER
  }

  const fromDateOnlyObject = formatDateFromDateOnlyObject(value)
  if (fromDateOnlyObject) {
    return fromDateOnlyObject
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) {
      return DATE_PLACEHOLDER
    }

    const dateOnlyMatch = ISO_DATE_PATTERN.exec(trimmed)
    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch
      return formatDateParts(year, month, day)
    }
  }

  const parsed = toValidDate(value)
  if (!parsed) {
    return DATE_PLACEHOLDER
  }

  return formatDateParts(
    String(parsed.getFullYear()),
    pad2(parsed.getMonth() + 1),
    pad2(parsed.getDate()),
  )
}

export function formatAgeInDays(value: unknown, today: Date = new Date()) {
  const dateParts = toDateParts(value)
  if (!dateParts || Number.isNaN(today.getTime())) {
    return null
  }

  const targetDay = Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day)
  const currentDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const dayDifference = Math.round((currentDay - targetDay) / (1000 * 60 * 60 * 24))
  const absoluteDays = Math.abs(dayDifference)
  const dayLabel = `${absoluteDays} day${absoluteDays === 1 ? '' : 's'}`

  return dayDifference >= 0 ? dayLabel : `in ${dayLabel}`
}

export function formatDateTime(value: unknown) {
  const parsed = toValidDate(value)
  if (!parsed) {
    return DATE_PLACEHOLDER
  }

  const formattedDate = formatDateParts(
    String(parsed.getFullYear()),
    pad2(parsed.getMonth() + 1),
    pad2(parsed.getDate()),
  )
  const formattedTime = `${pad2(parsed.getHours())}:${pad2(parsed.getMinutes())}`
  return `${formattedDate} ${formattedTime}`
}

export function toDisplayDate(value: string | null | undefined) {
  if (!value) {
    return ''
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  const formatted = formatDate(trimmed)
  return formatted === DATE_PLACEHOLDER ? '' : formatted
}

export function toIsoDate(value: string | null | undefined) {
  if (!value) {
    return undefined
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  const isoMatch = ISO_DATE_PATTERN.exec(trimmed)
  if (isoMatch) {
    const [, yearText, monthText, dayText] = isoMatch
    const year = Number(yearText)
    const month = Number(monthText)
    const day = Number(dayText)
    return isValidDateParts(year, month, day) ? `${yearText}-${monthText}-${dayText}` : undefined
  }

  const displayMatch = DISPLAY_DATE_PATTERN.exec(trimmed)
  if (!displayMatch) {
    return undefined
  }

  const [, dayText, monthText, yearText] = displayMatch
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)

  if (!isValidDateParts(year, month, day)) {
    return undefined
  }

  return toIsoDateText(yearText, monthText, dayText)
}

export function toDisplayDateTime(value: string | null | undefined) {
  if (!value) {
    return ''
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  const isoMatch = ISO_DATE_TIME_PATTERN.exec(trimmed)
  if (isoMatch) {
    const [, year, month, day, hour, minute] = isoMatch
    return `${formatDateParts(year, month, day)} ${formatTimeParts(hour, minute)}`
  }

  if (DISPLAY_DATE_TIME_PATTERN.test(trimmed)) {
    return trimmed
  }

  const parsed = toValidDate(trimmed)
  if (!parsed) {
    return ''
  }

  return `${formatDateParts(
    String(parsed.getFullYear()),
    pad2(parsed.getMonth() + 1),
    pad2(parsed.getDate()),
  )} ${formatTimeParts(pad2(parsed.getHours()), pad2(parsed.getMinutes()))}`
}

export function toIsoDateTime(value: string | null | undefined) {
  if (!value) {
    return undefined
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  const isoMatch = ISO_DATE_TIME_PATTERN.exec(trimmed)
  if (isoMatch) {
    const [, yearText, monthText, dayText, hourText, minuteText] = isoMatch
    const year = Number(yearText)
    const month = Number(monthText)
    const day = Number(dayText)
    const hour = Number(hourText)
    const minute = Number(minuteText)

    if (!isValidDateParts(year, month, day) || !isValidTimeParts(hour, minute)) {
      return undefined
    }

    return toIsoDateTimeText(yearText, monthText, dayText, hourText, minuteText)
  }

  const displayMatch = DISPLAY_DATE_TIME_PATTERN.exec(trimmed)
  if (!displayMatch) {
    return undefined
  }

  const [, dayText, monthText, yearText, hourText, minuteText] = displayMatch
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const hour = Number(hourText)
  const minute = Number(minuteText)

  if (!isValidDateParts(year, month, day) || !isValidTimeParts(hour, minute)) {
    return undefined
  }

  return toIsoDateTimeText(yearText, monthText, dayText, hourText, minuteText)
}
