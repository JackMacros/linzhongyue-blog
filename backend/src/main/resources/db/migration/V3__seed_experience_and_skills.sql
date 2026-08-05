INSERT INTO career_experience (
    period_zh, period_en, role_zh, role_en, organization_zh, organization_en,
    description_zh, description_en, sort_order
) VALUES
('2023 — 至今', '2023 — Now', '资深全栈工程师', 'Senior Full-Stack Engineer', '某 AI 独角兽', 'AI Unicorn', '主导 LLM 应用平台架构，支撑千万级调用量。', 'Leading an LLM application platform architecture at large scale.', 40),
('2021 — 2023', '2021 — 2023', '全栈工程师', 'Full-Stack Engineer', '一线大厂', 'Big Tech', '负责实时数据平台核心链路，从零到一搭建流处理体系。', 'Built a core real-time data pipeline from zero to one.', 30),
('2019 — 2021', '2019 — 2021', '前端工程师', 'Frontend Engineer', '出海创业公司', 'Global Startup', '独立负责 C 端产品前端，深度参与交互与动效设计。', 'Owned a consumer product frontend and its interaction design.', 20),
('2019', '2019', '计算机科学 · 工学学士', 'B.Eng. in Computer Science', '', '', '开始写第一行生产代码，也写下了第一篇技术博客。', 'Wrote the first line of production code and the first technical post.', 10);

INSERT INTO site_skill (group_zh, group_en, name, sort_order) VALUES
('前端', 'Frontend', 'React / Next.js', 90),
('前端', 'Frontend', 'TypeScript', 80),
('前端', 'Frontend', 'Three.js / WebGL', 70),
('前端', 'Frontend', 'GSAP Motion', 60),
('后端', 'Backend', 'Java / Spring Boot', 90),
('后端', 'Backend', 'MySQL / Redis', 80),
('后端', 'Backend', 'Messaging / Streaming', 70),
('后端', 'Backend', 'Docker / Nginx', 60),
('AI', 'AI', 'LLM App Architecture', 90),
('AI', 'AI', 'Agent Orchestration', 80),
('AI', 'AI', 'RAG Systems', 70),
('AI', 'AI', 'Model Integration', 60);

