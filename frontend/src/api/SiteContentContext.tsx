import { createContext, useContext, type ReactNode } from 'react'
import { useApi } from './client'
import type { SiteContent } from './types'

const SiteContentContext = createContext<ReturnType<typeof useApi<SiteContent>> | null>(null)

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const state = useApi<SiteContent>('/api/public/site-content')
  return <SiteContentContext.Provider value={state}>{children}</SiteContentContext.Provider>
}

export function useSiteContent() {
  const value = useContext(SiteContentContext)
  if (!value) throw new Error('useSiteContent must be used inside SiteContentProvider')
  return value
}

