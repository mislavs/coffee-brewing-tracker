export function formatRatio(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value) || value <= 0) {
    return '—'
  }

  return `1:${value.toFixed(1)}`
}

export function formatBrewTime(value: number | null | undefined) {
  if (value === null || value === undefined || value < 0) {
    return '—'
  }

  const minutes = Math.floor(value / 60)
  const seconds = value % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function getRatingDisplay(rating: number | null | undefined) {
  switch (rating) {
    case 1:
      return '😞'
    case 2:
      return '🙁'
    case 3:
      return '😐'
    case 4:
      return '🙂'
    case 5:
      return '🤩'
    default:
      return '—'
  }
}
