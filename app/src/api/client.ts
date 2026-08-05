import type { ApiResponse } from './types'

type RequestActivityListener = (active: boolean) => void
const requestActivityListeners = new Set<RequestActivityListener>()
let activeDataRequests = 0

function publishRequestActivity() {
  const active = activeDataRequests > 0
  requestActivityListeners.forEach(listener => listener(active))
}

function beginDataRequest() {
  activeDataRequests += 1
  publishRequestActivity()
}

function endDataRequest() {
  activeDataRequests = Math.max(0, activeDataRequests - 1)
  publishRequestActivity()
}

export function subscribeRequestActivity(listener: RequestActivityListener) {
  requestActivityListeners.add(listener)
  listener(activeDataRequests > 0)
  return () => { requestActivityListeners.delete(listener) }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const isForm = init?.body instanceof FormData
  const trackActivity = (init?.method ?? 'GET').toUpperCase() === 'GET'
  if (trackActivity) beginDataRequest()
  try {
    const response = await fetch(path, {
      ...init,
      credentials: 'include',
      headers: isForm ? init?.headers : { ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...init?.headers },
    })
    const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null
    if (response.status === 401 && !path.endsWith('/login')) window.dispatchEvent(new Event('auth-expired'))
    if (!response.ok || !payload || payload.code !== 0) throw new Error(payload?.message || `请求失败（${response.status}）`)
    return payload.data
  } finally {
    if (trackActivity) endDataRequest()
  }
}

export const jsonBody = (value: unknown): RequestInit => ({ body: JSON.stringify(value) })
export const formatDateTime = (value?: string | null) => value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '—'
