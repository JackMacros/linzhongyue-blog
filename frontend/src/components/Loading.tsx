import { useEffect, useRef, useState } from 'react'
import { subscribeRequestActivity } from '@/api/client'

const SHOW_DELAY = 120
const MIN_VISIBLE = 360

function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const dimensions = size === 'sm' ? 'h-5 w-5' : 'h-11 w-11'
  return <span className={`relative inline-block ${dimensions}`} aria-hidden="true"><span className="absolute inset-0 rounded-full border border-teal-300/20"/><span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-r-violet-300/40 border-t-teal-300"/><span className="absolute inset-[35%] animate-pulse rounded-full bg-teal-300/80 shadow-[0_0_12px_rgba(94,234,212,.7)]"/></span>
}

function useDelayedRequestActivity() {
  const [visible, setVisible] = useState(false)
  const visibleRef = useRef(false)
  const visibleSinceRef = useRef(0)
  const showTimerRef = useRef<number | null>(null)
  const hideTimerRef = useRef<number | null>(null)

  useEffect(() => subscribeRequestActivity(active => {
    if (active) {
      if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
      if (visibleRef.current || showTimerRef.current !== null) return
      showTimerRef.current = window.setTimeout(() => {
        showTimerRef.current = null
        visibleRef.current = true
        visibleSinceRef.current = performance.now()
        setVisible(true)
      }, SHOW_DELAY)
      return
    }
    if (showTimerRef.current !== null) window.clearTimeout(showTimerRef.current)
    showTimerRef.current = null
    if (!visibleRef.current) return
    const remaining = Math.max(0, MIN_VISIBLE - (performance.now() - visibleSinceRef.current))
    hideTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = null
      visibleRef.current = false
      setVisible(false)
    }, remaining)
  }), [])

  useEffect(() => () => {
    if (showTimerRef.current !== null) window.clearTimeout(showTimerRef.current)
    if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current)
  }, [])
  return visible
}

export function GlobalLoading() {
  const visible = useDelayedRequestActivity()
  return <div className={`pointer-events-none fixed inset-x-0 top-0 z-[100] transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`} role="status" aria-live="polite" aria-label="正在加载数据"><div className="h-0.5 overflow-hidden bg-white/[0.04]"><span className="loading-progress block h-full w-2/5 bg-gradient-to-r from-transparent via-teal-300 to-violet-300 shadow-[0_0_14px_rgba(94,234,212,.65)]"/></div><div className="absolute right-5 top-20 flex items-center gap-2 rounded-full border border-white/10 bg-[#0b0b11]/90 px-3 py-2 font-mono2 text-[11px] tracking-wider text-white/60 shadow-xl backdrop-blur"><LoadingSpinner size="sm"/>正在加载</div></div>
}

export function PageLoading({ label = '正在加载内容' }: { label?: string }) {
  return <div className="flex min-h-[55vh] flex-col items-center justify-center gap-4 text-white/45" role="status"><LoadingSpinner/><p className="font-mono2 text-xs tracking-[0.18em]">{label}</p></div>
}

export function InlineLoading({ label = '正在加载' }: { label?: string }) {
  return <div className="flex items-center justify-center gap-3 py-14 text-sm text-white/45" role="status"><LoadingSpinner size="sm"/><span>{label}</span></div>
}
