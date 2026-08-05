import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useLang } from '@/i18n'
import SpotlightText from '@/components/SpotlightText'
import { useSiteContent } from '@/api/SiteContentContext'

export default function Hero() {
  const { t, lang } = useLang()
  const { data: siteContent } = useSiteContent()
  const profile = siteContent?.profile
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-fade',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.14, ease: 'power3.out', delay: 0.4 },
      )
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative flex min-h-screen flex-col justify-center overflow-hidden">
      {/* giant hidden name + cursor spotlight */}
      <SpotlightText />
      {/* vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,#08080e_92%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-6 text-center">
        <p className="hero-fade mb-8 flex items-center gap-3 font-mono2 text-xs uppercase tracking-[0.3em] text-teal-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-300" />
          </span>
          {t.hero.status}
        </p>

        <p className="hero-fade text-lg text-white/60 md:text-xl">
          {t.hero.greeting} <span className="font-medium text-white">{profile ? (lang === 'zh' ? profile.displayNameZh : profile.displayNameEn) : t.hero.name}</span>
        </p>

        <h1 className="hero-fade mt-6 font-display text-4xl font-medium leading-tight tracking-tight md:text-7xl">
          {profile ? (lang === 'zh' ? profile.roleZh : profile.roleEn) : (
            <>{t.hero.role1}<span className="mx-4 text-teal-300 md:mx-6">×</span><span className="text-glow-gradient">{t.hero.role2}</span></>
          )}
        </h1>

        <p className="hero-fade mt-8 max-w-xl text-base leading-relaxed text-white/55 md:text-lg">
          {profile ? (lang === 'zh' ? profile.heroDescriptionZh : profile.heroDescriptionEn) : t.hero.desc}
        </p>

        <p className="hero-fade mt-12 hidden font-mono2 text-[11px] uppercase tracking-[0.25em] text-white/30 md:block">
          ✦ {t.hero.hint}
        </p>
      </div>

      {/* scroll indicator */}
      <div className="hero-fade absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
        <span className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-white/40">{t.hero.scroll}</span>
        <div className="h-12 w-px overflow-hidden">
          <div className="scroll-line h-full w-px bg-gradient-to-b from-teal-300 to-transparent" />
        </div>
      </div>
    </section>
  )
}
