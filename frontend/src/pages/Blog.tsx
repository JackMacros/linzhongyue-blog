import { useDeferredValue, useState } from 'react'
import { Link } from 'react-router'
import { useLang } from '@/i18n'
import Reveal from '@/components/Reveal'
import TiltCard from '@/components/TiltCard'
import { InlineLoading } from '@/components/Loading'
import { formatDate, useApi } from '@/api/client'
import type { ArticleSummary, PageResponse, TagView } from '@/api/types'

export default function Blog() {
  const { t, lang } = useLang()
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState<string | null>(null)
  const deferredQuery = useDeferredValue(query.trim())
  const params = new URLSearchParams({ page: '1', pageSize: '50' })
  if (deferredQuery) params.set('keyword', deferredQuery)
  if (tag) params.set('tag', tag)
  const { data: page, loading, error } = useApi<PageResponse<ArticleSummary>>(`/api/public/articles?${params}`)
  const { data: tagData } = useApi<TagView[]>('/api/public/tags')
  const tags = tagData ?? []
  const articles = page?.items ?? []

  return (
    <div className="mx-auto max-w-7xl px-6 pb-28 pt-36 md:px-10 md:pt-44">
      <Reveal>
        <h1 className="font-display text-4xl font-medium tracking-tight md:text-6xl">{t.blog.title}</h1>
        <p className="mt-4 max-w-lg text-white/55 md:text-lg">{t.blog.subtitle}</p>
      </Reveal>

      {/* controls */}
      <Reveal delay={0.1} className="mt-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTag(null)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                !tag ? 'border-teal-300/60 text-teal-300' : 'border-white/10 text-white/60 hover:border-white/30'
              }`}
            >
              {t.blog.all}
            </button>
            {tags.map((item) => (
              <button
                key={item.id}
                onClick={() => setTag(item.name)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  tag === item.name ? 'border-teal-300/60 text-teal-300' : 'border-white/10 text-white/60 hover:border-white/30'
                }`}
              >
                {item.name} <span className="text-white/30">{item.articleCount}</span>
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.blog.search}
            className="w-full rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-teal-300/50 md:w-64"
          />
        </div>
      </Reveal>

      {/* list */}
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {articles.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 2) * 0.1}>
            <TiltCard className="group h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-teal-300/40">
            <Link to={`/blog/${p.slug}`} className="flex h-full flex-col">
              {p.coverUrl && <img src={p.coverUrl} alt="" loading="lazy" className="aspect-[16/8] w-full object-cover opacity-80 transition-opacity group-hover:opacity-100" />}
              <div className="flex flex-1 flex-col p-7">
              <div className="flex items-center justify-between">
                <span className="font-mono2 text-[11px] uppercase tracking-widest text-teal-300/80">
                  {p.column ? (lang === 'zh' ? p.column.nameZh : p.column.nameEn) : t.blog.all}
                </span>
                <span className="font-mono2 text-[11px] text-white/35">
                  {formatDate(p.publishedAt, lang)} · {p.readMinutes} {t.blog.minRead}
                </span>
              </div>
              <h2 className="mt-4 font-display text-xl font-medium leading-snug transition-colors group-hover:text-teal-200 md:text-2xl">
                {p.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-white/55">{p.summary}</p>
              <div className="mt-5 flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {p.tags.slice(0, 3).map((item) => (
                    <span key={item.id} className="rounded-md bg-white/[0.05] px-2 py-0.5 font-mono2 text-[10px] text-white/60">
                      {item.name}
                    </span>
                  ))}
                </div>
                <span className="font-mono2 text-xs text-teal-300 opacity-0 transition-opacity group-hover:opacity-100">
                  {t.blog.readMore} →
                </span>
              </div>
              </div>
            </Link>
            </TiltCard>
          </Reveal>
        ))}
      </div>
      {loading ? <InlineLoading label="正在加载文章" /> : (error || articles.length === 0) && <p className="mt-16 text-center text-white/40">{error || t.blog.notFound}</p>}
    </div>
  )
}
