import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import rehypeHighlight from 'rehype-highlight'
import { unified } from 'unified'
import { Check, Copy } from 'lucide-react'
import { useLang } from '@/i18n'
import Reveal from '@/components/Reveal'
import { PageLoading } from '@/components/Loading'
import { apiRequest, formatDate, useApi } from '@/api/client'
import type { ArticleDetail } from '@/api/types'
import 'highlight.js/styles/github-dark.css'

function scrollToSection(el: HTMLElement, onComplete: () => void) {
  const lenis = (window as unknown as { __lenis?: { scrollTo: (target: HTMLElement, options: object) => void } }).__lenis
  if (lenis?.scrollTo) {
    lenis.scrollTo(el, { offset: -100, duration: 1, onComplete })
  } else {
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' })
    window.setTimeout(onComplete, 600)
  }
}

type MarkdownNode = {
  type: string
  depth?: number
  value?: string
  children?: MarkdownNode[]
  position?: { start: { offset?: number } }
  data?: { hProperties?: Record<string, unknown>; [key: string]: unknown }
}

type TocHeading = { id: string; text: string; offset: number }
const HIGHLIGHT_LEAD_MS = 120

function markdownText(node: MarkdownNode): string {
  if (typeof node.value === 'string') return node.value
  return node.children?.map(markdownText).join('') ?? ''
}

function walkMarkdown(node: MarkdownNode, visit: (current: MarkdownNode) => void) {
  visit(node)
  node.children?.forEach(child => walkMarkdown(child, visit))
}

function analyzeHeadings(markdown: string) {
  const tree = unified().use(remarkParse).parse(markdown) as MarkdownNode
  const headings: TocHeading[] = []
  walkMarkdown(tree, node => {
    const offset = node.position?.start.offset
    if (node.type === 'heading' && node.depth === 2 && typeof offset === 'number') {
      headings.push({ id: `section-${offset}`, text: markdownText(node), offset })
    }
  })
  return headings
}

function createHeadingIdPlugin(headings: TocHeading[]) {
  const idByOffset = new Map(headings.map(heading => [heading.offset, heading.id]))
  return () => (tree: MarkdownNode) => {
    walkMarkdown(tree, node => {
      const offset = node.position?.start.offset
      const id = typeof offset === 'number' ? idByOffset.get(offset) : undefined
      if (node.type !== 'heading' || node.depth !== 2 || !id) return
      node.data = {
        ...node.data,
        hProperties: { ...node.data?.hProperties, id },
      }
    })
  }
}

function nodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (node && typeof node === 'object' && 'props' in node) {
    return nodeText((node as { props: { children?: ReactNode } }).props.children)
  }
  return ''
}

function CodeBlock({ children }: { children?: ReactNode }) {
  const [copied, setCopied] = useState(false)
  const text = nodeText(children).replace(/\n$/, '')
  return (
    <div className="group/code relative my-6 overflow-hidden rounded-xl border border-white/10 bg-[#0d1117]">
      <button
        type="button"
        aria-label="Copy code"
        onClick={() => {
          navigator.clipboard.writeText(text).then(() => {
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1500)
          })
        }}
        className="absolute right-3 top-3 z-10 rounded-md border border-white/10 bg-black/40 p-2 text-white/50 opacity-0 transition hover:text-teal-300 group-hover/code:opacity-100"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <pre className="overflow-x-auto p-5 text-sm leading-relaxed">{children}</pre>
    </div>
  )
}

