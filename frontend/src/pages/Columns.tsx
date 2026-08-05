import { Link } from 'react-router'
import { useLang } from '@/i18n'
import Reveal from '@/components/Reveal'
import TiltCard from '@/components/TiltCard'
import { InlineLoading } from '@/components/Loading'
import { formatDate, useApi } from '@/api/client'
import type { ColumnView } from '@/api/types'

const GRADIENTS = [
  'from-teal-400/20 to-cyan-500/5', 'from-violet-400/20 to-fuchsia-500/5',
  'from-cyan-400/20 to-blue-500/5', 'from-emerald-400/20 to-teal-500/5',
  'from-purple-400/20 to-violet-500/5', 'from-sky-400/20 to-indigo-500/5',
]

export default function Columns() {
  const { t, lang } = useLang()
  const { data, loading, error } = useApi<ColumnView[]>('/api/public/columns')
  const columns = data ?? []
  return (
    <div className="mx-auto max-w-7xl px-6 pb-28 pt-36 md:px-10 md:pt-44">
      <Reveal>
        <h1 className="font-display text-4xl font-medium tracking-tight md:text-6xl">{t.columnsPage.title}</h1>
        <p className="mt-4 max-w-lg text-white/55 md:text-lg">{t.columnsPage.subtitle}</p>
      </Reveal>

      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {columns.map((column, index) => {
          const ongoing = column.status === 'ONGOING'
          return (
            <Reveal key={column.slug} delay={(index % 3) * 0.1}>
              <TiltCard className="group h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-teal-300/40">
                <Link to={`/columns/${column.slug}`} className="block h-full">
                  <div className={`h-28 bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]} p-5`}>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono2 text-[10px] uppercase tracking-widest ${ongoing ? 'border-teal-300/40 text-teal-300' : 'border-white/20 text-white/50'}`}>
                      {ongoing && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-300" />}
                      {ongoing ? t.columnsPage.ongoing : t.columnsPage.completed}
                    </span>
                  </div>
                  <div className="p-6">
                    <h2 className="font-display text-xl font-medium transition-colors group-hover:text-teal-200">{lang === 'zh' ? column.nameZh : column.nameEn}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-white/55">{lang === 'zh' ? column.descriptionZh : column.descriptionEn}</p>
                    <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 font-mono2 text-[11px] text-white/40">
                      <span>{column.articleCount} {t.columnsPage.articles}</span>
                      <span>{t.columnsPage.updated} {formatDate(column.latestPublishedAt || column.updatedAt, lang)}</span>
                    </div>
                    <p className="mt-4 font-mono2 text-xs text-teal-300 transition-all duration-300 group-hover:translate-x-1">{t.columnsPage.enter} →</p>
                  </div>
                </Link>
              </TiltCard>
            </Reveal>
          )
        })}
      </div>
      {loading ? <InlineLoading label="正在加载专栏" /> : error && <p className="mt-16 text-center text-white/40">{error}</p>}
    </div>
  )
}
