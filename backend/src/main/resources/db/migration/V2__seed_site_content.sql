INSERT INTO site_profile (
    id, display_name_zh, display_name_en, role_zh, role_en,
    hero_description_zh, hero_description_en,
    about_paragraph1_zh, about_paragraph1_en, about_paragraph2_zh, about_paragraph2_en,
    contact_heading_zh, contact_heading_en, contact_description_zh, contact_description_en,
    email, footer_zh, footer_en,
    stat1_value, stat1_label_zh, stat1_label_en,
    stat2_value, stat2_label_zh, stat2_label_en,
    stat3_value, stat3_label_zh, stat3_label_en,
    stat4_value, stat4_label_zh, stat4_label_en
) VALUES (
    1, '林中月', 'LIN ZHONGYUE', '全栈工程师 × AI 构建者', 'Full-Stack Engineer × AI Builder',
    '在代码与智能的交汇处构建产品。专注全栈架构与大模型应用，把复杂的想法变成优雅的系统。',
    'Building products at the intersection of code and intelligence, turning complex ideas into elegant systems.',
    '我是林中月，一名全栈 + AI 工程师，热衷于在系统设计与前沿智能之间搭建桥梁。',
    'I am Lin Zhongyue, a full-stack and AI engineer who loves bridging system design and frontier intelligence.',
    '相信好的工程是克制的艺术——用最合适的工具解决最真实的问题。',
    'Good engineering is the art of restraint: using the right tool for the real problem.',
    '让我们一起\n构建下一个产品。', 'Let''s build the\nnext thing together.',
    '无论是全职机会、自由合作，还是单纯聊聊技术——我的收件箱永远敞开。',
    'Full-time roles, freelance collaborations, or simply a chat about technology — my inbox is always open.',
    'hello@linzhongyue.dev', '© 林中月 · 设计与构建于深夜', '© Lin Zhongyue · Designed and built after midnight',
    '6+', '年工程经验', 'Years of engineering',
    '30+', '落地项目', 'Shipped projects',
    '40+', '技术文章', 'Technical posts',
    '12', '套 AI 系统', 'AI systems built'
);

INSERT INTO blog_column (slug, name_zh, name_en, description_zh, description_en, status, sort_order) VALUES
('llm-practice', 'LLM 工程实战', 'LLM Engineering in Practice', '从 Prompt 工程到 Agent 编排，大模型应用落地的完整方法论。', 'From prompt engineering to agent orchestration, a practical guide to shipping LLM applications.', 'ONGOING', 60),
('motion-lab', '前端动效实验室', 'Frontend Motion Lab', 'WebGL、GSAP、物理动画与获奖网站交互实现。', 'WebGL, GSAP, physics-based animation and award-winning interactions.', 'ONGOING', 50),
('system-design', '系统设计笔记', 'System Design Notes', '高并发、分布式与数据一致性实践。', 'Notes on high concurrency, distributed systems and data consistency.', 'ONGOING', 40),
('agent-watch', 'AI Agent 观察', 'AI Agent Watch', '追踪 Agent 生态演进。', 'Tracking the evolution of the AI agent ecosystem.', 'ONGOING', 30),
('rust-diaries', 'Rust 迁移手记', 'Rust Migration Diaries', '性能敏感模块迁移实践。', 'Practical notes on moving performance-sensitive modules to Rust.', 'ONGOING', 20),
('indie-log', '独立开发日志', 'Indie Dev Log', '从零到一构建独立产品。', 'Building independent products from zero to one.', 'ONGOING', 10);

INSERT INTO portfolio_project (name, subtitle_zh, subtitle_en, description_zh, description_en, tech_stack, sort_order) VALUES
('Nexus Agent', '多智能体协作平台', 'Multi-Agent Platform', '基于 LLM 的多 Agent 编排框架，支持工具调用、记忆共享与任务分解。', 'LLM-based multi-agent orchestration with tool use, shared memory and task decomposition.', '["TypeScript","LangGraph","Redis"]', 30),
('Pulse Engine', '实时数据流引擎', 'Real-time Data Engine', '毫秒级事件处理管道。', 'A millisecond-level event processing pipeline.', '["Go","Kafka","ClickHouse"]', 20),
('Aria UI', 'AI 原生设计系统', 'AI-native Design System', '面向 AI 应用的组件库。', 'A component library designed for AI applications.', '["React","Tailwind","WASM"]', 10);

INSERT INTO social_link (platform, handle, url, icon, sort_order) VALUES
('GitHub', '@linzhongyue', 'https://github.com/', 'github', 40),
('X / Twitter', '@linzhongyue', 'https://x.com/', 'twitter', 30),
('LinkedIn', '/in/linzhongyue', 'https://www.linkedin.com/', 'linkedin', 20),
('掘金', '@林中月', 'https://juejin.cn/', 'book-open', 10);
