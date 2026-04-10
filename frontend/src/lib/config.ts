const fallbackApiUrl = 'http://localhost:5081'
const runtimeApiUrl = window.__APP_CONFIG__?.apiUrl
const buildTimeApiUrl = import.meta.env.VITE_API_URL

export const API_URL = (runtimeApiUrl ?? buildTimeApiUrl ?? fallbackApiUrl).replace(
  /\/+$/,
  '',
)
