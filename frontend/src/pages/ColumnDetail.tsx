import { Link, useParams } from 'react-router'
import { useLang } from '@/i18n'
import Reveal from '@/components/Reveal'
import { PageLoading } from '@/components/Loading'
import { formatDate, useApi } from '@/api/client'
import type { ArticleSummary, ColumnView, PageResponse } from '@/api/types'

export default function ColumnDetail() {
  const { slug } = useParams()
  const { t, lang } = useLang()
  const encoded = slug ? encodeURIComponent(slug) : ''
  const { data: column, loading, error } = useApi<ColumnView>(slug ? `/api/public/columns/${encoded}` : null)
  const { data: articlePage } = useApi<PageResponse<ArticleSummary>>(slug ? `/api/public/articles?page=1&pageSize=50&column=${encoded}` : null)
  const articles = articlePage?.items ?? []

  if (loading) return <PageLoading label="正在加载专栏内容" />
  if (!column || error) {
    return <div className="mx-auto max-w-3xl px-6 pb-28 pt-44 text-center"><p className="text-white/50">{error || '404'}</p><Link to="/columns" className="mt-6 inline-block text-teal-300 hover:underline">← {t.columnsPage.back}</Link></div>
  }
  const ongoing = column.status === 'ONGOING'
  return (
    <div className="mx-auto max-w-5xl px-6 pb-28 pt-36 md:px-10 md:pt-44">
      <Reveal>
        <Link to="/columns" className="font-mono2 text-xs uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-teal-300">← {t.columnsPage.back}</Link>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <h1 className="font-display text-4xl font-medium tracking-tight md:text-6xl">{lang === 'zh' ? column.nameZh : column.nameEn}</h1>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono2 text-[10px] uppercase tracking-widest ${ongoing ? 'border-teal-300/40 text-teal-300' : 'border-white/20 text-white/50'}`}>
            {ongoing && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-300" />}
            {ongoing ? t.columnsPage.ongoing : t.columnsPage.completed}
          </span>
        </div>
        <p className="mt-5 max-w-xl leading-relaxed text-white/55 md:text-lg">{lang === 'zh' ? column.descriptionZh : column.descriptionEn}</p>
        <p className="mt-4 font-mono2 text-xs tracking-widest text-white/35">{articles.length} {t.columnsPage.articles} · {t.columnsPage.updated} {formatDate(column.latestPublishedAt || column.updatedAt, lang)}</p>
      </Reveal>

      {articles.length > 0 ? (
        <div className="mt-14 divide-y divide-white/10 border-y border-white/10">
          {articles.map((article, index) => (
            <Reveal key={article.slug} delay={index * 0.08}>
              <Link to={`/blog/${article.slug}`} className="group flex items-center gap-6 px-4 py-6 transition-all duration-300 hover:bg-white/[0.02] hover:px-6">
                <span className="w-16 shrink-0 font-mono2 text-sm text-teal-300/60">{lang === 'zh' ? `第 ${index + 1} 期` : `Ep. ${index + 1}`}</span>
                <div className="flex-1"><h2 className="font-display text-lg font-medium transition-colors group-hover:text-teal-200 md:text-xl">{article.title}</h2><p className="mt-1.5 line-clamp-1 text-sm text-white/45">{article.summary}</p></div>
                <span className="hidden shrink-0 font-mono2 text-[11px] text-white/35 md:block">{formatDate(article.publishedAt, lang)} · {article.readMinutes} {t.blog.minRead}</span>
                <span className="shrink-0 text-white/30 transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-teal-300">→</span>
              </Link>
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal delay={0.15} className="mt-14"><div className="rounded-2xl border border-dashed border-white/15 p-16 text-center"><p className="font-display text-2xl text-white/60">{t.columnsPage.emptyTitle}</p><p className="mt-3 text-sm text-white/40">{t.columnsPage.emptyDesc}</p></div></Reveal>
      )}
    </div>
  )
}
