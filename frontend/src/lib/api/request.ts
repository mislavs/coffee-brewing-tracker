import { API_URL } from '@/lib/config'

function resolveApiUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  if (path.startsWith('/')) {
    return `${API_URL}${path}`
  }

  return `${API_URL}/${path}`
}

async function extractErrorMessage(response: Response) {
  const responseText = await response.text()
  if (!responseText) {
    return undefined
  }

  try {
    const payload = JSON.parse(responseText) as {
      title?: unknown
      detail?: unknown
      errors?: Record<string, unknown>
    }

    if (payload.errors && typeof payload.errors === 'object') {
      for (const value of Object.values(payload.errors)) {
        if (Array.isArray(value)) {
          const first = value.find((entry) => typeof entry === 'string')
          if (typeof first === 'string' && first.trim()) {
            return first
          }
        }
      }
    }

    if (typeof payload.detail === 'string' && payload.detail.trim()) {
      return payload.detail
    }

    if (typeof payload.title === 'string' && payload.title.trim()) {
      return payload.title
    }
  } catch {
    if (responseText.trim()) {
      return responseText.trim()
    }
  }

  return undefined
}

async function ensureSuccess(response: Response) {
  if (response.ok) {
    return
  }

  const message =
    (await extractErrorMessage(response)) ??
    `Request failed with status ${response.status}.`
  const error = new Error(message)
  Object.assign(error, {
    status: response.status,
    statusText: response.statusText,
  })

  throw error
}

async function parseJsonOrUndefined<T>(response: Response): Promise<T | undefined> {
  if ([204, 205, 304].includes(response.status)) {
    return undefined
  }

  const responseText = await response.text()
  if (!responseText) {
    return undefined
  }

  return JSON.parse(responseText) as T
}

export async function requestJson<T>(path: string, init?: RequestInit) {
  const response = await fetch(resolveApiUrl(path), init)
  await ensureSuccess(response)
  return parseJsonOrUndefined<T>(response)
}

export async function requestVoid(path: string, init?: RequestInit) {
  const response = await fetch(resolveApiUrl(path), init)
  await ensureSuccess(response)
}
