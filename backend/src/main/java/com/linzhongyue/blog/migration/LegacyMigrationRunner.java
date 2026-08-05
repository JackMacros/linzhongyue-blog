package com.linzhongyue.blog.migration;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.linzhongyue.blog.article.entity.Article;
import com.linzhongyue.blog.article.entity.ArticleTag;
import com.linzhongyue.blog.article.mapper.ArticleMapper;
import com.linzhongyue.blog.article.mapper.ArticleTagMapper;
import com.linzhongyue.blog.column.entity.BlogColumn;
import com.linzhongyue.blog.column.mapper.BlogColumnMapper;
import com.linzhongyue.blog.config.BlogProperties;
import com.linzhongyue.blog.media.entity.MediaAsset;
import com.linzhongyue.blog.media.mapper.MediaAssetMapper;
import com.linzhongyue.blog.tag.entity.Tag;
import com.linzhongyue.blog.tag.mapper.TagMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
@ConditionalOnProperty(prefix = "blog.legacy-migration", name = "enabled", havingValue = "true")
public class LegacyMigrationRunner implements ApplicationRunner {
    private static final Pattern RAW_HTML = Pattern.compile("(?is)<\\s*/?\\s*(iframe|div|script|style|object|embed)\\b");
    private static final Pattern IMAGE_URL = Pattern.compile("(?i)!?\\[[^]]*]\\((https?://[^)\\s]+)");

    private final BlogProperties properties;
    private final ArticleMapper articleMapper;
    private final ArticleTagMapper articleTagMapper;
    private final TagMapper tagMapper;
    private final BlogColumnMapper columnMapper;
    private final MediaAssetMapper mediaMapper;
    private final TransactionTemplate transactionTemplate;

    public LegacyMigrationRunner(BlogProperties properties, ArticleMapper articleMapper,
                                 ArticleTagMapper articleTagMapper, TagMapper tagMapper,
                                 BlogColumnMapper columnMapper, MediaAssetMapper mediaMapper,
                                 TransactionTemplate transactionTemplate) {
        this.properties = properties;
        this.articleMapper = articleMapper;
        this.articleTagMapper = articleTagMapper;
        this.tagMapper = tagMapper;
        this.columnMapper = columnMapper;
        this.mediaMapper = mediaMapper;
        this.transactionTemplate = transactionTemplate;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        BlogProperties.LegacyMigration config = properties.getLegacyMigration();
        if (blank(config.getUrl()) || blank(config.getUsername())) {
            throw new IllegalStateException("Legacy migration is enabled but BLOG_LEGACY_DB_URL/USERNAME is missing");
        }
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
        dataSource.setUrl(config.getUrl());
        dataSource.setUsername(config.getUsername());
        dataSource.setPassword(config.getPassword());
        JdbcTemplate legacy = new JdbcTemplate(dataSource);

        List<Map<String, Object>> rows = legacy.queryForList("""
                SELECT id, title, summary, cover_image, content, view_counts, read_time,
                       category_name, create_time, update_time
                FROM blog_article
                WHERE is_publish = 1 AND is_deleted = 0
                ORDER BY id
                """);
        MigrationReport report = new MigrationReport(rows.size());
        transactionTemplate.executeWithoutResult(status -> rows.forEach(row -> migrateArticle(legacy, row, report)));
        Path reportFile = writeReport(config.getReportDirectory(), report);
        log.info("Legacy migration finished: migrated={}, skipped={}, review={}, report={}",
                report.migrated, report.skipped, report.reviewArticles.size(), reportFile.toAbsolutePath());
    }

