import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'zh' | 'en'

const LANGUAGE_STORAGE_KEY = 'blog-language'

function readStoredLanguage(): Lang {
  if (typeof window === 'undefined') return 'zh'
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return stored === 'en' || stored === 'zh' ? stored : 'zh'
  } catch {
    return 'zh'
  }
}

const zh = {
  nav: { home: '首页', blog: '博客', columns: '专栏', about: '关于', contact: '联系' },
  hero: {
    status: '开放合作机会',
    greeting: '你好，我是',
    name: '林中月',
    nameEn: 'LIN ZHONGYUE',
    role1: '全栈工程师',
    role2: 'AI 构建者',
    desc: '在代码与智能的交汇处构建产品。专注全栈架构与大模型应用，把复杂的想法变成优雅的系统。',
    scroll: '向下滚动',
    hint: '移动鼠标，发现隐藏的文字',
  },
  home: {
    featuredWorks: '精选项目',
    latestPosts: '最新文章',
    viewAll: '查看全部',
    viewProject: '查看项目',
    works: [
      { name: 'Nexus Agent', cn: '多智能体协作平台', desc: '基于 LLM 的多 Agent 编排框架，支持工具调用、记忆共享与任务分解。', tech: ['TypeScript', 'LangGraph', 'Redis'] },
      { name: 'Pulse Engine', cn: '实时数据流引擎', desc: '毫秒级事件处理管道，日处理 2 亿条消息。', tech: ['Go', 'Kafka', 'ClickHouse'] },
      { name: 'Aria UI', cn: 'AI 原生设计系统', desc: '面向 AI 应用的组件库，GitHub 2.4k stars。', tech: ['React', 'Tailwind', 'WASM'] },
    ],
  },
  blog: {
    title: '博客',
    subtitle: '关于工程、AI 与构建的思考记录。',
    search: '搜索文章…',
    all: '全部',
    readMore: '阅读全文',
    back: '返回博客',
    toc: '本页导航',
    minRead: '分钟阅读',
    notFound: '没有找到匹配的文章',
    related: '相关文章',
  },
  columnsPage: {
    title: '专栏',
    subtitle: '系统化的系列专题，比单篇文章走得更远。',
    articles: '篇文章',
    updated: '最近更新',
    enter: '进入专栏',
    ongoing: '连载中',
    completed: '已完结',
    back: '返回专栏',
    emptyTitle: '内容筹备中',
    emptyDesc: '这个专栏的文章正在整理，先去别处逛逛吧。',
    list: [
      { slug: 'llm-practice', name: 'LLM 工程实战', desc: '从 Prompt 工程到 Agent 编排，大模型应用落地的完整方法论。', count: 3, status: 'ongoing', date: '2025-07' },
      { slug: 'motion-lab', name: '前端动效实验室', desc: 'WebGL、GSAP、物理动画——拆解国际获奖网站的交互实现。', count: 2, status: 'ongoing', date: '2025-06' },
      { slug: 'system-design', name: '系统设计笔记', desc: '高并发、分布式、数据一致性，一线大厂的架构实战复盘。', count: 0, status: 'ongoing', date: '2025-03' },
      { slug: 'agent-watch', name: 'AI Agent 观察', desc: '追踪 Agent 生态演进，每周一篇深度解读。', count: 0, status: 'ongoing', date: '2025-08' },
      { slug: 'rust-diaries', name: 'Rust 迁移手记', desc: '把性能敏感模块从 Node.js 迁到 Rust 的踩坑全记录。', count: 1, status: 'ongoing', date: '2025-06' },
      { slug: 'indie-log', name: '独立开发日志', desc: '从零到一做 Side Project 的真实收支与心路。', count: 0, status: 'ongoing', date: '2025-07' },
    ],
  },
  about: {
    title: '关于我',
    role: '全栈工程师 × AI 构建者',
    p1: '我是林中月，一名全栈 + AI 工程师，热衷于在系统设计与前沿智能之间搭建桥梁。从分布式后端到精致的交互界面，从模型微调到 Agent 编排，我享受从零到一的完整创造过程。',
    p2: '相信好的工程是克制的艺术——用最合适的工具解决最真实的问题。写作于我而言是另一种构建：把经验沉淀为可以复用的思考。',
    stats: [{ n: '6+', label: '年工程经验' }, { n: '30+', label: '落地项目' }, { n: '40+', label: '技术文章' }, { n: '12', label: '套 AI 系统' }],
    projectsTitle: '项目',
    timelineTitle: '经历',
    timeline: [
      { year: '2023 — 至今', title: '资深全栈工程师 · 某 AI 独角兽', desc: '主导 LLM 应用平台架构，支撑千万级调用量。' },
      { year: '2021 — 2023', title: '全栈工程师 · 一线大厂', desc: '负责实时数据平台核心链路，从 0 到 1 搭建流处理体系。' },
      { year: '2019 — 2021', title: '前端工程师 · 出海创业公司', desc: '独立负责 C 端产品前端，深度参与交互与动效设计。' },
      { year: '2019', title: '计算机科学 · 工学学士', desc: '开始写第一行生产代码，也写下了第一篇技术博客。' },
    ],
    skillsTitle: '技能矩阵',
    skills: [
      { group: '前端', items: ['React / Next.js', 'TypeScript', 'Three.js / WebGL', 'GSAP 动效'] },
      { group: '后端', items: ['Node.js / Go', 'PostgreSQL / Redis', 'Kafka / 流处理', 'Kubernetes'] },
      { group: 'AI', items: ['LLM 应用架构', 'Agent 编排', 'RAG 系统', '模型微调'] },
    ],
  },
  contactPage: {
    title: '联系',
    heading: '让我们一起\n构建下一个产品。',
    desc: '无论是全职机会、自由合作，还是单纯聊聊技术——我的收件箱永远敞开。通常 24 小时内回复。',
    email: 'hello@linzhongyue.dev',
    cta: '发起对话',
    socialsTitle: '在其他地方找到我',
    socials: [
      { name: 'GitHub', handle: '@linzhongyue' },
      { name: 'X / Twitter', handle: '@linzhongyue' },
      { name: 'LinkedIn', handle: '/in/linzhongyue' },
      { name: '掘金', handle: '@林中月' },
    ],
  },
  footer: '© 2025 林中月 · 设计与构建于深夜',
}

