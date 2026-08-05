import { Link } from 'react-router'
import { useLang } from '@/i18n'
import Hero from '@/sections/Hero'
import Reveal from '@/components/Reveal'
import ProjectGrid from '@/components/ProjectGrid'
import { useApi, formatDate } from '@/api/client'
import { useSiteContent } from '@/api/SiteContentContext'
import type { ArticleSummary } from '@/api/types'

export default function Home() {
  const { t, lang } = useLang()
  const { data: latestData } = useApi<ArticleSummary[]>('/api/public/articles/latest?limit=3')
  const latest = latestData ?? []
  const { data: siteContent } = useSiteContent()
  const projects = (siteContent?.projects ?? []).slice(0, 3)

  return (
    <>
      <Hero />

      {/* selected works */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <Reveal>
          <div className="mb-12 flex items-end justify-between">
            <h2 className="font-display text-3xl font-medium tracking-tight md:text-5xl">{t.home.featuredWorks}</h2>
            <Link to="/about#projects" className="font-mono2 text-xs uppercase tracking-[0.2em] text-teal-300 hover:underline">
              {t.home.viewAll} →
            </Link>
          </div>
        </Reveal>
        <ProjectGrid projects={projects} lang={lang} viewProjectLabel={t.home.viewProject} />
      </section>

      {/* latest posts */}
      <section className="mx-auto max-w-7xl px-6 pb-28 md:px-10">
        <Reveal>
          <div className="mb-12 flex items-end justify-between">
            <h2 className="font-display text-3xl font-medium tracking-tight md:text-5xl">{t.home.latestPosts}</h2>
            <Link to="/blog" className="font-mono2 text-xs uppercase tracking-[0.2em] text-teal-300 hover:underline">
              {t.home.viewAll} →
            </Link>
          </div>
        </Reveal>
        <div className="divide-y divide-white/10 border-y border-white/10">
          {latest.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.1}>
              <Link
                to={`/blog/${p.slug}`}
                className="group flex flex-col gap-3 px-4 py-6 transition-all duration-300 hover:bg-white/[0.02] hover:px-6 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-mono2 text-[11px] uppercase tracking-widest text-teal-300/80">
                    {(p.column ? (lang === 'zh' ? p.column.nameZh : p.column.nameEn) : t.blog.all)} · {formatDate(p.publishedAt, lang)}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-medium transition-colors group-hover:text-teal-200 md:text-2xl">
                    {p.title}
                  </h3>
                </div>
                <span className="shrink-0 font-mono2 text-sm text-white/30 transition-all duration-300 group-hover:translate-x-2 group-hover:text-teal-300">
                  →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
