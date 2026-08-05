import { useEffect, useState } from 'react'
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
  const trackActivity = (init?.method ?? 'GET').toUpperCase() === 'GET'
  if (trackActivity) beginDataRequest()
  try {
    const response = await fetch(path, {
      ...init,
      credentials: 'include',
      headers: init?.body ? { 'Content-Type': 'application/json', ...init.headers } : init?.headers,
    })
    const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null
    if (!response.ok || !payload || payload.code !== 0) {
      throw new Error(payload?.message || `请求失败（${response.status}）`)
    }
    return payload.data
  } finally {
    if (trackActivity) endDataRequest()
  }
}

export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(Boolean(path))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!path) {
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    apiRequest<T>(path, { signal: controller.signal })
      .then(setData)
      .catch((reason: Error) => {
        if (reason.name !== 'AbortError') setError(reason.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [path])

  return { data, loading, error }
}

export function formatDate(value: string | null | undefined, locale: 'zh' | 'en') {
  if (!value) return '—'
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(value))
}

export function parseTechStack(value: string): string[] {
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed.map(String)
  } catch {
    // Older records may use comma-separated text.
  }
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}