    private void migrateArticle(JdbcTemplate legacy, Map<String, Object> row, MigrationReport report) {
        long oldId = number(row.get("id"), 0);
        String slug = "article-" + oldId;
        String coverUrl = text(row.get("cover_image"));
        Article existing = articleMapper.selectOne(new LambdaQueryWrapper<Article>().eq(Article::getSlug, slug));
        if (existing != null) {
            if (blank(existing.getCoverUrl()) && !coverUrl.isBlank()) {
                existing.setCoverUrl(coverUrl);
                articleMapper.updateById(existing);
                report.updatedCovers++;
            }
            registerImage(coverUrl, report);
            report.skipped++;
            return;
        }
        String title = text(row.get("title"));
        String content = text(row.get("content"));
        if (RAW_HTML.matcher(content).find()) {
            report.reviewArticles.add(oldId + " - " + title + "（包含禁用的原始 HTML）");
        }

        Article article = new Article();
        article.setSlug(slug);
        article.setTitle(title.isBlank() ? "未命名文章 " + oldId : title);
        article.setSummary(text(row.get("summary")));
        article.setCoverUrl(coverUrl);
        article.setContent(content);
        article.setColumnId(resolveColumn(legacy, oldId));
        article.setStatus("PUBLISHED");
        LocalDateTime created = dateTime(row.get("create_time"));
        LocalDateTime updated = dateTime(row.get("update_time"));
        article.setPublishedAt(created == null ? LocalDateTime.now() : created);
        article.setViewCount(number(row.get("view_counts"), 0));
        long oldReadTime = number(row.get("read_time"), 0);
        article.setReadMinutes(oldReadTime > 0 ? (int) Math.min(oldReadTime, Integer.MAX_VALUE) : estimateReadTime(content));
        article.setCreatedAt(created == null ? LocalDateTime.now() : created);
        article.setUpdatedAt(updated == null ? article.getCreatedAt() : updated);
        articleMapper.insert(article);

        Set<String> tagNames = new LinkedHashSet<>();
        legacy.queryForList("""
                SELECT t.name
                FROM blog_article_tag at
                JOIN blog_tag t ON t.id = at.tag_id
                WHERE at.article_id = ? AND (t.is_deleted = 0 OR t.is_deleted IS NULL)
                """, oldId).forEach(tag -> tagNames.add(text(tag.get("name"))));
        String category = text(row.get("category_name"));
        if (!category.isBlank()) {
            tagNames.add(category);
        }
        tagNames.stream().filter(name -> !name.isBlank()).map(this::resolveTag)
                .forEach(tagId -> articleTagMapper.insert(new ArticleTag(article.getId(), tagId)));
        registerImages(content, report);
        registerImage(coverUrl, report);
        report.migrated++;
    }

    private Long resolveColumn(JdbcTemplate legacy, long articleId) {
        List<Map<String, Object>> columns = legacy.queryForList("""
                SELECT c.id, c.name, c.columns_description
                FROM blog_column_article_relation r
                JOIN blog_column c ON c.id = r.column_id
                WHERE r.article_id = ?
                ORDER BY r.sort DESC, r.id ASC
                LIMIT 1
                """, articleId);
        if (columns.isEmpty()) {
            return null;
        }
        Map<String, Object> old = columns.getFirst();
        long oldId = number(old.get("id"), 0);
        String slug = "legacy-column-" + oldId;
        BlogColumn column = columnMapper.selectOne(new LambdaQueryWrapper<BlogColumn>().eq(BlogColumn::getSlug, slug));
        if (column != null) {
            return column.getId();
        }
        column = new BlogColumn();
        column.setSlug(slug);
        String name = text(old.get("name"));
        column.setNameZh(name.isBlank() ? "旧专栏 " + oldId : name);
        column.setNameEn(column.getNameZh());
        column.setDescriptionZh(text(old.get("columns_description")));
        column.setDescriptionEn(column.getDescriptionZh());
        column.setStatus("ONGOING");
        column.setSortOrder(0);
        column.setCreatedAt(LocalDateTime.now());
        column.setUpdatedAt(LocalDateTime.now());
        columnMapper.insert(column);
        return column.getId();
    }

