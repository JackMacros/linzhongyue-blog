import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Card, Badge, Btn, Modal, Table, Pagination, inputCls } from '@/components/admin'
import { apiRequest, formatDateTime } from '@/api/client'
import type { ArticleSummary, PageResponse } from '@/api/types'

const PAGE_SIZE = 10

export default function Posts() {
  const navigate = useNavigate()
  const [items, setItems] = useState<ArticleSummary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [removing, setRemoving] = useState<ArticleSummary | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
    if (query.trim()) params.set('keyword', query.trim())
    if (status) params.set('status', status)
    apiRequest<PageResponse<ArticleSummary>>(`/api/admin/articles?${params}`)
      .then(data => { setItems(data.items); setTotal(data.total) })
      .catch(reason => setError(reason.message))
  }, [page, query, status])

  useEffect(() => { load() }, [load])

  const remove = async () => {
    if (!removing) return
    try {
      await apiRequest(`/api/admin/articles/${removing.id}`, { method: 'DELETE' })
      setRemoving(null)
      load()
    } catch (reason) {
      setError((reason as Error).message)
    }
  }

  return <div className="space-y-4">
    {error && <p className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">{error}</p>}
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" /><input value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} placeholder="搜索标题 / 摘要…" className={`${inputCls} w-60 pl-9`} /></div>
      <select value={status} onChange={event => { setStatus(event.target.value); setPage(1) }} className={`${inputCls} w-32`}><option className="bg-[#12121c]" value="">全部状态</option><option className="bg-[#12121c]" value="PUBLISHED">已发布</option><option className="bg-[#12121c]" value="DRAFT">草稿</option></select>
      <Btn variant="primary" className="ml-auto flex items-center gap-1.5" onClick={() => navigate('/content/posts/new')}><Plus size={15} />写文章</Btn>
    </div>
    <Card><Table head={['标题', '专栏', '标签', '状态', '浏览', '更新', '操作']}>
      {items.map(article => <tr key={article.id} className="data-row border-b border-white/[.05]">
        <td className="max-w-[360px] px-5 py-3.5"><p className="line-clamp-1 font-medium text-white/85">{article.title}</p><p className="mt-1 line-clamp-1 text-xs text-white/35">{article.summary || '暂无摘要'}</p></td>
        <td className="whitespace-nowrap px-5 py-3.5 text-white/55">{article.column?.nameZh ?? '—'}</td>
        <td className="px-5 py-3.5"><div className="flex flex-wrap gap-1">{article.tags.slice(0, 3).map(tag => <span key={tag.id} className="rounded bg-white/[.06] px-1.5 py-.5 font-mono2 text-[10px] text-white/55">{tag.name}</span>)}</div></td>
        <td className="px-5 py-3.5"><Badge tone={article.status === 'PUBLISHED' ? 'teal' : 'amber'}>{article.status === 'PUBLISHED' ? '已发布' : '草稿'}</Badge></td>
        <td className="px-5 py-3.5 font-mono2 text-xs text-white/50">{article.viewCount.toLocaleString()}</td>
        <td className="whitespace-nowrap px-5 py-3.5 text-xs text-white/45">{formatDateTime(article.updatedAt)}</td>
        <td className="whitespace-nowrap px-5 py-3.5"><button aria-label="编辑" onClick={() => navigate(`/content/posts/${article.id}/edit`)} className="p-1.5 text-white/45 hover:text-teal-300"><Pencil size={15} /></button><button aria-label="删除" onClick={() => setRemoving(article)} className="p-1.5 text-white/45 hover:text-red-300"><Trash2 size={15} /></button></td>
      </tr>)}
      {items.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-white/35">没有文章</td></tr>}
    </Table><Pagination total={total} page={page} pageSize={PAGE_SIZE} onPage={setPage} /></Card>
    <Modal open={!!removing} title="删除文章" onClose={() => setRemoving(null)} footer={<><Btn onClick={() => setRemoving(null)}>取消</Btn><Btn variant="danger" onClick={remove}>确认删除</Btn></>}><p className="text-sm text-white/65">确定物理删除「{removing?.title}」吗？此操作不可恢复。</p></Modal>
  </div>
}