export default function PostDetail() {
  const { slug } = useParams()
  const { t, lang } = useLang()
  const { data: post, loading, error } = useApi<ArticleDetail>(slug ? `/api/public/articles/${encodeURIComponent(slug)}` : null)
  const headings = useMemo(() => analyzeHeadings(post?.content ?? ''), [post?.content])
  const headingIdPlugin = useMemo(() => createHeadingIdPlugin(headings), [headings])
  const [active, setActive] = useState(0)
  const scrollingToRef = useRef<number | null>(null)
  const navigationSequenceRef = useRef(0)
  const navigationStartTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!post) return
    apiRequest<void>(`/api/public/articles/${encodeURIComponent(post.slug)}/view`, { method: 'POST' }).catch(() => undefined)
  }, [post?.id])

  useEffect(() => {
    if (!post) return
    const onScroll = () => {
      if (scrollingToRef.current !== null) return
      let index = 0
      headings.forEach((heading, current) => {
        const element = document.getElementById(heading.id)
        if (element && element.getBoundingClientRect().top <= 160) index = current
      })
      setActive(index)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [post, headings])

  useEffect(() => () => {
    if (navigationStartTimerRef.current !== null) window.clearTimeout(navigationStartTimerRef.current)
  }, [])

  const navigateToHeading = (heading: TocHeading, index: number) => {
    const element = document.getElementById(heading.id)
    if (!element) return
    const sequence = ++navigationSequenceRef.current
    scrollingToRef.current = index
    setActive(index)
    if (navigationStartTimerRef.current !== null) window.clearTimeout(navigationStartTimerRef.current)
    navigationStartTimerRef.current = window.setTimeout(() => {
      if (navigationSequenceRef.current !== sequence) return
      navigationStartTimerRef.current = null
      scrollToSection(element, () => {
        if (navigationSequenceRef.current !== sequence) return
        scrollingToRef.current = null
        setActive(index)
      })
    }, HIGHLIGHT_LEAD_MS)
  }

  if (loading) {
    return <PageLoading label="正在加载文章" />
  }
  if (!post || error) {
    return (
      <div className="mx-auto max-w-3xl px-6 pb-28 pt-44 text-center">
        <p className="text-white/50">{error || t.blog.notFound}</p>
        <Link to="/blog" className="mt-6 inline-block text-teal-300 hover:underline">← {t.blog.back}</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-28 pt-36 md:px-10 md:pt-44">
      <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_260px]">
        <article className="max-w-3xl">
          <Reveal>
            <Link to="/blog" className="font-mono2 text-xs uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-teal-300">
              ← {t.blog.back}
            </Link>
            <div className="mt-8 flex flex-wrap items-center gap-4 font-mono2 text-[11px] uppercase tracking-widest text-white/40">
              <span className="text-teal-300/80">
                {post.column ? (lang === 'zh' ? post.column.nameZh : post.column.nameEn) : t.blog.all}
              </span>
              <span>{formatDate(post.publishedAt, lang)}</span>
              <span>{post.readMinutes} {t.blog.minRead}</span>
            </div>
            <h1 className="mt-6 font-display text-3xl font-medium leading-tight tracking-tight md:text-5xl">{post.title}</h1>
            {post.summary && <p className="mt-5 text-lg leading-relaxed text-white/60">{post.summary}</p>}
            {post.coverUrl && <img src={post.coverUrl} alt="" className="mt-8 aspect-[16/8] w-full rounded-2xl border border-white/10 object-cover" />}
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag.id} className="rounded-md bg-white/[0.05] px-2.5 py-1 font-mono2 text-[11px] text-white/60">{tag.name}</span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15} className="mt-12">
            <div className="markdown-body border-t border-white/10 pt-8">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, headingIdPlugin]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
                  a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer noopener">{children}</a>,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </Reveal>

          {post.related.length > 0 && (
            <Reveal delay={0.2} className="mt-16">
              <p className="mb-6 font-mono2 text-xs uppercase tracking-[0.25em] text-teal-300">{t.blog.related}</p>
              <div className="grid gap-4 md:grid-cols-2">
                {post.related.map((article) => (
                  <Link key={article.slug} to={`/blog/${article.slug}`} className="group rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-teal-300/40">
                    <h3 className="font-display text-base font-medium leading-snug transition-colors group-hover:text-teal-200">{article.title}</h3>
                    <p className="mt-2 font-mono2 text-[11px] text-white/35">{formatDate(article.publishedAt, lang)}</p>
                  </Link>
                ))}
              </div>
            </Reveal>
          )}
        </article>

        {headings.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-32">
              <p className="mb-5 font-mono2 text-xs uppercase tracking-[0.25em] text-white/40">{t.blog.toc}</p>
              <nav className="relative border-l border-white/10">
                {headings.map((heading, index) => (
                  <button key={heading.id} aria-current={active === index ? 'location' : undefined} onClick={() => navigateToHeading(heading, index)} className={`group relative block w-full py-2.5 pl-5 text-left text-sm transition-colors ${active === index ? 'text-teal-300' : 'text-white/45 hover:text-white/80'}`}>
                    <span className={`absolute left-[-1px] top-1/2 h-5 w-px -translate-y-1/2 bg-teal-300 transition-all duration-300 ${active === index ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}`} />
                    {heading.text}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
