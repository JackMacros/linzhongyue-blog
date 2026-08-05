export interface Post {
  slug: string
  column: string
  category: { zh: string; en: string }
  title: { zh: string; en: string }
  excerpt: { zh: string; en: string }
  date: string
  readMin: number
  tags: string[]
  headings: { zh: string[]; en: string[] }
  body: { zh: string[]; en: string[] }
}

export const posts: Post[] = [
  {
    slug: 'agent-orchestration-patterns',
    column: 'llm-practice',
    category: { zh: 'AI 工程', en: 'AI Engineering' },
    title: { zh: '多 Agent 编排的三种模式：从串行到群体智能', en: 'Three Patterns of Multi-Agent Orchestration' },
    excerpt: {
      zh: '当单个 Agent 无法完成任务时，编排就成了核心问题。本文拆解串行流水线、层级委派与去中心化协作三种模式的适用场景与工程代价。',
      en: 'When a single agent falls short, orchestration becomes the core problem. This post breaks down sequential pipelines, hierarchical delegation, and decentralized collaboration.',
    },
    date: '2025-07-28',
    readMin: 9,
    tags: ['LLM', 'Agent', '架构'],
    headings: {
      zh: ['编排决定上限', '串行流水线', '层级委派', '去中心化协作', '我的建议'],
      en: ['Orchestration sets the ceiling', 'Sequential pipelines', 'Hierarchical delegation', 'Decentralized collaboration', 'My advice'],
    },
    body: {
      zh: [
        '大多数 Agent 系统的失败不是模型能力的失败，而是编排的失败。当任务复杂度超过单个 Agent 的上下文与注意力极限，如何拆分、委派与汇合就决定了系统的上限。',
        '串行流水线是最直觉的模式：A 的输出是 B 的输入。它可预测、易调试，但错误会逐级放大。关键技巧是在每个节点加入校验器（validator），宁可重跑也不要传递坏结果。',
        '层级委派引入了"管理者"角色：一个 Planner 负责拆解任务并分发给 Worker。它适合任务边界清晰的场景，但 Planner 本身成为单点——它的幻觉会变成整个团队的幻觉。',
        '去中心化协作最接近人类团队：多个 Agent 通过共享记忆（黑板模式）异步协作。它最强大也最危险，没有清晰的终止条件时，成本会指数失控。工程上必须设置全局预算与僵局检测。',
        '我的建议是：从串行开始，只有在收益明确时才引入更复杂的拓扑。编排的复杂度本身就是一种技术债。',
      ],
      en: [
        "Most agent systems fail not from model capability, but from orchestration. Once task complexity exceeds a single agent's context and attention limits, how you split, delegate, and merge determines the ceiling.",
        "Sequential pipelines are the most intuitive pattern: A's output feeds B. Predictable and debuggable, but errors compound. The key trick is adding validators at each node — rerun rather than propagate bad results.",
        'Hierarchical delegation introduces a "manager": a Planner decomposes tasks and dispatches Workers. Great for well-bounded tasks, but the Planner is a single point of failure — its hallucinations become the team\'s hallucinations.',
        'Decentralized collaboration is closest to human teams: agents cooperate asynchronously through shared memory (blackboard pattern). Most powerful and most dangerous — without clear termination conditions, costs spiral. Set global budgets and deadlock detection.',
        'My advice: start sequential, and only adopt more complex topologies when the payoff is proven. Orchestration complexity is itself technical debt.',
      ],
    },
  },
  {
    slug: 'webgl-award-winning-sites',
    column: 'motion-lab',
    category: { zh: '前端', en: 'Frontend' },
    title: { zh: '拆解 Awwwards 获奖站：WebGL 交互的三个层次', en: 'Deconstructing Awwwards Sites: Three Levels of WebGL Interaction' },
    excerpt: {
      zh: '从粒子背景到全场景叙事，获奖网站的 WebGL 用法其实有清晰的进阶路径。掌握这三个层次，你也能做出"国际范"。',
      en: 'From particle backgrounds to full-scene storytelling, award-winning sites follow a clear progression. Master these three levels and you can build "international-class" experiences too.',
    },
    date: '2025-07-15',
    readMin: 7,
    tags: ['WebGL', 'Three.js', '动效'],
    headings: {
      zh: ['氛围层', '响应层', '叙事层', '常见误区'],
      en: ['The atmosphere layer', 'The responsive layer', 'The narrative layer', 'The common mistake'],
    },
    body: {
      zh: [
        '第一层是"氛围层"：粒子、噪点、渐变光晕。它们不参与叙事，只负责建立质感。技术上最简单，却决定了 70% 的第一印象。',
        '第二层是"响应层"：场景对鼠标、滚动做出物理反馈——涟漪、视差、惯性。关键是阻尼（damping）参数，0.06 到 0.12 之间的 lerp 几乎适用于所有场景。',
        '第三层是"叙事层"：WebGL 场景本身就是内容，滚动驱动相机穿越场景。这需要与内容团队深度协作，技术上是 scroll-driven camera 与材质过渡的组合。',
        '常见误区是跳过前两层直接做第三层。没有氛围与响应的叙事场景，就像没有混音的人声——技术上完整，体验上苍白。',
      ],
      en: [
        "Level one is the \"atmosphere layer\": particles, grain, gradient glows. They don't narrate — they establish texture. Technically simplest, yet responsible for 70% of first impressions.",
        'Level two is the "responsive layer": scenes react to cursor and scroll with physical feedback — ripples, parallax, inertia. The key is damping: a lerp between 0.06 and 0.12 works for almost everything.',
        "Level three is the \"narrative layer\": the WebGL scene IS the content, with scroll driving the camera through it. This demands deep collaboration with content teams — technically it's scroll-driven cameras plus material transitions.",
        'The common mistake is jumping straight to level three. A narrative scene without atmosphere and responsiveness is like an unmixed vocal — technically complete, experientially hollow.',
      ],
    },
  },
  {
    slug: 'rag-production-lessons',
    column: 'llm-practice',
    category: { zh: 'AI 工程', en: 'AI Engineering' },
    title: { zh: 'RAG 上线六个月后的七个教训', en: 'Seven Lessons from Six Months of RAG in Production' },
    excerpt: {
      zh: '检索增强生成在 Demo 里很美，在生产里很残酷。关于分块、混合检索、评估体系，这些是论文不会告诉你的事。',
      en: "RAG looks beautiful in demos and brutal in production. On chunking, hybrid retrieval, and evaluation — the things papers won't tell you.",
    },
    date: '2025-06-30',
    readMin: 11,
    tags: ['RAG', 'LLM', '生产实践'],
    headings: {
      zh: ['分块优先', '混合检索是基线', '评估体系', '查询改写', '最后三条'],
      en: ['Chunking first', 'Hybrid retrieval baseline', 'Evaluation', 'Query rewriting', 'The last three'],
    },
    body: {
      zh: [
        '教训一：分块策略比模型选择重要十倍。我们换了三次 embedding 模型，收益加起来不如一次分块重构。',
        '教训二：纯向量检索在专业领域会系统性失效。BM25 + 向量的混合检索，配合 RRF 融合，是不容谈判的基线。',
        '教训三：没有评估体系就没有迭代。我们最终建立了 200 条黄金问答集，每次改动跑全量回归——这比任何架构图都值钱。',
        '教训四：用户的问题质量极差。上线后 40% 的查询是模糊或超出语料范围的。查询改写（query rewriting）模块的 ROI 远超预期。',
        '教训五到七，一言以蔽之：缓存一切、记录一切、给"我不知道"一个体面的出口。',
      ],
      en: [
        'Lesson one: chunking strategy matters ten times more than model choice. We swapped embedding models three times; the combined gain was less than one chunking refactor.',
        'Lesson two: pure vector retrieval fails systematically in specialized domains. BM25 + vector hybrid with RRF fusion is a non-negotiable baseline.',
        'Lesson three: no evaluation, no iteration. We built a 200-item golden QA set and ran full regression on every change — worth more than any architecture diagram.',
        'Lesson four: user queries are terrible. 40% of production queries were vague or out-of-corpus. The ROI of a query rewriting module far exceeded expectations.',
        'Lessons five through seven, in short: cache everything, log everything, and give "I don\'t know" a dignified exit.',
      ],
    },
  },
  {
    slug: 'typescript-rust-wasm',
    column: 'rust-diaries',
    category: { zh: '工程实践', en: 'Engineering' },
    title: { zh: '把热点路径交给 Rust：一次 WASM 性能改造实录', en: 'Handing Hot Paths to Rust: A WASM Performance Story' },
    excerpt: {
      zh: '当 JS 优化到极限仍然不够快，WASM 是前端最后的性能武器。一次真实的 20 倍提速改造，以及那些文档里没写的坑。',
      en: "When JS optimization hits its limit, WASM is the frontend's last performance weapon. A real 20x speedup story, plus the pitfalls the docs don't mention.",
    },
    date: '2025-06-12',
    readMin: 8,
    tags: ['Rust', 'WASM', '性能'],
    headings: {
      zh: ['场景与瓶颈', '边界设计', '结果', '真实的坑'],
      en: ['The scenario', 'Boundary design', 'Results', 'Real pitfalls'],
    },
    body: {
      zh: [
        '场景：前端需要实时处理 10 万行数据的聚合计算。纯 JS 优化后仍需 800ms，交互完全卡死。',
        '迁移决策的关键不是"哪里慢"，而是"边界在哪"。WASM 与 JS 之间的数据传递有真实成本，频繁跨边界调用会吃掉所有收益。我们把整个计算核而不是单个函数搬进 Rust。',
        '结果：40ms，20 倍提速。但真正的收获是发现了 SIMD intrinsics 在 wasm32 目标下的稳定支持——向量化又带来了额外 3 倍。',
        '坑也是真的：调试体验倒退十年、panic 信息在生产环境几乎不可读、bundle 体积需要 brotli 才能接受。值不值？对热点路径，永远值。',
      ],
      en: [
        'The scenario: real-time aggregation over 100k rows in the browser. After every JS optimization, 800ms remained — the UI was frozen.',
        "The key migration decision isn't \"what's slow\" but \"where's the boundary.\" Data transfer between WASM and JS has real cost; frequent boundary crossings eat all gains. We moved the entire compute kernel, not individual functions.",
        'Result: 40ms, a 20x speedup. The real bonus was discovering stable SIMD intrinsics on wasm32 — vectorization added another 3x.',
        'The pitfalls are real too: debugging regressed a decade, panics are unreadable in production, and bundle size only becomes acceptable with brotli. Worth it? For hot paths, always.',
      ],
    },
  },
  {
    slug: 'lenis-gsap-smooth-scroll',
    column: 'motion-lab',
    category: { zh: '前端', en: 'Frontend' },
    title: { zh: '平滑滚动的正确姿势：Lenis + GSAP 协同指南', en: 'Smooth Scrolling Done Right: Lenis + GSAP Integration Guide' },
    excerpt: {
      zh: '90% 的平滑滚动实现都是错的：要么和 ScrollTrigger 打架，要么在移动端翻车。一篇文章讲清正确的集成方式。',
      en: '90% of smooth scroll implementations are wrong: they fight ScrollTrigger or break on mobile. The correct integration, in one post.',
    },
    date: '2025-05-20',
    readMin: 6,
    tags: ['GSAP', 'Lenis', '动效'],
    headings: {
      zh: ['核心矛盾', '一行胶水代码', '移动端策略', '锚点细节'],
      en: ['The core conflict', 'One line of glue', 'Mobile strategy', 'Anchor details'],
    },
    body: {
      zh: [
        '核心矛盾：Lenis 接管了滚动，而 ScrollTrigger 监听原生 scroll 事件。两者不同步，动画就会抖动或错位。',
        '解法是一行胶水代码：在 Lenis 的 scroll 回调里调用 ScrollTrigger.update，并用 gsap.ticker 驱动 Lenis 的 raf，保证两者在同一个帧循环里。',
        '移动端建议直接禁用平滑滚动——惯性滚动的手感是系统级的，用 JS 模拟永远得不偿失。pointer: fine 媒体查询是最简单的开关。',
        '最后一个细节：锚点跳转要改走 lenis.scrollTo，否则瞬间跳转会破坏整个平滑体系的沉浸感。',
      ],
      en: [
        "The core conflict: Lenis hijacks scrolling while ScrollTrigger listens to native scroll events. Out of sync, animations jitter or misalign.",
        "The fix is one line of glue: call ScrollTrigger.update inside Lenis's scroll callback, and drive Lenis's raf with gsap.ticker so both share one frame loop.",
        'On mobile, disable smooth scrolling entirely — inertial scroll feel is OS-level, and simulating it in JS never pays off. The pointer: fine media query is the simplest switch.',
        'Final detail: anchor navigation must go through lenis.scrollTo, or instant jumps will shatter the immersion of your entire smooth system.',
      ],
    },
  },
  {
    slug: 'llm-cost-optimization',
    column: 'llm-practice',
    category: { zh: 'AI 工程', en: 'AI Engineering' },
    title: { zh: 'LLM 成本优化实战：把月账单砍掉 80%', en: 'LLM Cost Optimization: Cutting the Monthly Bill by 80%' },
    excerpt: {
      zh: '语义缓存、模型路由、Prompt 压缩——不降质量的前提下，LLM 应用的成本有巨大的压缩空间。',
      en: 'Semantic caching, model routing, prompt compression — without sacrificing quality, LLM apps have enormous cost headroom.',
    },
    date: '2025-04-18',
    readMin: 10,
    tags: ['LLM', '成本', '架构'],
    headings: {
      zh: ['先测量', '模型路由', '语义缓存', 'Prompt 压缩'],
      en: ['Measure first', 'Model routing', 'Semantic caching', 'Prompt compression'],
    },
    body: {
      zh: [
        '第一步永远是测量。我们在网关层给每次调用打上场景标签，两周后发现 60% 的成本来自 12% 的"习惯性滥用"——用旗舰模型做分类任务。',
        '模型路由是最大的杠杆：用一个轻量分类器把请求分发给三个档位的模型。简单任务走小模型，质量无损，成本降 70%。',
        '语义缓存次之：embedding 相似度 > 0.95 的查询直接返回缓存结果。在客服类场景，命中率能到 35%。',
        '最后是 Prompt 压缩：系统提示里的每一个 token 都在每次调用中重复计费。我们把 2000 token 的祖传 Prompt 重构到 400，行为反而更稳定——冗余指令本来就在稀释注意力。',
      ],
      en: [
        'Step one is always measurement. We tagged every call with a scenario label at the gateway. Two weeks later: 60% of cost came from 12% of "habitual abuse" — flagship models doing classification tasks.',
        'Model routing is the biggest lever: a lightweight classifier dispatches requests across three model tiers. Simple tasks hit small models — zero quality loss, 70% cost reduction.',
        'Semantic caching comes next: queries with embedding similarity > 0.95 return cached results. In customer-service scenarios, hit rates reach 35%.',
        'Finally, prompt compression: every token in your system prompt is billed on every call. We refactored a legacy 2000-token prompt down to 400 — behavior actually became more stable. Redundant instructions were diluting attention all along.',
      ],
    },
  },
]
