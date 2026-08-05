-- Lin Zhongyue Blog standalone demo database snapshot
-- MySQL 8+
--
-- Demo login: admin / admin123
-- IMPORTANT: This credential is public and must never be used in production.
--
-- This snapshot is independent from Flyway. When running the backend against
-- this demo database, disable Flyway with SPRING_FLYWAY_ENABLED=false.
-- For normal development and production, prefer the versioned migrations in
-- backend/src/main/resources/db/migration.

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS linzhongyue_blog_demo
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE linzhongyue_blog_demo;

CREATE TABLE IF NOT EXISTS admin_user (
    id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NULL,
    avatar_url VARCHAR(1000) NULL,
    enabled TINYINT NOT NULL DEFAULT 1,
    last_login_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_admin_user_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_column (
    id BIGINT NOT NULL AUTO_INCREMENT,
    slug VARCHAR(120) NOT NULL,
    name_zh VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    description_zh VARCHAR(1000) NOT NULL DEFAULT '',
    description_en VARCHAR(1000) NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'ONGOING',
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_blog_column_slug (slug),
    CONSTRAINT ck_blog_column_status CHECK (status IN ('ONGOING', 'COMPLETED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_article (
    id BIGINT NOT NULL AUTO_INCREMENT,
    slug VARCHAR(160) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary VARCHAR(1000) NOT NULL DEFAULT '',
    cover_url VARCHAR(1000) NOT NULL DEFAULT '',
    content LONGTEXT NOT NULL,
    column_id BIGINT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    published_at DATETIME NULL,
    view_count BIGINT NOT NULL DEFAULT 0,
    read_minutes INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_blog_article_slug (slug),
    KEY idx_blog_article_status_published (status, published_at),
    KEY idx_blog_article_column (column_id),
    CONSTRAINT fk_blog_article_column FOREIGN KEY (column_id) REFERENCES blog_column (id) ON DELETE SET NULL,
    CONSTRAINT ck_blog_article_status CHECK (status IN ('DRAFT', 'PUBLISHED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_tag (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL DEFAULT '#2dd4bf',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_blog_tag_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_article_tag (
    article_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (article_id, tag_id),
    KEY idx_blog_article_tag_tag (tag_id),
    CONSTRAINT fk_blog_article_tag_article FOREIGN KEY (article_id) REFERENCES blog_article (id) ON DELETE CASCADE,
    CONSTRAINT fk_blog_article_tag_tag FOREIGN KEY (tag_id) REFERENCES blog_tag (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_profile (
    id BIGINT NOT NULL,
    display_name_zh VARCHAR(100) NOT NULL,
    display_name_en VARCHAR(100) NOT NULL,
    role_zh VARCHAR(255) NOT NULL DEFAULT '',
    role_en VARCHAR(255) NOT NULL DEFAULT '',
    hero_description_zh VARCHAR(1000) NOT NULL DEFAULT '',
    hero_description_en VARCHAR(1000) NOT NULL DEFAULT '',
    about_paragraph1_zh TEXT NOT NULL,
    about_paragraph1_en TEXT NOT NULL,
    about_paragraph2_zh TEXT NOT NULL,
    about_paragraph2_en TEXT NOT NULL,
    contact_heading_zh VARCHAR(500) NOT NULL DEFAULT '',
    contact_heading_en VARCHAR(500) NOT NULL DEFAULT '',
    contact_description_zh VARCHAR(1000) NOT NULL DEFAULT '',
    contact_description_en VARCHAR(1000) NOT NULL DEFAULT '',
    email VARCHAR(100) NOT NULL DEFAULT '',
    avatar_url VARCHAR(1000) NULL,
    footer_zh VARCHAR(500) NOT NULL DEFAULT '',
    footer_en VARCHAR(500) NOT NULL DEFAULT '',
    stat1_value VARCHAR(30) NOT NULL DEFAULT '',
    stat1_label_zh VARCHAR(100) NOT NULL DEFAULT '',
    stat1_label_en VARCHAR(100) NOT NULL DEFAULT '',
    stat2_value VARCHAR(30) NOT NULL DEFAULT '',
    stat2_label_zh VARCHAR(100) NOT NULL DEFAULT '',
    stat2_label_en VARCHAR(100) NOT NULL DEFAULT '',
    stat3_value VARCHAR(30) NOT NULL DEFAULT '',
    stat3_label_zh VARCHAR(100) NOT NULL DEFAULT '',
    stat3_label_en VARCHAR(100) NOT NULL DEFAULT '',
    stat4_value VARCHAR(30) NOT NULL DEFAULT '',
    stat4_label_zh VARCHAR(100) NOT NULL DEFAULT '',
    stat4_label_en VARCHAR(100) NOT NULL DEFAULT '',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portfolio_project (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    subtitle_zh VARCHAR(255) NOT NULL DEFAULT '',
    subtitle_en VARCHAR(255) NOT NULL DEFAULT '',
    description_zh VARCHAR(1000) NOT NULL DEFAULT '',
    description_en VARCHAR(1000) NOT NULL DEFAULT '',
    tech_stack VARCHAR(1000) NOT NULL DEFAULT '',
    project_url VARCHAR(1000) NULL,
    image_url VARCHAR(1000) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    enabled TINYINT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS career_experience (
    id BIGINT NOT NULL AUTO_INCREMENT,
    period_zh VARCHAR(100) NOT NULL,
    period_en VARCHAR(100) NOT NULL,
    role_zh VARCHAR(255) NOT NULL,
    role_en VARCHAR(255) NOT NULL,
    organization_zh VARCHAR(255) NOT NULL DEFAULT '',
    organization_en VARCHAR(255) NOT NULL DEFAULT '',
    description_zh VARCHAR(1000) NOT NULL DEFAULT '',
    description_en VARCHAR(1000) NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    enabled TINYINT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_skill (
    id BIGINT NOT NULL AUTO_INCREMENT,
    group_zh VARCHAR(100) NOT NULL,
    group_en VARCHAR(100) NOT NULL,
    name VARCHAR(150) NOT NULL,
    proficiency INT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    enabled TINYINT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS social_link (
    id BIGINT NOT NULL AUTO_INCREMENT,
    platform VARCHAR(100) NOT NULL,
    handle VARCHAR(150) NOT NULL DEFAULT '',
    url VARCHAR(1000) NOT NULL,
    icon VARCHAR(100) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    enabled TINYINT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media_asset (
    id BIGINT NOT NULL AUTO_INCREMENT,
    qiniu_key VARCHAR(500) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    content_hash CHAR(64) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_media_asset_qiniu_key (qiniu_key),
    UNIQUE KEY uk_media_asset_content_hash (content_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS operation_log (
    id BIGINT NOT NULL AUTO_INCREMENT,
    admin_id BIGINT NOT NULL,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(255) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    success TINYINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_operation_log_created (created_at),
    KEY idx_operation_log_admin (admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS daily_visit_stat (
    stat_date DATE NOT NULL,
    pv BIGINT NOT NULL DEFAULT 0,
    uv BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

START TRANSACTION;

-- Public demo credential: admin / admin123
INSERT IGNORE INTO admin_user (
    id, username, password_hash, nickname, email, enabled
) VALUES (
    1,
    'admin',
    '$2a$12$RnHTsZ4ZR9/.TaIIccGenujyiPjhU5EVRTU2VbtF.8e104djeszbm',
    'Demo Admin',
    'admin@example.com',
    1
);

INSERT IGNORE INTO site_profile (
    id, display_name_zh, display_name_en, role_zh, role_en,
    hero_description_zh, hero_description_en,
    about_paragraph1_zh, about_paragraph1_en,
    about_paragraph2_zh, about_paragraph2_en,
    contact_heading_zh, contact_heading_en,
    contact_description_zh, contact_description_en,
    email, footer_zh, footer_en,
    stat1_value, stat1_label_zh, stat1_label_en,
    stat2_value, stat2_label_zh, stat2_label_en,
    stat3_value, stat3_label_zh, stat3_label_en,
    stat4_value, stat4_label_zh, stat4_label_en
) VALUES (
    1, '演示博客', 'DEMO BLOG', '全栈工程师 × AI 构建者', 'Full-Stack Engineer × AI Builder',
    '记录工程实践、人工智能与独立开发。',
    'Notes on engineering, artificial intelligence, and independent building.',
    '这是一个可通过管理后台维护的双语个人博客演示站点。',
    'This is a bilingual personal blog demo maintained from the admin console.',
    '你可以修改这里的文字、项目、经历、技能和联系方式。',
    'You can edit this copy, projects, experience, skills, and contact details.',
    '一起构建下一个产品。', 'Let''s build the next thing together.',
    '欢迎通过示例联系方式与我交流。', 'Feel free to start a conversation through the demo contact details.',
    'hello@example.com', 'Demo Blog · MIT License', 'Demo Blog · MIT License',
    '6+', '年工程经验', 'Years of engineering',
    '30+', '落地项目', 'Shipped projects',
    '40+', '技术文章', 'Technical posts',
    '12', '套 AI 系统', 'AI systems built'
);

INSERT IGNORE INTO blog_column (
    id, slug, name_zh, name_en, description_zh, description_en, status, sort_order
) VALUES
    (1, 'engineering-notes', '工程实践', 'Engineering Notes', '记录架构、后端与运维实践。', 'Notes on architecture, backend engineering, and operations.', 'ONGOING', 20),
    (2, 'ai-building', 'AI 构建手记', 'Building with AI', '记录大模型应用与 Agent 开发。', 'Notes on LLM applications and agent development.', 'ONGOING', 10);

INSERT IGNORE INTO blog_tag (id, name, color) VALUES
    (1, 'Spring Boot', '#6db33f'),
    (2, 'React', '#61dafb'),
    (3, 'AI', '#a78bfa');

INSERT IGNORE INTO blog_article (
    id, slug, title, summary, cover_url, content, column_id,
    status, published_at, view_count, read_minutes
) VALUES (
    1,
    'welcome-to-linzhongyue-blog',
    '欢迎使用林中月个人博客',
    '这是一篇用于展示 Markdown、标签和专栏能力的示例文章。',
    '',
    '# 欢迎使用林中月个人博客\n\n这是一个开源的全栈个人博客系统。\n\n## 你可以做什么\n\n- 使用 Markdown 编写文章\n- 管理标签与专栏\n- 上传图片并复用素材\n- 维护个人资料和项目\n\n```java\nSystem.out.println("Hello, Blog!");\n```',
    1,
    'PUBLISHED',
    CURRENT_TIMESTAMP,
    128,
    2
);

INSERT IGNORE INTO blog_article_tag (article_id, tag_id) VALUES
    (1, 1),
    (1, 2),
    (1, 3);

INSERT IGNORE INTO portfolio_project (
    id, name, subtitle_zh, subtitle_en, description_zh, description_en,
    tech_stack, project_url, sort_order, enabled
) VALUES
    (1, 'Lin Zhongyue Blog', '全栈个人博客', 'Full-Stack Personal Blog', '支持内容管理、统计和对象存储。', 'Content management, analytics, and object storage in one project.', '["React","Spring Boot","MySQL","Redis"]', 'https://github.com/JackMacros/linzhongyue-blog', 20, 1),
    (2, 'Agent Publisher', '文章发布 Skill', 'Article Publishing Skill', '让 Agent 调用博客 API 编写并发布文章。', 'Lets an agent author and publish articles through the blog API.', '["Python","API","Agent Skill"]', 'https://github.com/JackMacros/linzhongyue-blog/tree/main/skills/linzhongyue-blog-publisher', 10, 1);

INSERT IGNORE INTO career_experience (
    id, period_zh, period_en, role_zh, role_en, organization_zh,
    organization_en, description_zh, description_en, sort_order, enabled
) VALUES (
    1, '2024 — 至今', '2024 — Present', '全栈工程师', 'Full-Stack Engineer',
    '示例团队', 'Demo Team', '构建可靠、易维护的 Web 与 AI 产品。',
    'Building reliable and maintainable web and AI products.', 10, 1
);

INSERT IGNORE INTO site_skill (
    id, group_zh, group_en, name, proficiency, sort_order, enabled
) VALUES
    (1, '前端', 'Frontend', 'React / TypeScript', 90, 30, 1),
    (2, '前端', 'Frontend', 'Tailwind CSS', 80, 20, 1),
    (3, '后端', 'Backend', 'Java / Spring Boot', 90, 30, 1),
    (4, '后端', 'Backend', 'MySQL / Redis', 85, 20, 1),
    (5, 'AI', 'AI', 'LLM Applications', 85, 30, 1),
    (6, 'AI', 'AI', 'Agent Orchestration', 80, 20, 1);

INSERT IGNORE INTO social_link (
    id, platform, handle, url, icon, sort_order, enabled
) VALUES
    (1, 'GitHub', '@JackMacros', 'https://github.com/JackMacros', 'github', 20, 1),
    (2, 'Website', 'linzhongyue.cn', 'https://linzhongyue.cn', 'globe', 10, 1);

INSERT IGNORE INTO daily_visit_stat (stat_date, pv, uv) VALUES
    (CURRENT_DATE - INTERVAL 2 DAY, 36, 18),
    (CURRENT_DATE - INTERVAL 1 DAY, 52, 27),
    (CURRENT_DATE, 24, 13);

COMMIT;