    private Long resolveTag(String name) {
        String normalized = name.trim();
        Tag existing = tagMapper.selectOne(new LambdaQueryWrapper<Tag>().eq(Tag::getName, normalized));
        if (existing != null) {
            return existing.getId();
        }
        Tag tag = new Tag();
        tag.setName(normalized.length() > 50 ? normalized.substring(0, 50) : normalized);
        tag.setColor("#2dd4bf");
        tag.setCreatedAt(LocalDateTime.now());
        tag.setUpdatedAt(LocalDateTime.now());
        tagMapper.insert(tag);
        return tag.getId();
    }

    private void registerImages(String content, MigrationReport report) {
        Matcher matcher = IMAGE_URL.matcher(content);
        while (matcher.find()) {
            registerImage(matcher.group(1), report);
        }
    }

    private void registerImage(String url, MigrationReport report) {
        String domain = properties.getQiniu().getDomain();
        if (blank(domain) || blank(url)) {
            return;
        }
        String prefix = domain.trim().replaceAll("/+$", "") + "/";
        if (!url.startsWith(prefix)) {
            return;
        }
        String key = url.substring(prefix.length()).split("[?#]", 2)[0];
        if (key.isBlank() || mediaMapper.selectCount(new LambdaQueryWrapper<MediaAsset>()
                .eq(MediaAsset::getQiniuKey, key)) > 0) {
            return;
        }
        MediaAsset asset = new MediaAsset();
        asset.setQiniuKey(key);
        asset.setUrl(url);
        asset.setOriginalName(key.substring(key.lastIndexOf('/') + 1));
        asset.setMimeType(inferMimeType(key));
        asset.setSizeBytes(0L);
        asset.setCreatedAt(LocalDateTime.now());
        mediaMapper.insert(asset);
        report.registeredImages++;
    }

    private Path writeReport(String directory, MigrationReport report) throws Exception {
        Path folder = Path.of(directory).toAbsolutePath().normalize();
        Files.createDirectories(folder);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        Path target = folder.resolve("legacy-migration-" + timestamp + ".md");
        StringBuilder text = new StringBuilder("# 旧博客迁移报告\n\n")
                .append("- 扫描已发布且未删除文章：").append(report.total).append("\n")
                .append("- 成功迁移：").append(report.migrated).append("\n")
                .append("- 因稳定 slug 已存在而跳过：").append(report.skipped).append("\n")
                .append("- 为已迁移文章补齐封面：").append(report.updatedCovers).append("\n")
                .append("- 登记七牛云图片：").append(report.registeredImages).append("\n")
                .append("- 需要人工复核：").append(report.reviewArticles.size()).append("\n\n")
                .append("## 原始 HTML 人工复核清单\n\n");
        if (report.reviewArticles.isEmpty()) {
            text.append("无。\n");
        } else {
            report.reviewArticles.forEach(item -> text.append("- ").append(item).append("\n"));
        }
        Files.writeString(target, text, StandardCharsets.UTF_8);
        return target;
    }

    private int estimateReadTime(String content) {
        int length = content.replaceAll("\\s+", "").length();
        return Math.max(1, (int) Math.ceil(length / 400.0));
    }
    private String inferMimeType(String key) {
        String lower = key.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".gif")) return "image/gif";
        return "image/jpeg";
    }
    private String text(Object value) { return value == null ? "" : value.toString(); }
    private long number(Object value, long fallback) {
        if (value instanceof Number number) return number.longValue();
        try { return value == null ? fallback : Long.parseLong(value.toString()); } catch (NumberFormatException ignored) { return fallback; }
    }
    private LocalDateTime dateTime(Object value) {
        if (value instanceof java.sql.Timestamp timestamp) return timestamp.toLocalDateTime();
        if (value instanceof LocalDateTime localDateTime) return localDateTime;
        return null;
    }
    private boolean blank(String value) { return value == null || value.isBlank(); }

    private static class MigrationReport {
        private final int total;
        private int migrated;
        private int skipped;
        private int updatedCovers;
        private int registeredImages;
        private final List<String> reviewArticles = new ArrayList<>();
        private MigrationReport(int total) { this.total = total; }
    }
}
