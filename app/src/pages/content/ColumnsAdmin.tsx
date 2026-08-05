import { useCallback, useEffect, useState } from 'react'
import { GripVertical, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import { Badge, Btn, Card, Field, Modal, inputCls } from '@/components/admin'
import { apiRequest, formatDateTime, jsonBody } from '@/api/client'
import type { ColumnView } from '@/api/types'

type FormData = { nameZh: string; nameEn: string; descriptionZh: string; descriptionEn: string; status: 'ONGOING' | 'COMPLETED' }

export default function ColumnsAdmin() {
  const [columns, setColumns] = useState<ColumnView[]>([])
  const [editing, setEditing] = useState<ColumnView | null>(null)
  const [creating, setCreating] = useState(false)
  const [removing, setRemoving] = useState<ColumnView | null>(null)
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [orderChanged, setOrderChanged] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(() => apiRequest<ColumnView[]>('/api/admin/columns').then(value => { setColumns(value); setOrderChanged(false) }).catch(reason => setError(reason.message)), [])
  useEffect(() => { load() }, [load])

  const save = async (form: FormData) => {
    try { await apiRequest(editing ? `/api/admin/columns/${editing.id}` : '/api/admin/columns', { method: editing ? 'PUT' : 'POST', ...jsonBody(form) }); setEditing(null); setCreating(false); load() }
    catch (reason) { setError((reason as Error).message) }
  }

  const remove = async () => {
    if (!removing) return
    try { await apiRequest(`/api/admin/columns/${removing.id}`, { method: 'DELETE' }); setRemoving(null); load() }
    catch (reason) { setError((reason as Error).message) }
  }

  const dropAt = (targetId: number) => {
    if (draggingId == null || draggingId === targetId) return
    setColumns(current => {
      const next = [...current]
      const from = next.findIndex(item => item.id === draggingId)
      const to = next.findIndex(item => item.id === targetId)
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
    setDraggingId(null); setOrderChanged(true)
  }

  const saveOrder = async () => {
    setSavingOrder(true); setError('')
    try { await apiRequest('/api/admin/columns/reorder', { method: 'PUT', ...jsonBody({ ids: columns.map(item => item.id) }) }); await load() }
    catch (reason) { setError((reason as Error).message) }
    finally { setSavingOrder(false) }
  }

  return <div className="space-y-4">
    {error && <p className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">{error}</p>}
    <div className="flex flex-wrap items-center gap-3"><div><p className="text-sm text-white/60">拖动专栏调整前台展示优先级</p><p className="mt-1 text-xs text-white/35">前台只展示包含已发布文章的专栏</p></div><div className="ml-auto flex gap-2">{orderChanged && <Btn onClick={saveOrder} className="flex items-center gap-1.5"><Save size={14} />{savingOrder ? '保存中…' : '保存排序'}</Btn>}<Btn variant="primary" className="flex items-center gap-1.5" onClick={() => setCreating(true)}><Plus size={15} />新建专栏</Btn></div></div>
    <Card className="overflow-hidden"><div className="divide-y divide-white/[.06]">{columns.map((column, index) => <div key={column.id} draggable onDragStart={() => setDraggingId(column.id)} onDragOver={event => event.preventDefault()} onDrop={() => dropAt(column.id)} className={`grid cursor-grab items-center gap-3 px-4 py-4 transition md:grid-cols-[36px_minmax(260px,1fr)_90px_100px_170px_90px] ${draggingId === column.id ? 'bg-teal-400/10 opacity-60' : 'hover:bg-white/[.025]'}`}>
      <div className="flex items-center gap-2 text-white/30"><GripVertical size={18} /><span className="font-mono2 text-[10px]">{index + 1}</span></div>
      <div className="min-w-0"><p className="truncate font-medium text-white/85">{column.nameZh}</p><p className="truncate text-xs text-white/40">{column.nameEn}</p></div>
      <div className="text-xs text-white/55">{column.articleCount} 篇</div>
      <div><Badge tone={column.status === 'ONGOING' ? 'teal' : 'gray'}>{column.status === 'ONGOING' ? '连载中' : '已完结'}</Badge></div>
      <div className="text-xs text-white/40">{formatDateTime(column.latestPublishedAt || column.updatedAt)}</div>
      <div className="text-right"><button aria-label="编辑" onClick={() => setEditing(column)} className="p-1.5 text-white/45 hover:text-teal-300"><Pencil size={15} /></button><button aria-label="删除" onClick={() => setRemoving(column)} className="p-1.5 text-white/45 hover:text-red-300"><Trash2 size={15} /></button></div>
    </div>)}</div></Card>
    {(creating || editing) && <ColumnForm key={editing?.id ?? 'new'} initial={editing} onClose={() => { setCreating(false); setEditing(null) }} onSave={save} />}
    <Modal open={!!removing} title="删除专栏" onClose={() => setRemoving(null)} footer={<><Btn onClick={() => setRemoving(null)}>取消</Btn><Btn variant="danger" onClick={remove}>确认删除</Btn></>}><p className="text-sm text-white/65">专栏「{removing?.nameZh}」下有 {removing?.articleCount} 篇文章，删除后文章将变为无专栏状态。</p></Modal>
  </div>
}

function ColumnForm({ initial, onClose, onSave }: { initial: ColumnView | null; onClose: () => void; onSave: (form: FormData) => void }) {
  const [form, setForm] = useState<FormData>({ nameZh: initial?.nameZh ?? '', nameEn: initial?.nameEn ?? '', descriptionZh: initial?.descriptionZh ?? '', descriptionEn: initial?.descriptionEn ?? '', status: initial?.status ?? 'ONGOING' })
  const set = (key: keyof FormData, value: string) => setForm(current => ({ ...current, [key]: value }))
  return <Modal open title={initial ? '编辑专栏' : '新建专栏'} onClose={onClose} footer={<><Btn onClick={onClose}>取消</Btn><Btn variant="primary" onClick={() => onSave(form)}>保存</Btn></>}><div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1"><div className="grid gap-4 md:grid-cols-2"><Field label="中文名称"><input value={form.nameZh} onChange={event => set('nameZh', event.target.value)} className={inputCls} /></Field><Field label="英文名称"><input value={form.nameEn} onChange={event => set('nameEn', event.target.value)} className={inputCls} /></Field></div><Field label="中文简介"><textarea rows={3} value={form.descriptionZh} onChange={event => set('descriptionZh', event.target.value)} className={inputCls} /></Field><Field label="英文简介"><textarea rows={3} value={form.descriptionEn} onChange={event => set('descriptionEn', event.target.value)} className={inputCls} /></Field><Field label="状态"><select value={form.status} onChange={event => set('status', event.target.value)} className={inputCls}><option className="bg-[#12121c]" value="ONGOING">连载中</option><option className="bg-[#12121c]" value="COMPLETED">已完结</option></select></Field></div></Modal>
}