const en: typeof zh = {
  nav: { home: 'Home', blog: 'Blog', columns: 'Columns', about: 'About', contact: 'Contact' },
  hero: {
    status: 'Open to opportunities',
    greeting: "Hi, I'm",
    name: '林中月',
    nameEn: 'LIN ZHONGYUE',
    role1: 'Full-Stack Engineer',
    role2: 'AI Builder',
    desc: 'Building products at the intersection of code and intelligence. Focused on full-stack architecture and LLM applications — turning complex ideas into elegant systems.',
    scroll: 'Scroll',
    hint: 'Move your cursor to discover hidden text',
  },
  home: {
    featuredWorks: 'Selected Works',
    latestPosts: 'Latest Posts',
    viewAll: 'View all',
    viewProject: 'View project',
    works: [
      { name: 'Nexus Agent', cn: 'Multi-Agent Platform', desc: 'LLM-based multi-agent orchestration with tool use, shared memory and task decomposition.', tech: ['TypeScript', 'LangGraph', 'Redis'] },
      { name: 'Pulse Engine', cn: 'Real-time Data Engine', desc: 'Millisecond event pipeline handling 200M messages/day.', tech: ['Go', 'Kafka', 'ClickHouse'] },
      { name: 'Aria UI', cn: 'AI-native Design System', desc: 'Component library for AI apps. 2.4k stars on GitHub.', tech: ['React', 'Tailwind', 'WASM'] },
    ],
  },
  blog: {
    title: 'Blog',
    subtitle: 'Notes on engineering, AI, and the craft of building.',
    search: 'Search posts…',
    all: 'All',
    readMore: 'Read more',
    back: 'Back to blog',
    toc: 'On this page',
    minRead: 'min read',
    notFound: 'No posts found',
    related: 'Related',
  },
  columnsPage: {
    title: 'Columns',
    subtitle: 'Systematic series that go further than single posts.',
    articles: 'articles',
    updated: 'Updated',
    enter: 'Enter column',
    ongoing: 'Ongoing',
    completed: 'Completed',
    back: 'Back to columns',
    emptyTitle: 'In preparation',
    emptyDesc: 'Articles for this column are being prepared — explore elsewhere in the meantime.',
    list: [
      { slug: 'llm-practice', name: 'LLM Engineering in Practice', desc: 'From prompt engineering to agent orchestration — a complete methodology for shipping LLM apps.', count: 3, status: 'ongoing', date: '2025-07' },
      { slug: 'motion-lab', name: 'Frontend Motion Lab', desc: 'WebGL, GSAP, physics-based animation — deconstructing award-winning site interactions.', count: 2, status: 'ongoing', date: '2025-06' },
      { slug: 'system-design', name: 'System Design Notes', desc: 'High concurrency, distributed systems, data consistency — real architecture retrospectives.', count: 0, status: 'ongoing', date: '2025-03' },
      { slug: 'agent-watch', name: 'AI Agent Watch', desc: 'Tracking the evolution of the agent ecosystem, one deep dive per week.', count: 0, status: 'ongoing', date: '2025-08' },
      { slug: 'rust-diaries', name: 'Rust Migration Diaries', desc: 'Moving performance-critical modules from Node.js to Rust — every pitfall recorded.', count: 1, status: 'ongoing', date: '2025-06' },
      { slug: 'indie-log', name: 'Indie Dev Log', desc: 'Real numbers and honest reflections on building side projects from zero to one.', count: 0, status: 'ongoing', date: '2025-07' },
    ],
  },
  about: {
    title: 'About',
    role: 'Full-Stack Engineer × AI Builder',
    p1: "I'm Lin Zhongyue, a full-stack + AI engineer who loves bridging system design and frontier intelligence. From distributed backends to polished interfaces, from fine-tuning to agent orchestration — I enjoy the full zero-to-one creation process.",
    p2: 'Good engineering is the art of restraint: the right tool for the realest problem. Writing is another form of building — distilling experience into reusable thought.',
    stats: [{ n: '6+', label: 'Years of engineering' }, { n: '30+', label: 'Shipped projects' }, { n: '40+', label: 'Technical posts' }, { n: '12', label: 'AI systems built' }],
    projectsTitle: 'Projects',
    timelineTitle: 'Journey',
    timeline: [
      { year: '2023 — Now', title: 'Senior Full-Stack Engineer · AI Unicorn', desc: 'Leading LLM application platform architecture at 10M+ daily calls.' },
      { year: '2021 — 2023', title: 'Full-Stack Engineer · Big Tech', desc: 'Built the core real-time data pipeline from zero to one.' },
      { year: '2019 — 2021', title: 'Frontend Engineer · Global Startup', desc: 'Owned the consumer product frontend, deep in interaction and motion design.' },
      { year: '2019', title: 'B.Eng. in Computer Science', desc: 'Wrote my first line of production code — and my first blog post.' },
    ],
    skillsTitle: 'Skill Matrix',
    skills: [
      { group: 'Frontend', items: ['React / Next.js', 'TypeScript', 'Three.js / WebGL', 'GSAP Motion'] },
      { group: 'Backend', items: ['Node.js / Go', 'PostgreSQL / Redis', 'Kafka / Streaming', 'Kubernetes'] },
      { group: 'AI', items: ['LLM App Architecture', 'Agent Orchestration', 'RAG Systems', 'Fine-tuning'] },
    ],
  },
  contactPage: {
    title: 'Contact',
    heading: "Let's build the\nnext thing together.",
    desc: 'Full-time roles, freelance collaborations, or just a chat about tech — my inbox is always open. Usually replies within 24 hours.',
    email: 'hello@linzhongyue.dev',
    cta: 'Start a conversation',
    socialsTitle: 'Find me elsewhere',
    socials: [
      { name: 'GitHub', handle: '@linzhongyue' },
      { name: 'X / Twitter', handle: '@linzhongyue' },
      { name: 'LinkedIn', handle: '/in/linzhongyue' },
      { name: 'Blog', handle: '@linzhongyue' },
    ],
  },
  footer: '© 2025 Lin Zhongyue · Designed & built after midnight',
}

interface LangCtx {
  lang: Lang
  toggle: () => void
  t: typeof zh
}

const LanguageContext = createContext<LangCtx>({ lang: 'zh', toggle: () => {}, t: zh })

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readStoredLanguage)

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    } catch {
      // Keep language switching functional when browser storage is unavailable.
    }
  }, [lang])

  useEffect(() => {
    const syncLanguage = (event: StorageEvent) => {
      if (event.key === LANGUAGE_STORAGE_KEY && (event.newValue === 'zh' || event.newValue === 'en')) {
        setLang(event.newValue)
      }
    }
    window.addEventListener('storage', syncLanguage)
    return () => window.removeEventListener('storage', syncLanguage)
  }, [])

  const toggle = () => setLang((l) => (l === 'zh' ? 'en' : 'zh'))
  return (
    <LanguageContext.Provider value={{ lang, toggle, t: lang === 'zh' ? zh : en }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
