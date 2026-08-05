import { useEffect, useRef, useState, type ClipboardEvent, type DragEvent } from 'react'
import { ArrowLeft, Eye, FileImage, ImagePlus, Save, Send, Upload } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { apiRequest, jsonBody } from '@/api/client'
import type { ArticleDetail, ColumnView, MediaAsset, PageResponse, TagView } from '@/api/types'
import { Badge, Btn, Card, Field, Modal, inputCls } from '@/components/admin'
import { InlineLoading } from '@/components/Loading'

type EditorForm = {
  title: string
  summary: string
  coverUrl: string
  content: string
  columnId: string | number
  tagIds: number[]
  status: 'DRAFT' | 'PUBLISHED'
  publishedAt: string
}

const EMPTY_FORM: EditorForm = { title: '', summary: '', coverUrl: '', content: '# 新文章\n\n开始写作…', columnId: '', tagIds: [], status: 'DRAFT', publishedAt: '' }

export default function ArticleEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const articleId = id ? Number(id) : undefined
  const [form, setForm] = useState<EditorForm>(EMPTY_FORM)
  const [columns, setColumns] = useState<ColumnView[]>([])
  const [tags, setTags] = useState<TagView[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [mediaOpen, setMediaOpen] = useState(false)
  const [mediaTarget, setMediaTarget] = useState<'content' | 'cover'>('content')
  const [media, setMedia] = useState<MediaAsset[]>([])
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLElement>(null)
  const syncingScrollRef = useRef(false)
  const imageInput = useRef<HTMLInputElement>(null)
  const coverInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      apiRequest<ColumnView[]>('/api/admin/columns'),
      apiRequest<TagView[]>('/api/admin/tags'),
      articleId ? apiRequest<ArticleDetail>(`/api/admin/articles/${articleId}`) : Promise.resolve(null),
    ]).then(([columnData, tagData, article]) => {
      setColumns(columnData)
      setTags(tagData)
      if (article) setForm({ title: article.title, summary: article.summary, coverUrl: article.coverUrl || '', content: article.content, columnId: article.column?.id ?? '', tagIds: article.tags.map(tag => tag.id), status: article.status, publishedAt: article.publishedAt?.slice(0, 16) ?? '' })
      else setForm(EMPTY_FORM)
      setDirty(false)
    }).catch(reason => setError(reason.message)).finally(() => setLoading(false))
  }, [articleId])

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const setField = <K extends keyof EditorForm>(key: K, value: EditorForm[K]) => {
    setForm(current => ({ ...current, [key]: value }))
    setDirty(true)
  }

  const syncScroll = (source: HTMLElement, target: HTMLElement | null) => {
    if (!target || syncingScrollRef.current) return
    const sourceRange = source.scrollHeight - source.clientHeight
    const targetRange = target.scrollHeight - target.clientHeight
    syncingScrollRef.current = true
    target.scrollTop = sourceRange > 0 ? (source.scrollTop / sourceRange) * targetRange : 0
    window.requestAnimationFrame(() => { syncingScrollRef.current = false })
  }

  const leave = () => {
    if (!dirty || window.confirm('文章还有未保存的修改，确定离开吗？')) navigate('/content/posts')
  }

  const save = async (publish = false) => {
    setSaving(true); setError(''); setMessage('')
    const status = publish ? 'PUBLISHED' : form.status
    const body = { ...form, status, columnId: form.columnId === '' ? null : Number(form.columnId), publishedAt: form.publishedAt || null }
    try {
      const saved = await apiRequest<ArticleDetail>(articleId ? `/api/admin/articles/${articleId}` : '/api/admin/articles', { method: articleId ? 'PUT' : 'POST', ...jsonBody(body) })
      setForm(current => ({ ...current, status: saved.status, publishedAt: saved.publishedAt?.slice(0, 16) ?? current.publishedAt }))
      setDirty(false)
      setMessage(publish ? '文章已发布' : '文章已保存')
      if (!articleId) navigate(`/content/posts/${saved.id}/edit`, { replace: true })
    } catch (reason) {
      setError((reason as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const insertMarkdown = (url: string, name: string) => {
    const editor = editorRef.current
    const markdown = `![${name.replace(/[\[\]]/g, '')}](${url})`
    if (!editor) { setField('content', `${form.content}\n\n${markdown}\n`); return }
    const start = editor.selectionStart
    const end = editor.selectionEnd
    const prefix = form.content.slice(0, start)
    const suffix = form.content.slice(end)
    const before = prefix.endsWith('\n') ? '' : '\n'
    const after = suffix.startsWith('\n') ? '' : '\n'
    const next = `${prefix}${before}${markdown}${after}${suffix}`
    setField('content', next)
    requestAnimationFrame(() => { const position = prefix.length + before.length + markdown.length; editor.focus(); editor.setSelectionRange(position, position) })
  }

  const upload = async (file: File | undefined, target: 'content' | 'cover') => {
    if (!file) return
    setUploading(true); setError('')
    const data = new FormData(); data.append('file', file)
    try {
      const asset = await apiRequest<MediaAsset>('/api/admin/media/images', { method: 'POST', body: data })
      if (target === 'cover') setField('coverUrl', asset.url)
      else insertMarkdown(asset.url, asset.originalName)
    } catch (reason) {
      setError((reason as Error).message)
    } finally {
      setUploading(false)
      if (imageInput.current) imageInput.current.value = ''
      if (coverInput.current) coverInput.current.value = ''
    }
  }

  const pasteImage = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const file = Array.from(event.clipboardData.files).find(item => item.type.startsWith('image/'))
    if (file) { event.preventDefault(); upload(file, 'content') }
  }

  const dropImage = (event: DragEvent<HTMLTextAreaElement>) => {
    const file = Array.from(event.dataTransfer.files).find(item => item.type.startsWith('image/'))
    if (file) { event.preventDefault(); upload(file, 'content') }
  }

  const openMedia = async (target: 'content' | 'cover') => {
    setMediaTarget(target); setMediaOpen(true)
    try { const result = await apiRequest<PageResponse<MediaAsset>>('/api/admin/media?page=1&pageSize=100'); setMedia(result.items) }
    catch (reason) { setError((reason as Error).message) }
  }

  const chooseMedia = (asset: MediaAsset) => {
    if (mediaTarget === 'cover') setField('coverUrl', asset.url)
    else insertMarkdown(asset.url, asset.originalName)
    setMediaOpen(false)
  }

  if (loading) return <Card><InlineLoading label="正在加载编辑器" /></Card>

  return <div className="mx-auto max-w-[1800px] space-y-5 pb-10">
    <div className="sticky top-[57px] z-20 -mx-4 flex flex-wrap items-center gap-3 border-y border-white/[0.06] bg-[#0a0a10]/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
      <button onClick={leave} className="flex items-center gap-2 text-sm text-white/55 hover:text-white"><ArrowLeft size={16} />返回文章列表</button>
      <div className="ml-auto flex items-center gap-2"><span className={`mr-2 text-xs ${dirty ? 'text-amber-300' : 'text-white/35'}`}>{dirty ? '有未保存修改' : message || '已保存'}</span><Btn onClick={() => save(false)} className="flex items-center gap-1.5"><Save size={14} />{saving ? '保存中…' : '保存'}</Btn><Btn variant="primary" onClick={() => save(true)} className="flex items-center gap-1.5"><Send size={14} />发布</Btn></div>
    </div>
    {error && <p className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">{error}</p>}
    <Card className="p-5 md:p-6">
      <input value={form.title} onChange={event => setField('title', event.target.value)} className="w-full border-none bg-transparent font-display text-3xl font-medium outline-none placeholder:text-white/20 md:text-4xl" placeholder="输入文章标题" />
      <textarea value={form.summary} onChange={event => setField('summary', event.target.value)} rows={2} className="mt-4 w-full resize-none border-none bg-transparent text-sm leading-relaxed text-white/55 outline-none placeholder:text-white/25" placeholder="写一段文章摘要…" />
    </Card>
    <details open className="rounded-xl border border-white/[0.07] bg-white/[0.02]">
      <summary className="cursor-pointer px-5 py-4 text-sm text-white/70">文章设置</summary>
      <div className="grid gap-5 border-t border-white/[0.07] p-5 md:grid-cols-2 xl:grid-cols-4">
        <Field label="专栏"><select value={form.columnId} onChange={event => setField('columnId', event.target.value)} className={inputCls}><option className="bg-[#12121c]" value="">无专栏</option>{columns.map(column => <option key={column.id} className="bg-[#12121c]" value={column.id}>{column.nameZh}</option>)}</select></Field>
        <Field label="状态"><select value={form.status} onChange={event => setField('status', event.target.value as EditorForm['status'])} className={inputCls}><option className="bg-[#12121c]" value="DRAFT">草稿</option><option className="bg-[#12121c]" value="PUBLISHED">已发布</option></select></Field>
        <Field label="发布时间"><input type="datetime-local" value={form.publishedAt} onChange={event => setField('publishedAt', event.target.value)} className={inputCls} /></Field>
        <div><span className="mb-1.5 block text-xs text-white/50">当前状态</span><div className="pt-2"><Badge tone={form.status === 'PUBLISHED' ? 'teal' : 'amber'}>{form.status === 'PUBLISHED' ? '已发布' : '草稿'}</Badge></div></div>
        <div className="md:col-span-2 xl:col-span-3"><span className="mb-2 block text-xs text-white/50">标签</span><div className="flex min-h-11 flex-wrap gap-2 rounded-lg border border-white/10 p-2.5">{tags.map(tag => <label key={tag.id} className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${form.tagIds.includes(tag.id) ? 'border-teal-400/50 bg-teal-400/10 text-teal-300' : 'border-white/10 text-white/45'}`}><input type="checkbox" className="sr-only" checked={form.tagIds.includes(tag.id)} onChange={() => setField('tagIds', form.tagIds.includes(tag.id) ? form.tagIds.filter(value => value !== tag.id) : [...form.tagIds, tag.id])} />{tag.name}</label>)}</div></div>
        <div><span className="mb-2 block text-xs text-white/50">文章封面</span><div className="flex gap-2"><button onClick={() => coverInput.current?.click()} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 hover:text-teal-300"><Upload size={14} />上传封面</button><button onClick={() => openMedia('cover')} className="rounded-lg border border-white/10 px-3 text-white/55 hover:text-teal-300"><FileImage size={15} /></button><input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={event => upload(event.target.files?.[0], 'cover')} /></div>{form.coverUrl && <div className="relative mt-3 overflow-hidden rounded-lg"><img src={form.coverUrl} className="aspect-video w-full object-cover" /><button onClick={() => setField('coverUrl', '')} className="absolute right-2 top-2 rounded bg-black/70 px-2 py-1 text-[10px] text-white/70">移除</button></div>}</div>
      </div>
    </details>
    <div className="grid items-stretch gap-5 xl:grid-cols-2">
      <Card className="flex h-[clamp(520px,68vh,820px)] min-h-0 flex-col overflow-hidden"><div className="flex shrink-0 items-center gap-2 border-b border-white/[0.07] px-4 py-3"><span className="font-mono2 text-xs text-teal-300">Markdown</span><span className="text-xs text-white/30">支持粘贴或拖入图片 · 与预览同步滚动</span><button onClick={() => imageInput.current?.click()} className="ml-auto flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:text-teal-300"><ImagePlus size={14} />{uploading ? '上传中…' : '上传图片'}</button><button onClick={() => openMedia('content')} className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:text-teal-300">素材库</button><input ref={imageInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={event => upload(event.target.files?.[0], 'content')} /></div><textarea ref={editorRef} value={form.content} onChange={event => setField('content', event.target.value)} onScroll={event => syncScroll(event.currentTarget, previewRef.current)} onPaste={pasteImage} onDragOver={event => event.preventDefault()} onDrop={dropImage} className="min-h-0 w-full flex-1 resize-none overflow-y-scroll bg-transparent p-5 font-mono2 text-sm leading-7 text-white/80 outline-none" spellCheck={false} /></Card>
      <Card className="flex h-[clamp(520px,68vh,820px)] min-h-0 flex-col overflow-hidden"><div className="flex shrink-0 items-center gap-2 border-b border-white/[0.07] px-4 py-3"><Eye size={14} className="text-teal-300" /><span className="text-xs text-white/60">实时预览</span><span className="text-xs text-white/30">双向同步滚动</span></div><article ref={previewRef} onScroll={event => syncScroll(event.currentTarget, editorRef.current)} className="markdown-preview min-h-0 flex-1 overflow-y-scroll overflow-x-hidden p-6"><ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown></article></Card>
    </div>
    <Modal open={mediaOpen} title={mediaTarget === 'cover' ? '选择封面' : '插入图片素材'} onClose={() => setMediaOpen(false)} className="max-w-5xl"><div className="grid max-h-[65vh] gap-3 overflow-y-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">{media.map(asset => <button key={asset.id} onClick={() => chooseMedia(asset)} className="overflow-hidden rounded-lg border border-white/10 text-left hover:border-teal-400/50"><img src={asset.url} className="aspect-video w-full object-cover" loading="lazy" /><span className="block truncate p-2 text-xs text-white/55">{asset.originalName}</span></button>)}</div>{media.length === 0 && <p className="py-16 text-center text-white/35">暂无图片素材</p>}</Modal>
  </div>
}
