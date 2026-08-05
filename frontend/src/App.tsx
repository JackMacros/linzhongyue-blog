import { lazy, Suspense, useEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router'
import Lenis from 'lenis'
import { LanguageProvider, useLang } from '@/i18n'
import CustomCursor from '@/components/CustomCursor'
import Nav from '@/sections/Nav'
import { SiteContentProvider, useSiteContent } from '@/api/SiteContentContext'
import { apiRequest } from '@/api/client'
import { GlobalLoading, PageLoading } from '@/components/Loading'

const Home = lazy(() => import('@/pages/Home'))
const Blog = lazy(() => import('@/pages/Blog'))
const PostDetail = lazy(() => import('@/pages/PostDetail'))
const Columns = lazy(() => import('@/pages/Columns'))
const ColumnDetail = lazy(() => import('@/pages/ColumnDetail'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))

function Site() {
  const { lang } = useLang()
  const { data: siteContent } = useSiteContent()
  const lenisRef = useRef<Lenis | null>(null)
  const location = useLocation()

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 })
    lenisRef.current = lenis
    ;(window as any).__lenis = lenis
    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  // scroll to top on page change
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true })
  }, [location.pathname])

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    const sessionKey = 'blog-pv-date'
    if (sessionStorage.getItem(sessionKey) === today) return
    sessionStorage.setItem(sessionKey, today)
    const visitorKey = 'blog-uv-date'
    const newVisitor = localStorage.getItem(visitorKey) !== today
    if (newVisitor) localStorage.setItem(visitorKey, today)
    apiRequest<void>('/api/public/visits', { method: 'POST', body: JSON.stringify({ newVisitor }) }).catch(() => undefined)
  }, [])

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <CustomCursor />
      <Nav />
      <main>
        <Suspense fallback={<PageLoading label="正在加载页面" />}><Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<PostDetail />} />
          <Route path="/columns" element={<Columns />} />
          <Route path="/columns/:slug" element={<ColumnDetail />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Home />} />
        </Routes></Suspense>
      </main>
      <footer className="border-t border-white/10 px-6 py-8 text-center font-mono2 text-xs text-white/35 md:px-10">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer" className="transition-colors hover:text-teal-300">
          {siteContent?.profile ? (lang === 'zh' ? siteContent.profile.footerZh : siteContent.profile.footerEn) : 'Copyright©2021-2026 · 苏ICP备2021001257号-1'}
        </a>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <>
      <GlobalLoading />
      <LanguageProvider>
        <SiteContentProvider>
          <Site />
        </SiteContentProvider>
      </LanguageProvider>
    </>
  )
}
