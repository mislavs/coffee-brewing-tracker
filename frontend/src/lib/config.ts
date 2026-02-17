const fallbackApiUrl = 'http://localhost:5081'

export const API_URL = (import.meta.env.VITE_API_URL ?? fallbackApiUrl).replace(
  /\/+$/,
  '',
)
