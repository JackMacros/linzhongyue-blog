CREATE TABLE admin_user (
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

CREATE TABLE blog_column (
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

CREATE TABLE blog_article (
    id BIGINT NOT NULL AUTO_INCREMENT,
    slug VARCHAR(160) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary VARCHAR(1000) NOT NULL DEFAULT '',
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

CREATE TABLE blog_tag (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL DEFAULT '#2dd4bf',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_blog_tag_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE blog_article_tag (
    article_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (article_id, tag_id),
    KEY idx_blog_article_tag_tag (tag_id),
    CONSTRAINT fk_blog_article_tag_article FOREIGN KEY (article_id) REFERENCES blog_article (id) ON DELETE CASCADE,
    CONSTRAINT fk_blog_article_tag_tag FOREIGN KEY (tag_id) REFERENCES blog_tag (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE site_profile (
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

CREATE TABLE portfolio_project (
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

CREATE TABLE career_experience (
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

CREATE TABLE site_skill (
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

CREATE TABLE social_link (
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

CREATE TABLE media_asset (
    id BIGINT NOT NULL AUTO_INCREMENT,
    qiniu_key VARCHAR(500) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_media_asset_qiniu_key (qiniu_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE operation_log (
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

CREATE TABLE daily_visit_stat (
    stat_date DATE NOT NULL,
    pv BIGINT NOT NULL DEFAULT 0,
    uv BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

